import 'reflect-metadata';
import {
  validateQuery,
  validateParams,
  validateBody,
  ApiValidationError,
} from './middleware';

export interface ValidationOptions {
  skipValidation?: boolean;
  customValidators?: any[];
  queryClass?: any;
  paramsClass?: any;
  [key: string]: any;
}

/**
 * Automatic validation decorator for API route methods
 * Uses reflection to determine validation schemas from method metadata
 */
export function ValidateRequest(
  options: ValidationOptions = {}
): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const [req, res] = args;

      try {
        const validatedData: any = {};

        // Get method metadata for validation schemas
        const bodyMetadata = Reflect.getMetadata(
          'api:body',
          target,
          propertyKey
        );
        const bodyParam = Reflect.getMetadata(
          'api:body-param',
          target,
          propertyKey
        );
        const parameters =
          Reflect.getMetadata('api:parameters', target, propertyKey) || [];

        // Validate request body if specified
        if (bodyMetadata?.type || bodyParam?.type) {
          const BodyClass = bodyMetadata?.type || bodyParam?.type;
          if (typeof BodyClass === 'function') {
            validatedData.body = await validateBody(req.body, BodyClass);
          }
        }

        // Extract query and path parameter schemas
        const queryParams = parameters.filter(
          (p: any) => p.location === 'query'
        );
        const pathParams = parameters.filter((p: any) => p.location === 'path');

        // Validate query parameters if any are defined
        if (queryParams.length > 0 && options.queryClass) {
          validatedData.query = await validateQuery(
            req.query || {},
            options.queryClass
          );
        }

        // Validate path parameters if any are defined
        if (pathParams.length > 0 && options.paramsClass) {
          validatedData.params = await validateParams(
            req.params || {},
            options.paramsClass
          );
        }

        // Attach validated data to request
        req.validated = validatedData;

        // Call original method
        return originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof ApiValidationError) {
          return res.status(error.statusCode).json(error.errors);
        }

        console.error('Validation error:', error);
        return res.status(500).json({
          message: 'Internal validation error',
          errors: { general: ['An unexpected error occurred'] },
        });
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for validating only the request body
 * @param {Function} BodyClass - DTO class for request body validation
 */
export function ValidateBody(BodyClass: any): MethodDecorator {
  return ValidateRequest({ bodyClass: BodyClass });
}

/**
 * Decorator for validating only query parameters
 * @param {Function} QueryClass - DTO class for query parameter validation
 */
export function ValidateQuery(QueryClass: any): MethodDecorator {
  return ValidateRequest({ queryClass: QueryClass });
}

/**
 * Decorator for validating only path parameters
 * @param {Function} ParamsClass - DTO class for path parameter validation
 */
export function ValidateParams(ParamsClass: any): MethodDecorator {
  return ValidateRequest({ paramsClass: ParamsClass });
}

/**
 * Combine multiple validation decorators
 * @param {object} config - Validation configuration
 */
export function ValidateAll(config = {}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    // Apply ValidateRequest with full configuration
    const validateRequestDecorator = ValidateRequest(config);
    return validateRequestDecorator(target, propertyKey, descriptor);
  };
}
