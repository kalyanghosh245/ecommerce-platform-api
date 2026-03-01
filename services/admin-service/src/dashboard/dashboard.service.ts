import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Product, Order, User, Payment, UserRole, OrderStatus } from '@ecommerce/shared';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
  ) {}

  async getDashboardMetrics(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Revenue metrics
    const todaysRevenue = await this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'captured' })
      .andWhere('payment.capturedAt >= :today', { today })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    const monthlyRevenue = await this.paymentRepo
      .createQueryBuilder('payment')
      .where('payment.status = :status', { status: 'captured' })
      .andWhere('payment.capturedAt >= :date', { date: thirtyDaysAgo })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();

    // Order metrics
    const totalOrders = await this.orderRepo.count();
    const pendingOrders = await this.orderRepo.count({ where: { status: OrderStatus.PENDING } });
    const todaysOrders = await this.orderRepo.count({ where: { createdAt: today } });

    // Product metrics
    const totalProducts = await this.productRepo.count({ where: { deletedAt: IsNull() } });
    const lowStockProducts = await this.productRepo
      .createQueryBuilder('product')
      .leftJoin('product.inventories', 'inventory')
      .where('inventory.available_quantity <= :threshold', { threshold: 10 })
      .getCount();

    // Customer metrics
    const totalCustomers = await this.userRepo.count({ where: { role: UserRole.CUSTOMER } });
    const newCustomersToday = await this.userRepo.count({ where: { createdAt: today } });

    return {
      revenue: {
        today: parseFloat(todaysRevenue?.total || 0),
        last30Days: parseFloat(monthlyRevenue?.total || 0),
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        today: todaysOrders,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
      customers: {
        total: totalCustomers,
        newToday: newCustomersToday,
      },
    };
  }

  async getSalesChartData(days: number = 30): Promise<any[]> {
    const data = await this.orderRepo
      .createQueryBuilder('order')
      .select('DATE(order.createdAt)', 'date')
      .addSelect('COUNT(*)', 'orders')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.createdAt >= :date', { 
        date: new Date(Date.now() - days * 24 * 60 * 60 * 1000) 
      })
      .groupBy('DATE(order.createdAt)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return data;
  }
}