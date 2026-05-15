import { FastifyInstance } from 'fastify';
import { DashboardService } from '../services/dashboard.service';

export async function dashboardRoutes(app: FastifyInstance) {
  const dashboardService = new DashboardService();

  // GET /api/dashboard/roles - List all role presets
  app.get('/roles', async () => {
    return dashboardService.getRoles();
  });

  // GET /api/dashboard/roles/:roleId - Get dashboard data for a specific role
  app.get<{ Params: { roleId: string } }>('/roles/:roleId', async (request, reply) => {
    const dashboard = dashboardService.getRoleDashboard(request.params.roleId);
    if (!dashboard) {
      return reply.status(404).send({ error: 'Role not found' });
    }
    return dashboard;
  });

  // GET /api/dashboard - Get all role dashboards (overview)
  app.get('/', async () => {
    return dashboardService.getAllRoleDashboards();
  });
}
