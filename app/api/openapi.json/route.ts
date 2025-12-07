import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/openapi.json - Serve OpenAPI specification
 *
 * Returns the generated OpenAPI JSON spec from the root directory
 */
export async function GET() {
  try {
    const openapiPath = path.join(process.cwd(), 'openapi.json');
    const content = await fs.readFile(openapiPath, 'utf-8');
    const spec = JSON.parse(content);

    return NextResponse.json(spec);
  } catch (error) {
    console.error('Failed to read openapi.json:', error);
    return NextResponse.json(
      {
        error: 'OpenAPI spec not found',
        message:
          'Run "npm run api:generate" to generate the OpenAPI specification',
      },
      { status: 404 }
    );
  }
}
