import Fastify from 'fastify';
import cors from '@fastify/cors';
import { readFile } from 'node:fs/promises';
import { Server } from 'socket.io';
import { installationRoutes } from './routes/installation.routes';
import { catalogRoutes } from './routes/catalog.routes';
import { licenseRoutes } from './routes/license.routes';
import { versionCheckRoutes } from './routes/version-check.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { setupSocketHandlers } from './websocket/socket.handler';
import { initDatabase } from './database/db';

const PORT = Number(process.env.PORT) || 3001;

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  // Initialize database
  initDatabase();

  // Register routes
  await app.register(catalogRoutes, { prefix: '/api/catalog' });
  await app.register(installationRoutes, { prefix: '/api/installations' });
  await app.register(licenseRoutes, { prefix: '/api/licenses' });
  await app.register(versionCheckRoutes, { prefix: '/api/version-check' });
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' });

  // Health check
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // OpenAPI specification
  app.get('/api/openapi.yaml', async (_request, reply) => {
    try {
      const spec = await readFile(`${process.cwd()}/openapi.yaml`, 'utf8');
      return reply.type('application/yaml').send(spec);
    } catch {
      return reply.status(404).send({ error: 'OpenAPI spec not found' });
    }
  });

  // Start HTTP server
  await app.listen({ port: PORT, host: '0.0.0.0' });

  // Attach Socket.IO to the underlying HTTP server
  const io = new Server(app.server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  setupSocketHandlers(io);

  console.log(`Server running on http://localhost:${PORT}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
