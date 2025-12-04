import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores (like you had)
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',

    // generated API files
    'app/lib/api/types/**',

    // scripts
    'scripts/**',

    // backend internals (decorators, schema, validation)
    'app/lib/api/decorators/**',
    'app/lib/api/schema/**',
    'app/lib/api/validation/**',
  ]),

  // === Backend zone (soft rules) ===
  {
    files: ['app/api/**/*.{ts,tsx}', 'app/lib/api/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },

  // === Internal library zone ===
  {
    files: ['app/lib/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // === App zone (frontend) ===
  {
    files: ['app/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      "react-hooks/set-state-in-effect": "off",
      'no-console': 'off',
      '@next/next/no-img-element': 'off',
    },
  },
]);
