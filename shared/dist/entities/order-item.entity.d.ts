import { BaseEntity } from './base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';
export declare class OrderItem extends BaseEntity {
    orderId: string;
    order: Order;
    productId: string;
    product: Product;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxAmount: number;
    metadata: Record<string, any>;
}
