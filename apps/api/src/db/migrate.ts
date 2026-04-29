import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://openchain:openchain@localhost:5432/openchain',
});

async function migrate() {
  console.log('🔄 Erstelle Datenbanktabellen...');

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS companies (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      budget_limit REAL DEFAULT 500,
      budget_used REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agents (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      adapter_type TEXT NOT NULL,
      role TEXT,
      status TEXT DEFAULT 'idle',
      company_id UUID REFERENCES companies(id),
      budget_limit REAL DEFAULT 100,
      budget_used REAL DEFAULT 0,
      last_heartbeat TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      company_id UUID NOT NULL REFERENCES companies(id),
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assignee_id UUID REFERENCES agents(id),
      goal_id UUID REFERENCES goals(id),
      revision_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      from_agent_id UUID REFERENCES agents(id),
      to_agent_id UUID REFERENCES agents(id),
      type TEXT NOT NULL,
      content TEXT,
      payload JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS heartbeats (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      agent_id UUID NOT NULL REFERENCES agents(id),
      status TEXT NOT NULL,
      metrics JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Seed Daten
    INSERT INTO companies (name) 
    VALUES ('My Company') 
    ON CONFLICT DO NOTHING;

    INSERT INTO agents (name, adapter_type, role, status) VALUES 
      ('OpenClaw', 'openclaw', 'Project Manager', 'idle'),
      ('Hermes', 'hermes', 'Senior Developer', 'idle'),
      ('Claude', 'claude', 'Researcher', 'idle'),
      ('Codex', 'codex', 'DevOps Engineer', 'idle')
    ON CONFLICT DO NOTHING;
  `);

  console.log('✅ Tabellen erstellt und mit Beispieldaten gefüllt');
  await pool.end();
}

migrate().catch(console.error);
