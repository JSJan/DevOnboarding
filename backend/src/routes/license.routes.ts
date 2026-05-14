import { FastifyInstance } from 'fastify';
import { LicenseService } from '../services/license.service';

export async function licenseRoutes(app: FastifyInstance) {
  const licenseService = new LicenseService();

  // POST /api/licenses/validate - Validate licenses for selected software
  app.post<{ Body: { softwareIds: string[] } }>('/validate', async (request) => {
    const { softwareIds } = request.body;
    return licenseService.validateAll(softwareIds);
  });

  // GET /api/licenses/:softwareId - Get license info for a specific software
  app.get<{ Params: { softwareId: string } }>('/:softwareId', async (request) => {
    return licenseService.getInfo(request.params.softwareId);
  });
}
