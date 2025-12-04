const productionUrl = 'https://template-nextjs-ts.vercel.app';

// Database configuration
export const dbConfig = {
  url: process.env.MONGODB_URI || 'mongodb://localhost:27017/nextjs-backend',
  options: {
    // Add mongoose connection options here if needed
  },
};

export const openApiConfig = {
  // API Information
  info: {
    title: process.env.API_TITLE || 'Next.js Decorator API',
    version: process.env.API_VERSION || '1.0.0',
    description:
      process.env.API_DESCRIPTION ||
      'Modern Next.js API with decorator-based OpenAPI generation',
    contact: {
      name: 'API Support',
      url: 'https://github.com/YousifAbozid/template-nextjs-ts',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },

  // Servers configuration - automatically adapts to environment
  servers:
    process.env.NODE_ENV === 'production'
      ? [
          {
            url: productionUrl,
            description: 'Production server',
          },
        ]
      : [
          {
            url: 'http://localhost:3000',
            description: 'Local development server',
          },
          {
            url: productionUrl,
            description: 'Development server (Vercel)',
          },
        ],

  // Security schemes (only one Bearer Auth)
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT Bearer token authentication',
    },
  },

  // File paths
  paths: {
    output: {
      spec: 'app/lib/api/types/openapi.json',
      types: 'app/lib/api/types/ApiTypes.ts',
      client: 'app/lib/api/types/ApiClient.ts',
    },
  },

  // Generation patterns
  patterns: [
    'app/api/**/*.js',
    'app/api/**/*.ts',
    'app/lib/api/**/*.js',
    'app/lib/api/**/*.ts',
  ],
};
