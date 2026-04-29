import dotenv from 'dotenv';
import { z } from 'zod';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Lade .env aus dem Root-Verzeichnis (2 Ebenen höher)
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('postgres://openchain:openchain@localhost:5432/openchain'),
  OLLAMA_HOST: z.string().default('http://localhost:11434'),
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  SANDBOX_CPU_LIMIT: z.string().default('1'),
  SANDBOX_MEMORY_LIMIT: z.string().default('512m'),
  CIRCUIT_BREAKER_MAX_REVISIONS: z.string().default('3'),
});

export const config = configSchema.parse(process.env);

export const CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];
