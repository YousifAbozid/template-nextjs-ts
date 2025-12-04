# 🚀 Next.js Full-Stack Template

A production-ready Next.js 16+ full-stack template with TypeScript, MongoDB, Tailwind CSS v4, and comprehensive tooling. Features auto-generated OpenAPI documentation, type-safe API client, React Query integration, dark mode support, custom UI components with Framer Motion, form validation with Zod, and complete developer experience.

## ✨ Features

### 🎯 **Dynamic OpenAPI System**

- **Automatic Route Discovery**: Scans `app/api/**/route.ts` files automatically
- **Type Extraction**: Reads co-located `types.ts` files and generates schemas
- **Zero Configuration**: Works out of the box with your existing code structure
- **Live Documentation**: Interactive Swagger UI at `/api/docs`
- **Type Safety**: Auto-generated TypeScript types and API client

### 🗃️ **MongoDB Integration**

- **Mongoose ODM**: Full MongoDB integration with schema validation
- **Connection Caching**: Optimized for serverless environments
- **Middleware Pattern**: `withDatabase` wrapper for seamless DB connections
- **Model Organization**: Clean separation of concerns with organized models

### 🎨 **Frontend Components**

- **Modern UI Library**: Comprehensive component system with Tailwind CSS v4
- **Dark Mode Support**: Built-in theme switching with CSS custom properties
- **Framer Motion**: Smooth animations and page transitions
- **Form Validation**: Type-safe forms with react-hook-form + Zod
- **State Management**: React Query for server state, React hooks for client state

### 🔧 **Developer Experience**

- **Hot Reload**: Watch mode for automatic OpenAPI regeneration
- **Type Safety**: Full TypeScript support with strict type checking
- **Route-Centric**: Co-located types and endpoints for better maintainability
- **Modern Stack**: Next.js 16+ App Router with ES modules

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

```bash
# Clone the template
git clone https://github.com/YousifAbozid/template-nextjs-ts.git
cd template-nextjs-ts

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Generate API documentation and types
npm run api:generate

# Start development server
npm run dev
```

### Environment Variables

```bash
# .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
API_TITLE="Your API Title"
API_VERSION="1.0.0"
API_DESCRIPTION="Your API Description"
```

## 📁 Project Structure

```
app/
├── api/                    # 🟢 API Routes (You modify these)
│   ├── users/
│   │   ├── route.ts       # API endpoints (GET, POST, etc.)
│   │   └── types.ts       # Route-specific DTOs/interfaces
│   ├── health/            # Health check endpoint
│   ├── docs/              # Swagger UI documentation
│   └── swagger/           # OpenAPI specification endpoint
├── components/            # 🟢 React components
│   ├── ui/                # Base UI components (Button, Card, etc.)
│   └── shared/            # Shared business components
├── context/               # 🟢 React context providers
│   ├── Providers.tsx      # App-level providers
│   ├── ThemeProvider.tsx  # Dark/light mode
│   └── ToastContext.tsx   # Toast notifications
├── lib/                   # Shared utilities and business logic
│   ├── api/
│   │   ├── database/      # 🟢 Database connection utilities
│   │   ├── middleware/    # 🟢 Custom middleware
│   │   ├── models/        # 🟢 Mongoose models
│   │   ├── config.ts      # 🟡 API configuration
│   │   └── types/         # 🔴 Auto-generated files (don't edit)
│   └── network/           # 🟢 React Query configuration
├── layout.tsx             # Root layout with providers
├── page.tsx               # Landing page with component showcase
└── globals.css            # Global styles with CSS custom properties
```

