import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Cart, CartItem, AddToCartDto, UpdateCartItemDto, CartResponseDto } from '@ecommerce/shared';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CartService {
  private readonly productServiceUrl: string;

  constructor(
    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,
    private dataSource: DataSource,
    private httpService: HttpService,
  ) {
    this.productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003';
  }

  async getOrCreateCart(userId: string | null, sessionId: string | null): Promise<CartResponseDto> {
    if (!userId && !sessionId) {
      throw new BadRequestException('Either userId or sessionId required');
    }

    let cart = await this.findExistingCart(userId, sessionId);

    if (!cart) {
      cart = this.cartRepo.create({
        userId,
        sessionId,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.cartRepo.save(cart);
    }

    return this.getCartResponse(cart.id);
  }

  private async findExistingCart(userId: string | null, sessionId: string | null): Promise<Cart | null> {
    if (userId) {
      return this.cartRepo.findOne({
        where: { userId, status: 'active' },
        relations: ['items', 'items.product'],
      });
    }
    if (sessionId) {
      return this.cartRepo.findOne({
        where: { sessionId, status: 'active' },
        relations: ['items', 'items.product'],
      });
    }
    return null;
  }

  async addItem(userId: string | null, sessionId: string | null, dto: AddToCartDto): Promise<CartResponseDto> {
    const product = await this.getProductFromService(dto.productId);
    
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    const availableQty = product.inventory?.availableQuantity || 0;
    if (availableQty < dto.quantity) {
      throw new BadRequestException(`Only ${availableQty} items available`);
    }

    const cart = await this.getOrCreateCartEntity(userId, sessionId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let cartItem = await this.cartItemRepo.findOne({
        where: { cartId: cart.id, productId: dto.productId },
      });

      if (cartItem) {
        const newQuantity = cartItem.quantity + dto.quantity;
        if (newQuantity > availableQty) {
          throw new BadRequestException(`Cannot add more than ${availableQty} items`);
        }
        cartItem.quantity = newQuantity;
        cartItem.totalPrice = newQuantity * cartItem.unitPrice;
        await queryRunner.manager.save(cartItem);
      } else {
        cartItem = this.cartItemRepo.create({
          cartId: cart.id,
          productId: dto.productId,
          quantity: dto.quantity,
          unitPrice: product.price,
          totalPrice: dto.quantity * product.price,
          metadata: dto.metadata,
        });
        await queryRunner.manager.save(cartItem);
      }

      await this.recalculateCartTotals(cart.id, queryRunner);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return this.getCartResponse(cart.id);
  }

  private async getOrCreateCartEntity(userId: string | null, sessionId: string | null): Promise<Cart> {
    let cart = await this.findExistingCart(userId, sessionId);
    if (!cart) {
      cart = this.cartRepo.create({
        userId,
        sessionId,
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      await this.cartRepo.save(cart);
    }
    return cart;
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartResponseDto> {
    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity === 0) {
      await this.cartItemRepo.remove(cartItem);
    } else {
      const product = await this.getProductFromService(cartItem.productId);
      const availableQty = product.inventory?.availableQuantity || 0;
      
      if (dto.quantity > availableQty + cartItem.quantity) {
        throw new BadRequestException(`Only ${availableQty + cartItem.quantity} items available`);
      }

      cartItem.quantity = dto.quantity;
      cartItem.totalPrice = dto.quantity * cartItem.unitPrice;
      await this.cartItemRepo.save(cartItem);
    }

    await this.recalculateCartTotals(cartId);
    return this.getCartResponse(cartId);
  }

  async removeItem(cartId: string, itemId: string): Promise<CartResponseDto> {
    const cartItem = await this.cartItemRepo.findOne({
      where: { id: itemId, cartId },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepo.remove(cartItem);
    await this.recalculateCartTotals(cartId);
    return this.getCartResponse(cartId);
  }

  async clearCart(cartId: string): Promise<CartResponseDto> {
    await this.cartItemRepo.delete({ cartId });
    await this.cartRepo.update(cartId, {
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      total: 0,
    });
    return this.getCartResponse(cartId);
  }

  async mergeCart(userId: string, sessionId: string): Promise<CartResponseDto> {
    const guestCart = await this.cartRepo.findOne({
      where: { sessionId, status: 'active' },
      relations: ['items'],
    });

    if (!guestCart || guestCart.items.length === 0) {
      return this.getOrCreateCart(userId, null);
    }

    const userCart = await this.getOrCreateCartEntity(userId, null);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of guestCart.items) {
        const existingItem = await this.cartItemRepo.findOne({
          where: { cartId: userCart.id, productId: item.productId },
        });

        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
          await queryRunner.manager.save(existingItem);
        } else {
          const newItem = this.cartItemRepo.create({
            cartId: userCart.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            metadata: item.metadata,
          });
          await queryRunner.manager.save(newItem);
        }
      }

      guestCart.status = 'converted';
      await queryRunner.manager.save(guestCart);
      await this.recalculateCartTotals(userCart.id, queryRunner);
      await queryRunner.commitTransaction();

      return this.getCartResponse(userCart.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async recalculateCartTotals(cartId: string, queryRunner?: any): Promise<void> {
    const repo = queryRunner ? queryRunner.manager.getRepository(Cart) : this.cartRepo;
    const items = await this.cartItemRepo.find({ where: { cartId } });
    
    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice.toString()), 0);
    const taxAmount = subtotal * 0.1;
    const total = subtotal + taxAmount;

    await repo.update(cartId, { subtotal, taxAmount, total });
  }

  private async getCartResponse(cartId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepo.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return {
      id: cart.id,
      items: cart.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || 'Unknown',
        productImage: item.product?.images?.[0] || '',
        sku: item.product?.sku || 'N/A',
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
        maxQuantity: item.product?.inventories?.[0]?.availableQuantity || 0,
      })),
      subtotal: parseFloat(cart.subtotal.toString()),
      taxAmount: parseFloat(cart.taxAmount.toString()),
      discountAmount: parseFloat(cart.discountAmount.toString()),
      total: parseFloat(cart.total.toString()),
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  private async getProductFromService(productId: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.productServiceUrl}/products/${productId}`)
      );
      return response.data?.data || response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch product details');
    }
  }
}