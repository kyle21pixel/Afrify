import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentStatus } from '@afrify/shared';

interface MpesaAuthResponse {
  access_token: string;
  expires_in: string;
}

interface MpesaStkPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface MpesaStkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface MpesaCallbackMetadata {
  Item: Array<{
    Name: string;
    Value: string | number;
  }>;
}

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: MpesaCallbackMetadata;
    };
  };
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortCode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get('MPESA_ENVIRONMENT', 'sandbox');
    this.baseUrl =
      environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.consumerKey = this.configService.get('MPESA_CONSUMER_KEY', '');
    this.consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET', '');
    this.shortCode = this.configService.get('MPESA_SHORT_CODE', '174379');
    this.passkey = this.configService.get('MPESA_PASSKEY', '');
    this.callbackUrl = this.configService.get(
      'MPESA_CALLBACK_URL',
      'https://yourdomain.com/api/payments/mpesa/callback',
    );
  }

  /**
   * Get OAuth access token for M-Pesa API
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`,
      ).toString('base64');

      const response = await axios.get<MpesaAuthResponse>(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Set expiry 1 minute before actual expiry for safety
      this.tokenExpiresAt = Date.now() + (parseInt(response.data.expires_in) - 60) * 1000;

      this.logger.log('M-Pesa access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get M-Pesa access token', error);
      throw new HttpException(
        'Failed to authenticate with M-Pesa',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(timestamp: string): string {
    return Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString(
      'base64',
    );
  }

  /**
   * Generate timestamp in M-Pesa format (YYYYMMDDHHmmss)
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Initiate STK Push payment
   */
  async initiatePayment(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDescription: string,
  ): Promise<MpesaStkPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody: MpesaStkPushRequest = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa requires whole numbers
        PartyA: formattedPhone,
        PartyB: this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDescription,
      };

      this.logger.log(
        `Initiating M-Pesa STK Push for ${formattedPhone}, Amount: ${amount}`,
      );

      const response = await axios.post<MpesaStkPushResponse>(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.ResponseCode === '0') {
        this.logger.log(
          `STK Push initiated successfully: ${response.data.CheckoutRequestID}`,
        );
        return response.data;
      } else {
        this.logger.error(
          `STK Push failed: ${response.data.ResponseDescription}`,
        );
        throw new HttpException(
          response.data.ResponseDescription,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      this.logger.error('M-Pesa STK Push failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to initiate M-Pesa payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Process M-Pesa callback
   */
  async processCallback(
    callbackData: MpesaCallbackBody,
  ): Promise<{
    success: boolean;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
    status: PaymentStatus;
    message: string;
  }> {
    try {
      const { stkCallback } = callbackData.Body;

      this.logger.log(
        `Processing M-Pesa callback for ${stkCallback.CheckoutRequestID}`,
      );

      // ResultCode 0 = Success
      if (stkCallback.ResultCode === 0) {
        const metadata = stkCallback.CallbackMetadata?.Item || [];

        const amount = metadata.find((item) => item.Name === 'Amount')?.Value as
          | number
          | undefined;
        const mpesaReceiptNumber = metadata.find(
          (item) => item.Name === 'MpesaReceiptNumber',
        )?.Value as string | undefined;
        const phoneNumber = metadata.find((item) => item.Name === 'PhoneNumber')
          ?.Value as string | undefined;

        this.logger.log(
          `M-Pesa payment successful: ${mpesaReceiptNumber}, Amount: ${amount}`,
        );

        return {
          success: true,
          transactionId: mpesaReceiptNumber,
          amount,
          phoneNumber: phoneNumber?.toString(),
          status: PaymentStatus.COMPLETED,
          message: 'Payment completed successfully',
        };
      } else {
        this.logger.warn(
          `M-Pesa payment failed: ${stkCallback.ResultDesc} (Code: ${stkCallback.ResultCode})`,
        );

        return {
          success: false,
          status: PaymentStatus.FAILED,
          message: stkCallback.ResultDesc || 'Payment failed',
        };
      }
    } catch (error) {
      this.logger.error('Failed to process M-Pesa callback', error);
      return {
        success: false,
        status: PaymentStatus.FAILED,
        message: 'Failed to process callback',
      };
    }
  }

  /**
   * Query transaction status
   */
  async queryTransactionStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to query M-Pesa transaction status', error);
      throw new HttpException(
        'Failed to query transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate configuration
   */
  isConfigured(): boolean {
    return !!(
      this.consumerKey &&
      this.consumerSecret &&
      this.shortCode &&
      this.passkey
    );
  }
}
