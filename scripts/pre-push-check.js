#!/usr/bin/env node
/**
 * Pre-push validation script that avoids regenerating files unnecessarily
 */

import { execSync } from 'child_process';
import fs from 'fs';

const API_FILES = [
  'lib/api/types/ApiClient.ts',
  'lib/api/types/ApiTypes.ts',
  'lib/api/types/openapi.json'
];

function runCommand(command, description) {
  try {
    console.log(`🔍 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} passed!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed!`);
    return false;
  }
}

function checkIfFilesNeedRegeneration() {
  // Check if all API files exist and are relatively recent
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const file of API_FILES) {
    if (!fs.existsSync(file)) {
      console.log(`📄 ${file} doesn't exist, will regenerate API files`);
      return true;
    }

    const stats = fs.statSync(file);
    if (now - stats.mtime.getTime() > maxAge) {
      console.log(`⏰ ${file} is older than 1 hour, will regenerate API files`);
      return true;
    }
  }

  console.log(`📄 API files are up to date, skipping regeneration`);
  return false;
}

async function main() {
  console.log('🚀 Running pre-push validation...');

  // Step 1: Format check
  if (!runCommand('npm run format:check', 'Format check')) {
    process.exit(1);
  }

  // Step 2: Lint check
  if (!runCommand('npm run lint', 'Lint check')) {
    process.exit(1);
  }

  // Step 3: Type check
  if (!runCommand('npm run type-check', 'TypeScript check')) {
    process.exit(1);
  }

  // Step 4: Build check (conditional API generation)
  const needsRegeneration = checkIfFilesNeedRegeneration();

  if (needsRegeneration) {
    console.log('🔄 Regenerating API files...');
    if (!runCommand('npm run api:generate', 'API generation')) {
      process.exit(1);
    }
  }

  console.log('🏗️  Running Next.js build...');
  if (!runCommand('npx next build', 'Next.js build')) {
    process.exit(1);
  }

  console.log('🎉 All pre-push checks passed successfully!');
  console.log('🚀 Ready to push!');
}

main().catch(console.error);
