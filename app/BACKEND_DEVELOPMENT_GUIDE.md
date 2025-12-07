# Development Guide - Next.js Functional API Template

## Architecture Overview

This is a **Next.js 16+ App Router API backend** with:

- **MongoDB integration** with Mongoose
- **Zod schemas** for validation and type safety
- **zod-to-openapi** for automatic OpenAPI 3.0 generation
- **Orval** for type-safe SDK generation
- **Functional, declarative architecture** - no classes, no decorators

**Key Principle**: Route-centric organization with co-located schemas and OpenAPI definitions.

---

## Project Structure

```
app/api/[resource]/
├── route.ts          # Pure functional API handlers
├── schema.ts         # Zod schemas for validation + OpenAPI
└── openapi.ts        # OpenAPI route definitions

app/lib/api/
├── openapi/          # OpenAPI registry and helpers
├── database/         # MongoDB connection utilities
├── middleware/       # Route handler wrappers (withDatabase, etc.)
└── models/           # Mongoose models

proxy.ts              # Next.js 16+ global proxy (CORS)

scripts/
├── generate-openapi.mjs   # OpenAPI spec generator
└── watch-openapi.mjs      # File watcher for development

sdk/
├── index.ts          # Generated type-safe SDK (auto-generated)
└── mutator.ts        # Custom fetch instance for SDK

openapi.json          # Generated OpenAPI spec (project root)
orval.config.ts       # Orval SDK generator configuration
```

---

## Middleware Architecture

This project uses **two distinct types of middleware**:

### 1. Global Next.js Proxy (`proxy.ts`) - **New in Next.js 16+**

**Location**: `proxy.ts` (project root)

**Purpose**: Runs at the edge **before** all requests hit your API routes.

**Note**: In Next.js 16+, the file is named `proxy.ts` (not `middleware.ts`) and exports a `proxy()` function.

**Use cases**:

- CORS handling
- Authentication checks
- Request logging
- Rate limiting
- Redirects

**Example**:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

export const config = {
  matcher: '/api/:path*' // Apply to all API routes
};
```

**Key Points**:

- Runs in the Edge Runtime (limited Node.js APIs)
- Cannot use database connections or heavy operations
- Perfect for headers, redirects, and auth checks

### 2. Route Handler Wrappers (`app/lib/api/middleware/`)

**Location**: `app/lib/api/middleware/`

**Purpose**: Higher-order functions that wrap individual route handlers.

**Use cases**:

- Database connection management
- Request validation
- Error handling
- Response formatting
- Per-route authorization

**Example**:

```typescript
// app/lib/api/middleware/database.ts
export const withDatabase = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    await connectDB();
    return await handler(req, ...args);
  };
};

// Usage in route.ts
export const GET = withDatabase(async () => {
  // DB is connected here
  const users = await User.find();
  return NextResponse.json({ data: users });
});
```

**Key Points**:

- Runs in the Node.js runtime (full APIs available)
- Can use database, filesystem, etc.
- Applied per-route, not globally
- Can be composed (chain multiple wrappers)

---

## Core Development Patterns

### 1. Route Structure (Co-location Pattern)

Every API endpoint should have these three files:

#### `schema.ts` - Zod Schemas

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Define your schemas with OpenAPI metadata
export const CreateUserRequestSchema = z
  .object({
    name: z.string().min(1).openapi({
      description: 'User full name',
      example: 'John Doe'
    }),
    email: z.string().email().openapi({
      description: 'Email address',
      example: 'john@example.com'
    })
  })
  .openapi('CreateUserRequest');

// Export TypeScript types
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

#### `openapi.ts` - OpenAPI Definitions

```typescript
import { registry, createRouteConfig } from '@/lib/api/openapi';
import { CreateUserRequestSchema, UserResponseSchema } from './schema';

// Register routes with OpenAPI metadata
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
```

#### `route.ts` - API Handler

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/api/middleware';
import { User } from '@/lib/api/models';
import { CreateUserRequestSchema } from './schema';
import './openapi'; // ⚠️ IMPORTANT: Import to register OpenAPI routes

export const POST = withDatabase(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Validate with Zod
    const validationResult = CreateUserRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;

    // Business logic
    const user = new User({ name, email });
    const savedUser = await user.save();

    return NextResponse.json(
      { success: true, data: savedUser, message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
```

