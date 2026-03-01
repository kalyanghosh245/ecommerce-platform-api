import { Controller, Get, Put, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationLogService } from './notification-log.service';
import { NotificationStatus } from './notification-log.entity';

@ApiTags('Notification Logs')
@Controller('notifications/logs')
export class NotificationLogController {
  constructor(private readonly notificationLogService: NotificationLogService) {}

  @Get('user/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notification history' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('type') type?: string,
  ) {
    return this.notificationLogService.getUserNotifications(userId, type as any);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification status' })
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: NotificationStatus,
  ) {
    return this.notificationLogService.updateStatus(id, status);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification statistics' })
  async getStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.notificationLogService.getNotificationStats(
      new Date(startDate),
      new Date(endDate),
    );
  }
}