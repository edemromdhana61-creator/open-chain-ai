import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { agentRoutes } from './agents.js';
import { db } from '../db/index.js';

describe('Agent Routes', () => {
  const app = Fastify();

  beforeAll(async () => {
    await app.register(agentRoutes, { prefix: '/api/v1/agents' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/agents - should return agents', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/agents',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('agents');
    expect(Array.isArray(body.agents)).toBe(true);
  });

  it('POST /api/v1/agents - should create agent', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/agents',
      payload: {
        name: 'Test Agent',
        adapterType: 'openclaw',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('agent');
    expect(body.agent.name).toBe('Test Agent');
  });

  it('GET /api/v1/agents/:id - should return agent', async () => {
    // First create an agent
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/agents',
      payload: {
        name: 'Test Agent',
        adapterType: 'openclaw',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { agent } = JSON.parse(createResponse.body);

    const response = await app.inject({
      method: 'GET',
      url: `/api/v1/agents/${agent.id}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.agent.id).toBe(agent.id);
  });

  it('PUT /api/v1/agents/:id - should update agent', async () => {
    // Create agent
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/agents',
      payload: {
        name: 'Test Agent',
        adapterType: 'openclaw',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { agent } = JSON.parse(createResponse.body);

    const response = await app.inject({
      method: 'PUT',
      url: `/api/v1/agents/${agent.id}`,
      payload: {
        name: 'Updated Agent',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.agent.name).toBe('Updated Agent');
  });

  it('DELETE /api/v1/agents/:id - should delete agent', async () => {
    // Create agent
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/agents',
      payload: {
        name: 'Test Agent',
        adapterType: 'openclaw',
        companyId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { agent } = JSON.parse(createResponse.body);

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/v1/agents/${agent.id}`,
    });

    expect(response.statusCode).toBe(204);
  });
});
