import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog, NotificationType, NotificationStatus } from './notification-log.entity';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private notificationLogRepo: Repository<NotificationLog>,
  ) {}

  async createLog(data: Partial<NotificationLog>): Promise<NotificationLog> {
    const log = this.notificationLogRepo.create(data);
    return this.notificationLogRepo.save(log);
  }

  async updateStatus(id: string, status: NotificationStatus, metadata?: any): Promise<NotificationLog> {
    const log = await this.notificationLogRepo.findOne({ where: { id } });
    if (!log) throw new Error('Notification log not found');

    log.status = status;
    if (metadata) {
      log.metadata = { ...log.metadata, ...metadata };
    }

    if (status === NotificationStatus.SENT) {
      log.sentAt = new Date();
    } else if (status === NotificationStatus.DELIVERED) {
      log.deliveredAt = new Date();
    } else if (status === NotificationStatus.OPENED) {
      log.openedAt = new Date();
    }

    return this.notificationLogRepo.save(log);
  }

  async getUserNotifications(userId: string, type?: NotificationType): Promise<NotificationLog[]> {
    const where: any = { userId };
    if (type) where.type = type;

    return this.notificationLogRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationStats(startDate: Date, endDate: Date): Promise<any> {
    const stats = await this.notificationLogRepo
      .createQueryBuilder('log')
      .select('log.type', 'type')
      .addSelect('log.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('log.type')
      .addGroupBy('log.status')
      .getRawMany();

    return stats;
  }
}