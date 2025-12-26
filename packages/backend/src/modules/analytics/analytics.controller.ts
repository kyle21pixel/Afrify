import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/user.entity';
import { AnalyticsService, DateRangeDto } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('api/v1/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get dashboard overview statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics retrieved' })
  async getDashboardStats(@Request() req) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    return this.analyticsService.getDashboardStats(storeId);
  }

  @Get('sales')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get sales report for a date range' })
  @ApiResponse({ status: 200, description: 'Sales report retrieved' })
  async getSalesReport(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month' = 'day',
  ) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    const dateRange: DateRangeDto = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    return this.analyticsService.getSalesReport(storeId, dateRange, groupBy);
  }

  @Get('revenue')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get revenue breakdown by product' })
  @ApiResponse({ status: 200, description: 'Revenue by product retrieved' })
  async getRevenueByProduct(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('limit') limit = 10,
  ) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    const dateRange: DateRangeDto = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    return this.analyticsService.getRevenueByProduct(
      storeId,
      dateRange,
      Number(limit),
    );
  }

  @Get('customers')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get customer insights and statistics' })
  @ApiResponse({ status: 200, description: 'Customer insights retrieved' })
  async getCustomerInsights(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    const dateRange: DateRangeDto = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    return this.analyticsService.getCustomerInsights(storeId, dateRange);
  }

  @Get('conversion')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get conversion metrics' })
  @ApiResponse({ status: 200, description: 'Conversion metrics retrieved' })
  async getConversionMetrics(
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    const dateRange: DateRangeDto = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    return this.analyticsService.getConversionMetrics(storeId, dateRange);
  }

  @Get('growth')
  @Roles(UserRole.MERCHANT, UserRole.STAFF)
  @ApiOperation({ summary: 'Get growth metrics comparing periods' })
  @ApiResponse({ status: 200, description: 'Growth metrics retrieved' })
  async getGrowthMetrics(
    @Request() req,
    @Query('currentStart') currentStart: string,
    @Query('currentEnd') currentEnd: string,
    @Query('previousStart') previousStart: string,
    @Query('previousEnd') previousEnd: string,
  ) {
    const storeId = req.user.storeId;
    if (!storeId) {
      throw new BadRequestException('User not associated with a store');
    }

    const currentPeriod: DateRangeDto = {
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
    };

    const previousPeriod: DateRangeDto = {
      startDate: new Date(previousStart),
      endDate: new Date(previousEnd),
    };

    return this.analyticsService.getGrowthMetrics(
      storeId,
      currentPeriod,
      previousPeriod,
    );
  }

  // Super Admin endpoints
  @Get('platform')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get platform-wide analytics (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Platform analytics retrieved' })
  async getPlatformAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // TODO: Implement platform-wide analytics
    // This would aggregate data across all stores
    return {
      message: 'Platform analytics endpoint - to be implemented',
      dateRange: { startDate, endDate },
    };
  }
}
