import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/sqlite.js';
import { agents, tasks } from '../db/schema-sqlite.js';
import { executeAgentTask } from '../services/agents.js';

const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  adapterType: z.enum(['openclaw', 'hermes', 'claude', 'codex']),
  role: z.string().optional(),
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
    const [agent] = await db.select().from(agents).where(eq(agents.id, parseInt(id)));

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    return { agent };
  });

  // POST /api/v1/agents
  fastify.post('/', async (request, reply) => {
    const body = createAgentSchema.parse(request.body);

    const result = await db.insert(agents).values({
      ...body,
      status: 'idle',
    }).returning();

    return reply.status(201).send({ agent: result[0] });
  });

  // POST /api/v1/agents/:id/execute
  fastify.post('/:id/execute', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { task } = request.body as { task: string };

    const [agent] = await db.select().from(agents).where(eq(agents.id, parseInt(id)));

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    // Update status to working
    await db.update(agents).set({ status: 'working' }).where(eq(agents.id, parseInt(id)));

    try {
      const result = await executeAgentTask(agent.adapterType, task);

      // Update status back to idle
      await db.update(agents).set({
        status: result.success ? 'idle' : 'error',
        lastHeartbeat: new Date(),
      }).where(eq(agents.id, parseInt(id)));

      return { success: result.success, result: result.result };
    } catch (error) {
      await db.update(agents).set({
        status: 'error',
        lastHeartbeat: new Date(),
      }).where(eq(agents.id, parseInt(id)));

      return reply.status(500).send({ error: error.message });
    }
  });

  // POST /api/v1/agents/:id/pause
  fastify.post('/:id/pause', async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.update(agents).set({ status: 'paused' }).where(eq(agents.id, parseInt(id)));
    return { message: 'Agent paused' };
  });

  // POST /api/v1/agents/:id/resume
  fastify.post('/:id/resume', async (request, reply) => {
    const { id } = request.params as { id: string };
    await db.update(agents).set({ status: 'idle' }).where(eq(agents.id, parseInt(id)));
    return { message: 'Agent resumed' };
  });
}
