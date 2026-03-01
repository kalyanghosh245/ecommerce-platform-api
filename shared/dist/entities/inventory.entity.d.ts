import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
export declare class Inventory extends BaseEntity {
    productId: string;
    product: Product;
    warehouseId: string;
    quantity: number;
    reservedQuantity: number;
    availableQuantity: number;
    lowStockThreshold: number;
    trackInventory: boolean;
    allowBackorders: boolean;
    version: number;
}
