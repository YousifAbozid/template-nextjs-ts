import 'reflect-metadata';

/**
 * Parameter location types
 */
export const PARAM_TYPES = {
  QUERY: 'query',
  PATH: 'path',
  HEADER: 'header',
  COOKIE: 'cookie',
} as const;

export interface ParameterOptions {
  required?: boolean;
  description?: string;
  schema?: any;
  example?: any;
  examples?: any;
  deprecated?: boolean;
  [key: string]: any;
}

export interface ParameterMetadata extends ParameterOptions {
  index: number;
  location: string;
  name: string;
}

type ParamLocation = (typeof PARAM_TYPES)[keyof typeof PARAM_TYPES];

/**
 * Base parameter decorator
 * @param location - Parameter location (query, path, header, cookie)
 */
function createParameterDecorator(location: ParamLocation) {
  return function (name?: string, options: ParameterOptions = {}) {
    return function (
      target: any,
      propertyKey: string | symbol,
      parameterIndex: number
    ) {
      const existingParameters: ParameterMetadata[] =
        Reflect.getMetadata('api:parameters', target, propertyKey) || [];

      existingParameters.push({
        index: parameterIndex,
        location,
        name: name || `param${parameterIndex}`,
        required: options.required !== false,
        description: options.description,
        schema: options.schema || { type: 'string' },
        example: options.example,
        examples: options.examples,
        deprecated: options.deprecated || false,
        ...options,
      });

      Reflect.defineMetadata(
        'api:parameters',
        existingParameters,
        target,
        propertyKey
      );
    };
  };
}

/**
 * Decorators for different parameter types
 */
export const Query = createParameterDecorator(PARAM_TYPES.QUERY);
export const Path = createParameterDecorator(PARAM_TYPES.PATH);
export const Header = createParameterDecorator(PARAM_TYPES.HEADER);
export const Cookie = createParameterDecorator(PARAM_TYPES.COOKIE);

/**
 * Decorator for request body parameter
 */
export function Body(type: any, options: ParameterOptions = {}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    const bodyInfo = {
      index: parameterIndex,
      type,
      required: options.required !== false,
      description: options.description,
      ...options,
    };

    Reflect.defineMetadata('api:body-param', bodyInfo, target, propertyKey);
  };
}

/**
 * Decorator for request object parameter (contains query, params, body, etc.)
 */
export function Req(options: ParameterOptions = {}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    const requestInfo = {
      index: parameterIndex,
      type: 'request',
      ...options,
    };

    Reflect.defineMetadata(
      'api:request-param',
      requestInfo,
      target,
      propertyKey
    );
  };
}

/**
 * Decorator for response object parameter
 * @param options - Response options
 */
export function Res(options = {}) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    const responseInfo = {
      index: parameterIndex,
      type: 'response',
      ...options,
    };

    Reflect.defineMetadata(
      'api:response-param',
      responseInfo,
      target,
      propertyKey
    );
  };
}
