import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { checkDatabase, db } from './db/sqlite.js';
import { agents } from './db/schema-sqlite.js';
import { agentRoutes } from './routes/agents.js';
import { taskRoutes } from './routes/tasks.js';
import { ollama } from './services/ollama.js';

const app = Fastify({
  logger: true,
});

// CORS
await app.register(cors, {
  origin: true,
  credentials: true,
});

// Health check
app.get('/health', async () => {
  const dbHealthy = checkDatabase();
  const ollamaHealthy = await ollama.isHealthy();

  return {
    status: dbHealthy && ollamaHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      api: true,
      database: dbHealthy,
      ollama: ollamaHealthy,
    },
  };
});

// Ollama status
app.get('/api/v1/ollama/status', async () => {
  const healthy = await ollama.isHealthy();
  const models = await ollama.listModels();

  return {
    status: healthy ? 'connected' : 'disconnected',
    models,
  };
});

// API Routes
await app.register(agentRoutes, { prefix: '/api/v1/agents' });
await app.register(taskRoutes, { prefix: '/api/v1/tasks' });

// Seed default agents
const seedAgents = async () => {
  const existing = await db.select().from(agents);
  if (existing.length === 0) {
    console.log('🌱 Seeding default agents...');
    await db.insert(agents).values([
      { name: 'OpenClaw', adapterType: 'openclaw', role: 'Project Manager', status: 'idle' },
      { name: 'Hermes', adapterType: 'hermes', role: 'Senior Developer', status: 'idle' },
      { name: 'Claude', adapterType: 'claude', role: 'Researcher', status: 'idle' },
      { name: 'Codex', adapterType: 'codex', role: 'DevOps Engineer', status: 'idle' },
    ]);
  }
};

// Start server
try {
  await seedAgents();

  await app.listen({ port: parseInt(config.PORT), host: '0.0.0.0' });

  console.log('🚀 Open Chain AI Server running!');
  console.log(`📊 Dashboard: http://localhost:${config.PORT}`);
  console.log(`🔍 Health:     http://localhost:${config.PORT}/health`);

  // Check Ollama
  const ollamaHealthy = await ollama.isHealthy();
  if (ollamaHealthy) {
    console.log('✅ Ollama connected');
    const models = await ollama.listModels();
    console.log(`📦 Available models: ${models.join(', ')}`);
  } else {
    console.log('⚠️  Ollama not found. Install: curl -fsSL https://ollama.com/install.sh | sh');
    console.log('   Then pull a model: ollama pull llama3.2');
  }
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
