# Afrify - System Architecture Documentation

## 📐 Architecture Overview

Afrify is built as a **multi-tenant SaaS platform** using a **monorepo structure** with clear separation of concerns between backend, frontend applications, and shared code.

```
┌─────────────────────────────────────────────────────────────┐
│                        Load Balancer / CDN                   │
└──────────────┬─────────────────┬──────────────┬─────────────┘
               │                 │              │
               ▼                 ▼              ▼
    ┌──────────────────┐  ┌──────────┐  ┌──────────┐
    │  Merchant        │  │ Customer │  │  Admin   │
    │  Dashboard       │  │Storefront│  │  Panel   │
    │  (Next.js)       │  │(Next.js) │  │(Next.js) │
    └────────┬─────────┘  └─────┬────┘  └─────┬────┘
             │                  │              │
             └──────────────────┼──────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   API Gateway         │
                    │   (NestJS Backend)    │
                    │   REST + GraphQL      │
                    └──────────┬────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
         ┌──────────┐   ┌──────────┐  ┌──────────┐
         │PostgreSQL│   │  Redis   │  │  MinIO   │
         │ Database │   │  Cache   │  │ Storage  │
         └──────────┘   └──────────┘  └──────────┘
```

---

## 🏗️ Monorepo Structure

```
afrify/
├── packages/
│   ├── shared/               # Shared TypeScript types & utilities
│   │   ├── src/
│   │   │   ├── enums.ts     # Status enums, payment methods
│   │   │   ├── interfaces.ts# Domain interfaces
│   │   │   ├── types.ts     # Type exports
│   │   │   ├── constants.ts # Platform constants
│   │   │   └── utils/       # Utility functions
│   │   └── package.json
│   │
│   ├── backend/             # NestJS API Server
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   └── modules/     # Feature modules
│   │   │       ├── stores/
│   │   │       ├── products/
│   │   │       ├── orders/
│   │   │       ├── customers/
│   │   │       ├── payments/
│   │   │       ├── themes/
│   │   │       └── ...
│   │   └── package.json
│   │
│   ├── merchant-dashboard/  # Merchant Web App
│   │   ├── src/
│   │   │   ├── app/         # Next.js App Router
│   │   │   ├── components/  # React components
│   │   │   ├── lib/         # API client, utils
│   │   │   └── styles/      # Global styles
│   │   └── package.json
│   │
│   ├── customer-storefront/ # Customer-facing store
│   │   └── (To be built)
│   │
│   ├── admin-panel/         # Super Admin panel
│   │   └── (To be built)
│   │
│   └── mobile-app/          # React Native app
│       └── (To be built)
│
├── docker-compose.yml       # Development services
├── package.json             # Root workspace config
├── tsconfig.json            # TypeScript config
└── README.md
```

---

## 🗄️ Database Architecture

### Multi-Tenant Design

**Strategy**: Shared database with tenant isolation via `tenant_id` / `store_id`

```sql
tenants (root level)
  id, slug, name, subscription_plan, subscription_status
  
  ↓ has many
  
stores (tenant instances)
  id, tenant_id, slug, name, domain, currency, settings
  
  ↓ has many
  
products, orders, customers, themes, discounts, webhooks...
```

### Entity Relationship Diagram

```
┌─────────┐
│ Tenants │
└────┬────┘
     │
     ├──→ ┌────────┐
     │    │ Stores │
     │    └───┬────┘
     │        │
     │        ├──→ ┌──────────┐      ┌─────────────────┐
     │        │    │ Products │──┬──→│ Product Variants│
     │        │    └──────────┘  │   └─────────────────┘
     │        │                   │
     │        │                   │   ┌────────────┐
     │        ├──→ ┌────────┐    └──→│ Order Items│
     │        │    │ Orders │───────→└────────────┘
     │        │    └───┬────┘
     │        │        │
     │        │        └──→ ┌──────────┐
     │        │             │ Payments │
     │        │             └──────────┘
     │        │
     │        ├──→ ┌───────────┐
     │        │    │ Customers │
     │        │    └───────────┘
     │        │
     │        ├──→ ┌────────┐
     │        │    │ Themes │
     │        │    └────────┘
     │        │
     │        ├──→ ┌───────────┐
     │        │    │ Discounts │
     │        │    └───────────┘
     │        │
     │        └──→ ┌──────────┐
     │             │ Webhooks │
     │             └──────────┘
```

### Key Tables

**tenants**
- Multi-tenant root
- Subscription management
- Billing information

**stores**
- Store configuration
- Domain/subdomain
- Currency and timezone
- Payment method settings
- Theme settings

**products**
- Product catalog
- SEO metadata
- Category and tags
- Multi-variant support

**product_variants**
- SKUs and barcodes
- Inventory tracking
- Pricing (price, compare_at_price, cost)
- Weight and dimensions

**orders**
- Order processing
- Payment status
- Fulfillment status
- Shipping/billing addresses
- Order items (line items)

**customers**
- Customer profiles
- Multiple addresses
- Order history
- Lifetime value tracking

**payments**
- Payment transactions
- Gateway integration data
- Status tracking
- Refund support

