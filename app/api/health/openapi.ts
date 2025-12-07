import { registry, createRouteConfig } from '@/lib/api/openapi';
import { HealthResponseSchema } from './schema';

/**
 * OpenAPI route definitions for /api/health
 */

// GET /api/health - Health check
registry.registerPath(
  createRouteConfig({
    method: 'get',
    path: '/api/health',
    tags: ['Health'],
    summary: 'Health check endpoint',
    description:
      'Check the overall health status of the API and its dependencies. Optionally check specific components.',
    responses: {
      200: {
        description: 'Health check completed successfully',
        content: {
          'application/json': {
            schema: HealthResponseSchema
          }
        }
      },
      503: {
        description: 'Service unavailable',
        content: {
          'application/json': {
            schema: HealthResponseSchema
          }
        }
      }
    }
  })
);
