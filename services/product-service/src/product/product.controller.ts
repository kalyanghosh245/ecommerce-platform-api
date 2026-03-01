import { Controller, Get, Post, Put, Delete, Body, Param, Query, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductSearchDto, CreateProductDto, UpdateProductDto } from '@ecommerce/shared';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products with search and filters' })
  async findAll(@Query() query: ProductSearchDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product (Admin only)' })
  async create(@Body() dto: CreateProductDto) {
    // User ID from JWT token (added by auth middleware)
    const userId = 'temp-user-id'; // Replace with actual user from request
    return this.productService.create(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const userId = 'temp-user-id';
    return this.productService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product' })
  async remove(@Param('id') id: string) {
    const userId = 'temp-user-id';
    return this.productService.remove(id, userId);
  }
}