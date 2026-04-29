import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config.js';
import * as schema from './schema.js';

// ⚠️ WICHTIG: pgvector Extension muss aktiviert sein!
// CREATE EXTENSION IF NOT EXISTS vector;

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error', err);
  process.exit(-1);
});

export const db = drizzle(pool, { schema });

// Health check
export async function checkDatabase(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
