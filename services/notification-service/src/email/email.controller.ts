import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';

@ApiTags('Email Notifications')
@Controller('notifications/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send custom email' })
  async sendEmail(
    @Body() body: {
      to: string;
      subject: string;
      html: string;
      text?: string;
    },
  ) {
    return this.emailService.sendEmail(body);
  }

  @Post('order-confirmation')
  @ApiOperation({ summary: 'Send order confirmation email' })
  async sendOrderConfirmation(
    @Body() data: {
      email: string;
      orderNumber: string;
      total: number;
      items: any[];
      shippingAddress: any;
    },
  ) {
    return this.emailService.sendOrderConfirmation(data);
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Send password reset email' })
  async sendPasswordReset(
    @Body() body: { email: string; resetToken: string },
  ) {
    return this.emailService.sendPasswordReset(body.email, body.resetToken);
  }

  @Post('welcome')
  @ApiOperation({ summary: 'Send welcome email' })
  async sendWelcome(
    @Body() body: { email: string; firstName: string },
  ) {
    return this.emailService.sendWelcomeEmail(body.email, body.firstName);
  }

  @Post('low-stock-alert')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send low stock alert to admin' })
  async sendLowStockAlert(
    @Body() body: { adminEmail: string; productName: string; stock: number },
  ) {
    return this.emailService.sendLowStockAlert(body.adminEmail, body.productName, body.stock);
  }
}