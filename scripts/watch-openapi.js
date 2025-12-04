#!/usr/bin/env node
import chokidar from 'chokidar';
import { pathToFileURL } from 'url';
import { generateOpenAPI } from './generate-openapi.js';

/**
 * Watch mode for development - automatically regenerates OpenAPI when files change
 */
async function startWatchMode() {
  console.log('👀 Starting OpenAPI watch mode...\n');

  const patterns = ['app/api/**/*.{js,ts}', 'app/lib/api/**/*.{js,ts}'];

  let isGenerating = false;
  let pendingRegeneration = false;

  const watcher = chokidar.watch(patterns, {
    ignored: ['node_modules/**', '.next/**', 'dist/**', 'app/lib/api/types/**'],
    persistent: true,
    ignoreInitial: false,
  });

  const regenerate = async () => {
    if (isGenerating) {
      pendingRegeneration = true;
      return;
    }

    isGenerating = true;
    pendingRegeneration = false;

    try {
      console.log('🔄 File changes detected, regenerating...');
      await generateOpenAPI();
      console.log('✅ Regeneration complete\n');
    } catch (error) {
      console.error('❌ Regeneration failed:', error.message);
    } finally {
      isGenerating = false;

      // Check if there's a pending regeneration
      if (pendingRegeneration) {
        setTimeout(regenerate, 100);
      }
    }
  };

  watcher
    .on('ready', () => {
      console.log('📁 Initial scan complete. Watching for changes...\n');
    })
    .on('add', path => {
      console.log(`➕ Added: ${path}`);
      regenerate();
    })
    .on('change', path => {
      console.log(`🔄 Changed: ${path}`);
      regenerate();
    })
    .on('unlink', path => {
      console.log(`➖ Removed: ${path}`);
      regenerate();
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️  Stopping watch mode...');
    watcher.close();
    process.exit(0);
  });

  console.log('Press Ctrl+C to stop watching\n');
}

// Start watch mode if called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Check if chokidar is installed
  try {
    await import('chokidar');
    startWatchMode();
  } catch (error) {
    console.log('📦 Installing chokidar for watch mode...');
    const { execSync } = await import('child_process');
    execSync('npm install --save-dev chokidar', { stdio: 'inherit' });

    // Re-import and start
    const chokidar = await import('chokidar');
    startWatchMode();
  }
}
