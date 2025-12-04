import 'reflect-metadata';

/**
 * Decorator for grouping API endpoints by tags
 */
export function ApiTags(...tags: string[]): ClassDecorator {
  return function (target: any) {
    const tagList = tags.flat().filter(Boolean);
    Reflect.defineMetadata('api:tags', tagList, target);
  };
}

/**
 * Decorator for adding security requirements to endpoints
 */
export function ApiSecurity(security: any): ClassDecorator & MethodDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    if (descriptor && propertyKey !== undefined) {
      // Method decorator
      Reflect.defineMetadata('api:security', security, target, propertyKey);
    } else {
      // Class decorator
      Reflect.defineMetadata('api:security', security, target);
    }
  };
}

/**
 * Decorator for marking endpoints as deprecated
 */
export function ApiDeprecated(reason?: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const deprecationInfo = {
      deprecated: true,
      reason: reason || 'This endpoint is deprecated',
    };

    if (descriptor) {
      // Method decorator
      const existingOperation =
        Reflect.getMetadata('api:operation', target, propertyKey) || {};
      Object.assign(existingOperation, deprecationInfo);
      Reflect.defineMetadata(
        'api:operation',
        existingOperation,
        target,
        propertyKey
      );
    } else {
      // Class decorator
      Reflect.defineMetadata('api:deprecated', deprecationInfo, target);
    }
  };
}

/**
 * Decorator for adding external documentation
 */
export function ApiExternalDocs(
  url: string,
  description?: string
): ClassDecorator & MethodDecorator {
  return function (
    target: any,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ) {
    const docsInfo = { url, description };

    if (descriptor && propertyKey) {
      // Method decorator
      Reflect.defineMetadata(
        'api:external-docs',
        docsInfo,
        target,
        propertyKey
      );
    } else {
      // Class decorator
      Reflect.defineMetadata('api:external-docs', docsInfo, target);
    }
  };
}
