import 'reflect-metadata';

/**
 * HTTP method types supported by the API
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export interface ApiOperationOptions {
  method?: HttpMethod;
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  deprecated?: boolean;
  parameters?: any[];
  requestBody?: any;
  responses?: Record<string, any>;
  security?: any[];
  [key: string]: any;
}

/**
 * Decorator for marking API operation methods with metadata
 */
export function ApiOperation(
  options: ApiOperationOptions = {}
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    const operationMetadata = {
      method: options.method || 'GET',
      summary: options.summary || '',
      description: options.description || '',
      operationId:
        options.operationId ||
        `${target.constructor.name}_${String(propertyKey)}`,
      tags: options.tags || [],
      responses: options.responses || {
        200: { description: 'Success' },
      },
      parameters: options.parameters || [],
      requestBody: options.requestBody,
      security: options.security,
      deprecated: options.deprecated || false,
      ...options,
    };

    // Store operation metadata
    Reflect.defineMetadata(
      'api:operation',
      operationMetadata,
      target,
      propertyKey
    );

    // Store on the class for discovery
    const existingOperations =
      Reflect.getMetadata('api:operations', target.constructor) || [];
    existingOperations.push({
      propertyKey,
      metadata: operationMetadata,
      target: target.constructor,
    });
    Reflect.defineMetadata(
      'api:operations',
      existingOperations,
      target.constructor
    );
  };
}

/**
 * Shorthand decorators for common HTTP methods
 */
export const Get = (options = {}) =>
  ApiOperation({ ...options, method: 'GET' });
export const Post = (options = {}) =>
  ApiOperation({ ...options, method: 'POST' });
export const Put = (options = {}) =>
  ApiOperation({ ...options, method: 'PUT' });
export const Patch = (options = {}) =>
  ApiOperation({ ...options, method: 'PATCH' });
export const Delete = (options = {}) =>
  ApiOperation({ ...options, method: 'DELETE' });

export interface ApiBodyOptions {
  required?: boolean;
  description?: string;
  examples?: any;
  [key: string]: any;
}

/**
 * Decorator for setting request body schema
 */
export function ApiBody(
  bodyType: any,
  options: ApiBodyOptions = {}
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    const bodyMetadata = {
      type: bodyType,
      required: options.required !== false,
      description: options.description,
      examples: options.examples,
      ...options,
    };

    Reflect.defineMetadata('api:body', bodyMetadata, target, propertyKey);
  };
}

/**
 * Decorator for setting response schemas
 */
export function ApiResponse(responses: Record<string, any>): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    _descriptor: PropertyDescriptor
  ) {
    const existingOperation =
      Reflect.getMetadata('api:operation', target, propertyKey) || {};
    existingOperation.responses = {
      ...existingOperation.responses,
      ...responses,
    };
    Reflect.defineMetadata(
      'api:operation',
      existingOperation,
      target,
      propertyKey
    );
  };
}
