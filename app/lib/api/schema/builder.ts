import 'reflect-metadata';
import { createOperationObject, collectSchemasFromClasses } from './generator';

export interface OpenAPIInfo {
  title?: string;
  version?: string;
  description?: string;
  [key: string]: any;
}

export interface OpenAPISpec {
  openapi: string;
  info: OpenAPIInfo;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes: Record<string, any>;
  };
  tags: any[];
  security?: any[];
  servers?: any[];
}

/**
 * OpenAPI specification builder class
 */
export class OpenAPIBuilder {
  spec: OpenAPISpec;
  discoveredClasses: Set<any>;
  registeredTags: Set<string>;

  constructor(info: OpenAPIInfo = {}) {
    this.spec = {
      openapi: '3.0.3',
      info: {
        title: info.title || 'API Documentation',
        version: info.version || '1.0.0',
        description: info.description || 'Generated API documentation',
        ...info,
      },
      paths: {},
      components: {
        schemas: {},
        securitySchemes: {},
      },
      tags: [],
    };

    this.discoveredClasses = new Set();
    this.registeredTags = new Set();
  }

  /**
   * Add security schemes to the OpenAPI spec
   */
  addSecuritySchemes(schemes: Record<string, any>): OpenAPIBuilder {
    Object.assign(this.spec.components.securitySchemes, schemes);
    return this;
  }

  /**
   * Add global security requirements
   */
  addSecurity(security: any[]): OpenAPIBuilder {
    this.spec.security = security;
    return this;
  }

  /**
   * Add servers to the OpenAPI spec
   */
  addServers(servers: any[]): OpenAPIBuilder {
    this.spec.servers = servers;
    return this;
  }

  /**
   * Register a decorated controller class
   */
  addController(controllerClass: any, basePath: string = ''): OpenAPIBuilder {
    this.discoveredClasses.add(controllerClass);

    // Get class-level tags
    const classTags = Reflect.getMetadata('api:tags', controllerClass) || [];
    classTags.forEach((tag: any) => {
      if (typeof tag === 'string') {
        this.registeredTags.add(tag);
      } else if (typeof tag === 'object' && tag.name) {
        this.registeredTags.add(tag);
      }
    });

    // Get all operations from the controller
    const operations =
      Reflect.getMetadata('api:operations', controllerClass) || [];

    for (const { propertyKey, metadata } of operations) {
      this.addOperation(controllerClass, propertyKey, metadata, basePath);
    }

    return this;
  }

  /**
   * Add a single operation to the spec
   */
  addOperation(
    target: any,
    propertyKey: string | symbol,
    metadata: any,
    basePath: string = ''
  ): OpenAPIBuilder {
    const path = this.normalizePath(basePath, metadata.path || '');
    const method = metadata.method.toLowerCase();

    // Ensure path exists
    if (!this.spec.paths[path]) {
      this.spec.paths[path] = {};
    }

    // Create operation object
    const operation = createOperationObject(target, propertyKey, metadata);

    // Add class tags to operation tags if they exist
    const classTags = Reflect.getMetadata('api:tags', target) || [];
    if (classTags.length > 0) {
      operation.tags = [...(operation.tags || []), ...classTags];
    }

    this.spec.paths[path][method] = operation;

    return this;
  }

  /**
   * Add a DTO class to generate schemas
   */
  addDto(dtoClass: any): OpenAPIBuilder {
    this.discoveredClasses.add(dtoClass);
    return this;
  }

  /**
   * Normalize path by combining base path and route path
   */
  normalizePath(basePath: string, routePath: string): string {
    const combined = `${basePath}/${routePath}`.replace(/\/+/g, '/');
    return combined === '/' ? '/' : combined.replace(/\/$/, '');
  }

  /**
   * Build and return the complete OpenAPI specification
   */
  build(): OpenAPISpec {
    // Generate schemas for all discovered classes
    const allClasses = Array.from(this.discoveredClasses);
    const schemas = collectSchemasFromClasses(allClasses);
    Object.assign(this.spec.components.schemas, schemas);

    // Add tags
    const tagsArray = Array.from(this.registeredTags).map(tag => {
      if (typeof tag === 'string') {
        return { name: tag };
      }
      return tag;
    });

    if (tagsArray.length > 0) {
      this.spec.tags = tagsArray;
    }

    return { ...this.spec };
  }

  /**
   * Build and return the specification as JSON string
   */
  buildJson(indent: number = 2): string {
    return JSON.stringify(this.build(), null, indent);
  }
}

/**
 * Factory function to create a new OpenAPI builder
 */
export function createOpenAPIBuilder(info: OpenAPIInfo): OpenAPIBuilder {
  return new OpenAPIBuilder(info);
}
