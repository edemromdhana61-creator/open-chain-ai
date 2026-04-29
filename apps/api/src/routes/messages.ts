import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { messages } from '../db/schema.js';

const messageSchema = z.object({
  from: z.string(), // agentId or 'user'
  to: z.string(),   // agentId or 'broadcast' or 'user'
  type: z.enum(['heartbeat', 'task_update', 'question', 'answer', 'status', 'error', 'deliverable']),
  payload: z.record(z.any()).optional(),
  threadId: z.string().uuid().optional(),
});

export async function messageRoutes(fastify: FastifyInstance) {
  // POST /api/v1/messages
  fastify.post('/', async (request, reply) => {
    const body = messageSchema.parse(request.body);

    const [message] = await db
      .insert(messages)
      .values({
        fromAgentId: body.from,
        toAgentId: body.to,
        type: body.type,
        payload: body.payload,
        threadId: body.threadId,
      })
      .returning();

    // Broadcast via WebSocket
    fastify.websocketServer?.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: 'new_message',
          message,
        }));
      }
    });

    return reply.status(201).send({ message });
  });

  // GET /api/v1/messages
  fastify.get('/', async (request) => {
    const { from, to, threadId } = request.query as {
      from?: string;
      to?: string;
      threadId?: string;
    };

    let query = db.select().from(messages);

    if (from) {
      query = query.where(eq(messages.fromAgentId, from));
    }

    if (to) {
      query = query.where(eq(messages.toAgentId, to));
    }

    if (threadId) {
      query = query.where(eq(messages.threadId, threadId));
    }

    const allMessages = await query.orderBy(messages.createdAt);

    return { messages: allMessages };
  });

  // GET /api/v1/messages/thread/:threadId
  fastify.get('/thread/:threadId', async (request, reply) => {
    const { threadId } = request.params as { threadId: string };

    const threadMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(messages.createdAt);

    return { messages: threadMessages };
  });

  // GET /api/v1/messages/conversation/:agentId
  fastify.get('/conversation/:agentId', async (request) => {
    const { agentId } = request.params as { agentId: string };

    const conversation = await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.fromAgentId, agentId),
          eq(messages.toAgentId, agentId)
        )
      )
      .orderBy(messages.createdAt);

    return { messages: conversation };
  });
}
