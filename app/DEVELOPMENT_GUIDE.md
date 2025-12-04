# 🚀 Next.js Backend Development Guide

This guide covers how to work with this Next.js backend template that includes MongoDB integration, auto-generated OpenAPI specs, and a decorator-based API framework.

## 📁 Project Structure Overview

```
app/
├── api/                    # 🟢 API Routes (You modify these)
│   ├── users/
│   │   ├── route.ts       # API endpoints
│   │   └── types.ts       # Route-specific DTOs
│   ├── health/
│   │   ├── route.ts       # Health check endpoint
│   │   └── types.ts       # Health-specific types
│   ├── docs/              # Swagger UI
│   ├── swagger/           # OpenAPI spec endpoint
│   └── route.ts           # Main API info
├── lib/                   # Shared utilities and business logic
│   └── api/
│       ├── database/      # 🟢 Database utilities (You modify)
│       ├── middleware/    # 🟢 Custom middleware (You modify)
│       ├── models/        # 🟢 Mongoose models (You modify)
│       ├── dto/           # 🟢 Shared DTOs (You modify)
│       ├── config.ts      # 🟡 API configuration (Modify carefully)
│       ├── decorators/    # 🔴 Core framework (Don't touch)
│       ├── schema/        # 🔴 Core framework (Don't touch)
│       ├── validation/    # 🔴 Core framework (Don't touch)
│       └── types/         # 🔴 Auto-generated (Don't touch)
├── layout.tsx
└── page.tsx
```

**Legend:**

- 🟢 **Safe to modify** - Your main development area
- 🟡 **Modify carefully** - Configuration files, understand impact
- 🔴 **Don't touch** - Auto-generated or core framework files

---

## 🎯 Adding New API Routes

### 1. Create Route Structure

```bash
mkdir app/api/products
touch app/api/products/route.ts
touch app/api/products/types.ts
```

### 2. Define Types First (`app/api/products/types.ts`)

```typescript
/**
 * Product-related DTOs and types
 */

export interface CreateProductDto {
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface ProductResponseDto {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
}
```

### 3. Create the Route (`app/api/products/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/api/middleware';
import { Product } from '@/lib/api/models';
import type { CreateProductDto } from './types';

/**
 * GET /api/products - Get all products
 */
export const GET = withDatabase(async () => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error: unknown) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/products - Create a new product
 */
