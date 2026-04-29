import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().default('postgres://localhost:5432/openchain'),
  NATS_URL: z.string().default('nats://localhost:4222'),
  OLLAMA_HOST: z.string().default('https://api.ollama.com'),
  OLLAMA_TOKEN: z.string(),
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

export const DOCKER_IMAGE = 'open-chain-ai/agent-sandbox:latest';
