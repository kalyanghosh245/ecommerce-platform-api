import { Controller, Post, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PushService } from './push.service';

@ApiTags('Push Notifications')
@Controller('notifications/push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send push notification' })
  async sendPush(
    @Body() body: {
      subscription: any;
      payload: any;
    },
  ) {
    return this.pushService.sendPushNotification(body.subscription, body.payload);
  }

  @Post('order-update')
  @ApiOperation({ summary: 'Send order update push' })
  async sendOrderUpdate(
    @Body() body: {
      subscription: any;
      orderNumber: string;
      status: string;
    },
  ) {
    return this.pushService.sendOrderUpdatePush(body.subscription, body.orderNumber, body.status);
  }

  @Post('promotional')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send promotional push' })
  async sendPromotional(
    @Body() body: {
      subscription: any;
      title: string;
      message: string;
      url: string;
    },
  ) {
    return this.pushService.sendPromotionalPush(body.subscription, body.title, body.message, body.url);
  }
}