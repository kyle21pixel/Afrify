import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private defaultFrom: string;

  constructor(private configService: ConfigService) {
    const smtpHost = this.configService.get('SMTP_HOST', 'smtp.gmail.com');
    const smtpPort = this.configService.get('SMTP_PORT', 587);
    const smtpUser = this.configService.get('SMTP_USER', '');
    const smtpPass = this.configService.get('SMTP_PASS', '');
    this.defaultFrom = this.configService.get(
      'SMTP_FROM',
      'Afrify <noreply@afrify.com>',
    );

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
    } catch (error) {
      this.logger.error('SMTP connection failed', error);
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent to ${mailOptions.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    items: any[],
    total: number,
    currency: string,
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${currency} ${item.price.toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Order #${orderNumber}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Thank you for your order! We're preparing your items for shipment.</p>
            
            <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Order Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">Total:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #667eea;">${currency} ${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <div style="background: white; padding: 20px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0;"><strong>What's next?</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>We'll send you a shipping confirmation once your order ships</li>
                <li>Track your order status in your account dashboard</li>
                <li>Expected delivery: 3-5 business days</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                Need help? Contact us at <a href="mailto:support@afrify.com" style="color: #667eea;">support@afrify.com</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                © ${new Date().getFullYear()} Afrify. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Order Confirmation #${orderNumber}`,
      html,
    });
  }

  /**
   * Send shipping notification
   */
  async sendShippingNotification(
    email: string,
    orderNumber: string,
    trackingNumber: string,
    carrier: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Your Order Has Shipped! 📦</h1>
          <p>Great news! Your order #${orderNumber} is on its way.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
            <p><strong>Carrier:</strong> ${carrier}</p>
          </div>
          
          <p>You can track your shipment using the tracking number above.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions? Contact us at support@afrify.com
          </p>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: `Your Order #${orderNumber} Has Shipped`,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Reset Your Password</h1>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Or copy and paste this URL: ${resetUrl}
          </p>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 10px; text-align: center;">
            <h1 style="margin: 0;">Welcome to Afrify! 🎉</h1>
          </div>
          
          <div style="padding: 30px 0;">
            <p>Hi ${name},</p>
            <p>Welcome to Afrify! We're excited to have you on board.</p>
            
            <h2 style="color: #667eea;">Get Started</h2>
            <ul style="line-height: 2;">
              <li>Browse thousands of products</li>
              <li>Track your orders in real-time</li>
              <li>Save your favorite items</li>
              <li>Get exclusive deals and offers</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://afrify.com/shop" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Start Shopping</a>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Afrify!',
      html,
    });
  }
}
