import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { config, CORS_ORIGINS } from './config.js';
import { checkDatabase } from './db/index.js';
import { agentRoutes } from './routes/agents.js';
import { taskRoutes } from './routes/tasks.js';
import { heartbeatRoutes } from './routes/heartbeat.js';
import { messageRoutes } from './routes/messages.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { sandbox } from './services/sandbox.js';

const app = Fastify({
  logger: true,
});

// CORS
await app.register(cors, {
  origin: CORS_ORIGINS,
  credentials: true,
});

// WebSocket
await app.register(websocket);

// Health check
app.get('/health', async () => {
  const dbHealthy = await checkDatabase();
  return {
    status: dbHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
  };
});

// API Routes v1
await app.register(agentRoutes, { prefix: '/api/v1/agents' });
await app.register(taskRoutes, { prefix: '/api/v1/tasks' });
await app.register(heartbeatRoutes, { prefix: '/api/v1/heartbeat' });
await app.register(messageRoutes, { prefix: '/api/v1/messages' });
await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });

// WebSocket for real-time updates
app.get('/api/v1/ws', { websocket: true }, (connection, req) => {
  connection.socket.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Broadcast to all connected clients
      app.websocketServer?.clients.forEach((client) => {
        if (client.readyState === 1 && client !== connection.socket) {
          client.send(JSON.stringify(data));
        }
      });
    } catch {
      connection.socket.send(JSON.stringify({ error: 'Invalid message format' }));
    }
  });
});

// Cleanup job (every 5 minutes)
setInterval(async () => {
  try {
    await sandbox.cleanupZombies();
    app.log.info('Cleaned up zombie containers');
  } catch (err) {
    app.log.error(err, 'Failed to cleanup zombie containers');
  }
}, 5 * 60 * 1000);

// Start server
try {
  await app.listen({ port: parseInt(config.PORT), host: '0.0.0.0' });
  app.log.info(`🚀 Server running on http://localhost:${config.PORT}`);
  app.log.info(`📊 Dashboard: http://localhost:${config.PORT}/api/v1/dashboard`);
  app.log.info(`🔌 WebSocket: ws://localhost:${config.PORT}/api/v1/ws`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
