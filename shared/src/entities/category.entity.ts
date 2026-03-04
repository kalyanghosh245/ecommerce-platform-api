import { Entity, Column, Tree, TreeChildren, TreeParent, OneToMany, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('categories')
@Tree('materialized-path')
@Index(['slug'], { unique: true })
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'category_id' })
  categoryId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}