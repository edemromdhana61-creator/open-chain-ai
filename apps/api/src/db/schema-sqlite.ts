import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Einfaches SQLite Schema - kein Docker nötig!

export const companies = sqliteTable('companies', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  budgetLimit: real('budget_limit').default(500),
  budgetUsed: real('budget_used').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const agents = sqliteTable('agents', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  adapterType: text('adapter_type').notNull(),
  role: text('role'),
  status: text('status', { enum: ['idle', 'working', 'error', 'paused'] }).default('idle'),
  companyId: integer('company_id'),
  budgetLimit: real('budget_limit').default(100),
  budgetUsed: real('budget_used').default(0),
  lastHeartbeat: integer('last_heartbeat', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const tasks = sqliteTable('tasks', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status', { enum: ['pending', 'in_progress', 'review', 'done', 'blocked'] }).default('pending'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  assigneeId: integer('assignee_id'),
  goalId: integer('goal_id'),
  revisionCount: integer('revision_count').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const messages = sqliteTable('messages', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  fromAgentId: integer('from_agent_id'),
  toAgentId: integer('to_agent_id'),
  type: text('type').notNull(),
  content: text('content'),
  payload: text('payload'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const heartbeats = sqliteTable('heartbeats', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  agentId: integer('agent_id').notNull(),
  status: text('status').notNull(),
  metrics: text('metrics'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
