import { Controller, Get, Post, Put, Body, Param, Query, Headers } from '@nestjs/common';  // ADD Post
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderAdminService } from './order-admin.service';
import { OrderStatus } from '@ecommerce/shared';

@ApiTags('Admin - Orders')
@Controller('admin/orders')
export class OrderAdminController {
  constructor(private readonly orderAdminService: OrderAdminService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders with filters' })
  async findAll(@Query() filters: any) {
    return this.orderAdminService.findAllOrders(filters);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order statistics' })
  async getStatistics() {
    return this.orderAdminService.getOrderStatistics();
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderAdminService.updateOrderStatus(id, status, userId);
  }

  @Post(':id/refund')  // ADD THIS ENDPOINT
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund' })
  async processRefund(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderAdminService.processRefund(id, amount, reason, userId);
  }
}