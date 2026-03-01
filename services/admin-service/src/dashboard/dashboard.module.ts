import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Order, User, Payment } from '@ecommerce/shared';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Order, User, Payment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}