import { Entity, Column, ManyToOne, JoinColumn, Index, VersionColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('inventory')
@Index(['productId'])
@Index(['warehouseId'])
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'inventory_id' })
  inventoryId: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.inventories)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 100, default: 'default' })
  warehouseId: string;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  reservedQuantity: number; // For pending orders

  @Column({ type: 'integer', default: 0 })
  availableQuantity: number;

  @Column({ type: 'integer', default: 0 })
  lowStockThreshold: number;

  @Column({ type: 'boolean', default: true })
  trackInventory: boolean;

  @Column({ type: 'boolean', default: true })
  allowBackorders: boolean;

  // Optimistic locking for concurrent inventory updates
  @VersionColumn()
  version: number;
}