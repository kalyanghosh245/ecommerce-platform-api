export declare class AddToCartDto {
    productId: string;
    quantity: number;
    metadata?: Record<string, any>;
}
export declare class UpdateCartItemDto {
    quantity: number;
}
export declare class CartResponseDto {
    id: string;
    items: CartItemDto[];
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    itemCount: number;
}
export declare class CartItemDto {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    maxQuantity: number;
}
