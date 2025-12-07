# GitHub Copilot Instructions - Next.js Full-Stack Template

## Architecture Overview

This is a **Next.js 16+ App Router full-stack application** with **MongoDB integration**, **dynamic OpenAPI generation**, and **comprehensive UI components**. The system automatically discovers API routes and generates type-safe documentation while providing a complete frontend with React Query, Framer Motion, and custom UI components.

**Key Principles**:

- Route-centric API organization with co-located types and automatic discovery
- Type-safe client-server communication with auto-generated API clients
- Component-driven UI with consistent design system

## Critical Development Patterns

### API Route Structure (Co-location Pattern)

```
app/api/[resource]/
├── route.ts          # API endpoints (GET, POST, etc.)
├── schema.ts         # Zod schemas for validation + OpenAPI
└── openapi.ts        # OpenAPI route definitions
```

**Always create these three files together**. The system uses Zod schemas for validation and OpenAPI generation, with a functional registry pattern.

### Frontend Component Organization

```
app/components/
├── ui/              # Base UI components (Button, Card, etc.)
├── [feature]/       # Feature-specific components
└── shared/          # Shared business components
```

**UI Components**: Use `app/components/ui/` for reusable design system components. All support dark mode via CSS custom properties.

### Database Integration Pattern

```typescript
// Every route handler MUST use withDatabase middleware
import { withDatabase } from '@/lib/api/middleware';
import { User } from '@/lib/api/models';

export const GET = withDatabase(async () => {
  const users = await User.find();
  return NextResponse.json({ success: true, data: users });
});
```

### Type Definition Pattern

```typescript
// schema.ts - Use Zod schemas for validation and OpenAPI
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const CreateUserRequestSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .openapi({ description: 'User name', example: 'John' }),
    email: z
      .string()
      .email()
      .openapi({ description: 'Email', example: 'john@example.com' })
  })
  .openapi('CreateUserRequest');

// openapi.ts - Register routes with OpenAPI metadata
import { registry, createRouteConfig } from '@/lib/api/openapi';
import { CreateUserRequestSchema } from './schema';
import './openapi'; // Import in route.ts to register
```

## Auto-Generation Workflow

**Critical**: The build system (`npm run build`) automatically runs `npm run api:generate` and `npm run api:sdk`.

```bash
npm run api:generate    # Generate OpenAPI spec from route definitions
npm run api:sdk         # Generate type-safe SDK with Orval
npm run api:watch       # Watch mode: OpenAPI + SDK auto-regeneration
npm run api:dev         # Next.js dev + OpenAPI + SDK watching
npm run build           # Production build (includes generation)
```

**Generated files (never edit manually)**:

- `openapi.json` - OpenAPI 3.0 spec (project root)
- `sdk/index.ts` - Type-safe SDK with React Query hooks

## Database Patterns

### Model Definition

```typescript
// app/lib/api/models/[Model].ts
interface IModel extends Document {
  field: string;
  createdAt: Date;
  updatedAt: Date;
}

const ModelSchema: Schema<IModel> = new Schema(
  {
    field: { type: String, required: true }
  },
  { timestamps: true }
);

export const Model =
  mongoose.models.Model || mongoose.model<IModel>('Model', ModelSchema);
```

### Connection Handling

- **Never call `mongoose.connect()` directly**
- Use `withDatabase` middleware - it handles connection caching for serverless
- Connection config in `app/lib/api/config.ts`

## Response Patterns

**Standard API response format**:

```typescript
// Success
return NextResponse.json({
  success: true,
  data: result,
  count?: number,        // For lists
  message?: string       // For operations
});

// Error
return NextResponse.json(
  { success: false, error: 'Error message' },
  { status: 500 }
);
```

## Critical Files & Dependencies

### Configuration

- `app/lib/api/config.ts` - Database, OpenAPI, security config
- `app/lib/api/openapi/registry.ts` - OpenAPI registry and document generator
- `orval.config.ts` - Orval SDK generator configuration
- `proxy.ts` - CORS and proxy configuration
- `package.json` - Scripts: `api:generate`, `api:sdk`, `api:watch`, `api:dev`

### Core Middleware & Utilities

- `app/lib/api/middleware/database.ts` - Connection management with `withDatabase` wrapper
- `app/lib/network/QueryClient.ts` - React Query configuration for frontend
- `app/context/Providers.tsx` - App-level providers (theme, toast, query client)
- Import paths: Use `@/lib/` prefix, never relative paths

### Generation Scripts

- `scripts/generate-openapi.mjs` - Imports openapi.ts files to generate OpenAPI spec
- `scripts/watch-openapi.mjs` - Development file watcher for schema/openapi changes
- Orval generates React Query hooks from OpenAPI spec

## Development Workflows

### API Development

1. **Add route**: Create `app/api/[resource]/route.ts` + `schema.ts` + `openapi.ts`
2. **Define schemas**: Create Zod schemas in `schema.ts` with OpenAPI metadata
3. **Register routes**: Use registry in `openapi.ts` to define API endpoints
4. **Implement handlers**: Export HTTP methods in `route.ts` with `withDatabase` wrapper
5. **Import openapi**: Add `import './openapi'` in `route.ts` to register routes
6. **Run generation**: `npm run api:generate && npm run api:sdk` or use watch mode
7. **Check docs**: http://localhost:3000/api/docs (Swagger UI)

### Frontend Development

1. **Use generated SDK**: Import from `sdk/` for React Query hooks and types
2. **API calls**: Use auto-generated React Query hooks from Orval
3. **UI components**: Extend existing `app/components/ui/` components
4. **State management**: React Query for server state, React hooks for client state
5. **Styling**: Tailwind CSS with CSS custom properties for theming

## Common Gotchas

### API Development

- **Mongoose models**: Always check `mongoose.models.ModelName` before creating
- **Import paths**: Use `@/lib/` not relative paths
- **Import openapi**: Must add `import './openapi'` in `route.ts` for route registration
- **Zod schemas**: Use `.openapi()` method to add OpenAPI metadata
- **Registry pattern**: Use `registry.registerPath()` in `openapi.ts` files
- **Build order**: api:generate → api:sdk → Next.js build
- **withDatabase**: Required for all route handlers that need DB access

### Frontend Development

- **Component imports**: Use `@/components/` not relative paths
- **CSS custom properties**: Use for theming, not hardcoded colors
- **React Query**: Wrap app in QueryClient provider (done in `Providers.tsx`)
- **Form validation**: Use react-hook-form with zod for type-safe forms
- **Framer Motion**: Already configured for page transitions and animations

## Testing Endpoints & Development URLs

- **Health check**: `/api/health`
- **API docs**: `/api/docs` (Swagger UI)
- **OpenAPI spec**: `/api/swagger` (JSON)
- **Frontend**: `/` (Landing page with component showcase)

## Key Dependencies & Architecture

**Frontend**: React 19 + Next.js 16 + Tailwind CSS v4 + Framer Motion + React Query  
**Backend**: MongoDB + Mongoose + Zod validation + OpenAPI 3.0 + Orval SDK generation  
**Type Safety**: Full-stack TypeScript with Zod schemas and auto-generated React Query hooks  
**Theming**: CSS custom properties with dark/light mode support

The system uses **functional, declarative patterns** - Zod schemas define validation and OpenAPI metadata, routes are registered functionally, and SDK is auto-generated with React Query hooks.
