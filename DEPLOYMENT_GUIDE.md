# 🚀 Afrify Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Infrastructure Setup
- [ ] **Server/Hosting**: Set up production servers (DigitalOcean, AWS, Azure, or Linode)
- [ ] **Domain Names**: Register domains
  - [ ] api.afrify.com (Backend API)
  - [ ] www.afrify.com (Customer Storefront)
  - [ ] merchant.afrify.com (Merchant Dashboard)
- [ ] **SSL Certificates**: Obtain SSL certificates (Let's Encrypt or purchased)
- [ ] **DNS Configuration**: Point domains to servers

### 2. Database Setup
- [ ] **PostgreSQL 15+**: Set up production database
- [ ] **Database Backup**: Configure automated backups
- [ ] **Connection Pooling**: Configure PgBouncer or RDS Proxy
- [ ] **Database User**: Create production user with limited permissions

### 3. Storage Setup
- [ ] **S3/MinIO**: Set up file storage
- [ ] **CDN**: Configure CloudFront or similar CDN
- [ ] **Bucket Policies**: Set correct permissions (public-read for product images)

### 4. Email Service
- [ ] **SMTP Provider**: Set up SendGrid, Mailgun, or Amazon SES
- [ ] **Domain Verification**: Verify sending domain
- [ ] **Email Templates**: Test all email templates
- [ ] **SPF/DKIM Records**: Configure DNS records

### 5. Payment Gateways
- [ ] **M-Pesa**: Apply for production credentials
  - [ ] Complete Safaricom onboarding
  - [ ] Configure production shortcode
  - [ ] Test STK Push in production
- [ ] **Paystack**: Upgrade to live account
  - [ ] Complete KYC verification
  - [ ] Get live API keys
  - [ ] Configure webhook URL
- [ ] **Flutterwave**: Activate production account
  - [ ] Complete business verification
  - [ ] Get live keys
  - [ ] Test payment flows

### 6. Monitoring & Logging
- [ ] **Sentry**: Set up error tracking
- [ ] **Application Monitoring**: Configure New Relic or DataDog
- [ ] **Uptime Monitoring**: Set up UptimeRobot or Pingdom
- [ ] **Log Management**: Configure logging (CloudWatch, Loggly, or self-hosted)

### 7. Security
- [ ] **Firewall**: Configure firewall rules
- [ ] **Rate Limiting**: Enable rate limiting
- [ ] **SSL/TLS**: Enforce HTTPS
- [ ] **Environment Variables**: Secure all secrets
- [ ] **Database Encryption**: Enable encryption at rest
- [ ] **Regular Updates**: Plan for security patches

---

## 🏗️ Deployment Architecture

### Recommended Production Setup

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                   (Nginx/CloudFlare)                     │
└───────────┬─────────────────────────────────────────────┘
            │
    ┌───────┴──────────────────────────────┐
    │                                       │
┌───▼────────────┐              ┌─────────▼────────┐
│  API Server    │              │  Frontend Apps   │
│  (NestJS)      │              │  (Next.js)       │
│  Port 3000     │              │  Ports 3001-3002 │
└───┬────────────┘              └──────────────────┘
    │
┌───▼──────────────────┬────────────────┬──────────────┐
│                      │                │              │
│  PostgreSQL          │    Redis       │   MinIO/S3   │
│  Port 5432           │    Port 6379   │   Port 9000  │
└──────────────────────┴────────────────┴──────────────┘
```

---

## 🐳 Docker Production Deployment

### 1. Update `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_DATABASE}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  minio:
    image: minio/minio:latest
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  backend:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
    env_file:
      - ./packages/backend/.env.production
    depends_on:
      - postgres
      - redis
    ports:
      - "3000:3000"

  merchant-dashboard:
    build:
      context: ./packages/merchant-dashboard
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
    ports:
      - "3001:3001"

  customer-storefront:
    build:
      context: ./packages/customer-storefront
      dockerfile: Dockerfile
    restart: always
    environment:
      NODE_ENV: production
    ports:
      - "3002:3002"

  nginx:
    image: nginx:alpine
    restart: always
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
      - merchant-dashboard
      - customer-storefront

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 2. Create Dockerfiles

#### Backend Dockerfile
```dockerfile
# packages/backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### Frontend Dockerfile (Same for merchant-dashboard & customer-storefront)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Nginx Configuration

```nginx
# nginx.conf
upstream backend {
    server backend:3000;
}

upstream merchant {
    server merchant-dashboard:3001;
}

upstream storefront {
    server customer-storefront:3002;
}

