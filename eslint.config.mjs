import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated files
    'app/lib/api/types/**',
    'scripts/**',
    // API Framework files with intentional any types
    'app/lib/api/decorators/**',
    'app/lib/api/schema/**',
    'app/lib/api/validation/**',
  ]),
  // More lenient rules for better development experience
  {
    files: ['app/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Turn off or reduce strict TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',

      // Turn off strict React rules
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'warn',

      // Turn off Next.js strict rules
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',

      // General JS/TS rules
      'no-console': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
      'prefer-const': 'warn',
    },
  },
  // Extra lenient rules for lib files
  {
    files: ['app/lib/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
]);

export default eslintConfig;
