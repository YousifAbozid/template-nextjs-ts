import { NextResponse } from 'next/server';

/**
 * GET /api - API Information endpoint
 *
 * Returns basic information about the API and available endpoints
 */
export async function GET() {
  return NextResponse.json({
    name: process.env.API_TITLE || 'Next.js Functional API',
    version: process.env.API_VERSION || '1.0.0',
    description:
      process.env.API_DESCRIPTION ||
      'Modern Next.js API with Zod schemas and functional OpenAPI generation',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      openapi: '/api/openapi.json',
      users: '/api/users'
    }
  });
}
