import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from '@ecommerce/shared';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart' })
  async getCart(
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.getOrCreateCart(userId || null, sessionId || null);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddToCartDto,
  ) {
    return this.cartService.addItem(userId || null, sessionId || null, dto);
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(
    @Headers('x-cart-id') cartId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(cartId, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(
    @Headers('x-cart-id') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(cartId, itemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@Headers('x-cart-id') cartId: string) {
    return this.cartService.clearCart(cartId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge guest cart to user cart' })
  async mergeCart(
    @Headers('x-user-id') userId: string,
    @Headers('x-session-id') sessionId: string,
  ) {
    return this.cartService.mergeCart(userId, sessionId);
  }
}