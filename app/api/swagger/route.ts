import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/swagger - Serve OpenAPI specification JSON
 */
export async function GET() {
  try {
    const specPath = path.join(process.cwd(), 'app/lib/api/types/openapi.json');
    const specContent = await fs.readFile(specPath, 'utf8');
    const openApiSpec = JSON.parse(specContent);

    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('Failed to read OpenAPI spec:', error);

    // Return a basic spec if file doesn't exist
    return NextResponse.json({
      openapi: '3.0.3',
      info: {
        title: 'Next.js Decorator API',
        version: '1.0.0',
        description:
          'API documentation not yet generated. Run `npm run api:generate` to create the specification.',
      },
      paths: {},
      components: { schemas: {} },
    });
  }
}