export const POST = withDatabase(async (req: NextRequest) => {
  try {
    const body: CreateProductDto = await req.json();

    const product = new Product(body);
    const savedProduct = await product.save();

    return NextResponse.json(
      {
        success: true,
        data: savedProduct,
        message: 'Product created successfully',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
});
```

---

## 🗃️ Adding New Database Models

### 1. Create Model File (`app/lib/api/models/Product.ts`)

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Prevent re-compilation in serverless environments
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
```

### 2. Export from Models Index (`app/lib/api/models/index.ts`)

```typescript
export { default as User, type IUser } from './User';
export { default as Product, type IProduct } from './Product';
```

---

## 🔧 Using Middleware

### Database Middleware (Already Available)

```typescript
import { withDatabase } from '@/lib/api/middleware';

// Automatically connects to MongoDB before handling request
export const GET = withDatabase(async () => {
  // Your database operations here
  const data = await SomeModel.find();
  return NextResponse.json(data);
});
```

### Creating Custom Middleware

```typescript
// app/lib/api/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';

type AuthenticatedHandler = (
  req: NextRequest,
  ...args: unknown[]
) => Promise<Response> | Response;

export const withAuth = (handler: AuthenticatedHandler) => {
  return async (req: NextRequest, ...args: unknown[]) => {
    const token = req.headers.get('Authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token logic here
    try {
      // Your auth logic
      return await handler(req, ...args);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
};
```

---

## ⚙️ Configuration and Environment

### Environment Variables (`.env`)

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# API Configuration
API_TITLE="Your API Name"
API_VERSION="1.0.0"
API_DESCRIPTION="Your API description"

# URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### API Configuration (`app/lib/api/config.ts`)

⚠️ **Modify carefully** - This affects OpenAPI generation

```typescript
// Only modify these sections:
export const openApiConfig = {
  info: {
    title: process.env.API_TITLE || 'Your API Name',
    version: process.env.API_VERSION || '1.0.0',
    description: process.env.API_DESCRIPTION || 'Your description',
    // Add contact, license info here
  },

  // Add new servers if needed
  servers: [
    // ... existing servers
  ],

  // Don't modify paths or patterns unless you understand the impact
};
```

---

## 🔄 Auto-Generation Workflow

### How It Works

The project now includes **dynamic OpenAPI generation** that automatically discovers and documents your API routes:

1. **You create/modify** routes in `app/api/*/route.ts`
2. **Script automatically scans** all `app/api/**/route.ts` files
3. **Extracts HTTP methods** (GET, POST, PUT, etc.) from exported functions
4. **Discovers types** from co-located `types.ts` files (supports interfaces, types, and classes)
5. **Generates** comprehensive OpenAPI spec and TypeScript types

### Key Features

- **Automatic Route Discovery**: Scans all route files, no manual registration needed
- **Type Extraction**: Reads DTOs from `types.ts` files and includes them in schemas
- **Request Body Mapping**: Automatically links `CreateXxxDto` classes to POST endpoints
- **Class Support**: Handles both interfaces/types and classes with decorators
- **Zero Configuration**: Works out of the box, discovers your API structure

### Generated Files (🔴 Don't Touch)

- `app/lib/api/types/openapi.json` - Complete OpenAPI 3.0 specification with all discovered routes
- `app/lib/api/types/ApiTypes.ts` - TypeScript types for all endpoints and schemas
- `app/lib/api/types/ApiClient.ts` - Auto-generated API client with type safety

### Manual Generation

```bash
# Generate API documentation and types
npm run api:generate

# Watch for changes and regenerate automatically
npm run api:watch

# Development with live auto-generation
npm run api:dev
```

### Adding New Routes

When you add a new route, the system will automatically:

1. **Discover the route** on next generation
2. **Extract HTTP methods** from your exports
3. **Include request/response schemas** from types files
4. **Update documentation** in Swagger UI

**Example**: Adding `/api/products/route.ts` with `GET` and `POST` exports will automatically appear in:

- OpenAPI spec at `/api/swagger`
- Interactive docs at `/api/docs`
- Generated TypeScript types

---

## 🧪 Development Workflow

### 1. Start Development

```bash
# Install dependencies
npm install

# Start development server with auto-generation
npm run api:dev

# Or start normally
npm run dev
```

### 2. Create New Feature

1. **Create route directory**: `app/api/feature-name/`
2. **Define types**: `app/api/feature-name/types.ts`
3. **Create model** (if needed): `app/lib/api/models/FeatureName.ts`
4. **Implement route**: `app/api/feature-name/route.ts`
5. **Test the endpoint**

### 3. Test and Validate

```bash
# Run all tests
npm test

# Individual checks
npm run lint
npm run type-check
npm run format:check
```

---

## 📝 API Documentation

### Access Documentation

- **Swagger UI**: http://localhost:3000/api/docs
- **OpenAPI Spec**: http://localhost:3000/api/swagger
- **Health Check**: http://localhost:3000/api/health

### Example Requests

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Health check with details
curl http://localhost:3000/api/health?detailed=true
```

---

## 🚨 Common Pitfalls

### ❌ Don't Do This

```typescript
// Don't modify generated files
// ❌ app/lib/api/types/ApiTypes.ts - This gets overwritten!

// Don't put route-specific types in shared locations
// ❌ app/lib/api/dto/user-specific-types.ts

// Don't modify core framework files
// ❌ app/lib/api/decorators/
// ❌ app/lib/api/schema/
// ❌ app/lib/api/validation/
```

### ✅ Do This Instead

```typescript
// ✅ Put route-specific types next to routes
// app/api/users/types.ts

// ✅ Use shared DTOs only for truly shared types
// app/lib/api/dto/shared-response.ts

// ✅ Create custom middleware in the middleware folder
// app/lib/api/middleware/custom-auth.ts
```

---

## 🛟 Getting Help

### File Structure Questions

- If you're unsure where to put something, follow the co-location principle
- Route-specific code goes with the route
- Shared utilities go in `app/lib/`

### Build Issues

- Check if you modified any 🔴 files accidentally
- Run `npm run api:generate` to regenerate types
- Verify import paths use `@/lib/` not relative paths

### Database Issues

- Ensure MongoDB is running and accessible
- Check connection string in `.env`
- Use `withDatabase` middleware for automatic connection management

---

## 📚 Quick Reference

### Essential Commands

```bash
npm run dev          # Start development
npm run build        # Build for production
npm test             # Run all tests
npm run api:generate # Generate API docs/types
```

### Key Import Patterns

```typescript
// Database & Models
import { withDatabase } from '@/lib/api/middleware';
import { User, Product } from '@/lib/api/models';

// Route-specific types
import type { CreateUserDto } from './types';

// Database utilities
import { connectDB } from '@/lib/api/database';
```

### File Naming Conventions

- Routes: `route.ts`
- Types: `types.ts`
- Models: `PascalCase.ts` (e.g., `User.ts`, `Product.ts`)
- Library files: `PascalCase.ts` (e.g., `ApiProperty.ts`, `ApiTypes.ts`)
- Middleware: `database.ts`, `auth.ts` (lowercase for core functionality)

---

_Happy coding! 🚀_
