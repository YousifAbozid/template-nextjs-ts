import {
  OpenAPIRegistry,
  OpenApiGeneratorV3
} from '@asteasolutions/zod-to-openapi';

/**
 * Global OpenAPI registry for collecting route definitions
 */
export const registry = new OpenAPIRegistry();

/**
 * Generate OpenAPI document from registry
 */
export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: process.env.API_TITLE || 'Next.js Functional API',
      version: process.env.API_VERSION || '1.0.0',
      description:
        process.env.API_DESCRIPTION ||
        'Modern Next.js API with Zod schemas and functional OpenAPI generation',
      contact: {
        name: 'API Support',
        url: 'https://github.com/YousifAbozid/template-nextjs-backend'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers:
      process.env.NODE_ENV === 'production'
        ? [
            {
              url:
                process.env.PRODUCTION_URL ||
                'https://template-nextjs-backend.vercel.app',
              description: 'Production server'
            }
          ]
        : [
            {
              url: 'http://localhost:3000',
              description: 'Local development server'
            },
            {
              url: 'https://template-nextjs-backend.vercel.app',
              description: 'Development server (Vercel)'
            }
          ]
  });
}
