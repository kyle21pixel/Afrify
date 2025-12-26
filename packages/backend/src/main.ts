import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3001', // Merchant Dashboard
      'http://localhost:3002', // Customer Storefront
      'http://localhost:3003', // Admin Panel
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Afrify API')
    .setDescription('Multi-tenant e-commerce SaaS platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('stores', 'Store management')
    .addTag('products', 'Product management')
    .addTag('orders', 'Order management')
    .addTag('customers', 'Customer management')
    .addTag('payments', 'Payment processing')
    .addTag('themes', 'Theme management')
    .addTag('subscriptions', 'Subscription management')
    .addTag('webhooks', 'Webhook management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Afrify API Server running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  console.log(`🎮 GraphQL Playground: http://localhost:${port}/graphql\n`);
}

bootstrap();
