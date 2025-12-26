# Afrify Development Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v9+ (comes with Node.js)
- **Docker Desktop**: ([Download](https://www.docker.com/products/docker-desktop/))
- **Git**: ([Download](https://git-scm.com/))

### Initial Setup

```bash
# 1. Navigate to project
cd afrify

# 2. Install all dependencies
npm install

# 3. Start Docker services (PostgreSQL, Redis, MinIO)
npm run docker:up

# 4. Set up environment variables
cd packages/backend
cp .env.example .env

cd ../merchant-dashboard
cp .env.example .env.local

# Return to root
cd ../..
```

### Running the Application

**Option 1: Run all services at once**
```bash
npm run dev
```

**Option 2: Run services individually**

```bash
# Terminal 1 - Backend API
cd packages/backend
npm run start:dev

# Terminal 2 - Merchant Dashboard
cd packages/merchant-dashboard
npm run dev

# Terminal 3 - Customer Storefront (when built)
cd packages/customer-storefront
npm run dev
```

### Access Applications

Once running, open your browser:

- **Merchant Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql
- **MinIO Console**: http://localhost:9001 (login: afrify / afrify_minio_password)

---

## 📦 Package Structure

### Shared Package (`packages/shared`)

Common types, utilities, and constants used across all packages.

**Key Files:**
- `src/enums.ts` - All enum types (OrderStatus, PaymentMethod, etc.)
- `src/interfaces.ts` - TypeScript interfaces for domain models
- `src/constants.ts` - Platform constants (currencies, payment gateways, etc.)
- `src/utils/` - Utility functions (string, date, currency, validation)

**Usage in other packages:**
```typescript
import { OrderStatus, formatCurrency, slugify } from '@afrify/shared';
```

### Backend (`packages/backend`)

NestJS API server with REST and GraphQL endpoints.

**Project Structure:**
```
src/
├── main.ts                 # Application entry point
├── app.module.ts           # Root module
└── modules/
    ├── stores/
    │   ├── store.entity.ts     # TypeORM entity
    │   ├── stores.module.ts    # NestJS module
    │   ├── stores.service.ts   # Business logic
    │   ├── stores.controller.ts# REST endpoints
    │   ├── stores.resolver.ts  # GraphQL resolvers
    │   └── dto/                # Data transfer objects
    ├── products/
    ├── orders/
    └── ...
```

**Adding a new feature module:**

```bash
# Generate module, service, controller
cd packages/backend
npm run nest generate module modules/features
npm run nest generate service modules/features
npm run nest generate controller modules/features
```

**Creating a new entity:**

```typescript
// src/modules/features/feature.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Merchant Dashboard (`packages/merchant-dashboard`)

Next.js 14 application for merchants to manage their stores.

**Project Structure:**
```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/landing page
│   ├── providers.tsx           # React Query provider
│   └── dashboard/
│       ├── layout.tsx          # Dashboard shell
│       ├── page.tsx            # Dashboard home
│       ├── products/
│       │   └── page.tsx
│       ├── orders/
│       └── settings/
├── components/
│   └── ui/                     # Reusable components
├── lib/
│   ├── api.ts                  # API client
│   └── utils.ts
└── styles/
    └── globals.css
```

**Creating a new page:**

```typescript
// src/app/dashboard/analytics/page.tsx
'use client';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Analytics</h1>
      {/* Your content */}
    </div>
  );
}
```

**Making API calls:**

```typescript
'use client';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

export default function ProductsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', storeId],
    queryFn: () => productsApi.getAll(storeId),
  });

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Render products */}</div>;
}
```

---

## 🛠️ Common Development Tasks

### 1. Database Migrations

**Note**: Database schema is currently auto-synced in development (TypeORM `synchronize: true`).

For production, create migrations:

```bash
cd packages/backend

# Generate migration from entity changes
npm run migration:generate -- src/database/migrations/AddFeatureTable

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

### 2. Adding a New API Endpoint

**REST Endpoint:**

```typescript
// packages/backend/src/modules/products/products.controller.ts
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Query('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
}
```

**GraphQL Resolver:**