**themes**
- Store theming
- Section-based layout
- Customizable settings
- Preview images

---

## 🔌 API Architecture

### REST API

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**: JWT Bearer token (to be implemented)

**Endpoints Structure**:
```
/stores
  GET    /              List stores
  POST   /              Create store
  GET    /:id           Get store
  PATCH  /:id           Update store
  DELETE /:id           Delete store

/products
  GET    /              List products
  POST   /              Create product
  GET    /:id           Get product
  PATCH  /:id           Update product
  DELETE /:id           Delete product

/orders
  GET    /              List orders
  POST   /              Create order
  GET    /:id           Get order
  PATCH  /:id           Update order status

/customers
  GET    /              List customers
  GET    /:id           Get customer
  POST   /              Create customer

/payments
  POST   /              Process payment
  GET    /:id           Get payment status
  POST   /:id/refund    Refund payment

/themes
  GET    /              List themes
  POST   /              Create theme
  PATCH  /:id           Update theme

/webhooks
  GET    /              List webhooks
  POST   /              Create webhook
  DELETE /:id           Delete webhook
```

### GraphQL API

**Endpoint**: `http://localhost:3000/graphql`

**Schema**:
```graphql
type Query {
  stores(tenantId: ID): [Store!]!
  store(id: ID!): Store
  products(storeId: ID!): [Product!]!
  product(id: ID!): Product
  orders(storeId: ID!): [Order!]!
  order(id: ID!): Order
  customers(storeId: ID!): [Customer!]!
}

type Mutation {
  createStore(input: CreateStoreInput!): Store!
  updateStore(id: ID!, input: UpdateStoreInput!): Store!
  deleteStore(id: ID!): Boolean!
  
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  
  createOrder(input: CreateOrderInput!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order!
}

type Store {
  id: ID!
  name: String!
  slug: String!
  email: String!
  currency: Currency!
  status: StoreStatus!
  products: [Product!]!
  orders: [Order!]!
  customers: [Customer!]!
}

# ... (complete schema in backend/src/schema.gql)
```

---

## 🎨 Frontend Architecture

### Merchant Dashboard

**Technology**: Next.js 14 (App Router)

**Structure**:
```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── providers.tsx        # React Query, etc.
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout
│       ├── page.tsx         # Dashboard home
│       ├── products/        # Products management
│       ├── orders/          # Orders management
│       ├── customers/       # Customers management
│       └── settings/        # Store settings
│
├── components/
│   ├── ui/                  # UI components
│   ├── forms/               # Form components
│   └── charts/              # Chart components
│
├── lib/
│   ├── api.ts               # API client
│   ├── utils.ts             # Utility functions
│   └── hooks/               # Custom hooks
│
└── styles/
    └── globals.css          # Global styles
```

**State Management**:
- **Server State**: React Query (TanStack Query)
- **Client State**: Zustand
- **Forms**: React Hook Form + Zod

**Key Features**:
- Server-side rendering (SSR)
- API route proxying
- Optimistic updates
- Real-time notifications
- Responsive design

### Customer Storefront (To be built)

**Technology**: Next.js 14 (SSR + ISR)

**Key Features**:
- Dynamic theme rendering
- SEO optimization
- PWA support
- Cart in local storage
- Mobile-first design
- Low-bandwidth optimization

---

## 🔄 Data Flow

### Order Creation Flow

```
Customer Storefront
       │
       ├─→ Add items to cart (localStorage)
       │
       ├─→ Checkout form
       │
       ▼
POST /api/v1/orders
       │
       ▼
Backend validates:
  - Product availability
  - Inventory check
  - Calculate totals
  - Apply discounts
       │
       ▼
Create Order (PENDING)
       │
       ├─→ Process Payment
       │   (M-Pesa/Paystack/etc.)
       │
       ├─→ Update order status (PAID)
       │
       ├─→ Decrement inventory
       │
       ├─→ Trigger webhooks
       │
       ├─→ Send email notification
       │
       └─→ Return order confirmation
              │
              ▼
       Redirect to order confirmation page
```

### Product Creation Flow

```
Merchant Dashboard
       │
       ├─→ Fill product form
       │   (title, description, price, images)
       │
       ├─→ Upload images
       │   (MinIO/S3)
       │
       ▼
POST /api/v1/products
       │
       ▼
Backend creates:
  - Product record
  - Product variants
  - Generate slug
  - Process images
       │
       ▼
Cache invalidation (Redis)
       │
       ▼
Return product data
       │
       ▼
Update UI (optimistic)
```

---

## 🔐 Security Architecture

### Authentication (To be implemented)

```
User Login
    │
    ▼
POST /auth/login
    │
    ├─→ Validate credentials
    │
    ├─→ Generate JWT token
    │   {
    │     userId,
    │     tenantId,
    │     storeId,
    │     role,
    │     exp
    │   }
    │
    └─→ Return token + refresh token
```

### Authorization

**Role-Based Access Control (RBAC)**:

