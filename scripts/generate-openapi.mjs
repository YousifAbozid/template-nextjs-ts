#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

/**
 * New functional OpenAPI generation script
 * Scans app/api/** folders for openapi.ts files and collects route definitions
 */
async function generateOpenAPI() {
  console.log(
    '🚀 Generating OpenAPI specification from route definitions...\n'
  );

  try {
    // Find all openapi.ts files
    const openapiFiles = await findOpenApiFiles();
    console.log(`📁 Found ${openapiFiles.length} OpenAPI definition files\n`);

    if (openapiFiles.length === 0) {
      console.warn('⚠️  No openapi.ts files found in app/api/**');
      console.warn(
        '   Make sure your routes export OpenAPI definitions in openapi.ts files\n'
      );
    }

    // Import all openapi files to register their routes
    for (const file of openapiFiles) {
      const relativePath = path.relative(projectRoot, file);
      console.log(`📄 Loading: ${relativePath}`);

      try {
        // Convert to file URL for dynamic import
        const fileUrl = pathToFileURL(file).href;
        await import(fileUrl);
        console.log(
          `   ✅ Registered routes from ${path.basename(path.dirname(file))}`
        );
      } catch (error) {
        console.error(`   ❌ Failed to load ${relativePath}:`, error.message);
      }
    }

    console.log('\n🔨 Generating OpenAPI document...');

    // Import the registry and generate document
    const registryPath = path.join(
      projectRoot,
      'app/lib/api/openapi/registry.ts'
    );
    const registryUrl = pathToFileURL(registryPath).href;
    const { generateOpenApiDocument } = await import(registryUrl);

    const openApiDoc = generateOpenApiDocument();

    // Write to project root
    const outputPath = path.join(projectRoot, 'openapi.json');
    await fs.writeFile(outputPath, JSON.stringify(openApiDoc, null, 2));

    console.log(
      `✅ OpenAPI spec written to: ${path.relative(projectRoot, outputPath)}`
    );
    console.log(`\n🎉 OpenAPI generation completed successfully!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Run "npm run api:sdk" to generate the SDK`);
    console.log(`  2. Visit http://localhost:3000/api/docs for Swagger UI`);
  } catch (error) {
    console.error('\n❌ OpenAPI generation failed:', error);
    process.exit(1);
  }
}

/**
 * Recursively find all openapi.ts files in app/api
 */
async function findOpenApiFiles() {
  const apiDir = path.join(projectRoot, 'app/api');
  const openapiFiles = [];

  async function scanDirectory(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.name === 'openapi.ts') {
          openapiFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Could not scan directory ${dir}:`, error.message);
    }
  }

  await scanDirectory(apiDir);
  return openapiFiles;
}

// Run the generation
generateOpenAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
