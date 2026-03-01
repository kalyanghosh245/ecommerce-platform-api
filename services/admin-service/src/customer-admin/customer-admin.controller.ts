import { Controller, Get, Put, Body, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerAdminService } from './customer-admin.service';

@ApiTags('Admin - Customers')
@Controller('admin/customers')
export class CustomerAdminController {
  constructor(private readonly customerAdminService: CustomerAdminService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all customers' })
  async findAll(@Query() filters: any) {
    return this.customerAdminService.findAllCustomers(filters);
  }

  @Get('statistics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer statistics' })
  async getStatistics() {
    return this.customerAdminService.getCustomerStatistics();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer details with orders' })
  async getDetails(@Param('id') id: string) {
    return this.customerAdminService.getCustomerDetails(id);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/Deactivate customer' })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.customerAdminService.updateCustomerStatus(id, isActive);
  }
}