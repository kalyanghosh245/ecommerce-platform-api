import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Inventory } from './inventory.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['isActive'])
@Index(['price'])
@Index(['name'], { fulltext: true }) // For search
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  compareAtPrice: number;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'active' | 'archived';

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  attributes: Record<string, any>; // Flexible product attributes

  @Column({ type: 'varchar', length: 50, nullable: true })
  brand: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  taxRate: number;

  @Column({ type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  // GDPR: Data retention
  @Column({ type: 'date', nullable: true, name: 'retention_until' })
  retentionUntil: Date | null;
}