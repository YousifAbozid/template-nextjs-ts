import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * User Zod Schemas
 */

// User base schema (matches MongoDB model)
export const UserSchema = z
  .object({
    _id: z
      .string()
      .openapi({ description: 'User ID', example: '507f1f77bcf86cd799439011' }),
    name: z
      .string()
      .min(1)
      .openapi({ description: 'User full name', example: 'John Doe' }),
    email: z.string().email().openapi({
      description: 'User email address',
      example: 'john@example.com'
    }),
    createdAt: z.coerce.date().openapi({
      description: 'Creation timestamp',
      example: '2023-12-04T10:30:00Z'
    }),
    updatedAt: z.coerce.date().openapi({
      description: 'Last update timestamp',
      example: '2023-12-04T10:30:00Z'
    })
  })
  .openapi('User');

// Request schemas
export const CreateUserRequestSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .openapi({ description: 'User full name', example: 'John Doe' }),
    email: z.string().email().openapi({
      description: 'User email address',
      example: 'john@example.com'
    })
  })
  .openapi('CreateUserRequest');

export const UpdateUserRequestSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .optional()
      .openapi({ description: 'User full name' }),
    email: z
      .string()
      .email()
      .optional()
      .openapi({ description: 'User email address' })
  })
  .openapi('UpdateUserRequest');

// Response schemas
export const UserListResponseSchema = z
  .object({
    success: z.literal(true),
    data: z.array(UserSchema),
    count: z.number().openapi({ description: 'Total number of users' })
  })
  .openapi('UserListResponse');

export const UserResponseSchema = z
  .object({
    success: z.literal(true),
    data: UserSchema,
    message: z.string().optional()
  })
  .openapi('UserResponse');

// Export types
export type User = z.infer<typeof UserSchema>;
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
