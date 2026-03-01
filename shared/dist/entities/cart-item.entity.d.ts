import { BaseEntity } from './base.entity';
import { Cart } from './cart.entity';
import { Product } from './product.entity';
export declare class CartItem extends BaseEntity {
    cartId: string;
    cart: Cart;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    metadata: Record<string, any>;
}
