# Middleware Guide

This template uses **two types of middleware**. Understanding when to use each is crucial.

**Note**: This project uses Next.js 16+, which changed the middleware naming convention.

---

## 1. Global Next.js Proxy (Next.js 16+ Convention)

**File**: `proxy.ts` (project root)

**Function**: `proxy()` (not `middleware()`)

**Runs**: At the Edge, **before** all requests reach your API routes

**Runtime**: Edge Runtime (limited Node.js APIs)

**Important**: In Next.js 16+, the file is named `proxy.ts` and exports a `proxy()` function.
This changed from `middleware.ts` in previous versions.

### When to Use

✅ **Use for**:

- CORS handling (already configured)
- Authentication token validation
- Request logging
- Rate limiting
- Geolocation-based redirects
- A/B testing
- Bot detection

❌ **Don't use for**:

- Database queries
- Heavy computations
- File system operations
- Complex business logic

### Example: Adding Request Logging

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Log all API requests
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);

  // Handle CORS
  const origin = request.headers.get('origin') ?? '';
  const response = NextResponse.next();

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  return response;
}

export const config = {
  matcher: '/api/:path*'
};
```

### Key Characteristics

- ⚡ **Fast**: Runs at the edge, close to users
- 🌐 **Global**: Applies to all matching routes
- ⚠️ **Limited**: Cannot use database, mongoose, etc.
- 🔧 **Configuration**: Uses `config.matcher` to specify paths

---

## 2. Route Handler Wrappers

**Location**: `app/lib/api/middleware/`

**Runs**: In Node.js runtime, **inside** your route handlers

**Runtime**: Full Node.js runtime

### When to Use

✅ **Use for**:

- Database connection management (withDatabase)
- Request validation
- Authorization checks requiring DB lookups
- Response formatting
- Error handling
- Transaction management
- File uploads

❌ **Don't use for**:

- Things that should run before all routes (use global middleware)
- Simple header manipulation (use global middleware)

### Example: Database Middleware

```typescript
// app/lib/api/middleware/database.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/api/database/connection';

type ApiHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<Response> | Response;

export const withDatabase = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      await connectDB();
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
```

### Example: Custom Auth Middleware

```typescript
// app/lib/api/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/api/models';

type ApiHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<Response> | Response;

export const withAuth = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Verify token and get user from DB
      const user = await User.findOne({ apiToken: token });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Add user to request context (if needed, attach to custom property)
      // req.user = user; (TypeScript will complain, extend type if needed)

      return await handler(req, ...args);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
};
```

### Using Multiple Wrappers

Middleware wrappers can be **composed** (stacked):

```typescript
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middleware/auth';
import { User } from '@/lib/api/models';

// Compose middleware - executes RIGHT-TO-LEFT
// Order: withAuth → withDatabase → handler
export const GET = withAuth(
  withDatabase(async (req: NextRequest) => {
    // Both auth and DB are ready here
    const users = await User.find();
    return NextResponse.json({ success: true, data: users });
  })
);
```

**Execution order**: Right-to-left (like function composition)

1. `withDatabase` ensures DB connection
2. `withAuth` checks authentication
3. Your handler runs

### Key Characteristics

- 🚀 **Flexible**: Full Node.js runtime access
- 📦 **Per-Route**: Applied individually to routes that need them
- 🔄 **Composable**: Can stack multiple wrappers
- 🛠️ **Powerful**: Can use DB, filesystem, external APIs, etc.

---

## Comparison Table

| Feature             | Global Proxy (Next.js 16+) | Route Handler Wrappers        |
| ------------------- | -------------------------- | ----------------------------- |
| **Location**        | `proxy.ts` (root)          | `app/lib/api/middleware/`     |
| **Function Name**   | `proxy()`                  | Custom names                  |
| **Runtime**         | Edge Runtime               | Node.js Runtime               |
| **Scope**           | All matching routes        | Per-route opt-in              |
| **Database Access** | ❌ No                      | ✅ Yes                        |
| **File System**     | ❌ No                      | ✅ Yes                        |
| **External APIs**   | ⚠️ Limited                 | ✅ Yes                        |
| **Use Case**        | CORS, logging, auth checks | DB operations, business logic |
| **Performance**     | ⚡ Fastest                 | Fast                          |
| **Configuration**   | `config.matcher`           | Applied manually              |

---

## Decision Flow

```
Need middleware functionality?
│
├─ Affects ALL routes globally?
│  └─ Use Global Proxy (proxy.ts)
│
└─ Specific to certain routes?
   │
   ├─ Needs database/filesystem/heavy operations?
   │  └─ Use Route Handler Wrapper (app/lib/api/middleware/)
   │
   └─ Simple header/redirect logic?
      └─ Could use either (prefer Global for performance)
```

---

## Best Practices

### Global Proxy ✅

```typescript
// ✅ Good: CORS, simple checks
// proxy.ts
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}
```

```typescript
// ❌ Bad: Database queries in global proxy
// proxy.ts
export async function proxy(request: NextRequest) {
  const user = await User.findOne({ token }); // ❌ Won't work in Edge Runtime
  return NextResponse.next();
}
```

### Route Handler Wrappers ✅

```typescript
// ✅ Good: Database operations
export const withDatabase = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    await connectDB();
    return await handler(req, ...args);
  };
};
```

```typescript
// ❌ Bad: Applying to all routes manually
// If you need something on ALL routes, use global middleware instead
export const GET = withLogging(withCORS(withDatabase(handler)));
```

---

## Common Patterns

### Pattern 1: Public + Protected Routes

```typescript
// Global proxy handles CORS for all
// proxy.ts
export function proxy(request: NextRequest) {
  // CORS for everyone
}

// Public route - only needs DB
// app/api/public/route.ts
export const GET = withDatabase(async () => {
  /* ... */
});

// Protected route - needs DB + Auth
// app/api/protected/route.ts
export const GET = withAuth(
  withDatabase(async () => {
    /* ... */
  })
);
```

### Pattern 2: API Key Validation

```typescript
// Option A: Global proxy (if all routes need it)
// proxy.ts
export function proxy(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }
  return NextResponse.next();
}

// Option B: Route wrapper (if only some routes need it)
// app/lib/api/middleware/apiKey.ts
export const withApiKey = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    return await handler(req, ...args);
  };
};
```

### Pattern 3: Error Handling Wrapper

```typescript
// app/lib/api/middleware/errorHandler.ts
export const withErrorHandler = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error('API Error:', error);

      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
};

// Usage
export const POST = withErrorHandler(
  withDatabase(async req => {
    // Your logic - errors caught automatically
  })
);
```

---

## Summary

- **Global Proxy** (`proxy.ts` - Next.js 16+): Use for **CORS, logging, simple auth checks** that affect **all routes**
- **Route Handler Wrappers** (`app/lib/api/middleware/`): Use for **database, complex auth, business logic** applied to **specific routes**
- **Compose wrappers** when you need multiple layers of functionality
- **Keep it simple**: Don't over-engineer - use global proxy for global concerns, wrappers for route-specific logic

**Next.js 16+ Change**: The file is now `proxy.ts` (not `middleware.ts`) and exports `proxy()` function.
