import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
@Unique(['cartId', 'productId'])
@Index(['cartId'])
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'cart_item_id' })
  cartItemId: string;

  @Column({ type: 'uuid' })
  cartId: string;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>; // Product options, variants
}