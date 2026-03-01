import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = Twilio(accountSid, authToken);
    }
  }

  async sendSms(to: string, message: string): Promise<{ sid: string; status: string }> {
    try {
      if (!this.twilioClient) {
        this.logger.warn('Twilio not configured, SMS not sent');
        return { sid: 'mock-sid', status: 'mock-sent' };
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: to,
      });

      this.logger.log(`SMS sent to ${to}, sid: ${result.sid}`);
      
      return {
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`);
      throw error;
    }
  }

  async sendOrderConfirmationSms(phone: string, orderNumber: string, total: number): Promise<any> {
    const message = `Your order #${orderNumber} for $${total} has been confirmed. Thank you for shopping with us!`;
    return this.sendSms(phone, message);
  }

  async sendShippingUpdateSms(phone: string, orderNumber: string, status: string, trackingNumber?: string): Promise<any> {
    let message = `Your order #${orderNumber} status: ${status}.`;
    if (trackingNumber) {
      message += ` Track: ${trackingNumber}`;
    }
    return this.sendSms(phone, message);
  }

  async sendOtpSms(phone: string, otp: string): Promise<any> {
    const message = `Your verification code is: ${otp}. Valid for 10 minutes.`;
    return this.sendSms(phone, message);
  }
}