---

### 2. Database Integration Pattern

**Always use the `withDatabase` middleware:**

```typescript
import { withDatabase } from '@/lib/api/middleware';
import { User } from '@/lib/api/models';

export const GET = withDatabase(async () => {
  const users = await User.find();
  return NextResponse.json({ success: true, data: users });
});
```

**Why?** The middleware handles:

- Connection pooling for serverless
- Automatic connection reuse
- Error handling
- Connection state management

### 3. Creating Custom Middleware Wrappers

You can create custom middleware wrappers in `app/lib/api/middleware/`:

```typescript
// app/lib/api/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';

type ApiHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<Response> | Response;

export const withAuth = (handler: ApiHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    const token = req.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token logic here

    return await handler(req, ...args);
  };
};
```

**Composing multiple wrappers**:

```typescript
// app/api/protected/route.ts
import { withDatabase } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middleware/auth';

// Compose middleware - executes right-to-left
export const GET = withAuth(
  withDatabase(async (req: NextRequest) => {
    // Both auth and DB are ready here
    const users = await User.find();
    return NextResponse.json({ data: users });
  })
);
```

---

### 4. Response Patterns

**Standard API response format:**

```typescript
// Success Response
{
  success: true,
  data: <result>,
  count?: number,        // For lists
  message?: string       // For operations
}

// Error Response
{
  success: false,
  error: <error_message>
}
```

**Helper functions available:**

```typescript
import { createSuccessResponse, createListResponse } from '@/lib/api/openapi';

// For single item responses
const UserResponseSchema = createSuccessResponse(UserSchema);

// For list responses
const UserListResponseSchema = createListResponse(UserSchema);
```

---

## Auto-Generation Workflow

### Generate OpenAPI Spec

```bash
npm run api:generate    # Generate openapi.json from route definitions
```

**What it does:**

1. Scans `app/api/**/openapi.ts` files
2. Imports them to trigger `registry.registerPath()` calls
3. Generates `openapi.json` at project root

### Generate Type-Safe SDK

```bash
npm run api:sdk         # Generate SDK from openapi.json using Orval
```

**Generated SDK location:** `sdk/index.ts`

### Development Mode

```bash
npm run api:dev         # Next.js dev + watch mode for OpenAPI + SDK
```

**Watches for changes in:**

- `app/api/**/schema.ts`
- `app/api/**/openapi.ts`
- `app/api/**/route.ts`

Auto-regenerates both OpenAPI spec and SDK on file changes.

---

## Validation with Zod

### Request Validation

```typescript
const validationResult = CreateUserRequestSchema.safeParse(body);

if (!validationResult.success) {
  return NextResponse.json(
    { success: false, error: validationResult.error.errors[0].message },
    { status: 400 }
  );
}

// Use validated data
const { name, email } = validationResult.data;
```

### Schema Composition

```typescript
// Reuse schemas
const BaseUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

// Extend schemas
const CreateUserSchema = BaseUserSchema.extend({
  password: z.string().min(8)
});

// Partial schemas
const UpdateUserSchema = BaseUserSchema.partial();
```

---

## Testing Endpoints

- **Health Check**: `GET /api/health`
- **API Info**: `GET /api`
- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI Spec**: `http://localhost:3000/api/openapi.json`
- **Example Endpoint**: `GET /api/users`

---

## Adding a New Endpoint

1. **Create route folder**: `app/api/posts/`
2. **Create schema**: `app/api/posts/schema.ts`
3. **Create OpenAPI definition**: `app/api/posts/openapi.ts`
4. **Create handler**: `app/api/posts/route.ts` (import './openapi')
5. **Generate**: `npm run api:generate && npm run api:sdk`

---

## Best Practices

✅ **DO:**

- Co-locate schemas, OpenAPI defs, and handlers
- Use Zod for all validation
- Export types from schemas
- Use `withDatabase` middleware
- Add OpenAPI metadata to schemas
- Keep handlers pure and functional

❌ **DON'T:**

- Use classes or decorators
- Skip validation
- Duplicate type definitions
- Call `mongoose.connect()` directly
- Edit generated files (`sdk/index.ts`, `openapi.json`)
- Skip the `import './openapi'` in route handlers
