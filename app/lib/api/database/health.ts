import mongoose from 'mongoose';
import { connectDB, getConnectionStatus } from './connection';

/**
 * Component health interface
 */
export interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

/**
 * Check MongoDB database health
 */
export async function checkDatabaseHealth(): Promise<ComponentHealth> {
  const startTime = Date.now();

  try {
    // Try to establish connection if not already connected
    await connectDB();

    // Check if connection is active
    const isConnected = getConnectionStatus();

    if (!isConnected) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        responseTime: Date.now() - startTime,
        details: {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host
        }
      };
    }

    // Perform a simple ping to test the connection
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    }

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime,
      details: {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        readyState: mongoose.connection.readyState
      }
    };
  } catch (error: unknown) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        readyState: mongoose.connection.readyState
      }
    };
  }
}
