import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, Between } from 'typeorm';
import { Product, Category, Inventory, AuditLog, AuditAction, CreateProductDto, UpdateProductDto, ProductSearchDto, PaginatedResponse } from '@ecommerce/shared';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    private dataSource: DataSource,
  ) {}

  // ADD THIS MISSING METHOD
  async findAll(query: ProductSearchDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, brand, sortBy, sortOrder } = query;
    
    const where: any = { deletedAt: null };

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (brand) {
      where.brand = brand;
    }
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = Between(minPrice, 999999);
    } else if (maxPrice !== undefined) {
      where.price = Between(0, maxPrice);
    }

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'inventories'],
      order: { [sortBy as string]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async createProduct(dto: CreateProductDto, userId: string): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.productRepo.create({
        ...dto,
        isActive: dto.status === 'active',
        createdBy: userId,
      });

      const savedProduct = await queryRunner.manager.save(product);

      const inventory = this.inventoryRepo.create({
        productId: savedProduct.id,
        quantity: dto.initialStock || 0,
        availableQuantity: dto.initialStock || 0,
        reservedQuantity: 0,
      });

      await queryRunner.manager.save(inventory);
      await this.createAuditLog(userId, AuditAction.CREATE, 'Product', savedProduct.id, null, dto);
      await queryRunner.commitTransaction();

      return savedProduct;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProduct(id: string, dto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const oldValues = { ...product };

    Object.assign(product, {
      ...dto,
      updatedBy: userId,
    });

    const saved = await this.productRepo.save(product);
    await this.createAuditLog(userId, AuditAction.UPDATE, 'Product', id, oldValues, saved);

    return saved;
  }

  async deleteProduct(id: string, userId: string): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    product.deletedAt = new Date();
    product.updatedBy = userId;
    await this.productRepo.save(product);

    await this.createAuditLog(userId, AuditAction.DELETE, 'Product', id, product, null);
  }

  async bulkUpdateProducts(ids: string[], updates: Partial<Product>, userId: string): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ ...updates, updatedBy: userId })
      .whereInIds(ids)
      .execute();

    await this.createAuditLog(userId, AuditAction.UPDATE, 'Product', null, { ids }, updates);
  }

  async adjustInventory(productId: string, quantity: number, reason: string, userId: string): Promise<Inventory> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!inventory) throw new NotFoundException('Inventory not found');

      const oldValues = { ...inventory };

      inventory.quantity += quantity;
      inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
      inventory.updatedBy = userId;

      const saved = await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();

      await this.createAuditLog(userId, AuditAction.UPDATE, 'Inventory', inventory.id, oldValues, { quantity, reason });

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getLowStockProducts(threshold: number = 10): Promise<Inventory[]> {
    return this.inventoryRepo
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.available_quantity <= :threshold', { threshold })
      .andWhere('inventory.track_inventory = true')
      .getMany();
  }

  private async createAuditLog(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string | null,
    oldValues: any,
    newValues: any,
  ): Promise<void> {
    const audit = this.auditRepo.create({
      userId,
      action,
      entityType,
      entityId,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
      ipAddress: '0.0.0.0',
      reason: 'Admin operation',
    });

    await this.auditRepo.save(audit);
  }
}