import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    attachments?: any[];
  }): Promise<{ messageId: string; accepted: string[] }> {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || `"E-Commerce" <${this.configService.get('SMTP_USER')}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent to ${options.to}, messageId: ${result.messageId}`);
      
      return {
        messageId: result.messageId,
        accepted: result.accepted,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      throw error;
    }
  }

  async sendOrderConfirmation(data: {
    email: string;
    orderNumber: string;
    total: number;
    items: any[];
    shippingAddress: any;
  }): Promise<any> {
    const html = this.getOrderConfirmationTemplate(data);
    
    return this.sendEmail({
      to: data.email,
      subject: `Order Confirmation #${data.orderNumber}`,
      html,
    });
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<any> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<any> {
    const html = `
      <h1>Welcome to E-Commerce!</h1>
      <p>Hi ${firstName},</p>
      <p>Thank you for joining us. Start shopping now!</p>
      <a href="${this.configService.get('FRONTEND_URL')}/shop" style="padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">Start Shopping</a>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to E-Commerce!',
      html,
    });
  }

  async sendLowStockAlert(adminEmail: string, productName: string, stock: number): Promise<any> {
    const html = `
      <h1>Low Stock Alert</h1>
      <p>Product <strong>${productName}</strong> is running low on stock.</p>
      <p>Current stock: <strong>${stock}</strong> units</p>
      <p>Please restock soon.</p>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `Low Stock Alert: ${productName}`,
      html,
    });
  }

  private getOrderConfirmationTemplate(data: any): string {
    const itemsHtml = data.items.map((item: { productName: any; quantity: any; unitPrice: any; totalPrice: any; }) => `
      <tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice}</td>
        <td>$${item.totalPrice}</td>
      </tr>
    `).join('');

    return `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <h2>Order #${data.orderNumber}</h2>
      <table border="1" cellpadding="10" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <h3>Total: $${data.total}</h3>
      <h3>Shipping Address:</h3>
      <p>${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</p>
      <p>${data.shippingAddress.addressLine1}</p>
      <p>${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postalCode}</p>
      <p>${data.shippingAddress.country}</p>
    `;
  }
}