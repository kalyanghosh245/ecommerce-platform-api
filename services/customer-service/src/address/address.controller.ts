import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressService } from './address.service';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all addresses' })
  async getAddresses(@Headers('x-user-id') userId: string) {
    return this.addressService.getAddresses(userId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add new address' })
  async addAddress(
    @Headers('x-user-id') userId: string,
    @Body() address: any,
  ) {
    return this.addressService.addAddress(userId, address);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update address' })
  async updateAddress(
    @Headers('x-user-id') userId: string,
    @Param('id') addressId: string,
    @Body() updates: any,
  ) {
    return this.addressService.updateAddress(userId, addressId, updates);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete address' })
  async deleteAddress(
    @Headers('x-user-id') userId: string,
    @Param('id') addressId: string,
  ) {
    return this.addressService.deleteAddress(userId, addressId);
  }
}