import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Order extends BaseEntity {
    orderNumber: string;
    userId: string;
    user: User;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    total: number;
    currency: string;
    shippingAddressEncrypted: string;
    shippingAddressHash: string;
    billingAddressEncrypted: string | null;
    cardLastFour: string | null;
    paymentMethod: string | null;
    paymentTransactionId: string | null;
    notes: string | null;
    paidAt: Date | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    items: OrderItem[];
}
