import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '../database/connection';

/**
 * Database middleware for API routes
 * Automatically ensures database connection before handling requests
 */
type ApiHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<Response> | Response;

export const withDatabase = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      // Ensure database connection
      await connectDB();

      // Call the original handler
      return await handler(req, ...args);
    } catch (error) {
      console.error('Database middleware error:', error);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  };
};

/**
 * Database connection decorator for API handlers
 * Usage: @withDbConnection
 */
export const withDbConnection = (
  _target: unknown,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    try {
      await connectDB();
      return await originalMethod.apply(this, args);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  };

  return descriptor;
};

export { connectDB } from '../database/connection';
