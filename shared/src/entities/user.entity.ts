import { Entity, Column, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
  GUEST = 'guest'
}

@Entity('users')
@Index(['email'], { unique: true })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string | null; // Nullable for OAuth users

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  preferences: {
    marketingEmails: boolean;
    smsNotifications: boolean;
    language: string;
    currency: string;
    addresses: any;
  };

  // GDPR: Consent tracking
  @Column({ type: 'timestamptz', nullable: true, name: 'consent_marketing_at' })
  consentMarketingAt: Date | null;

  @Column({ type: 'text', nullable: true, name: 'consent_ip' })
  consentIp: string | null;

  // GDPR: Right to be forgotten request
  @Column({ type: 'timestamptz', nullable: true, name: 'deletion_requested_at' })
  deletionRequestedAt: Date | null;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}