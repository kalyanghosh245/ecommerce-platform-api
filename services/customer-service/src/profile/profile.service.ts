import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Order, UpdateUserDto, ChangePasswordDto } from '@ecommerce/shared';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

@Injectable()
export class ProfileService { 
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  private readonly logger = new Logger('ProfileService');

  async getProfile(userId: string): Promise<User> {
    const startTime = Date.now();
    const metadata = this.userRepo.metadata;
  console.log('📋 User Entity Properties:');
  metadata.columns.forEach(col => {
    console.log(`  - ${col.propertyName} (db: ${col.databaseName})`);
  });
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    const duration = Date.now() - startTime;
  
    this.logger.debug(`Query completed in ${duration}ms. Found: ${!!user}`);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash || '');
    if (!isMatch) throw new ConflictException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.passwordHash = hashedPassword;
    await this.userRepo.save(user);
  }

  async getOrderHistory(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const [orders, total] = await this.orderRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.deletionRequestedAt = new Date();
    user.isActive = false;
    await this.userRepo.save(user);
  }
}