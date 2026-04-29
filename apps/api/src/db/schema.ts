import { pgTable, uuid, text, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core';

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
  status: text('status').default('idle'),
  companyId: uuid('company_id').references(() => companies.id),
  budgetLimit: real('budget_limit').default(100),
  budgetUsed: real('budget_used').default(0),
  lastHeartbeat: timestamp('last_heartbeat'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  priority: text('priority').default('medium'),
  assigneeId: uuid('assignee_id').references(() => agents.id),
  revisionCount: integer('revision_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
