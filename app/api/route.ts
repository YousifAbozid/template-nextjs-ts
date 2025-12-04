import { NextResponse } from 'next/server';
import { ApiProperty } from '@/app/lib/api/decorators';

/**
 * API Information DTO
 */
class ApiInfoDto {
  @ApiProperty({
    description: 'API name',
    example: 'Next.js Decorator API',
  })
  name!: string;

  @ApiProperty({
    description: 'API version',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'API description',
    example: 'Modern Next.js API with decorator-based OpenAPI generation',
  })
  description!: string;

  @ApiProperty({
    description: 'Current timestamp',
    format: 'date-time',
    example: '2023-12-04T10:30:00Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'API environment',
    example: 'development',
  })
  environment!: string;

  @ApiProperty({
    description: 'Available endpoints',
    type: 'object',
    example: {
      health: '/api/health',
      docs: '/api/docs',
      swagger: '/api/swagger',
    },
  })
  endpoints!: Record<string, string>;
}

/**
 * GET /api - Get basic API information
 *
 * Returns basic information about the API including version,
 * description, and available endpoints.
 */
export async function GET() {
  try {
    const apiInfo: ApiInfoDto = {
      name: process.env.API_TITLE || 'Next.js Decorator API',
      version: process.env.API_VERSION || '1.0.0',
      description:
        process.env.API_DESCRIPTION ||
        'Modern Next.js API with decorator-based OpenAPI generation',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        info: '/api',
        health: '/api/health',
        docs: '/api/docs',
        swagger: '/api/swagger',
      },
    };

    return NextResponse.json(apiInfo);
  } catch (error) {
    console.error('API info error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve API information',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
