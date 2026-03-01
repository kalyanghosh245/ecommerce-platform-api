import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, IsJSON, Min, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  sku: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'active', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'])
  status?: 'draft' | 'active' | 'archived' = 'draft';

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsJSON()
  attributes?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxRate?: number = 0;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialStock?: number = 0;
}

export class UpdateProductDto extends CreateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProductSearchDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;
}

export class ProductResponseDto {
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