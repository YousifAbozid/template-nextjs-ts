import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 16+ Proxy Function - Global CORS Handler
 *
 * IMPORTANT: In Next.js 16+, the middleware file is named `proxy.ts` (not middleware.ts)
 * and exports a `proxy` function (not middleware).
 *
 * This runs before all API routes to handle CORS and other global concerns.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 *
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */

const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'https://template-nextjs-ts.vercel.app'
  // Add your frontend domains here
];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export function proxy(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin =
    allowedOrigins.includes(origin) ||
    // Allow localhost with any port in development
    (process.env.NODE_ENV !== 'production' &&
      origin.startsWith('http://localhost:'));

  // Handle preflighted requests
  const isPreflight = request.method === 'OPTIONS';

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configure which paths this middleware applies to
export const config = {
  matcher: '/api/:path*'
};
