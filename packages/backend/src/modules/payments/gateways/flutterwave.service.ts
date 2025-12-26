import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentStatus } from '@afrify/shared';

interface FlutterwaveInitializeResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card?: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      expiry: string;
    };
  };
}

interface FlutterwaveWebhookEvent {
  event: string;
  data: any;
}

@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly encryptionKey: string;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get(
      'FLUTTERWAVE_ENVIRONMENT',
      'test',
    );
    this.baseUrl =
      environment === 'production'
        ? 'https://api.flutterwave.com/v3'
        : 'https://api.flutterwave.com/v3';

    this.secretKey = this.configService.get('FLUTTERWAVE_SECRET_KEY', '');
    this.publicKey = this.configService.get('FLUTTERWAVE_PUBLIC_KEY', '');
    this.encryptionKey = this.configService.get('FLUTTERWAVE_ENCRYPTION_KEY', '');
  }

  /**
   * Initialize payment transaction
   */
  async initializePayment(
    email: string,
    phoneNumber: string,
    amount: number,
    currency: string,
    reference: string,
    customerName: string,
    metadata?: any,
    redirectUrl?: string,
  ): Promise<FlutterwaveInitializeResponse> {
    try {
      const response = await axios.post<FlutterwaveInitializeResponse>(
        `${this.baseUrl}/payments`,
        {
          tx_ref: reference,
          amount,
          currency,
          redirect_url: redirectUrl,
          payment_options: 'card,mobilemoney,ussd,banktransfer',
          customer: {
            email,
            phonenumber: phoneNumber,
            name: customerName,
          },
          customizations: {
            title: 'Afrify Store Payment',
            description: `Payment for order ${reference}`,
            logo: 'https://yourdomain.com/logo.png',
          },
          meta: metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'success') {
        this.logger.log(`Flutterwave payment initialized: ${reference}`);
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Flutterwave initialization failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to initialize Flutterwave payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(transactionId: string): Promise<FlutterwaveVerifyResponse> {
    try {
      const response = await axios.get<FlutterwaveVerifyResponse>(
        `${this.baseUrl}/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      if (response.data.status === 'success') {
        this.logger.log(`Flutterwave payment verified: ${transactionId}`);
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Flutterwave verification failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to verify Flutterwave payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Process webhook event
   */
  async processWebhook(
    event: FlutterwaveWebhookEvent,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
    status: PaymentStatus;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log(`Processing Flutterwave webhook event: ${event.event}`);

      switch (event.event) {
        case 'charge.completed':
          // Verify the transaction
          const verification = await this.verifyPayment(
            event.data.id.toString(),
          );

          if (
            verification.data.status === 'successful' &&
            verification.data.amount === event.data.amount &&
            verification.data.currency === event.data.currency
          ) {
            return this.handleChargeSuccess(verification.data);
          } else {
            return this.handleChargeFailed(event.data);
          }

        case 'charge.failed':
          return this.handleChargeFailed(event.data);

        case 'transfer.completed':
          return this.handleTransferCompleted(event.data);

        default:
          this.logger.log(`Unhandled webhook event: ${event.event}`);
          return {
            success: true,
            status: PaymentStatus.PENDING,
            message: 'Event received but not processed',
          };
      }
    } catch (error) {
      this.logger.error('Failed to process Flutterwave webhook', error);
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
      `Flutterwave charge successful: ${data.tx_ref}, Amount: ${data.amount} ${data.currency}`,
    );

    return {
      success: true,
      transactionId: data.tx_ref,
      amount: data.amount,
      status: PaymentStatus.COMPLETED,
      message: 'Payment completed successfully',
      data: {
        flwRef: data.flw_ref,
        currency: data.currency,
        paymentType: data.payment_type,
        chargedAmount: data.charged_amount,
        appFee: data.app_fee,
        merchantFee: data.merchant_fee,
        customer: data.customer,
        card: data.card,
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
      `Flutterwave charge failed: ${data.tx_ref}, Reason: ${data.processor_response}`,
    );

    return {
      success: false,
      transactionId: data.tx_ref,
      status: PaymentStatus.FAILED,
      message: data.processor_response || 'Payment failed',
    };
  }

  /**
   * Handle transfer completion (for merchant payouts)
   */
  private handleTransferCompleted(data: any): {
    success: boolean;
    transactionId: string;
    status: PaymentStatus;
    message: string;
  } {
    this.logger.log(`Flutterwave transfer completed: ${data.reference}`);

    return {
      success: true,
      transactionId: data.reference,
      status: PaymentStatus.COMPLETED,
      message: 'Transfer completed successfully',
    };
  }

  /**
   * Create transfer (for merchant payouts)
   */
  async createTransfer(
    accountBank: string,
    accountNumber: string,
    amount: number,
    currency: string,
    reference: string,
    narration: string,
    beneficiaryName?: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfers`,
        {
          account_bank: accountBank,
          account_number: accountNumber,
          amount,
          currency,
          reference,
          narration,
          beneficiary_name: beneficiaryName,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === 'success') {
        this.logger.log(`Flutterwave transfer created: ${reference}`);
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('Flutterwave transfer failed', error);
      throw new HttpException(
        'Failed to create transfer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * List supported banks
   */
  async listBanks(country: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/banks/${country}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new HttpException(
          response.data.message,
          HttpStatus.BAD_REQUEST,
        );
      }
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
    return !!(this.secretKey && this.publicKey && this.encryptionKey);
  }
}
