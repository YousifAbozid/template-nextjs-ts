import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '../decorators';

// Create alias for optional properties
const ApiPropertyOptional = ApiProperty;

/**
 * Health status enum
 */
export const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
} as const;

/**
 * Health check response DTO
 */
export class HealthResponseDto {
  @ApiProperty({
    description: 'Service health status',
    example: 'healthy',
  })
  @IsString()
  @IsEnum(HealthStatus)
  status!: string;

  @ApiProperty({
    description: 'Current timestamp',
    format: 'date-time',
    example: '2023-12-04T10:30:00Z',
  })
  @IsDateString()
  timestamp!: string;

  @ApiPropertyOptional({
    description: 'Service version information',
    example: '1.0.0',
  })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional({
    description: 'Additional health information',
    example: 'All systems operational',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

/**
 * Health check query parameters DTO
 */
export class HealthQueryDto {
  @ApiPropertyOptional({
    description: 'Include detailed health information',
    type: 'boolean',
    example: true,
  })
  @IsOptional()
  detailed?: boolean;

  @ApiPropertyOptional({
    description: 'Check specific service components',
    type: 'array',
    items: { type: 'string' },
    example: ['database', 'cache'],
  })
  @IsOptional()
  @IsString({ each: true })
  components?: string[];
}