```typescript
// packages/backend/src/modules/products/products.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';

@Resolver('Product')
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}

  @Query('products')
  findAll(@Args('storeId') storeId: string) {
    return this.productsService.findAll(storeId);
  }

  @Mutation('createProduct')
  create(@Args('input') input: CreateProductInput) {
    return this.productsService.create(input);
  }
}
```

### 3. Adding a New UI Component

```typescript
// packages/merchant-dashboard/src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const className = variant === 'primary'
    ? 'bg-primary-600 text-white hover:bg-primary-700'
    : 'bg-gray-200 text-gray-900 hover:bg-gray-300';

  return (
    <button
      className={`px-4 py-2 rounded-lg transition ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

Usage:
```typescript
import { Button } from '@/components/ui/Button';

<Button variant="primary" onClick={handleClick}>
  Save Product
</Button>
```

### 4. Working with Forms

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0, 'Price must be positive'),
});

type FormData = z.infer<typeof schema>;

export default function ProductForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input type="number" {...register('price', { valueAsNumber: true })} />
      {errors.price && <span>{errors.price.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 5. Handling State

**Server State (React Query):**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';

function useProducts(storeId: string) {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: () => productsApi.getAll(storeId),
  });
}

function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
```

**Client State (Zustand):**

```typescript
// src/lib/store.ts
import { create } from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),
  clear: () => set({ items: [] }),
}));
```

---

## 🐛 Debugging

### Backend Debugging

**VS Code launch.json:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "start:debug"],
  "cwd": "${workspaceFolder}/packages/backend",
  "console": "integratedTerminal"
}
```

**Database queries:**
```typescript
// Enable query logging in development
// packages/backend/src/app.module.ts
TypeOrmModule.forRoot({
  // ...
  logging: true, // Log all queries
  logger: 'advanced-console',
})
```

### Frontend Debugging

**React DevTools**: Install browser extension

**Network Tab**: Monitor API calls

**React Query DevTools**: Add to app:
```typescript
// packages/merchant-dashboard/src/app/providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 🧪 Testing

### Backend Tests (To be implemented)

```bash
cd packages/backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests (To be implemented)

```bash
cd packages/merchant-dashboard

# Run tests
npm run test

# Watch mode
npm run test:watch
```

---

## 📦 Building for Production

### Backend

```bash
cd packages/backend
npm run build
npm run start:prod
```

### Frontend

```bash
cd packages/merchant-dashboard
npm run build
npm run start
```

---

## 🔧 Troubleshooting

### Docker containers won't start

```bash
# Stop and remove all containers
npm run docker:down

# Remove volumes
docker-compose down -v

# Start fresh
npm run docker:up
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database connection errors

Check `.env` file has correct credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=afrify
DB_PASSWORD=afrify_dev_password
DB_DATABASE=afrify
```

### TypeScript errors in shared package

```bash
# Rebuild shared package
cd packages/shared
npm run build

# Clear Next.js cache
cd ../merchant-dashboard
rm -rf .next
```

---

## 📝 Code Style Guide

### Naming Conventions

- **Files**: kebab-case (`product-variant.entity.ts`)
- **Classes**: PascalCase (`ProductVariant`)
- **Variables**: camelCase (`productVariant`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_PAGE_SIZE`)
- **Interfaces**: PascalCase, prefix with I optional (`interface Product {}`)

### Code Formatting

Prettier is configured. Run:
```bash
npm run format
```

### Linting

```bash
npm run lint
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linting and formatting
5. Submit a pull request

---

## 📚 Useful Commands

```bash
# Install dependencies for all packages
npm install

# Clean install
npm ci

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Build all packages
npm run build

# Start all in development
npm run dev

# Format code
npm run format

# Lint code
npm run lint

# Docker commands
npm run docker:up      # Start services
npm run docker:down    # Stop services

# Database
npm run db:migrate     # Run migrations
npm run db:seed        # Seed database
```

---

## 🆘 Getting Help

- Check documentation in `ARCHITECTURE.md`
- Check implementation status in `IMPLEMENTATION_STATUS.md`
- Review API docs at http://localhost:3000/api/docs
- Check GraphQL schema at http://localhost:3000/graphql

---

**Happy Coding! 🚀**
