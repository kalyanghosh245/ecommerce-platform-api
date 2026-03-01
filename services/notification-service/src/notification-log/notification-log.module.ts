import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './notification-log.entity';
import { NotificationLogService } from './notification-log.service';
import { NotificationLogController } from './notification-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLog])],
  providers: [NotificationLogService],
  controllers: [NotificationLogController],
  exports: [NotificationLogService],
})
export class NotificationLogModule {}