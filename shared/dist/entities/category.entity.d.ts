import { BaseEntity } from './base.entity';
import { Product } from './product.entity';
export declare class Category extends BaseEntity {
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    sortOrder: number;
    children: Category[];
    parent: Category;
    parentId: string | null;
    products: Product[];
}
