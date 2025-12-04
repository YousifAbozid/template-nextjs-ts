import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';

/**
 * Validation error response format
 */
export class ApiValidationError extends Error {
  public statusCode: number;
  public errors: any;

  constructor(errors: any, statusCode: number = 400) {
    super('Validation failed');
    this.name = 'ApiValidationError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Formats validation errors into a consistent structure
 * @param validationErrors - Array of validation errors
 * @returns Formatted error response
 */
export function formatValidationErrors(
  validationErrors: ValidationError[]
): Record<string, any> {
  const errors: Record<string, any> = {};

  function extractErrors(error: ValidationError, parentPath: string = '') {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      errors[propertyPath] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      error.children.forEach(childError => {
        extractErrors(childError, propertyPath);
      });
    }
  }

  validationErrors.forEach(error => extractErrors(error));

  return {
    message: 'Validation failed',
    errors,
  };
}

/**
 * Main validation function that validates data against a DTO class
 * @param data - Data to validate
 * @param dtoClass - DTO class constructor
 * @param options - Validation options
 * @returns Validated and transformed data
 */
export async function validateDto(
  data: any,
  dtoClass: any,
  options: { transformOptions?: any; validateOptions?: any } = {}
): Promise<any> {
  if (!dtoClass || typeof dtoClass !== 'function') {
    throw new Error('Invalid DTO class provided');
  }

  try {
    // Transform plain object to class instance
    const instance = plainToInstance(dtoClass, data, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
      ...options.transformOptions,
    });

    // Validate the instance
    const validationErrors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      ...options.validateOptions,
    });

    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      throw new ApiValidationError(formattedErrors, 400);
    }

    return instance;
  } catch (error) {
    if (error instanceof ApiValidationError) {
      throw error;
    }

    throw new ApiValidationError(
      {
        message: 'Invalid data format',
        errors: { general: [(error as Error).message] },
      },
      400
    );
  }
}

/**
 * Validates query parameters with automatic type conversion
 * @param query - Raw query parameters
 * @param dtoClass - Query DTO class
 * @returns Validated query parameters
 */
export async function validateQuery(
  query: Record<string, any>,
  dtoClass: any
): Promise<any> {
  // Convert string values to appropriate types based on DTO
  const convertedQuery = { ...query };

  // Get property metadata to determine types
  const properties = Reflect.getMetadata('api:properties', dtoClass) || {};

  for (const [key, value] of Object.entries(convertedQuery)) {
    const propMetadata = properties[key];
    if (propMetadata && value !== undefined && value !== null) {
      const { type, options } = propMetadata;

      // Convert based on type
      if (type === Number || options.type === 'number') {
        const num = Number(value);
        if (!isNaN(num)) {
          convertedQuery[key] = num;
        }
      } else if (type === Boolean || options.type === 'boolean') {
        convertedQuery[key] =
          value === 'true' || value === '1' || value === 'yes';
      } else if (options.type === 'array' && typeof value === 'string') {
        // Handle comma-separated arrays
        convertedQuery[key] = value.split(',').map(v => v.trim());
      }
    }
  }

  return validateDto(convertedQuery, dtoClass, {
    transformOptions: { enableImplicitConversion: true },
  });
}

/**
 * Validates path parameters
 */
export async function validateParams(
  params: Record<string, any>,
  dtoClass: any
): Promise<any> {
  return validateDto(params, dtoClass, {
    transformOptions: { enableImplicitConversion: true },
  });
}

/**
 * Validates request body
 * @param body - Request body
 * @param dtoClass - Body DTO class
 * @returns Validated body
 */
export async function validateBody(body: any, dtoClass: any): Promise<any> {
  if (!body && dtoClass) {
    throw new ApiValidationError(
      {
        message: 'Request body is required',
        errors: { body: ['Request body cannot be empty'] },
      },
      400
    );
  }

  return validateDto(body, dtoClass);
}

/**
 * Creates a validation middleware for Next.js API routes
 * @param validationConfig - Validation configuration
 * @returns Validation middleware
 */
export function createValidationMiddleware(validationConfig: any = {}) {
  return async function validationMiddleware(req: any, res: any, next?: any) {
    try {
      const validatedData: any = {};

      // Validate query parameters
      if (validationConfig.query) {
        validatedData.query = await validateQuery(
          req.query || {},
          validationConfig.query
        );
      }

      // Validate path parameters
      if (validationConfig.params) {
        validatedData.params = await validateParams(
          req.params || {},
          validationConfig.params
        );
      }

      // Validate request body
      if (validationConfig.body) {
        validatedData.body = await validateBody(
          req.body,
          validationConfig.body
        );
      }

      // Attach validated data to request
      req.validated = validatedData;

      // Call next middleware or handler
      if (next) {
        return next();
      }
    } catch (error) {
      if (error instanceof ApiValidationError) {
        return res.status(error.statusCode).json(error.errors);
      }

      return res.status(500).json({
        message: 'Internal validation error',
        errors: { general: [(error as Error).message] },
      });
    }
  };
}

/**
 * Higher-order function that wraps API route handlers with validation
 * @param {Function} handler - Original API route handler
 * @param {object} validationConfig - Validation configuration
 * @returns {Function} Wrapped handler with validation
 */
export function withValidation(handler: any, validationConfig: any = {}) {
  return async function validatedHandler(req: any, res: any) {
    const middleware = createValidationMiddleware(validationConfig);

    return new Promise((resolve, reject) => {
      middleware(req, res, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(handler(req, res));
        }
      });
    });
  };
}
