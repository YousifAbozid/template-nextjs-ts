# GitHub Copilot Instructions - Next.js Backend Template

## Architecture Overview

This is a **Next.js 16+ App Router API backend** with **MongoDB integration** and **dynamic OpenAPI generation**. The system automatically discovers routes and generates type-safe documentation.

**Key Principle**: Route-centric organization with co-located types and automatic discovery.

## Critical Development Patterns

### Route Structure (Co-location Pattern)

```
app/api/[resource]/
├── route.ts          # API endpoints (GET, POST, etc.)
└── types.ts          # Route-specific DTOs/interfaces
```

**Always create both files together**. The OpenAPI generator scans `route.ts` for exported HTTP methods and `types.ts` for schemas.

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

### Core Middleware

- `app/lib/api/middleware/database.ts` - Connection management
- Import path: `@/lib/api/middleware`

### Generation Scripts

- `scripts/generate-openapi.js` - Route scanner and OpenAPI generator
- `scripts/watch-openapi.js` - Development file watcher

## Development Workflow

1. **Add route**: Create `app/api/[resource]/route.ts` + `types.ts`
2. **Export HTTP methods**: `export const GET = withDatabase(async () => ...)`
3. **Define types**: Classes for request DTOs, interfaces for responses
4. **Run generation**: `npm run api:generate` or use watch mode
5. **Check docs**: http://localhost:3000/api/docs (Swagger UI)

## Common Gotchas

- **Mongoose models**: Always check `mongoose.models.ModelName` before creating
- **Import paths**: Use `@/lib/` not relative paths
- **Type exports**: Must use `export` keyword for OpenAPI discovery
- **Route names**: Directory name becomes OpenAPI tag (`users` → `Users`)
- **Build order**: Generation runs before Next.js build, not after

## Testing Endpoints

- **Health check**: `/api/health`
- **API docs**: `/api/docs` (Swagger UI)
- **OpenAPI spec**: `/api/swagger` (JSON)

The system prioritizes **zero configuration** - routes are discovered automatically, types are extracted from code, and documentation stays in sync.
