import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, Payment, PaginatedResponse } from '@ecommerce/shared';

@Injectable()
export class OrderAdminService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async findAllOrders(filters: any): Promise<PaginatedResponse<Order>> {
    const { page, limit, status, paymentStatus, startDate, endDate } = filters;
    
    const query = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user');

    if (status) query.andWhere('order.status = :status', { status });
    if (paymentStatus) query.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    if (startDate) query.andWhere('order.createdAt >= :startDate', { startDate });
    if (endDate) query.andWhere('order.createdAt <= :endDate', { endDate });

    const [data, total] = await query
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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

  async updateOrderStatus(orderId: string, status: OrderStatus, userId: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = status;
    order.updatedBy = userId;

    if (status === 'shipped') order.shippedAt = new Date();
    if (status === 'delivered') order.deliveredAt = new Date();

    return this.orderRepo.save(order);
  }

  async processRefund(orderId: string, amount: number, reason: string, userId: string): Promise<Payment> {
    const order = await this.orderRepo.findOne({ 
      where: { id: orderId },
      relations: ['payments'],
    });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.paymentRepo.findOne({
      where: { orderId, status: 'captured' as PaymentStatus },
    });

    if (!payment) throw new NotFoundException('No captured payment found');

    if (payment.refundedAmount + amount > payment.amount) {
      throw new Error('Refund amount exceeds payment amount');
    }

    payment.refundedAmount += amount;
    payment.refundCount += 1;
    payment.status = payment.refundedAmount === payment.amount ? PaymentStatus.REFUNDED : ('partial_refunded' as PaymentStatus);
    payment.refundedAt = new Date();

    return this.paymentRepo.save(payment);
  }

  async getOrderStatistics(): Promise<any> {
    const totalOrders = await this.orderRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { status: 'pending' as OrderStatus } });
    const processingOrders = await this.orderRepo.count({ where: { status: 'processing' as OrderStatus } });
    const shippedOrders = await this.orderRepo.count({ where: { status: 'shipped' as OrderStatus } });
    const deliveredOrders = await this.orderRepo.count({ where: { status: 'delivered' as OrderStatus } });
    const cancelledOrders = await this.orderRepo.count({ where: { status: 'cancelled' as OrderStatus } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysOrders = await this.orderRepo.count({ where: { createdAt: today } });

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todaysOrders,
    };
  }
}