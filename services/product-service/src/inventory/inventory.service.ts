import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory, Product } from '@ecommerce/shared';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  async findByProductId(productId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({
      where: { productId },
      relations: ['product'],
    });
    
    if (!inventory) {
      throw new NotFoundException('Inventory not found for this product');
    }
    
    return inventory;
  }

  async updateStock(productId: string, quantity: number, userId: string): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      inventory.quantity = quantity;
      inventory.availableQuantity = quantity - inventory.reservedQuantity;
      inventory.updatedBy = userId;

      const saved = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();
      
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.inventoryRepo
      .createQueryBuilder()
      .update()
      .set({
        reservedQuantity: () => `reserved_quantity + ${quantity}`,
        availableQuantity: () => `available_quantity - ${quantity}`,
      })
      .where('product_id = :productId AND available_quantity >= :quantity', {
        productId,
        quantity,
      })
      .returning('*')
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await this.inventoryRepo
      .createQueryBuilder()
      .update()
      .set({
        reservedQuantity: () => `GREATEST(reserved_quantity - ${quantity}, 0)`,
        availableQuantity: () => `available_quantity + ${quantity}`,
      })
      .where('product_id = :productId', { productId })
      .execute();
  }

  async adjustStock(productId: string, adjustment: number, reason: string, userId: string): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) {
        throw new NotFoundException('Inventory not found');
      }

      const newQuantity = inventory.quantity + adjustment;
      if (newQuantity < 0) {
        throw new BadRequestException('Stock cannot be negative');
      }

      inventory.quantity = newQuantity;
      inventory.availableQuantity = newQuantity - inventory.reservedQuantity;
      inventory.updatedBy = userId;

      // TODO: Create inventory log entry for audit trail

      const saved = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();
      
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLowStockProducts(threshold?: number): Promise<Inventory[]> {
    const query = this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.track_inventory = true');

    if (threshold) {
      query.andWhere('inventory.available_quantity <= :threshold', { threshold });
    } else {
      query.andWhere('inventory.available_quantity <= inventory.low_stock_threshold');
    }

    return query.getMany();
  }

  async checkAvailability(productId: string, requestedQuantity: number): Promise<{
    available: boolean;
    availableQuantity: number;
    reservedQuantity: number;
    totalQuantity: number;
  }> {
    const inventory = await this.inventoryRepo.findOne({
      where: { productId },
    });

    if (!inventory) {
      return {
        available: false,
        availableQuantity: 0,
        reservedQuantity: 0,
        totalQuantity: 0,
      };
    }

    return {
      available: inventory.availableQuantity >= requestedQuantity,
      availableQuantity: inventory.availableQuantity,
      reservedQuantity: inventory.reservedQuantity,
      totalQuantity: inventory.quantity,
    };
  }
}