#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { openApiConfig } from '../app/lib/api/config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

/**
 * Dynamic OpenAPI generation script that scans actual route files
 */
async function generateDynamicOpenAPI() {
  console.log('🚀 Generating dynamic OpenAPI specification...\n');

  const openApiSpec = {
    openapi: '3.0.3',
    info: openApiConfig.info,
    servers: openApiConfig.servers,
    paths: {},
    components: {
      schemas: {},
      securitySchemes: openApiConfig.securitySchemes || {},
    },
    tags: [],
  };

  // Scan for route files
  const routeFiles = await findRouteFiles();
  console.log(`📁 Found ${routeFiles.length} route files`);

  for (const routeFile of routeFiles) {
    await processRouteFile(routeFile, openApiSpec);
  }

  // Add common schemas
  addCommonSchemas(openApiSpec);

  // Ensure output directory exists
  const outputDir = path.dirname(
    path.join(projectRoot, openApiConfig.paths.output.spec)
  );
  await fs.mkdir(outputDir, { recursive: true });

  const specPath = path.join(projectRoot, openApiConfig.paths.output.spec);

  // Write the spec file
  await fs.writeFile(specPath, JSON.stringify(openApiSpec, null, 2));
  console.log(`✅ OpenAPI spec written to: ${specPath}`);

  // Generate TypeScript types
  await generateTypes(specPath);

  // Generate API client
  await generateClient(specPath);

  console.log('\\n🎉 Dynamic OpenAPI generation completed successfully!');
  console.log('\\nGenerated files:');
  console.log(`- OpenAPI spec: ${openApiConfig.paths.output.spec}`);
  console.log(`- TypeScript types: ${openApiConfig.paths.output.types}`);
  console.log(`- API client: ${openApiConfig.paths.output.client}`);
}

/**
 * Find all route.ts files in the API directory
 */
