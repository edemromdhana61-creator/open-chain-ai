import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { agentRoutes } from '../routes/agents.js';
import { taskRoutes } from '../routes/tasks.js';
import { heartbeatRoutes } from '../routes/heartbeat.js';
import { messageRoutes } from '../routes/messages.js';
import { dashboardRoutes } from '../routes/dashboard.js';

describe('API Integration Tests', () => {
  const app = Fastify();

  beforeAll(async () => {
    await app.register(agentRoutes, { prefix: '/api/v1/agents' });
    await app.register(taskRoutes, { prefix: '/api/v1/tasks' });
    await app.register(heartbeatRoutes, { prefix: '/api/v1/heartbeat' });
    await app.register(messageRoutes, { prefix: '/api/v1/messages' });
    await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Full workflow: create agent, assign task, heartbeat, message', async () => {
    // 1. Create agent
    const agentResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/agents',
      payload: {
        name: 'Integration Agent',
        adapterType: 'openclaw',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    expect(agentResponse.statusCode).toBe(201);
    const { agent } = JSON.parse(agentResponse.body);

    // 2. Create task
    const taskResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Integration Task',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    expect(taskResponse.statusCode).toBe(201);
    const { task } = JSON.parse(taskResponse.body);

    // 3. Assign task to agent
    const assignResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/assign`,
      payload: {
        assigneeId: agent.id,
      },
    });

    expect(assignResponse.statusCode).toBe(200);

    // 4. Send heartbeat
    const heartbeatResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/heartbeat',
      payload: {
        agentId: agent.id,
        status: 'healthy',
      },
    });

    expect(heartbeatResponse.statusCode).toBe(201);

    // 5. Send message
    const messageResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/messages',
      payload: {
        from: agent.id,
        to: 'broadcast',
        type: 'status',
      },
    });

    expect(messageResponse.statusCode).toBe(201);

    // 6. Check dashboard
    const dashboardResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard',
    });

    expect(dashboardResponse.statusCode).toBe(200);
    const dashboard = JSON.parse(dashboardResponse.body);
    expect(dashboard).toHaveProperty('overview');
  });

  it('Circuit breaker should trigger after 3 revisions', async () => {
    // Create task
    const taskResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Circuit Breaker Test',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { task } = JSON.parse(taskResponse.body);

    // Trigger 3 revisions
    for (let i = 0; i < 3; i++) {
      const revisionResponse = await app.inject({
        method: 'POST',
        url: `/api/v1/tasks/${task.id}/revision`,
      });
      expect(revisionResponse.statusCode).toBe(200);
    }

    // 4th revision should fail
    const circuitResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/revision`,
    });

    expect(circuitResponse.statusCode).toBe(423);
    const body = JSON.parse(circuitResponse.body);
    expect(body.error).toBe('Circuit breaker triggered');
  });
});
