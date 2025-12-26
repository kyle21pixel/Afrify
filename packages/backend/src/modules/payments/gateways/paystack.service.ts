import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentStatus } from '@afrify/shared';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
    plan: any;
    order_id: string | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
  };
}

interface PaystackWebhookEvent {
  event: string;
  data: any;
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY', '');
    this.publicKey = this.configService.get('PAYSTACK_PUBLIC_KEY', '');
  }

  /**
   * Initialize payment transaction
   */
  async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata?: any,
    callbackUrl?: string,
  ): Promise<PaystackInitializeResponse> {
    try {
      // Paystack expects amount in kobo (multiply by 100)
      const amountInKobo = Math.round(amount * 100);

      const response = await axios.post<PaystackInitializeResponse>(
        `${this.baseUrl}/transaction/initialize`,
        {
          email,
          amount: amountInKobo,
          reference,
          metadata,
          callback_url: callbackUrl,
          channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        this.logger.log(
          `Paystack payment initialized: ${response.data.data.reference}`,
        );
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Paystack initialization failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to initialize Paystack payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await axios.get<PaystackVerifyResponse>(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.status) {
        this.logger.log(`Paystack payment verified: ${reference}`);
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Paystack verification failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to verify Paystack payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    event: PaystackWebhookEvent,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
    status: PaymentStatus;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log(`Processing Paystack webhook event: ${event.event}`);

      switch (event.event) {
        case 'charge.success':
          return this.handleChargeSuccess(event.data);

        case 'charge.failed':
          return this.handleChargeFailed(event.data);

        case 'transfer.success':
        case 'transfer.failed':
        case 'transfer.reversed':
          return this.handleTransferEvent(event.event, event.data);

        default:
          this.logger.log(`Unhandled webhook event: ${event.event}`);
          return {
            success: true,
            status: PaymentStatus.PENDING,
            message: 'Event received but not processed',
          };
      }
    } catch (error) {
      this.logger.error('Failed to process Paystack webhook', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: 'Failed to process webhook',
      };
    }
  }

  /**
   * Handle successful charge
   */
  private handleChargeSuccess(data: any): {
    success: boolean;
    transactionId: string;
    amount: number;
    status: PaymentStatus;
    message: string;
    data: any;
  } {
    this.logger.log(
      `Paystack charge successful: ${data.reference}, Amount: ${data.amount / 100}`,
    );

    return {
      success: true,
      transactionId: data.reference,
      amount: data.amount / 100, // Convert from kobo to main currency
      status: PaymentStatus.COMPLETED,
      message: 'Payment completed successfully',
      data: {
        channel: data.channel,
        currency: data.currency,
        paidAt: data.paid_at,
        fees: data.fees / 100,
        customer: data.customer,
        authorization: data.authorization,
      },
    };
  }

  /**
   * Handle failed charge
   */
  private handleChargeFailed(data: any): {
    success: boolean;
    transactionId: string;
    status: PaymentStatus;
    message: string;
  } {
    this.logger.warn(
      `Paystack charge failed: ${data.reference}, Reason: ${data.gateway_response}`,
    );

    return {
      success: false,
      transactionId: data.reference,
      status: PaymentStatus.FAILED,
      message: data.gateway_response || 'Payment failed',
    };
  }

  /**
   * Handle transfer events (for payouts)
   */
  private handleTransferEvent(
    eventType: string,
    data: any,
  ): {
    success: boolean;
    transactionId: string;
    status: PaymentStatus;
    message: string;
  } {
    const statusMap = {
      'transfer.success': PaymentStatus.COMPLETED,
      'transfer.failed': PaymentStatus.FAILED,
      'transfer.reversed': PaymentStatus.REFUNDED,
    };

    return {
      success: eventType === 'transfer.success',
      transactionId: data.reference,
      status: statusMap[eventType] || PaymentStatus.PENDING,
      message: `Transfer ${eventType.split('.')[1]}`,
    };
  }

  /**
   * Create transfer (for merchant payouts)
   */
  async createTransfer(
    amount: number,
    recipient: string,
    reason: string,
    reference: string,
  ): Promise<any> {
    try {
      const amountInKobo = Math.round(amount * 100);

      const response = await axios.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          amount: amountInKobo,
          recipient,
          reason,
          reference,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status) {
        this.logger.log(`Paystack transfer created: ${reference}`);
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Paystack transfer failed', error);
      throw new HttpException(
        'Failed to create transfer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List supported banks
   */
  async listBanks(country: string = 'nigeria'): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/bank`, {
        params: { country },
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to list banks', error);
      throw new HttpException(
        'Failed to list banks',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get public key for frontend
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Validate configuration
   */
  isConfigured(): boolean {
    return !!(this.secretKey && this.publicKey);
  }
}
