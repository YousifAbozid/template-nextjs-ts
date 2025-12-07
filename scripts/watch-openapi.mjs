#!/usr/bin/env node
import chokidar from 'chokidar';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('👀 Watching for OpenAPI changes...\n');

// Watch for changes in route files, schema files, and openapi files
const watcher = chokidar.watch(
  ['app/api/**/schema.ts', 'app/api/**/openapi.ts', 'app/api/**/route.ts'],
  {
    cwd: projectRoot,
    persistent: true,
    ignoreInitial: false,
  }
);

let timeout;

function regenerate() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('🔄 Regenerating OpenAPI spec...');
    try {
      execSync('tsx scripts/generate-openapi.mjs', {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      console.log('✅ OpenAPI spec regenerated\n');
    } catch (error) {
      console.error('❌ Failed to regenerate:', error.message);
    }
  }, 500);
}

watcher
  .on('add', filepath => {
    console.log(`📄 Added: ${filepath}`);
    regenerate();
  })
  .on('change', filepath => {
    console.log(`📝 Changed: ${filepath}`);
    regenerate();
  })
  .on('unlink', filepath => {
    console.log(`🗑️  Removed: ${filepath}`);
    regenerate();
  })
  .on('error', error => {
    console.error('❌ Watcher error:', error);
  });

console.log('Watching for changes in:');
console.log('  - app/api/**/schema.ts');
console.log('  - app/api/**/openapi.ts');
console.log('  - app/api/**/route.ts\n');
