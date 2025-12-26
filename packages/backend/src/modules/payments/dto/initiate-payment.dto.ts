import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentGateway } from '@afrify/shared';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Currency code (NGN, KES, GHS, etc.)' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment gateway', enum: PaymentGateway })
  @IsNotEmpty()
  @IsEnum(PaymentGateway)
  gateway: PaymentGateway;

  @ApiProperty({ description: 'Customer email address' })
  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ description: 'Customer phone number', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ description: 'Customer name', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Payment ID' })
  @IsNotEmpty()
  @IsString()
  paymentId: string;
}
