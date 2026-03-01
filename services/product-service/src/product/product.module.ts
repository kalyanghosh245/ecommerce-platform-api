import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Inventory } from '@ecommerce/shared';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { InventoryService } from '../inventory/inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Inventory])],
  controllers: [ProductController],
  providers: [ProductService, InventoryService],
  exports: [ProductService],
})
export class ProductModule {}