# API Server
server {
    listen 80;
    server_name api.afrify.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.afrify.com;

    ssl_certificate /etc/nginx/ssl/api.afrify.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.afrify.com.key;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Merchant Dashboard
server {
    listen 80;
    server_name merchant.afrify.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name merchant.afrify.com;

    ssl_certificate /etc/nginx/ssl/merchant.afrify.com.crt;
    ssl_certificate_key /etc/nginx/ssl/merchant.afrify.com.key;

    location / {
        proxy_pass http://merchant;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Customer Storefront
server {
    listen 80;
    server_name www.afrify.com afrify.com;
    return 301 https://www.afrify.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.afrify.com;

    ssl_certificate /etc/nginx/ssl/www.afrify.com.crt;
    ssl_certificate_key /etc/nginx/ssl/www.afrify.com.key;

    location / {
        proxy_pass http://storefront;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📦 Manual Deployment Steps

### 1. Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis
sudo apt install redis-server

# Install Nginx
sudo apt install nginx
```

### 2. Clone & Build

```bash
# Clone repository
git clone https://github.com/your-org/afrify.git
cd afrify

# Install dependencies
npm install

# Build all packages
npm run build

# Set up environment variables
cp packages/backend/.env.production.example packages/backend/.env.production
# Edit .env.production with your credentials
nano packages/backend/.env.production
```

### 3. Database Migration

```bash
cd packages/backend

# Run migrations
npm run typeorm migration:run

# (Optional) Seed initial data
npm run seed
```

### 4. Start Services with PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'afrify-backend',
      cwd: './packages/backend',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'afrify-merchant',
      cwd: './packages/merchant-dashboard',
      script: 'npm',
      args: 'start',
      instances: 1,
    },
    {
      name: 'afrify-storefront',
      cwd: './packages/customer-storefront',
      script: 'npm',
      args: 'start',
      instances: 1,
    },
  ],
};
EOF

# Start all services
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 5. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/afrify

# Enable site
sudo ln -s /etc/nginx/sites-available/afrify /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d api.afrify.com -d www.afrify.com -d merchant.afrify.com

# Auto-renewal is configured automatically
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/afrify
            git pull origin main
            npm install
            npm run build
            pm2 restart ecosystem.config.js
```

---

## 📊 Post-Deployment Verification

### 1. Health Checks

```bash
# Check backend health
curl https://api.afrify.com/health

# Check frontend
curl https://www.afrify.com

# Check merchant dashboard
curl https://merchant.afrify.com
```

### 2. Database Check

```bash
# Connect to database
psql -h localhost -U afrify_prod -d afrify_production

# Check tables
\dt

# Check record counts
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM stores;
```

### 3. Payment Gateway Tests

```bash
# Test M-Pesa (use test phone numbers)
curl -X POST https://api.afrify.com/api/v1/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "phone": "254712345678", "gateway": "mpesa"}'
```

### 4. Monitoring Setup

- **Sentry**: Verify error tracking is working
- **Uptime**: Confirm monitoring is active
- **Logs**: Check log aggregation
- **Backups**: Verify first backup completed

---

## 🛡️ Security Hardening

### 1. Firewall Rules (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban (Brute Force Protection)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates

```bash
# Create update script
cat > /usr/local/bin/update-afrify.sh << 'EOF'
#!/bin/bash
apt update && apt upgrade -y
npm update -g
pm2 update
EOF

chmod +x /usr/local/bin/update-afrify.sh

# Schedule weekly updates
sudo crontab -e
# Add: 0 2 * * 0 /usr/local/bin/update-afrify.sh
```

---

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (AWS ELB, DigitalOcean Load Balancer)
- Run multiple backend instances with PM2 cluster mode
- Use Redis for session storage

### Database Scaling
- Set up read replicas for analytics queries
- Configure connection pooling with PgBouncer
- Consider partitioning for large tables

### CDN Integration
- Use CloudFlare or CloudFront for static assets
- Configure cache headers properly
- Enable image optimization

---

## 🆘 Troubleshooting

### Service Won't Start

```bash
# Check PM2 logs
pm2 logs

# Check system logs
journalctl -u nginx
journalctl -u postgresql
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

### High Memory Usage

```bash
# Check memory
free -h

# Monitor processes
htop

# Restart services
pm2 restart all
```

---

## ✅ Go-Live Checklist

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Payment gateways tested in production
- [ ] SSL certificates installed and working
- [ ] DNS records propagated
- [ ] Monitoring and alerting active
- [ ] Backups configured and tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Support team trained
- [ ] Marketing materials ready
- [ ] Social media accounts active

---

## 📞 Support

For deployment support, contact:
- **Email**: devops@afrify.com
- **Slack**: #deployment-support
- **Documentation**: https://docs.afrify.com

**🎉 Congratulations on deploying Afrify to production!**
