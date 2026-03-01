import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(private configService: ConfigService) {
    const publicKey = this.configService.get('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get('VAPID_PRIVATE_KEY');
    const subject = this.configService.get('VAPID_SUBJECT', 'mailto:admin@example.com');

    if (publicKey && privateKey) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
    }
  }

  async sendPushNotification(subscription: webPush.PushSubscription, payload: any): Promise<any> {
    try {
      const result = await webPush.sendNotification(
        subscription,
        JSON.stringify(payload),
      );

      this.logger.log(`Push notification sent, status: ${result.statusCode}`);
      
      return {
        statusCode: result.statusCode,
        body: result.body,
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      throw error;
    }
  }

  async sendOrderUpdatePush(subscription: webPush.PushSubscription, orderNumber: string, status: string): Promise<any> {
    return this.sendPushNotification(subscription, {
      title: 'Order Update',
      body: `Your order #${orderNumber} is now ${status}`,
      icon: '/assets/icon.png',
      badge: '/assets/badge.png',
      data: {
        url: `/orders/${orderNumber}`,
      },
    });
  }

  async sendPromotionalPush(subscription: webPush.PushSubscription, title: string, message: string, url: string): Promise<any> {
    return this.sendPushNotification(subscription, {
      title,
      body: message,
      icon: '/assets/icon.png',
      badge: '/assets/badge.png',
      data: { url },
    });
  }
}