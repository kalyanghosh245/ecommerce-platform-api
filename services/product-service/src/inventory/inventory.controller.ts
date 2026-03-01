import { Controller, Get, Put, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  async findByProduct(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Get('product/:productId/check')
  @ApiOperation({ summary: 'Check stock availability' })
  async checkAvailability(
    @Param('productId') productId: string,
    @Query('quantity') quantity: number,
  ) {
    return this.inventoryService.checkAvailability(productId, quantity || 1);
  }

  @Put('product/:productId/stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update stock quantity (Admin only)' })
  async updateStock(
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
    @Headers('x-user-id') userId: string,
  ) {
    return this.inventoryService.updateStock(productId, quantity, userId);
  }

  @Post('product/:productId/adjust')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust stock (positive or negative)' })
  async adjustStock(
    @Param('productId') productId: string,
    @Body('adjustment') adjustment: number,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.inventoryService.adjustStock(productId, adjustment, reason, userId);
  }

  @Get('low-stock')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get low stock products' })
  async getLowStock(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockProducts(threshold);
  }
}