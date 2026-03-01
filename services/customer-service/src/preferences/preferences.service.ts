import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@ecommerce/shared';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getPreferences(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    return {
      marketingEmails: user.preferences?.marketingEmails ?? true,
      smsNotifications: user.preferences?.smsNotifications ?? false,
      language: user.preferences?.language ?? 'en',
      currency: user.preferences?.currency ?? 'USD',
    };
  }

  async updatePreferences(userId: string, preferences: any): Promise<any> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.preferences) {
      user.preferences = {
        marketingEmails: true,
        smsNotifications: false,
        language: 'en',
        currency: 'USD',
        addresses: [],
      };
    }

    Object.assign(user.preferences, preferences);
    await this.userRepo.save(user);

    return this.getPreferences(userId);
  }

  async updateMarketingConsent(userId: string, consent: boolean, ipAddress: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.consentMarketingAt = consent ? new Date() : null;
    user.consentIp = ipAddress;
    
    if (!user.preferences) user.preferences = {} as any;
    user.preferences.marketingEmails = consent;

    await this.userRepo.save(user);
  }
}