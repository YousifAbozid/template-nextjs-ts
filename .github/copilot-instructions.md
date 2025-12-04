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
└── types.ts          # Route-specific DTOs/interfaces
```

**Always create both files together**. The OpenAPI generator scans `route.ts` for exported HTTP methods and `types.ts` for schemas.

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
// types.ts - Use classes for DTOs (supports decorators)
export class CreateUserDto {
  name!: string; // Required field (no ?)
  email!: string;
}

export interface UserResponseDto {
  // Interfaces for responses
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Auto-Generation Workflow

**Critical**: The build system (`npm run build`) automatically runs `npm run api:generate`. Don't skip this.

```bash
npm run api:generate    # Manual generation
npm run api:watch      # Development with auto-regeneration
npm run api:dev        # Next.js dev + OpenAPI watching
npm run build          # Production build (includes api:generate)
```

**Generated files (never edit manually)**:

- `app/lib/api/types/openapi.json` - OpenAPI 3.0 spec
- `app/lib/api/types/ApiTypes.ts` - TypeScript types
- `app/lib/api/types/ApiClient.ts` - Type-safe client

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
    field: { type: String, required: true },
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
- `proxy.ts` - CORS and proxy configuration
- `package.json` - Scripts: `api:generate`, `api:watch`, `api:dev`, `api:type-check`

### Core Middleware & Utilities

- `app/lib/api/middleware/database.ts` - Connection management with `withDatabase` wrapper
- `app/lib/network/QueryClient.ts` - React Query configuration for frontend
- `app/context/Providers.tsx` - App-level providers (theme, toast, query client)
- Import paths: Use `@/lib/` prefix, never relative paths

### Generation Scripts

- `scripts/generate-openapi.js` - Route scanner and OpenAPI generator
- `scripts/watch-openapi.js` - Development file watcher
- Both scripts scan `app/api/**/route.ts` files automatically

## Development Workflows

### API Development

1. **Add route**: Create `app/api/[resource]/route.ts` + `types.ts`
2. **Export HTTP methods**: `export const GET = withDatabase(async () => ...)`
3. **Define types**: Classes for request DTOs, interfaces for responses
4. **Run generation**: `npm run api:generate` or use watch mode
5. **Check docs**: http://localhost:3000/api/docs (Swagger UI)

### Frontend Development

1. **Use generated types**: Import from `@/lib/api/types/ApiTypes`
2. **API calls**: Use React Query with generated client or custom hooks
3. **UI components**: Extend existing `app/components/ui/` components
4. **State management**: React Query for server state, React hooks for client state
5. **Styling**: Tailwind CSS with CSS custom properties for theming

## Common Gotchas

### API Development

- **Mongoose models**: Always check `mongoose.models.ModelName` before creating
- **Import paths**: Use `@/lib/` not relative paths
- **Type exports**: Must use `export` keyword for OpenAPI discovery
- **Route names**: Directory name becomes OpenAPI tag (`users` → `Users`)
- **Build order**: Generation runs before Next.js build, not after
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
**Backend**: MongoDB + Mongoose + OpenAPI auto-generation  
**Type Safety**: Full-stack TypeScript with auto-generated API types  
**Theming**: CSS custom properties with dark/light mode support

The system prioritizes **zero configuration** - routes are discovered automatically, types are extracted from code, and documentation stays in sync.
