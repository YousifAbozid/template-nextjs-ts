import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: './openapi.json',
    output: {
      mode: 'single',
      target: './sdk/index.ts',
      client: 'react-query',
      clean: ['./sdk/index.ts'],
      // prettier: true,
      override: {
        mutator: {
          path: './app/lib/api/sdk-mutator.ts',
          name: 'customInstance'
        }
      }
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write'
    }
  }
});