**Legend**: 🟢 Safe to modify | 🟡 Modify carefully | 🔴 Auto-generated (don't touch)

## 🎯 Adding New API Routes

### 1. Create Route Structure

```bash
mkdir app/api/products
touch app/api/products/route.ts app/api/products/types.ts
```

### 2. Define Types (`types.ts`)

```typescript
export class CreateProductDto {
  name!: string;
  price!: number;
  category!: string;
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
```

### 3. Create Route Handler (`route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/app/lib/api/middleware';
import { Product } from '@/app/lib/api/models';

export const GET = withDatabase(async () => {
  const products = await Product.find().sort({ createdAt: -1 });
  return NextResponse.json({
    success: true,
    data: products,
    count: products.length,
  });
});

export const POST = withDatabase(async (req: NextRequest) => {
  const body = await req.json();
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
});
```

### 4. Create Database Model (`app/lib/api/models/Product.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

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
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
```

### 5. Regenerate Documentation

```bash
npm run api:generate
```

**Result**: Your new route automatically appears in:

- OpenAPI spec at `/api/swagger`
- Interactive docs at `/api/docs`
- Generated TypeScript types

## 🎨 Frontend Development

### Using UI Components

```typescript
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';

export function ExampleComponent() {
  const { showToast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => showToast('Success!', 'success')}
          variant="default"
        >
          Click me
        </Button>
      </CardContent>
    </Card>
  );
}
```

### API Integration with React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Using auto-generated API client
export function UsersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.data.map(user => (
        <div key={user._id}>{user.name}</div>
      ))}
    </div>
  );
}
```

## 🔧 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production (includes OpenAPI generation)
npm run start            # Start production server
npm run api:generate     # Generate OpenAPI spec, types, and client
npm run api:watch        # Watch mode for development
npm run api:dev          # Start dev server + OpenAPI watching
npm run type-check       # TypeScript type checking
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier formatting
npm run test             # Run all checks (format, lint, type-check)
```

## 📖 API Documentation

Once running, access your documentation and app:

- **Frontend App**: [http://localhost:3000](http://localhost:3000) (Landing page with component showcase)
- **Interactive Docs**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI Spec**: [http://localhost:3000/api/swagger](http://localhost:3000/api/swagger)
- **Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## 🔄 Auto-Generation Workflow

The system automatically:

1. **Discovers Routes**: Scans all `app/api/**/route.ts` files
2. **Extracts Methods**: Finds exported HTTP methods (GET, POST, etc.)
3. **Reads Types**: Processes co-located `types.ts` files for schemas
4. **Generates Docs**: Creates comprehensive OpenAPI specification
5. **Creates Types**: Generates TypeScript types and API client

### Generated Files (Auto-updated)

- `app/lib/api/types/openapi.json` - OpenAPI 3.0 specification
- `app/lib/api/types/ApiTypes.ts` - TypeScript types
- `app/lib/api/types/ApiClient.ts` - Type-safe API client

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16+](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with CSS custom properties
- **Components**: Custom UI library with [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [React Query](https://tanstack.com/query) + React hooks
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend

- **Language**: TypeScript with ES Modules
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Documentation**: [OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3) + [Swagger UI](https://swagger.io/tools/swagger-ui/)
- **Type Generation**: Auto-generated TypeScript types and API client

### Developer Tools

- **Code Quality**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) + [TypeScript](https://www.typescriptlang.org/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Development**: [Chokidar](https://github.com/paulmillr/chokidar) file watching + [Concurrently](https://github.com/open-cli-tools/concurrently)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t nextjs-backend .

# Run container
docker run -p 3000:3000 nextjs-backend
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📚 Additional Resources

- **[Development Guide](app/DEVELOPMENT_GUIDE.md)** - Comprehensive development documentation
- **[GitHub Copilot Instructions](.github/copilot-instructions.md)** - AI coding assistant setup
- **[Examples](examples/)** - Common implementation patterns
- **[Contributing](CONTRIBUTING.md)** - Contribution guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Mongoose](https://mongoosejs.com/) for MongoDB integration
- [OpenAPI](https://www.openapis.org/) specification contributors
- [Swagger](https://swagger.io/) for API documentation tools

---

**Built with ❤️ by [Yousif Abozid](https://github.com/YousifAbozid)**
