import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SmsService } from './sms.service';

@ApiTags('SMS Notifications')
@Controller('notifications/sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send custom SMS' })
  async sendSms(
    @Body() body: { to: string; message: string },
  ) {
    return this.smsService.sendSms(body.to, body.message);
  }

  @Post('order-confirmation')
  @ApiOperation({ summary: 'Send order confirmation SMS' })
  async sendOrderConfirmation(
    @Body() body: { phone: string; orderNumber: string; total: number },
  ) {
    return this.smsService.sendOrderConfirmationSms(body.phone, body.orderNumber, body.total);
  }

  @Post('shipping-update')
  @ApiOperation({ summary: 'Send shipping update SMS' })
  async sendShippingUpdate(
    @Body() body: { phone: string; orderNumber: string; status: string; trackingNumber?: string },
  ) {
    return this.smsService.sendShippingUpdateSms(body.phone, body.orderNumber, body.status, body.trackingNumber);
  }

  @Post('otp')
  @ApiOperation({ summary: 'Send OTP SMS' })
  async sendOtp(
    @Body() body: { phone: string; otp: string },
  ) {
    return this.smsService.sendOtpSms(body.phone, body.otp);
  }
}