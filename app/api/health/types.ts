/**
 * Health check related DTOs and types
 */

/**
 * Health status enum
 */
export const HealthStatus = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
} as const;

/**
 * Component health interface
 */
export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

/**
 * Health response DTO
 */
export class HealthResponseDto {
  status!: string;
  timestamp!: string;
  version!: string;
  message?: string;
  components?: Record<string, ComponentHealth>;
  responseTime?: number;
}
