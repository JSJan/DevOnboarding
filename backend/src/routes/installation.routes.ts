import { FastifyInstance } from 'fastify';
import { InstallationService } from '../services/installation.service';
import { Platform } from '../types';

interface CreateInstallationBody {
  platform: Platform;
  selectedSoftware: string[];
}

export async function installationRoutes(app: FastifyInstance) {
  const installationService = new InstallationService();

  // POST /api/installations - Create a new installation session
  app.post<{ Body: CreateInstallationBody }>('/', async (request, reply) => {
    const { platform, selectedSoftware } = request.body;

    if (!platform || !selectedSoftware?.length) {
      return reply.status(400).send({ error: 'Platform and selectedSoftware are required' });
    }

    const installation = installationService.create(platform, selectedSoftware);
    return reply.status(201).send(installation);
  });

  // GET /api/installations/:id - Get installation status
  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    return installationService.getById(request.params.id);
  });

  // POST /api/installations/:id/start - Start the installation process
  app.post<{ Params: { id: string } }>('/:id/start', async (request, reply) => {
    const result = installationService.start(request.params.id);
    if (!result) {
      return reply.status(404).send({ error: 'Installation not found' });
    }
    return { message: 'Installation started', installationId: request.params.id };
  });

  // POST /api/installations/:id/retry/:taskId - Retry a failed task
  app.post<{ Params: { id: string; taskId: string } }>('/:id/retry/:taskId', async (request) => {
    return installationService.retryTask(request.params.id, request.params.taskId);
  });

  // GET /api/installations/:id/logs - Get installation logs
  app.get<{ Params: { id: string } }>('/:id/logs', async (request) => {
    return installationService.getLogs(request.params.id);
  });
}
