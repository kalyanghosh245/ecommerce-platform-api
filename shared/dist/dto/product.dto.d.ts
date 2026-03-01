import { PaginationDto } from './pagination.dto';
export declare class CreateProductDto {
    name: string;
    description?: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    status?: 'draft' | 'active' | 'archived';
    categoryId: string;
    attributes?: Record<string, any>;
    brand?: string;
    taxRate?: number;
    initialStock?: number;
}
export declare class UpdateProductDto extends CreateProductDto {
    isActive?: boolean;
}
export declare class ProductSearchDto extends PaginationDto {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    brand?: string;
}
export declare class ProductResponseDto {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    compareAtPrice: number;
    images: string[];
    status: string;
    isActive: boolean;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    inventory: {
        quantity: number;
        available: number;
        reserved: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
