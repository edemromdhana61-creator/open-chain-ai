import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { tasks } from '../db/schema.js';
import { circuitBreaker } from '../services/circuit-breaker.js';

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  goalId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  parentTaskId: z.string().uuid().optional(),
});

const assignTaskSchema = z.object({
  assigneeId: z.string().uuid(),
});

export async function taskRoutes(fastify: FastifyInstance) {
  // GET /api/v1/tasks
  fastify.get('/', async () => {
    const allTasks = await db.select().from(tasks);
    return { tasks: allTasks };
  });

  // GET /api/v1/tasks/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return { task };
  });

  // POST /api/v1/tasks
  fastify.post('/', async (request, reply) => {
    const body = createTaskSchema.parse(request.body);

    const [task] = await db
      .insert(tasks)
      .values(body)
      .returning();

    return reply.status(201).send({ task });
  });

  // POST /api/v1/tasks/:id/assign
  fastify.post('/:id/assign', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = assignTaskSchema.parse(request.body);

    const [task] = await db
      .update(tasks)
      .set({
        assigneeId: body.assigneeId,
        status: 'in_progress',
        startedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return { task };
  });

  // POST /api/v1/tasks/:id/complete
  fastify.post('/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [task] = await db
      .update(tasks)
      .set({
        status: 'done',
        completedAt: new Date(),
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return { task };
  });

  // POST /api/v1/tasks/:id/revision
  fastify.post('/:id/revision', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Check circuit breaker
    const check = await circuitBreaker.checkRevision(id);
    if (!check.allowed) {
      return reply.status(423).send({
        error: 'Circuit breaker triggered',
        reason: check.reason,
      });
    }

    // Increment revision count
    await circuitBreaker.incrementRevision(id);

    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));

    return { task };
  });

  // POST /api/v1/tasks/:id/block
  fastify.post('/:id/block', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [task] = await db
      .update(tasks)
      .set({
        status: 'blocked',
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }

    return { task };
  });
}
