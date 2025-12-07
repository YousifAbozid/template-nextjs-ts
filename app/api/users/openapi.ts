import { registry, createRouteConfig } from '@/lib/api/openapi';
import {
  CreateUserRequestSchema,
  UserListResponseSchema,
  UserResponseSchema
} from './schema';

/**
 * OpenAPI route definitions for /api/users
 */

// GET /api/users - List all users
registry.registerPath(
  createRouteConfig({
    method: 'get',
    path: '/api/users',
    tags: ['Users'],
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
    responses: {
      200: {
        description: 'List of users retrieved successfully',
        content: {
          'application/json': {
            schema: UserListResponseSchema
          }
        }
      }
    }
  })
);

// POST /api/users - Create new user
registry.registerPath(
  createRouteConfig({
    method: 'post',
    path: '/api/users',
    tags: ['Users'],
    summary: 'Create a new user',
    description: 'Create a new user with the provided information',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CreateUserRequestSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: 'User created successfully',
        content: {
          'application/json': {
            schema: UserResponseSchema
          }
        }
      }
    }
  })
);
