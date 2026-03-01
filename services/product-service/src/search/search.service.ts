import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '@ecommerce/shared';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async search(query: string, filters?: any) {
    // Advanced PostgreSQL full-text search
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventories', 'inventory')
      .where('product.deleted_at IS NULL')
      .andWhere('product.is_active = true');

    if (query) {
      qb.andWhere(
        `(to_tsvector('english', product.name) @@ plainto_tsquery('english', :query)
        OR to_tsvector('english', product.description) @@ plainto_tsquery('english', :query)
        OR product.name ILIKE :likeQuery)`,
        { query, likeQuery: `%${query}%` }
      );
    }

    if (filters?.categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters?.maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    // Add ranking for full-text search
    if (query) {
      qb.addSelect(
        `ts_rank(to_tsvector('english', product.name), plainto_tsquery('english', :query))`,
        'rank'
      )
      .orderBy('rank', 'DESC')
      .setParameter('query', query);
    }

    qb.addOrderBy('product.created_at', 'DESC');

    return qb.getMany();
  }
}