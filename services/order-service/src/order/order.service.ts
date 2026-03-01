import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { 
  Order, 
  OrderItem, 
  Cart, 
  OrderStatus, 
  PaymentStatus,
  CreateOrderDto, 
  OrderFilterDto,
  PaginatedResponse,
  encrypt,
  hashForSearch 
} from '@ecommerce/shared';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly productServiceUrl: string;

  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    private dataSource: DataSource,
    private httpService: HttpService,
  ) {
    this.productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { 
          id: dto.cartId,
          userId,
          status: 'active',
        },
        relations: ['items'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty or not found');
      }

      for (const item of cart.items) {
        const available = await this.checkProductAvailability(item.productId, item.quantity);
        if (!available) {
          throw new BadRequestException(`Product ${item.productId} is no longer available in requested quantity`);
        }
      }

      for (const item of cart.items) {
        await this.reserveProductInventory(item.productId, item.quantity);
      }

      const orderNumber = await this.generateOrderNumber(queryRunner);
      const shippingAddressStr = JSON.stringify(dto.shippingAddress);
      const billingAddressStr = JSON.stringify(dto.billingAddress || dto.shippingAddress);

      const order = this.orderRepo.create({
        orderNumber,
        userId,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        subtotal: cart.subtotal,
        taxAmount: cart.taxAmount,
        shippingAmount: dto.shippingAddress.country === 'US' ? 5.99 : 15.99,
        discountAmount: cart.discountAmount,
        total: cart.total + (dto.shippingAddress.country === 'US' ? 5.99 : 15.99),
        currency: 'USD',
        shippingAddressEncrypted: encrypt(shippingAddressStr),
        shippingAddressHash: hashForSearch(shippingAddressStr),
        billingAddressEncrypted: encrypt(billingAddressStr),
        notes: dto.notes,
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.product?.name || 'Unknown',
          sku: item.product?.sku || 'N/A',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          taxAmount: item.totalPrice * 0.1,
        })),
      });

      const savedOrder = await queryRunner.manager.save(order);
      cart.status = 'converted';
      await queryRunner.manager.save(cart);
      await queryRunner.commitTransaction();

      return this.findById(savedOrder.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findUserOrders(userId: string, filters: OrderFilterDto): Promise<PaginatedResponse<Order>> {
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
    
    const where: any = { userId };
    if (status) where.status = status;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      relations: ['items'],
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

  async findById(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
    const order = await this.findById(orderId, userId);

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel shipped or delivered order');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        await this.releaseProductInventory(item.productId, item.quantity);
      }

      order.status = OrderStatus.CANCELLED;
      order.notes = reason ? `Cancellation reason: ${reason}` : order.notes;
      
      const saved = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async processPayment(orderId: string, userId: string, paymentMethodId: string): Promise<Order> {
    const order = await this.findById(orderId, userId);

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Order is already paid');
    }

    // TODO: Integrate with payment gateway (Stripe, Razorpay, etc.)
    // This is a placeholder for payment processing logic
    
    order.paymentStatus = PaymentStatus.PAID;
    order.paidAt = new Date();
    order.status = OrderStatus.CONFIRMED;

    return this.orderRepo.save(order);
  }

  private async generateOrderNumber(queryRunner: any): Promise<string> {
    const date = new Date();
    const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const result = await queryRunner.manager.query(
      `SELECT MAX(order_number) as max_num FROM orders WHERE order_number LIKE $1 FOR UPDATE`,
      [`${prefix}%`]
    );

    let sequence = 1;
    if (result[0]?.max_num) {
      const lastNum = parseInt(result[0].max_num.slice(-6));
      sequence = lastNum + 1;
    }

    return `${prefix}${String(sequence).padStart(6, '0')}`;
  }

  private async checkProductAvailability(productId: string, quantity: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productServiceUrl}/inventory/product/${productId}/check?quantity=${quantity}`)
      );
      return response.data?.data?.available || false;
    } catch {
      return false;
    }
  }

  private async reserveProductInventory(productId: string, quantity: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.productServiceUrl}/inventory/product/${productId}/reserve`, { quantity })
      );
    } catch (error) {
      throw new BadRequestException(`Failed to reserve inventory for product ${productId}`);
    }
  }

  private async releaseProductInventory(productId: string, quantity: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(`${this.productServiceUrl}/inventory/product/${productId}/release`, { quantity })
      );
    } catch (error) {
      console.error(`Failed to release inventory for product ${productId}:`, error);
    }
  }
}