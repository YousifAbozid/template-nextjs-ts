import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Health Check Zod Schemas
 */

// Health status enum
export const HealthStatusEnum = z
  .enum(['healthy', 'degraded', 'unhealthy'])
  .openapi({
    description: 'Component health status',
    example: 'healthy'
  });

// Component health schema
export const ComponentHealthSchema = z
  .object({
    status: HealthStatusEnum,
    message: z.string().openapi({ description: 'Health check message' }),
    responseTime: z
      .number()
      .optional()
      .openapi({ description: 'Response time in ms' }),
    details: z
      .record(z.string(), z.unknown())
      .optional()
      .openapi({ description: 'Additional details' })
  })
  .openapi('ComponentHealth');

// Health response schema
export const HealthResponseSchema = z
  .object({
    status: HealthStatusEnum,
    timestamp: z.string().openapi({
      description: 'Current timestamp',
      format: 'date-time',
      example: '2023-12-04T10:30:00Z'
    }),
    version: z.string().optional().openapi({
      description: 'Service version',
      example: '1.0.0'
    }),
    uptime: z.number().optional().openapi({
      description: 'Server uptime in seconds',
      example: 3600
    }),
    checks: z
      .record(z.string(), ComponentHealthSchema)
      .optional()
      .openapi({ description: 'Component-specific health checks' })
  })
  .openapi('HealthResponse');

// Export types
export type HealthStatus = z.infer<typeof HealthStatusEnum>;
export type ComponentHealth = z.infer<typeof ComponentHealthSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
