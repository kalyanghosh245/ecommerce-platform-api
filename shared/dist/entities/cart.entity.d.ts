import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { CartItem } from './cart-item.entity';
export declare class Cart extends BaseEntity {
    userId: string | null;
    user: User | null;
    sessionId: string | null;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    status: 'active' | 'converted' | 'abandoned';
    expiresAt: Date | null;
    items: CartItem[];
}
