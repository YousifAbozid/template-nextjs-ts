import { z } from 'zod';
import { RouteConfig } from '@asteasolutions/zod-to-openapi';

/**
 * Standard API response wrapper schemas
 */
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.unknown().optional(),
  count: z.number().optional(),
  message: z.string().optional()
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string()
});

/**
 * Helper to create a standard success response schema
 */
export function createSuccessResponse<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    count: z.number().optional(),
    message: z.string().optional()
  });
}

/**
 * Helper to create a standard list response schema
 */
export function createListResponse<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    count: z.number()
  });
}

/**
 * Standard error responses for OpenAPI
 */
export const standardErrorResponses = {
  400: {
    description: 'Bad Request',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  404: {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  },
  500: {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: ErrorResponseSchema
      }
    }
  }
};

/**
 * Helper to create route config with standard error responses
 */
export function createRouteConfig(
  config: Omit<RouteConfig, 'responses'> & {
    responses: Record<string, unknown>;
  }
): RouteConfig {
  return {
    ...config,
    responses: {
      ...config.responses,
      ...standardErrorResponses
    }
  } as RouteConfig;
}
