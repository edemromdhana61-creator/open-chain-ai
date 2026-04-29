import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { agents, tasks } from '../db/schema.js';

const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  adapterType: z.enum(['openclaw', 'hermes', 'claude', 'codex', 'custom']),
  role: z.string().optional(),
  companyId: z.string().uuid().optional(),
});

export async function agentRoutes(fastify: FastifyInstance) {
  // GET /api/v1/agents
  fastify.get('/', async () => {
    const allAgents = await db.select().from(agents);
    return { agents: allAgents };
  });

  // GET /api/v1/agents/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return { agent };
  });

  // POST /api/v1/agents
  fastify.post('/', async (request, reply) => {
    const body = createAgentSchema.parse(request.body);

    const [agent] = await db.insert(agents).values({
      ...body,
      status: 'idle',
    }).returning();

    return reply.status(201).send({ agent });
  });

  // PUT /api/v1/agents/:id
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = createAgentSchema.partial().parse(request.body);

    const [agent] = await db.update(agents).set({
      ...body,
    }).where(eq(agents.id, id)).returning();

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return { agent };
  });

  // DELETE /api/v1/agents/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [agent] = await db.delete(agents).where(eq(agents.id, id)).returning();

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return reply.status(204).send();
  });

  // POST /api/v1/agents/:id/pause
  fastify.post('/:id/pause', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [agent] = await db.update(agents).set({ status: 'paused' }).where(eq(agents.id, id)).returning();

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return { agent };
  });

  // POST /api/v1/agents/:id/resume
  fastify.post('/:id/resume', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [agent] = await db.update(agents).set({ status: 'idle' }).where(eq(agents.id, id)).returning();

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return { agent };
  });

  // GET /api/v1/agents/:id/tasks
  fastify.get('/:id/tasks', async (request, reply) => {
    const { id } = request.params as { id: string };
    const agentTasks = await db.select().from(tasks).where(eq(tasks.assigneeId, id));
    return { tasks: agentTasks };
  });
}
