import 'reflect-metadata';

/**
 * Converts TypeScript/JavaScript types to OpenAPI schema types
 */
export function convertTypeToSchema(type: any): any {
  if (!type) {
    return { type: 'string' };
  }

  // Handle primitive types
  const typeName = typeof type === 'function' ? type.name : type.toString();

  switch (typeName.toLowerCase()) {
    case 'string':
      return { type: 'string' };
    case 'number':
      return { type: 'number' };
    case 'boolean':
      return { type: 'boolean' };
    case 'date':
      return { type: 'string', format: 'date-time' };
    case 'array':
      return { type: 'array', items: { type: 'string' } };
    case 'object':
      return { type: 'object' };
    default:
      // For custom classes, return a reference
      if (typeof type === 'function' && type.prototype) {
        return { $ref: `#/components/schemas/${type.name}` };
      }
      return { type: 'string' };
  }
}

/**
 * Generates OpenAPI schema from a decorated class
 * @param {Function} classConstructor - Class constructor
 * @returns {object} OpenAPI schema object
 */
export function generateSchemaFromClass(classConstructor: any): any {
  if (!classConstructor || typeof classConstructor !== 'function') {
    throw new Error('Invalid class constructor provided');
  }

  const properties =
    Reflect.getMetadata('api:properties', classConstructor) || {};
  const required = [];
  const schemaProperties: Record<string, any> = {};

  for (const [propertyKey, propertyMetadata] of Object.entries(properties)) {
    const metadata = propertyMetadata as any;
    const { type, options } = metadata;
    let propertySchema: any;

    // Handle custom options first
    if (options.type) {
      switch (options.type) {
        case 'array':
          propertySchema = {
            type: 'array',
            items: options.items
              ? convertTypeToSchema(options.items)
              : { type: 'string' },
          };
          break;
        default:
          propertySchema = { type: options.type };
      }
    } else {
      propertySchema = convertTypeToSchema(type);
    }

    // Apply additional options
    if (options.description) propertySchema.description = options.description;
    if (options.example !== undefined) propertySchema.example = options.example;
    if (options.enum) propertySchema.enum = options.enum;
    if (options.format) propertySchema.format = options.format;
    if (options.minimum !== undefined) propertySchema.minimum = options.minimum;
    if (options.maximum !== undefined) propertySchema.maximum = options.maximum;
    if (options.minLength !== undefined)
      propertySchema.minLength = options.minLength;
    if (options.maxLength !== undefined)
      propertySchema.maxLength = options.maxLength;
    if (options.pattern) propertySchema.pattern = options.pattern;
    if (options.default !== undefined) propertySchema.default = options.default;

    schemaProperties[propertyKey] = propertySchema;

    // Add to required array if not explicitly marked as optional
    if (options.required !== false) {
      required.push(propertyKey);
    }
  }

  const schema: any = {
    type: 'object',
    properties: schemaProperties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
}

/**
 * Generates OpenAPI parameter definitions from method metadata
 */
export function generateParametersFromMethod(
  target: any,
  propertyKey: string | symbol
): any[] {
  const parameters =
    Reflect.getMetadata('api:parameters', target, propertyKey) || [];

  return parameters.map((param: any) => ({
    name: param.name,
    in: param.location,
    required: param.required,
    description: param.description,
    schema: param.schema,
    example: param.example,
    examples: param.examples,
    deprecated: param.deprecated,
  }));
}

/**
 * Generates request body schema from method metadata
 */
export function generateRequestBodyFromMethod(
  target: any,
  propertyKey: string | symbol
): any | null {
  const bodyMetadata = Reflect.getMetadata('api:body', target, propertyKey);
  const bodyParam = Reflect.getMetadata('api:body-param', target, propertyKey);

  if (bodyMetadata || bodyParam) {
    const metadata = bodyMetadata || bodyParam;
    const schema =
      typeof metadata.type === 'function'
        ? generateSchemaFromClass(metadata.type)
        : metadata.schema || { type: 'object' };

    return {
      required: metadata.required !== false,
      description: metadata.description,
      content: {
        'application/json': {
          schema: schema,
          examples: metadata.examples,
        },
      },
    };
  }

  return null;
}

/**
 * Collects all schemas from decorated classes in a module or set of classes
 */
export function collectSchemasFromClasses(classes: any[]): Record<string, any> {
  const schemas: Record<string, any> = {};

  for (const classConstructor of classes) {
    if (typeof classConstructor === 'function') {
      try {
        const schema = generateSchemaFromClass(classConstructor);
        schemas[classConstructor.name] = schema;
      } catch (error) {
        console.warn(
          `Failed to generate schema for ${classConstructor.name}:`,
          (error as Error).message
        );
      }
    }
  }

  return schemas;
}

/**
 * Creates a complete OpenAPI operation object from method metadata
 */
export function createOperationObject(
  target: any,
  propertyKey: string | symbol,
  operationMetadata: any
): any {
  const operation: any = {
    operationId: operationMetadata.operationId,
    summary: operationMetadata.summary,
    description: operationMetadata.description,
    tags: operationMetadata.tags,
    deprecated: operationMetadata.deprecated,
  };

  // Add parameters
  const parameters = generateParametersFromMethod(target, propertyKey);
  if (parameters.length > 0) {
    operation.parameters = parameters;
  }

  // Add request body
  const requestBody = generateRequestBodyFromMethod(target, propertyKey);
  if (requestBody) {
    operation.requestBody = requestBody;
  }

  // Add responses
  operation.responses = operationMetadata.responses || {
    200: { description: 'Success' },
  };

  // Add security
  if (operationMetadata.security) {
    operation.security = operationMetadata.security;
  }

  // Add external docs
  const externalDocs = Reflect.getMetadata(
    'api:external-docs',
    target,
    propertyKey
  );
  if (externalDocs) {
    operation.externalDocs = externalDocs;
  }

  return operation;
}
