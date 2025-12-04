import 'reflect-metadata';

export interface ApiPropertyOptions {
  description?: string;
  example?: any;
  type?: string | Function;
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: any[];
  default?: any;
  required?: boolean;
  items?: any;
}

/**
 * Decorator for marking class properties as API properties with OpenAPI metadata
 */
export function ApiProperty(
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const existingProperties =
      Reflect.getMetadata('api:properties', target.constructor) || {};

    // Get the TypeScript design type
    const propertyType = Reflect.getMetadata(
      'design:type',
      target,
      propertyKey
    );

    existingProperties[propertyKey] = {
      type: propertyType,
      options,
      propertyKey,
    };

    Reflect.defineMetadata(
      'api:properties',
      existingProperties,
      target.constructor
    );
  };
}

/**
 * Decorator for marking class properties as optional API properties
 */
export function ApiPropertyOptional(
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  return ApiProperty({ ...options, required: false });
}

/**
 * Decorator for array properties
 */
export function ApiPropertyArray(
  itemType: any,
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  return ApiProperty({
    ...options,
    type: 'array',
    items: itemType,
  });
}

/**
 * Decorator for enum properties
 */
export function ApiPropertyEnum(
  enumObject: any,
  options: ApiPropertyOptions = {}
): PropertyDecorator {
  const enumValues = Array.isArray(enumObject)
    ? enumObject
    : Object.values(enumObject);

  return ApiProperty({
    ...options,
    enum: enumValues,
  });
}
