import { Controller, Post, Get, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderFilterDto } from '@ecommerce/shared';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order from cart' })
  async createOrder(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders' })
  async getUserOrders(
    @Headers('x-user-id') userId: string,
    @Query() filters: OrderFilterDto,
  ) {
    return this.orderService.findUserOrders(userId, filters);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async getOrder(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.orderService.findById(orderId, userId);
  }

  @Put(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.orderService.cancelOrder(orderId, userId, reason);
  }

  @Put(':id/payment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment for order' })
  async processPayment(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
    @Body('paymentMethodId') paymentMethodId: string,
  ) {
    return this.orderService.processPayment(orderId, userId, paymentMethodId);
  }
}