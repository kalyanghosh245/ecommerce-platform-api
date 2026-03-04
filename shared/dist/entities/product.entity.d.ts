import { BaseEntity } from './base.entity';
import { Category } from './category.entity';
import { Inventory } from './inventory.entity';
import { OrderItem } from './order-item.entity';
export declare class Product extends BaseEntity {
    productId: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    compareAtPrice: number;
    images: string[];
    status: 'draft' | 'active' | 'archived';
    isActive: boolean;
    attributes: Record<string, any>;
    brand: string;
    taxRate: number;
    categoryId: string;
    category: Category;
    inventories: Inventory[];
    orderItems: OrderItem[];
    retentionUntil: Date | null;
}
