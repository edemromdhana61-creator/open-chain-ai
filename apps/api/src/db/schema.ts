import { pgTable, uuid, text, timestamp, jsonb, integer, real, boolean } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  budgetLimit: real('budget_limit').default(500),
  budgetUsed: real('budget_used').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  adapterType: text('adapter_type').notNull(),
  role: text('role'),
  status: text('status', { enum: ['idle', 'working', 'error', 'paused'] }).default('idle'),
  companyId: uuid('company_id').references(() => companies.id),
  supervisorId: uuid('supervisor_id'),
  capabilities: jsonb('capabilities').$type<string[]>(),
  config: jsonb('config'),
  budgetLimit: real('budget_limit').default(100),
  budgetUsed: real('budget_used').default(0),
  lastHeartbeat: timestamp('last_heartbeat'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const goals = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  status: text('status', { enum: ['active', 'completed', 'failed'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  goalId: uuid('goal_id').notNull().references(() => goals.id),
  assigneeId: uuid('assignee_id').references(() => agents.id),
  status: text('status', { enum: ['pending', 'in_progress', 'review', 'done', 'blocked'] }).default('pending'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  deliverables: jsonb('deliverables').$type<{ type: string; content: string }[]>(),
  parentTaskId: uuid('parent_task_id'),
  revisionCount: integer('revision_count').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  fromAgentId: uuid('from_agent_id').references(() => agents.id),
  toAgentId: uuid('to_agent_id').references(() => agents.id),
  type: text('type', {
    enum: ['heartbeat', 'task_update', 'question', 'answer', 'status', 'error', 'deliverable']
  }).notNull(),
  payload: jsonb('payload'),
  threadId: uuid('thread_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const heartbeats = pgTable('heartbeats', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  status: text('status', { enum: ['healthy', 'warning', 'error'] }).notNull(),
  currentTaskId: uuid('current_task_id'),
  progress: real('progress').default(0),
  metrics: jsonb('metrics'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const agentMemories = pgTable('agent_memories', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  type: text('type').notNull(),
  content: text('content').notNull(),
  embedding: text('embedding'), // Simplified - no pgvector for now
  tags: jsonb('tags').$type<string[]>(),
  metadata: jsonb('metadata'),
  importance: real('importance').default(0.5),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});
