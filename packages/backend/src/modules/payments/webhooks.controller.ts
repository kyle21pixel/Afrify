import {
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { MpesaService } from './gateways/mpesa.service';
import { PaystackService } from './gateways/paystack.service';
import { FlutterwaveService } from './gateways/flutterwave.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mpesaService: MpesaService,
    private readonly paystackService: PaystackService,
    private readonly flutterwaveService: FlutterwaveService,
  ) {}

  /**
   * M-Pesa STK Push Callback
   */
  @Post('mpesa/callback')
  @ApiOperation({ summary: 'M-Pesa STK Push callback endpoint' })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async handleMpesaCallback(@Body() body: any) {
    try {
      this.logger.log('Received M-Pesa callback');

      const result = await this.mpesaService.processCallback(body);

      if (result.success && result.transactionId) {
        // Update payment record in database
        await this.paymentsService.updatePaymentFromCallback({
          gateway: 'mpesa',
          transactionId: result.transactionId,
          status: result.status,
          amount: result.amount,
          metadata: {
            phoneNumber: result.phoneNumber,
          },
        });
      }

      // Always return 200 to M-Pesa to acknowledge receipt
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    } catch (error) {
      this.logger.error('M-Pesa callback processing failed', error);
      // Still return 200 to prevent retries
      return {
        ResultCode: 0,
        ResultDesc: 'Accepted',
      };
    }
  }

  /**
   * M-Pesa Timeout Callback
   */
  @Post('mpesa/timeout')
  @ApiOperation({ summary: 'M-Pesa timeout callback endpoint' })
  async handleMpesaTimeout(@Body() body: any) {
    this.logger.warn('M-Pesa timeout received', body);

    // Mark payment as failed due to timeout
    // Extract checkout request ID and mark as failed

    return {
      ResultCode: 0,
      ResultDesc: 'Accepted',
    };
  }

  /**
   * Paystack Webhook
   */
  @Post('paystack')
  @ApiOperation({ summary: 'Paystack webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handlePaystackWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    try {
      this.logger.log('Received Paystack webhook');

      // Verify webhook signature
      const rawBody = JSON.stringify(body);
      const isValid = this.paystackService.verifyWebhookSignature(
        rawBody,
        signature,
      );

      if (!isValid) {
        this.logger.warn('Invalid Paystack webhook signature');
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      const result = await this.paystackService.processWebhook(body);

      if (result.success && result.transactionId) {
        // Update payment record in database
        await this.paymentsService.updatePaymentFromCallback({
          gateway: 'paystack',
          transactionId: result.transactionId,
          status: result.status,
          amount: result.amount,
          metadata: result.data,
        });
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Paystack webhook processing failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Flutterwave Webhook
   */
  @Post('flutterwave')
  @ApiOperation({ summary: 'Flutterwave webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleFlutterwaveWebhook(
    @Body() body: any,
    @Headers('verif-hash') signature: string,
  ) {
    try {
      this.logger.log('Received Flutterwave webhook');

      // Verify webhook signature
      const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
      if (signature !== secretHash) {
        this.logger.warn('Invalid Flutterwave webhook signature');
        throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
      }

      const result = await this.flutterwaveService.processWebhook(body);

      if (result.success && result.transactionId) {
        // Update payment record in database
        await this.paymentsService.updatePaymentFromCallback({
          gateway: 'flutterwave',
          transactionId: result.transactionId,
          status: result.status,
          amount: result.amount,
          metadata: result.data,
        });
      }

      return { status: 'success' };
    } catch (error) {
      this.logger.error('Flutterwave webhook processing failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Test webhook endpoint (development only)
   */
  @Get('test/:gateway')
  @ApiOperation({ summary: 'Test webhook endpoint (development only)' })
  async testWebhook(@Param('gateway') gateway: string) {
    if (process.env.NODE_ENV === 'production') {
      throw new HttpException('Not available in production', HttpStatus.FORBIDDEN);
    }

    return {
      message: `${gateway} webhook endpoint is active`,
      url: `http://localhost:3000/webhooks/${gateway}`,
    };
  }
}
