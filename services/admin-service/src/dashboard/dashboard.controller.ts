import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard metrics' })
  async getMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('sales-chart')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get sales chart data' })
  async getSalesChart(@Query('days') days?: number) {
    return this.dashboardService.getSalesChartData(days || 30);
  }
}