```
Roles:
  - SUPER_ADMIN   (Platform admin)
  - MERCHANT      (Store owner)
  - STAFF         (Store employee)
  - CUSTOMER      (End customer)

Permissions:
  SUPER_ADMIN:
    - Manage all tenants
    - Manage subscriptions
    - View all data
  
  MERCHANT:
    - Manage own store
    - Manage products
    - Manage orders
    - View analytics
  
  STAFF:
    - View products
    - Manage orders
    - View customers
  
  CUSTOMER:
    - Place orders
    - View own orders
    - Manage profile
```

### API Security

- **JWT Authentication**: Bearer token in Authorization header
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific origins
- **SQL Injection**: Prevented by TypeORM parameterized queries
- **XSS**: React auto-escaping
- **CSRF**: Token validation (to be implemented)
- **HTTPS**: Required in production

---

## 🚀 Performance Optimization

### Caching Strategy

**Redis Layers**:

```
Cache Keys:
  store:{storeId}                    TTL: 1 hour
  products:{storeId}                 TTL: 15 minutes
  product:{productId}                TTL: 15 minutes
  orders:{storeId}:page:{page}       TTL: 5 minutes
  theme:{storeId}                    TTL: 1 hour
```

**Cache Invalidation**:
- On product update: Clear `product:*` and `products:*`
- On order create: Clear `orders:*`
- On theme update: Clear `theme:*`

### Database Optimization

**Indexes**:
```sql
CREATE INDEX idx_stores_tenant_id ON stores(tenant_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

**Query Optimization**:
- Use `select` to limit fields
- Eager load relations with `relations`
- Pagination for large lists
- Aggregate queries for analytics

### Frontend Optimization

**Next.js**:
- Static generation for public pages
- Server-side rendering for dynamic content
- Incremental static regeneration (ISR)
- Image optimization
- Code splitting
- Lazy loading

**Bundle Size**:
- Tree shaking
- Dynamic imports
- Minimal dependencies
- CDN for static assets

---

## 📊 Monitoring & Logging

### Logging (To be implemented)

**Log Levels**:
- ERROR: Application errors
- WARN: Warnings
- INFO: General info
- DEBUG: Debug information

**Log Destinations**:
- Console (development)
- File rotation (production)
- External service (Datadog, Sentry)

### Metrics (To be implemented)

**System Metrics**:
- API response time
- Database query time
- Cache hit/miss ratio
- Error rates
- Request throughput

**Business Metrics**:
- Orders per hour
- Revenue per day
- Conversion rate
- Cart abandonment rate
- Active users

---

## 🌍 Deployment Architecture

### Production Setup (Planned)

```
           ┌──────────────┐
           │   CloudFlare │ (CDN + DDoS Protection)
           │   DNS + WAF  │
           └──────┬───────┘
                  │
           ┌──────▼───────┐
           │ Load Balancer│
           └──────┬───────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Frontend │ │ Frontend │ │ Frontend │
│ Server 1 │ │ Server 2 │ │ Server 3 │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └────────────┼────────────┘
                  │
      ┌───────────▼───────────┐
      │   API Load Balancer   │
      └───────────┬───────────┘
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Backend  │ │ Backend  │ │ Backend  │
│ Server 1 │ │ Server 2 │ │ Server 3 │
└────┬─────┘ └────┬─────┘ └────┬─────┘
     │            │            │
     └────────────┼────────────┘
                  │
      ┌───────────┼───────────┬──────────┐
      ▼           ▼           ▼          ▼
┌──────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
│PostgreSQL│ │  Redis  │ │  S3    │ │ Queue  │
│ (Primary)│ │ Cluster │ │ Bucket │ │ (Bull) │
└──────────┘ └─────────┘ └────────┘ └────────┘
     │
     ▼
┌──────────┐
│PostgreSQL│
│ (Replica)│
└──────────┘
```

### Container Strategy

**Docker Images**:
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/main"]

# Frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
CMD ["npm", "start"]
```

### Environment Variables

**Backend** (`.env`):
```
NODE_ENV=production
PORT=3000
DB_HOST=postgres-primary.internal
DB_PORT=5432
REDIS_HOST=redis-cluster.internal
S3_ENDPOINT=https://s3.amazonaws.com
JWT_SECRET=<secret>
```

**Frontend** (`.env.production`):
```
NEXT_PUBLIC_API_URL=https://api.afrify.com
NEXT_PUBLIC_APP_URL=https://dashboard.afrify.com
```

---

## 🔧 Development Workflow

### Local Development

```bash
# Start infrastructure
npm run docker:up

# Start backend
cd packages/backend
npm run start:dev

# Start merchant dashboard
cd packages/merchant-dashboard
npm run dev

# Start customer storefront
cd packages/customer-storefront
npm run dev
```

### Git Workflow

```
main (production)
  ↑
  └─ develop (staging)
       ↑
       ├─ feature/product-filters
       ├─ feature/payment-mpesa
       └─ bugfix/order-calculation
```

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api/docs
- **GraphQL Playground**: http://localhost:3000/graphql
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **README**: See `README.md`

---

**Last Updated**: December 26, 2025  
**Version**: 1.0.0  
**Status**: Foundation Complete
