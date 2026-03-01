import { PaginationDto } from './pagination.dto';
export declare class AddressDto {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
}
export declare class CreateOrderDto {
    cartId?: string;
    shippingAddress: AddressDto;
    billingAddress?: AddressDto;
    paymentMethodId?: string;
    couponCode?: string;
    notes?: string;
}
export declare class OrderResponseDto {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    items: OrderItemDto[];
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    total: number;
    currency: string;
    shippingAddress: AddressDto;
    createdAt: Date;
    updatedAt: Date;
}
export declare class OrderItemDto {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export declare class OrderFilterDto extends PaginationDto {
    status?: string;
    userId?: string;
}
