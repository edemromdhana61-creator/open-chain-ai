import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { taskRoutes } from './tasks.js';

describe('Task Routes', () => {
  const app = Fastify();

  beforeAll(async () => {
    await app.register(taskRoutes, { prefix: '/api/v1/tasks' });
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/tasks - should return tasks', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/tasks',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('tasks');
    expect(Array.isArray(body.tasks)).toBe(true);
  });

  it('POST /api/v1/tasks - should create task', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Test Task',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
        priority: 'high',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('task');
    expect(body.task.title).toBe('Test Task');
  });

  it('POST /api/v1/tasks/:id/assign - should assign task', async () => {
    // Create task
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Test Task',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { task } = JSON.parse(createResponse.body);

    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/assign`,
      payload: {
        assigneeId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.task.status).toBe('in_progress');
  });

  it('POST /api/v1/tasks/:id/complete - should complete task', async () => {
    // Create and assign task
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Test Task',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { task } = JSON.parse(createResponse.body);

    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/complete`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.task.status).toBe('done');
  });

  it('POST /api/v1/tasks/:id/revision - should increment revision', async () => {
    // Create task
    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/tasks',
      payload: {
        title: 'Test Task',
        goalId: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    const { task } = JSON.parse(createResponse.body);

    // Test revision
    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/revision`,
    });

    expect(response.statusCode).toBe(200);

    // Test circuit breaker after 3 revisions
    await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/revision`,
    });
    await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/revision`,
    });

    const circuitResponse = await app.inject({
      method: 'POST',
      url: `/api/v1/tasks/${task.id}/revision`,
    });

    expect(circuitResponse.statusCode).toBe(423); // Locked
  });
});
