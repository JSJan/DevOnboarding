import { FastifyInstance } from 'fastify';
import { CatalogService } from '../services/catalog.service';

export async function catalogRoutes(app: FastifyInstance) {
  const catalogService = new CatalogService();

  // GET /api/catalog - List all available software
  app.get('/', async () => {
    return catalogService.getAll();
  });

  // GET /api/catalog/:id - Get specific software details
  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const item = catalogService.getById(request.params.id);
    if (!item) {
      return { error: 'Software not found' };
    }
    return item;
  });

  // GET /api/catalog/platform/:platform - Get software available for a platform
  app.get<{ Params: { platform: string } }>('/platform/:platform', async (request) => {
    return catalogService.getByPlatform(request.params.platform);
  });
}
