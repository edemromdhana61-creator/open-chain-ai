import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { checkDatabase, db } from './db/index.js';
import { agents } from './db/schema.js';
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
  const dbHealthy = await checkDatabase();
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

// API Routes
await app.register(agentRoutes, { prefix: '/api/v1/agents' });
await app.register(taskRoutes, { prefix: '/api/v1/tasks' });

// Start server
try {
  await app.listen({ port: parseInt(config.PORT), host: '0.0.0.0' });

  console.log('🚀 Open Chain AI Server läuft!');
  console.log(`📊 Dashboard: http://localhost:${config.PORT}`);
  console.log(`🔍 Health:     http://localhost:${config.PORT}/health`);

  // Check services
  const dbHealthy = await checkDatabase();
  if (dbHealthy) {
    console.log('✅ PostgreSQL verbunden');
  } else {
    console.log('❌ PostgreSQL nicht erreichbar');
  }

  const ollamaHealthy = await ollama.isHealthy();
  if (ollamaHealthy) {
    console.log('✅ Ollama verbunden');
  } else {
    console.log('⚠️  Ollama nicht erreichbar');
    console.log('   Installiere: curl -fsSL https://ollama.com/install.sh | sh');
  }
} catch (err) {
  console.error('❌ Server Start fehlgeschlagen:', err);
  process.exit(1);
}
