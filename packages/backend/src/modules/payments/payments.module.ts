import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { MpesaService } from './gateways/mpesa.service';
import { PaystackService } from './gateways/paystack.service';
import { FlutterwaveService } from './gateways/flutterwave.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ConfigModule],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    PaymentsService,
    MpesaService,
    PaystackService,
    FlutterwaveService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
