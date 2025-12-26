import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private emailService: EmailService) {}

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(order: any): Promise<void> {
    try {
      await this.emailService.sendOrderConfirmation(
        order.customer.email,
        order.orderNumber,
        order.items,
        order.total,
        order.currency || 'NGN',
      );
    } catch (error) {
      this.logger.error('Failed to send order confirmation', error);
    }
  }

  /**
   * Send shipping notification
   */
  async sendShippingNotification(
    order: any,
    trackingNumber: string,
    carrier: string,
  ): Promise<void> {
    try {
      await this.emailService.sendShippingNotification(
        order.customer.email,
        order.orderNumber,
        trackingNumber,
        carrier,
      );
    } catch (error) {
      this.logger.error('Failed to send shipping notification', error);
    }
  }

  /**
   * Send password reset
   */
  async sendPasswordReset(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `https://afrify.com/reset-password?token=${resetToken}`;
    
    try {
      await this.emailService.sendPasswordReset(email, resetToken, resetUrl);
    } catch (error) {
      this.logger.error('Failed to send password reset', error);
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.emailService.sendWelcomeEmail(email, name);
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }
}
