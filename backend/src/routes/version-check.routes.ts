import { FastifyInstance } from 'fastify';
import { VersionCheckService } from '../services/version-check.service';
import { Platform } from '../types';

export async function versionCheckRoutes(app: FastifyInstance) {
  const versionCheckService = new VersionCheckService();

  // GET /api/version-check/:platform - Check all software versions for a platform
  app.get<{ Params: { platform: string } }>('/:platform', async (request, reply) => {
    const platform = request.params.platform as Platform;
    if (!['macos', 'linux', 'windows'].includes(platform)) {
      return reply.status(400).send({ error: 'Invalid platform. Use: macos, linux, windows' });
    }
    return versionCheckService.checkAll(platform);
  });

  // GET /api/version-check/:platform/:softwareId - Check a specific software version
  app.get<{ Params: { platform: string; softwareId: string } }>(
    '/:platform/:softwareId',
    async (request, reply) => {
      const platform = request.params.platform as Platform;
      const result = versionCheckService.checkById(request.params.softwareId, platform);
      if (!result) {
        return reply.status(404).send({ error: 'Software not found' });
      }
      return result;
    }
  );
}
