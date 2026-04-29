import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { companies, agents, goals, tasks } from '../db/schema.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  // GET /api/v1/dashboard
  fastify.get('/', async () => {
    // Company overview
    const allCompanies = await db.select().from(companies);
    const allAgents = await db.select().from(agents);
    const allGoals = await db.select().from(goals);
    const allTasks = await db.select().from(tasks);

    return {
      overview: {
        companies: allCompanies.length,
        agents: allAgents.length,
        goals: allGoals.length,
        tasks: allTasks.length,
      },
      agentStatus: {
        idle: allAgents.filter((a) => a.status === 'idle').length,
        working: allAgents.filter((a) => a.status === 'working').length,
        error: allAgents.filter((a) => a.status === 'error').length,
        paused: allAgents.filter((a) => a.status === 'paused').length,
      },
      taskStatus: {
        pending: allTasks.filter((t) => t.status === 'pending').length,
        in_progress: allTasks.filter((t) => t.status === 'in_progress').length,
        review: allTasks.filter((t) => t.status === 'review').length,
        done: allTasks.filter((t) => t.status === 'done').length,
        blocked: allTasks.filter((t) => t.status === 'blocked').length,
      },
      budget: {
        total: allAgents.reduce((sum, a) => sum + (parseFloat(a.budgetLimit) || 0), 0),
        used: allAgents.reduce((sum, a) => sum + (parseFloat(a.budgetUsed) || 0), 0),
      },
    };
  });

  // GET /api/v1/dashboard/agents
  fastify.get('/agents', async () => {
    const allAgents = await db.select().from(agents);
    return { agents: allAgents };
  });

  // GET /api/v1/dashboard/tasks
  fastify.get('/tasks', async () => {
    const allTasks = await db.select().from(tasks);
    return { tasks: allTasks };
  });

  // GET /api/v1/dashboard/budget
  fastify.get('/budget', async () => {
    const allAgents = await db.select().from(agents);
    return {
      budget: {
        total: allAgents.reduce((sum, a) => sum + (parseFloat(a.budgetLimit) || 0), 0),
        used: allAgents.reduce((sum, a) => sum + (parseFloat(a.budgetUsed) || 0), 0),
        remaining: allAgents.reduce(
          (sum, a) => sum + (parseFloat(a.budgetLimit) || 0) - (parseFloat(a.budgetUsed) || 0),
          0
        ),
      },
    };
  });
}
