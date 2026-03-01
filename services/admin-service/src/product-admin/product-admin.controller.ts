import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductAdminService } from './product-admin.service';
import { CreateProductDto, UpdateProductDto, ProductSearchDto } from '@ecommerce/shared';

@ApiTags('Admin - Products')
@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all products with filters' })
  async findAll(@Query() query: ProductSearchDto) {
    return this.productAdminService.findAll(query);  // NOW IMPLEMENTED
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product' })
  async create(
    @Body() dto: CreateProductDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.productAdminService.createProduct(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Headers('x-user-id') userId: string,
  ) {
    return this.productAdminService.updateProduct(id, dto, userId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft delete product' })
  async remove(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.productAdminService.deleteProduct(id, userId);
  }

  @Post('bulk-update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update products' })
  async bulkUpdate(
    @Body('ids') ids: string[],
    @Body('updates') updates: any,
    @Headers('x-user-id') userId: string,
  ) {
    return this.productAdminService.bulkUpdateProducts(ids, updates, userId);
  }

  @Post(':id/inventory/adjust')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust product inventory' })
  async adjustInventory(
    @Param('id') productId: string,
    @Body('quantity') quantity: number,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.productAdminService.adjustInventory(productId, quantity, reason, userId);
  }

  @Get('inventory/low-stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStock(@Query('threshold') threshold?: number) {
    return this.productAdminService.getLowStockProducts(threshold);
  }
}