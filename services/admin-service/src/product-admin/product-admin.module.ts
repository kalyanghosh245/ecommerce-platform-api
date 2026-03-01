import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Category, Inventory, AuditLog } from '@ecommerce/shared';
import { ProductAdminService } from './product-admin.service';
import { ProductAdminController } from './product-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Inventory, AuditLog])],
  controllers: [ProductAdminController],
  providers: [ProductAdminService],
  exports: [ProductAdminService],
})
export class ProductAdminModule {}