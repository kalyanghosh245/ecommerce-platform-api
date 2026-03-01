import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Order } from '@ecommerce/shared';
import { CustomerAdminService } from './customer-admin.service';
import { CustomerAdminController } from './customer-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [CustomerAdminController],
  providers: [CustomerAdminService],
  exports: [CustomerAdminService],
})
export class CustomerAdminModule {}