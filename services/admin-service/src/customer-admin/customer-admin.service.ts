import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Order, UserRole } from '@ecommerce/shared';

@Injectable()
export class CustomerAdminService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  async findAllCustomers(filters: any): Promise<any> {
    const { page, limit, role, isActive, search } = filters;
    
    const query = this.userRepo.createQueryBuilder('user');

    if (role) query.andWhere('user.role = :role', { role });
    if (isActive !== undefined) query.andWhere('user.isActive = :isActive', { isActive });
    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await query
      .orderBy('user.createdAt', 'DESC')
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

  async getCustomerDetails(userId: string): Promise<any> {
    const customer = await this.userRepo.findOne({ where: { id: userId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const orders = await this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total.toString()), 0);

    return {
      customer,
      orders,
      totalOrders: orders.length,
      totalSpent,
    };
  }

  async updateCustomerStatus(userId: string, isActive: boolean): Promise<User> {
    const customer = await this.userRepo.findOne({ where: { id: userId } });
    if (!customer) throw new NotFoundException('Customer not found');

    customer.isActive = isActive;
    return this.userRepo.save(customer);
  }

  async getCustomerStatistics(): Promise<any> {
    const totalCustomers = await this.userRepo.count({ where: { role: UserRole.CUSTOMER } });
    const activeCustomers = await this.userRepo.count({ where: { role: UserRole.CUSTOMER, isActive: true } });
    const newCustomersThisMonth = await this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.CUSTOMER })
      .andWhere('user.createdAt >= :date', { date: new Date(new Date().setMonth(new Date().getMonth() - 1)) })
      .getCount();

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      newCustomersThisMonth,
    };
  }
}