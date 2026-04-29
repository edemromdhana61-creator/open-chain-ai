import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { heartbeats, agents } from '../db/schema.js';

const heartbeatSchema = z.object({
  agentId: z.string().uuid(),
  status: z.enum(['healthy', 'warning', 'error']),
  currentTaskId: z.string().uuid().optional(),
  progress: z.number().min(0).max(100).optional(),
  metrics: z.object({
    tokensUsed: z.number().optional(),
    tokensRemaining: z.number().optional(),
    cpuUsage: z.number().optional(),
    memoryUsage: z.number().optional(),
  }).optional(),
});

export async function heartbeatRoutes(fastify: FastifyInstance) {
  // POST /api/v1/heartbeat
  fastify.post('/', async (request, reply) => {
    const body = heartbeatSchema.parse(request.body);

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, body.agentId));

    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }

    // Update agent last heartbeat
    await db
      .update(agents)
      .set({
        lastHeartbeat: new Date(),
        status: body.status === 'error' ? 'error' : body.status === 'warning' ? 'working' : agent.status,
      })
      .where(eq(agents.id, body.agentId));

    // Insert heartbeat
    const [heartbeat] = await db
      .insert(heartbeats)
      .values(body)
      .returning();

    return reply.status(201).send({ heartbeat });
  });

  // GET /api/v1/heartbeat/:agentId
  fastify.get('/:agentId', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    const agentHeartbeats = await db
      .select()
      .from(heartbeats)
      .where(eq(heartbeats.agentId, agentId))
      .orderBy(heartbeats.createdAt);

    return { heartbeats: agentHeartbeats };
  });

  // GET /api/v1/heartbeat/:agentId/latest
  fastify.get('/:agentId/latest', async (request, reply) => {
    const { agentId } = request.params as { agentId: string };

    const [latest] = await db
      .select()
      .from(heartbeats)
      .where(eq(heartbeats.agentId, agentId))
      .orderBy(heartbeats.createdAt)
      .limit(1);

    if (!latest) {
      return reply.status(404).send({ error: 'No heartbeats found' });
    }

    return { heartbeat: latest };
  });
}
