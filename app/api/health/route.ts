import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/app/lib/api/database';
import {
  HealthStatus,
  type ComponentHealth,
  type HealthResponseDto,
} from './types';

/**
 * Check individual component health
 */
async function checkComponentHealth(
  component: string
): Promise<ComponentHealth> {
  switch (component.toLowerCase()) {
    case 'database':
    case 'db':
    case 'mongo':
    case 'mongodb':
      return await checkDatabaseHealth();

    case 'cache':
    case 'redis':
      // Mock cache health check - replace with actual cache service
      return {
        status: 'healthy',
        message: 'Cache service operational',
        responseTime: Math.floor(Math.random() * 50) + 10,
      };

    case 'external':
    case 'api':
      // Mock external service health check
      return {
        status: 'healthy',
        message: 'External services accessible',
        responseTime: Math.floor(Math.random() * 100) + 50,
      };

    case 'storage':
    case 'filesystem':
      // Mock storage health check
      try {
        const fs = await import('fs/promises');
        await fs.access(process.cwd());
        return {
          status: 'healthy',
          message: 'File system accessible',
          responseTime: Math.floor(Math.random() * 20) + 5,
        };
      } catch {
        return {
          status: 'unhealthy',
          message: 'File system access error',
          responseTime: 0,
        };
      }

    default:
      return {
        status: 'degraded',
        message: `Unknown component: ${component}`,
        responseTime: 0,
      };
  }
}

/**
 * GET /api/health - Comprehensive health check endpoint
 *
 * Query parameters:
 * - detailed: boolean - Include detailed health information
 * - components: string[] - Check specific service components (database, cache, external, storage)
 *
 * Returns comprehensive health status with component details and performance metrics
 */
export async function GET(request: Request) {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const url = new URL(request.url);
    const detailed = url.searchParams.get('detailed') === 'true';
    const componentsParam = url.searchParams.getAll('components');
    const components =
      componentsParam.length > 0
        ? componentsParam.flatMap(c => c.split(',').filter(Boolean))
        : [];

    const timestamp = new Date().toISOString();
    const version =
      process.env.npm_package_version || process.env.API_VERSION || '1.0.0';

    // Base health data
    const healthData: HealthResponseDto = {
      status: HealthStatus.HEALTHY,
      timestamp,
      version,
    };

    let overallStatus: string = HealthStatus.HEALTHY;
    const componentResults: Record<string, ComponentHealth> = {};

    // Check specific components if requested
    if (components.length > 0) {
      const componentChecks = await Promise.allSettled(
        components.map(async component => ({
          name: component,
          result: await checkComponentHealth(component),
        }))
      );

      componentChecks.forEach(check => {
        if (check.status === 'fulfilled') {
          const { name, result } = check.value;
          componentResults[name] = result;

          // Update overall status based on component health
          if (result.status === 'unhealthy') {
            overallStatus = HealthStatus.UNHEALTHY;
          } else if (
            result.status === 'degraded' &&
            overallStatus === HealthStatus.HEALTHY
          ) {
            overallStatus = HealthStatus.DEGRADED;
          }
        } else {
          componentResults[`error_${Date.now()}`] = {
            status: 'unhealthy',
            message: 'Component check failed',
          };
          overallStatus = HealthStatus.UNHEALTHY;
        }
      });

      healthData.components = componentResults;
    }

    // Add detailed information if requested
    if (detailed) {
      const unhealthyComponents = Object.values(componentResults).filter(
        c => c.status === 'unhealthy'
      ).length;
      const degradedComponents = Object.values(componentResults).filter(
        c => c.status === 'degraded'
      ).length;

      if (overallStatus === HealthStatus.UNHEALTHY) {
        healthData.message = `${unhealthyComponents} component(s) unhealthy`;
      } else if (overallStatus === HealthStatus.DEGRADED) {
        healthData.message = `${degradedComponents} component(s) degraded`;
      } else {
        healthData.message = 'All systems operational';
      }
    }

    healthData.status = overallStatus;
    healthData.responseTime = Date.now() - startTime;

    const statusCode = overallStatus === HealthStatus.UNHEALTHY ? 503 : 200;
    return NextResponse.json(healthData, { status: statusCode });
  } catch (error: unknown) {
    console.error('Health check error:', error);
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: HealthStatus.UNHEALTHY,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        message: error instanceof Error ? error.message : 'Health check failed',
        responseTime,
      },
      { status: 503 }
    );
  }
}
