import { pgTable, uuid, varchar, text, timestamp, integer, decimal, jsonb, index, vector } from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  mission: text('mission'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  adapterType: varchar('adapter_type', { length: 50 }).notNull(),
  role: varchar('role', { length: 100 }),
  supervisorId: uuid('supervisor_id').references(() => agents.id),
  status: varchar('status', { length: 20 }).default('idle').notNull(),
  config: jsonb('config'),
  budgetLimit: decimal('budget_limit', { precision: 12, scale: 2 }),
  budgetUsed: decimal('budget_used', { precision: 12, scale: 2 }).default('0'),
  lastHeartbeat: timestamp('last_heartbeat'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id).notNull(),
  parentGoalId: uuid('parent_goal_id').references(() => goals.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  progress: integer('progress').default(0),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  goalId: uuid('goal_id').references(() => goals.id).notNull(),
  assigneeId: uuid('assignee_id').references(() => agents.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  parentTaskId: uuid('parent_task_id').references(() => tasks.id),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  cost: decimal('cost', { precision: 12, scale: 2 }).default('0'),
  deliverables: jsonb('deliverables'),
  revisionCount: integer('revision_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromAgentId: varchar('from_agent_id', { length: 255 }).notNull(),
  toAgentId: varchar('to_agent_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  payload: jsonb('payload'),
  threadId: uuid('thread_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const heartbeats = pgTable('heartbeats', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  currentTaskId: uuid('current_task_id').references(() => tasks.id),
  progress: integer('progress'),
  metrics: jsonb('metrics'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ⚠️ KRITISCH: Embedding Dimension muss zum Modell passen!
// nomic-embed-text = 768
// mxbai-embed-large = 1024
export const agentMemories = pgTable('agent_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id).notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 768 }).notNull(), // NOMIC-EMBED-TEXT
  taskContext: uuid('task_context').references(() => tasks.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Vektor-Index für schnelle Similarity-Suche
  embeddingIdx: index('embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));