async function findRouteFiles() {
  const apiDir = path.join(projectRoot, 'app/api');
  const routeFiles = [];

  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.name === 'route.ts') {
          const relativePath = path.relative(apiDir, dir);
          const apiPath =
            '/' + path.join('api', relativePath).replace(/\\\\/g, '/');
          routeFiles.push({
            filePath: fullPath,
            apiPath: apiPath === '/api' ? '/api' : apiPath,
            dirName: path.basename(dir),
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dir}:`, error.message);
    }
  }

  await scanDirectory(apiDir);
  return routeFiles;
}

/**
 * Process a route file and extract OpenAPI information
 */
async function processRouteFile(routeFile, openApiSpec) {
  try {
    const content = await fs.readFile(routeFile.filePath, 'utf-8');
    console.log(`📄 Processing: ${routeFile.apiPath}`);

    // Extract HTTP methods
    const methods = extractHttpMethods(content);

    if (methods.length === 0) {
      console.log(`   ⚠️  No HTTP methods found in ${routeFile.apiPath}`);
      return;
    }

    // Create path object
    const pathObj = {};

    for (const method of methods) {
      const operation = await createOperation(routeFile, method, content);
      pathObj[method.toLowerCase()] = operation;
      console.log(`   ✅ Added ${method} ${routeFile.apiPath}`);
    }

    openApiSpec.paths[routeFile.apiPath] = pathObj;

    // Extract and add schemas from types file if it exists
    await addSchemasFromTypes(routeFile, openApiSpec);
  } catch (error) {
    console.warn(`⚠️  Could not process ${routeFile.apiPath}:`, error.message);
  }
}

/**
 * Extract HTTP methods from route file content
 */
function extractHttpMethods(content) {
  const methodRegex =
    /export\s+(?:const|async\s+function)\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s*[=\(]/g;
  const methods = [];
  let match;

  while ((match = methodRegex.exec(content)) !== null) {
    methods.push(match[1]);
  }

  return methods;
}

/**
 * Create an OpenAPI operation object
 */
async function createOperation(routeFile, method, content) {
  const operation = {
    tags: [capitalizeFirst(routeFile.dirName)],
    summary: `${method} ${routeFile.apiPath}`,
    description:
      extractDescription(content, method) ||
      `${method} operation for ${routeFile.apiPath}`,
    responses: {
      200: {
        description: 'Success',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                data: { type: 'object' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      500: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string' },
              },
            },
          },
        },
      },
    },
  };

  // Add request body for methods that typically have one
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const requestBodySchema = await extractRequestBodySchema(routeFile, method);
    if (requestBodySchema) {
      operation.requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: requestBodySchema,
          },
        },
      };
    }
  }

  return operation;
}

/**
 * Extract description from comments
 */
function extractDescription(content, method) {
  const methodPattern = new RegExp(
    `/\\*\\*[\\s\\S]*?\\*/[\\s\\S]*?export\\s+(?:const|async\\s+function)\\s+${method}`,
    'i'
  );
  const match = content.match(methodPattern);

  if (match) {
    const commentBlock = match[0];
    const descriptionMatch = commentBlock.match(/\*\s*(.+?)(?:\n|\*\/)/);
    return descriptionMatch ? descriptionMatch[1].trim() : null;
  }

  return null;
}

/**
 * Extract request body schema from types file
 */
async function extractRequestBodySchema(routeFile, method) {
  const typesFile = path.join(path.dirname(routeFile.filePath), 'types.ts');

  try {
    const typesContent = await fs.readFile(typesFile, 'utf-8');

    // Look for CreateXxxDto or similar patterns
    const createDtoMatch = typesContent.match(
      /export\s+(?:interface|type|class)\s+(Create\w+Dto)(?:\s+extends\s+[\w\s,<>]+)?\s*{([^}]+)}/s
    );

    if (createDtoMatch && method === 'POST') {
      return createSchemaFromInterface(createDtoMatch[2]);
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Create JSON schema from TypeScript interface content
 */
function createSchemaFromInterface(interfaceContent) {
  const properties = {};
  const required = [];

  // Enhanced property extraction that handles class properties with decorators
  const propRegex = /\s*(?:@[\w\(\)'".,\s]*\s*)?\s*(\w+)[?!]?\s*:\s*([^;\n]+)/g;
  let match;

  while ((match = propRegex.exec(interfaceContent)) !== null) {
    const [fullMatch, propName, propType] = match;
    const isOptional = fullMatch.includes(`${propName}?`);

    properties[propName] = {
      type: mapTypeScriptToJsonSchema(propType.trim()),
    };

    if (!isOptional) {
      required.push(propName);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

/**
 * Map TypeScript types to JSON Schema types
 */
function mapTypeScriptToJsonSchema(tsType) {
  switch (tsType.toLowerCase()) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'string';
    default:
      return 'string';
  }
}

/**
 * Add schemas from types files
 */
async function addSchemasFromTypes(routeFile, openApiSpec) {
  const typesFile = path.join(path.dirname(routeFile.filePath), 'types.ts');

  try {
    const typesContent = await fs.readFile(typesFile, 'utf-8');

    // Extract all interfaces/types/classes
    const interfaceRegex =
      /export\s+(?:interface|type|class)\s+(\w+)(?:\s+extends\s+[\w\s,<>]+)?\s*{([^}]+)}/gs;
    let match;

    while ((match = interfaceRegex.exec(typesContent)) !== null) {
      const [, interfaceName, interfaceContent] = match;
      openApiSpec.components.schemas[interfaceName] =
        createSchemaFromInterface(interfaceContent);
    }
  } catch (error) {
    // Types file doesn't exist, that's okay
  }
}

/**
 * Add common schemas
 */
function addCommonSchemas(openApiSpec) {
  openApiSpec.components.schemas.ApiResponse = {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      data: { type: 'object' },
    },
  };

  openApiSpec.components.schemas.ErrorResponse = {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'string' },
    },
  };
}

/**
 * Generate TypeScript types
 */
async function generateTypes(specPath) {
  try {
    const { execSync } = await import('child_process');
    console.log('🔤 Generating TypeScript types...');

    const typesPath = path.join(projectRoot, openApiConfig.paths.output.types);
    const command = `npx openapi-typescript ${specPath} -o ${typesPath}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ Types generated at: ${typesPath}`);
  } catch (error) {
    console.error('❌ Failed to generate types:', error.message);
  }
}

/**
 * Generate API client
 */
async function generateClient(specPath) {
  try {
    const { execSync } = await import('child_process');
    console.log('🔌 Generating API client...');

    const clientPath = path.join(
      projectRoot,
      openApiConfig.paths.output.client
    );
    const outputDir = path.dirname(clientPath);
    const fileName = path.basename(clientPath);

    const command = `npx swagger-typescript-api generate -p ${specPath} -o ${outputDir} -n ${fileName}`;
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ API client generated at: ${clientPath}`);
  } catch (error) {
    console.error('❌ Failed to generate API client:', error.message);
  }
}

/**
 * Utility functions
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export the function for use in watch mode
export { generateDynamicOpenAPI as generateOpenAPI };

// Run the generation when called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateDynamicOpenAPI().catch(console.error);
}
