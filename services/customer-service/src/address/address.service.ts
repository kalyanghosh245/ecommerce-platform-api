import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@ecommerce/shared';

export interface Address {
  addressId: string;
  userId: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  type: 'shipping' | 'billing';
}

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private getUserAddresses(user: User): Address[] {
    return user.preferences?.addresses || [];
  }

  async getAddresses(userId: string): Promise<Address[]> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.getUserAddresses(user);
  }

  async addAddress(userId: string, address: Omit<Address, 'addressId'>): Promise<Address[]> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    const addresses = this.getUserAddresses(user);
    
    const newAddress: Address = {
      ...address,
      addressId: crypto.randomUUID(),
    };

    if (address.isDefault) {
      addresses.forEach(a => { if (a.type === address.type) a.isDefault = false; });
    }

    addresses.push(newAddress);

    if (!user.preferences) user.preferences = {} as any;
    user.preferences.addresses = addresses;

    await this.userRepo.save(user);
    return addresses;
  }

  async updateAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<Address[]> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    const addresses = this.getUserAddresses(user);
    const index = addresses.findIndex(a => a.addressId === addressId);
    if (index === -1) throw new NotFoundException('Address not found');

    if (updates.isDefault) {
      addresses.forEach(a => { 
        if (a.addressId !== addressId && a.type === addresses[index].type) a.isDefault = false; 
      });
    }

    addresses[index] = { ...addresses[index], ...updates };
    
    if (!user.preferences) user.preferences = {} as any;
    user.preferences.addresses = addresses;

    await this.userRepo.save(user);
    return addresses;
  }

  async deleteAddress(userId: string, addressId: string): Promise<Address[]> {
    const user = await this.userRepo.findOne({ where: { userId: userId } });
    if (!user) throw new NotFoundException('User not found');

    const addresses = this.getUserAddresses(user).filter(a => a.addressId !== addressId);
    
    if (!user.preferences) user.preferences = {} as any;
    user.preferences.addresses = addresses;

    await this.userRepo.save(user);
    return addresses;
  }
}