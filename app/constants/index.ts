// App-wide constants
export const APP_NAME = 'Next.js Full-Stack Template';

export const API_ENDPOINTS = {
  USERS: '/api/users',
  HEALTH: '/api/health',
  DOCS: '/api/docs',
  SWAGGER: '/api/swagger'
} as const;

export const THEME_STORAGE_KEY = 'ui-theme';

export const QUERY_KEYS = {
  USERS: ['users'],
  USER: (id: string) => ['user', id],
  HEALTH: ['health']
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5
} as const;
