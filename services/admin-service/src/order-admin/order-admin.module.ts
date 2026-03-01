import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, Payment } from '@ecommerce/shared';
import { OrderAdminService } from './order-admin.service';
import { OrderAdminController } from './order-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Payment])],
  controllers: [OrderAdminController],
  providers: [OrderAdminService],
})
export class OrderAdminModule {}