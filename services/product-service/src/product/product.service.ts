import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, MoreThanOrEqual, LessThanOrEqual, Between, IsNull } from 'typeorm';
import { Product, Inventory, ProductSearchDto, CreateProductDto, UpdateProductDto, PaginatedResponse } from '@ecommerce/shared';
import { BusinessException } from '@ecommerce/shared';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateProductDto, userId: string): Promise<Product> {
    // Check SKU uniqueness
    const existing = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (existing) {
      throw new ConflictException('SKU already exists');
    }

    // Transaction: Create product + inventory
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

      // Create initial inventory
      const inventory = this.inventoryRepo.create({
        productId: savedProduct.id,
        quantity: dto.initialStock || 0,
        availableQuantity: dto.initialStock || 0,
        reservedQuantity: 0,
      });

      await queryRunner.manager.save(inventory);
      await queryRunner.commitTransaction();

      return this.findById(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: ProductSearchDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 10, search, categoryId, minPrice, maxPrice, inStock, brand, sortBy, sortOrder } = query;
    
    const where: any = { deletedAt: null };
    
    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = brand;
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice);
    }

    // Handle search with full-text or ILIKE fallback
    if (search) {
      // For PostgreSQL full-text search (requires setup)
      // where.name = () => `to_tsvector('english', name) @@ plainto_tsquery('english', '${search}')`;
      // Fallback:
      where.name = Like(`%${search}%`);
    }

    const [data, total] = await this.productRepo.findAndCount({
      where,
      relations: ['category', 'inventories'],
      order: { [sortBy as string]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter in-stock if requested
    let filteredData = data;
    if (inStock) {
      filteredData = data.filter(p => 
        p.inventories.some(inv => inv.availableQuantity > 0)
      );
    }

    return {
      data: filteredData,
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

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'inventories'],
    });
    
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    
    return product;
  }

  async update(id: string, dto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.findById(id);
    
    // Optimistic locking check
    if ('version' in dto && dto.version && product.version !== dto.version) {
      throw new BusinessException('CONFLICT', 'Product was modified by another user', 409);
    }

    Object.assign(product, {
      ...dto,
      updatedBy: userId,
    });

    return this.productRepo.save(product);
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.findById(id);
    product.deletedAt = new Date();
    product.updatedBy = userId;
    await this.productRepo.save(product);
  }

  // For order service: Check and reserve inventory
  async checkInventory(productId: string, quantity: number): Promise<boolean> {
    const inventory = await this.inventoryRepo.findOne({
      where: { productId },
    });
    
    return !!(inventory && inventory.availableQuantity >= quantity);
  }

  async reserveInventory(productId: string, quantity: number): Promise<boolean> {
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

    return (result?.affected ?? 0) > 0;
  }

  async releaseReservation(productId: string, quantity: number): Promise<void> {
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
}