import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'], { unique: true, where: '"userId" IS NOT NULL' })
@Index(['sessionId'], { where: '"userId" IS NULL' })
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'cart_id' })
  cartId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string | null; // For guest users

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: 'active' | 'converted' | 'abandoned';

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}