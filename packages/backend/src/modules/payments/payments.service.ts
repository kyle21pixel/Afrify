import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentStatus, PaymentGateway, Currency } from '@afrify/shared';
import { MpesaService } from './gateways/mpesa.service';
import { PaystackService } from './gateways/paystack.service';
import { FlutterwaveService } from './gateways/flutterwave.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private mpesaService: MpesaService,
    private paystackService: PaystackService,
    private flutterwaveService: FlutterwaveService,
  ) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentsRepository.create(data);
    return this.paymentsRepository.save(payment);
  }

  async findOne(id: string): Promise<Payment> {
    return this.paymentsRepository.findOne({ where: { id } });
  }

  async findByReference(reference: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { transactionId: reference },
    });
  }

  /**
   * Initiate payment based on gateway
   */
  async initiatePayment(
    gateway: PaymentGateway,
    orderId: string,
    amount: number,
    currency: string,
    customerEmail: string,
    customerPhone?: string,
    customerName?: string,
  ): Promise<any> {
    try {
      const reference = `PAY-${Date.now()}-${orderId}`;

      // Create pending payment record
      const payment = await this.create({
        orderId,
        amount,
        currency: currency as Currency,
        gateway,
        status: PaymentStatus.PENDING,
        transactionId: reference,
        metadata: {
          customerEmail,
          customerPhone,
          customerName,
        },
      });

      let paymentUrl: string;

      switch (gateway) {
        case PaymentGateway.MPESA:
          if (!customerPhone) {
            throw new HttpException(
              'Phone number required for M-Pesa',
              HttpStatus.BAD_REQUEST,
            );
          }
          const mpesaResponse = await this.mpesaService.initiatePayment(
            customerPhone,
            amount,
            reference,
            `Payment for order ${orderId}`,
          );
          
          // M-Pesa STK Push doesn't return a URL, customer pays on phone
          return {
            paymentId: payment.id,
            reference,
            checkoutRequestId: mpesaResponse.CheckoutRequestID,
            message: mpesaResponse.CustomerMessage,
            requiresAction: false,
          };

        case PaymentGateway.PAYSTACK:
          const paystackResponse = await this.paystackService.initializePayment(
            customerEmail,
            amount,
            reference,
            { orderId },
          );
          paymentUrl = paystackResponse.data.authorization_url;
          break;

        case PaymentGateway.FLUTTERWAVE:
          if (!customerPhone || !customerName) {
            throw new HttpException(
              'Phone number and name required for Flutterwave',
              HttpStatus.BAD_REQUEST,
            );
          }
          const flutterwaveResponse = await this.flutterwaveService.initializePayment(
            customerEmail,
            customerPhone,
            amount,
            currency,
            reference,
            customerName,
            { orderId },
          );
          paymentUrl = flutterwaveResponse.data.link;
          break;

        default:
          throw new HttpException(
            `Payment gateway ${gateway} not supported`,
            HttpStatus.BAD_REQUEST,
          );
      }

      return {
        paymentId: payment.id,
        reference,
        paymentUrl,
        requiresAction: true,
      };
    } catch (error) {
      this.logger.error('Payment initiation failed', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to initiate payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update payment from webhook callback
   */
  async updatePaymentFromCallback(data: {
    gateway: string;
    transactionId: string;
    status: PaymentStatus;
    amount?: number;
    metadata?: any;
  }): Promise<Payment | null> {
    try {
      const payment = await this.findByReference(data.transactionId);

      if (!payment) {
        this.logger.warn(
          `Payment not found for transaction: ${data.transactionId}`,
        );
        return null;
      }

      // Update payment status
      payment.status = data.status;
      payment.paidAt = data.status === PaymentStatus.COMPLETED ? new Date() : null;
      payment.metadata = {
        ...payment.metadata,
        ...data.metadata,
        callbackReceivedAt: new Date().toISOString(),
      };

      await this.paymentsRepository.save(payment);

      this.logger.log(
        `Payment ${payment.id} updated to status: ${data.status}`,
      );

      return payment;
    } catch (error) {
      this.logger.error('Failed to update payment from callback', error);
      throw error;
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(paymentId: string): Promise<Payment> {
    const payment = await this.findOne(paymentId);

    if (!payment) {
      throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
    }

    // If already completed or failed, return current status
    if (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.FAILED
    ) {
      return payment;
    }

    // Verify with gateway
    try {
      switch (payment.gateway) {
        case PaymentGateway.PAYSTACK:
          const paystackResult = await this.paystackService.verifyPayment(
            payment.transactionId,
          );
          if (paystackResult.data.status === 'success') {
            payment.status = PaymentStatus.COMPLETED;
            payment.paidAt = new Date();
          }
          break;

        case PaymentGateway.FLUTTERWAVE:
          const flutterwaveResult = await this.flutterwaveService.verifyPayment(
            payment.transactionId,
          );
          if (flutterwaveResult.data.status === 'successful') {
            payment.status = PaymentStatus.COMPLETED;
            payment.paidAt = new Date();
          }
          break;

        case PaymentGateway.MPESA:
          // M-Pesa verification handled via callback
          break;
      }

      await this.paymentsRepository.save(payment);
      return payment;
    } catch (error) {
      this.logger.error('Payment verification failed', error);
      throw new HttpException(
        'Failed to verify payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get available payment gateways for a currency
   */
  getAvailableGateways(currency: string): PaymentGateway[] {
    const gateways: PaymentGateway[] = [];

    // M-Pesa for East African currencies
    if (['KES', 'TZS', 'UGX'].includes(currency) && this.mpesaService.isConfigured()) {
      gateways.push(PaymentGateway.MPESA);
    }

    // Paystack for supported countries
    if (
      ['NGN', 'GHS', 'ZAR', 'USD'].includes(currency) &&
      this.paystackService.isConfigured()
    ) {
      gateways.push(PaymentGateway.PAYSTACK);
    }

    // Flutterwave supports most African currencies
    if (this.flutterwaveService.isConfigured()) {
      gateways.push(PaymentGateway.FLUTTERWAVE);
    }

    return gateways;
  }
}
