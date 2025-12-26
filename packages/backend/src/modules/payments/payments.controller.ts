import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto, VerifyPaymentDto } from './dto/initiate-payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a payment transaction' })
  @ApiResponse({ status: 201, description: 'Payment initiated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment details' })
  async initiatePayment(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(
      dto.gateway,
      dto.orderId,
      dto.amount,
      dto.currency,
      dto.customerEmail,
      dto.customerPhone,
      dto.customerName,
    );
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved' })
  async verifyPayment(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(dto.paymentId);
  }

  @Get('gateways')
  @ApiOperation({ summary: 'Get available payment gateways for a currency' })
  @ApiResponse({ status: 200, description: 'Available gateways' })
  async getAvailableGateways(@Query('currency') currency: string) {
    return {
      currency,
      gateways: this.paymentsService.getAvailableGateways(currency),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
