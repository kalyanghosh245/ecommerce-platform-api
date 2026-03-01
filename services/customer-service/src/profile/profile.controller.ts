import { Controller, Get, Put, Delete, Body, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateUserDto, ChangePasswordDto } from '@ecommerce/shared';

@ApiTags('Profile')
@Controller('customer/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Headers('x-user-id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(
    @Headers('x-user-id') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Put('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Headers('x-user-id') userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(userId, dto);
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history' })
  async getOrderHistory(
    @Headers('x-user-id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.profileService.getOrderHistory(userId, page, limit);
  }

  @Delete()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete account (GDPR)' })
  async deleteAccount(@Headers('x-user-id') userId: string) {
    return this.profileService.deleteAccount(userId);
  }
}