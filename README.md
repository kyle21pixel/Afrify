# Afrify - Multi-Tenant E-Commerce SaaS Platform

> A Shopify clone optimized for African markets with mobile-first design, local payment integrations, and low-bandwidth optimization.

## 🚀 Features

### Merchant Features
- Store setup wizard with custom domain/subdomain
- Product & variant management with SKU and inventory tracking
- Order, refund, and fulfillment management
- Local & global payment integrations (M-Pesa, Airtel, Paystack, Flutterwave)
- Shipping & courier integration
- Discounts, coupons, and abandoned cart recovery
- Sales analytics & reporting
- Theme customization
- Subscription plans & billing

### Customer Features
- Fast mobile storefront (PWA)
- Product search and filters
- Shopping cart
- One-page checkout
- Order tracking
- Reviews & ratings
- Customer accounts

### Super Admin Features
- Merchant & plan management
- Platform revenue dashboard
- Payouts & disputes
- Feature toggles
- Fraud & abuse monitoring

## 🏗️ Tech Stack

- **Frontend (Web)**: Next.js 14, React 18, TypeScript, TailwindCSS
- **Mobile**: React Native (Android-first)
- **Backend**: NestJS, Node.js, TypeScript
- **APIs**: REST + GraphQL
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible)
- **Infrastructure**: Docker, Docker Compose

## 📦 Project Structure

```
afrify/
├── packages/
│   ├── backend/              # NestJS API server
│   ├── merchant-dashboard/   # Merchant web dashboard (Next.js)
│   ├── customer-storefront/  # Customer storefront + PWA (Next.js)
│   ├── admin-panel/          # Super admin panel (Next.js)
│   ├── mobile-app/           # Merchant mobile app (React Native)
│   └── shared/               # Shared types, utilities, constants
├── docker-compose.yml
└── package.json
```

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd afrify
```

2. Install dependencies:
```bash
npm install
```

3. Start development services (PostgreSQL, Redis, MinIO):
```bash
npm run docker:up
```

4. Set up environment variables:
```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/merchant-dashboard/.env.example packages/merchant-dashboard/.env.local
cp packages/customer-storefront/.env.example packages/customer-storefront/.env.local
cp packages/admin-panel/.env.example packages/admin-panel/.env.local
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed the database (optional):
```bash
npm run db:seed
```

7. Start all development servers:
```bash
npm run dev
```

### Development URLs

- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Merchant Dashboard**: http://localhost:3001
- **Customer Storefront**: http://localhost:3002
- **Admin Panel**: http://localhost:3003
- **MinIO Console**: http://localhost:9001

## 🗄️ Database Schema

The platform uses a multi-tenant architecture with the following core entities:

- **Tenants & Stores**: Multi-tenant isolation
- **Products & Variants**: Product catalog management
- **Orders & Order Items**: Order processing
- **Customers**: Customer management
- **Payments**: Payment processing
- **Themes**: Store theming system
- **Subscriptions**: Merchant subscription plans
- **Webhooks**: Event notification system

## 🚢 Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment

The platform is designed to be cloud-agnostic and can be deployed to:
- AWS (ECS, RDS, ElastiCache, S3)
- Google Cloud (Cloud Run, Cloud SQL, Memorystore, Cloud Storage)
- Azure (Container Instances, PostgreSQL, Redis Cache, Blob Storage)
- DigitalOcean (App Platform, Managed Database, Spaces)

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Rate limiting
- SQL injection prevention
- XSS protection
- CSRF protection

## 📊 Performance

- Server-side rendering (SSR) for SEO
- Redis caching
- CDN integration
- Image optimization
- Code splitting
- Lazy loading
- Mobile-first optimization
- Low-bandwidth optimization

## 🌍 African Market Optimization

- Mobile-first design
- Low bandwidth optimization
- Local payment gateway integrations
- Multi-currency support
- Local courier integrations
- Africa-optimized CDN delivery

## 📝 License

Proprietary - All Rights Reserved

## 🤝 Contributing

This is a private project. Contact the team for contribution guidelines.

## 📧 Support

For support, email support@afrify.com
