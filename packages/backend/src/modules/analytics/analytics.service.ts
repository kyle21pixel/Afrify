import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from '../orders/order.entity';
import { OrderItem } from '../orders/order-item.entity';
import { Payment } from '../payments/payment.entity';
import { Customer } from '../customers/customer.entity';
import { Product } from '../products/product.entity';
import { OrderStatus } from '@afrify/shared';

export interface DateRangeDto {
  startDate: Date;
  endDate: Date;
}

export interface SalesReportDto {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface RevenueByProductDto {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
  orders: number;
}

export interface CustomerInsightsDto {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
  }>;
}

export interface ConversionMetricsDto {
  totalVisitors: number;
  conversionRate: number;
  cartAbandonmentRate: number;
  averageCartValue: number;
}

export interface DashboardStatsDto {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Get sales report for a date range
   */
  async getSalesReport(
    storeId: string,
    dateRange: DateRangeDto,
    groupBy: 'day' | 'week' | 'month' = 'day',
  ): Promise<SalesReportDto[]> {
    const orders = await this.orderRepository.find({
      where: {
        storeId,
        createdAt: Between(dateRange.startDate, dateRange.endDate),
        status: OrderStatus.DELIVERED,
      },
    });

    // Group by period
    const grouped = this.groupByPeriod(orders, groupBy);

    return Object.entries(grouped).map(([period, periodOrders]) => ({
      period,
      revenue: periodOrders.reduce((sum, order) => sum + order.total, 0),
      orders: periodOrders.length,
      averageOrderValue:
        periodOrders.reduce((sum, order) => sum + order.total, 0) /
        periodOrders.length,
    }));
  }

  /**
   * Get revenue breakdown by product
   */
  async getRevenueByProduct(
    storeId: string,
    dateRange: DateRangeDto,
    limit = 10,
  ): Promise<RevenueByProductDto[]> {
    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .innerJoin('orderItem.product', 'product')
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('SUM(orderItem.total)', 'revenue')
      .addSelect('SUM(orderItem.quantity)', 'quantity')
      .addSelect('COUNT(DISTINCT order.id)', 'orders')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .groupBy('product.id')
      .addGroupBy('product.name')
      .orderBy('revenue', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((row) => ({
      productId: row.productId,
      productName: row.productName,
      revenue: parseFloat(row.revenue),
      quantity: parseInt(row.quantity),
      orders: parseInt(row.orders),
    }));
  }

  /**
   * Get customer insights and statistics
   */
  async getCustomerInsights(
    storeId: string,
    dateRange: DateRangeDto,
  ): Promise<CustomerInsightsDto> {
    // Total customers
    const totalCustomers = await this.customerRepository.count({
      where: { storeId },
    });

    // New customers in date range
    const newCustomers = await this.customerRepository.count({
      where: {
        storeId,
        createdAt: Between(dateRange.startDate, dateRange.endDate),
      },
    });

    // Calculate returning customers (customers with more than 1 order)
    const returningCustomersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.customerId', 'customerId')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .groupBy('order.customerId')
      .having('COUNT(*) > 1')
      .getRawMany();

    const returningCustomers = returningCustomersResult.length;

    // Calculate average lifetime value
    const lifetimeValueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(customerTotal)', 'averageLifetimeValue')
      .from((subQuery) => {
        return subQuery
          .select('order.customerId', 'customerId')
          .addSelect('SUM(order.total)', 'customerTotal')
          .from(Order, 'order')
          .where('order.storeId = :storeId', { storeId })
          .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
          .groupBy('order.customerId');
      }, 'customerTotals')
      .getRawOne();

    const averageLifetimeValue =
      parseFloat(lifetimeValueResult?.averageLifetimeValue) || 0;

    // Top customers
    const topCustomersResult = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.customer', 'customer')
      .select('customer.id', 'customerId')
      .addSelect(
        "CONCAT(customer.firstName, ' ', customer.lastName)",
        'customerName',
      )
      .addSelect('SUM(order.total)', 'totalSpent')
      .addSelect('COUNT(*)', 'orderCount')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .groupBy('customer.id')
      .addGroupBy('customer.firstName')
      .addGroupBy('customer.lastName')
      .orderBy('totalSpent', 'DESC')
      .limit(10)
      .getRawMany();

    const topCustomers = topCustomersResult.map((row) => ({
      customerId: row.customerId,
      customerName: row.customerName,
      totalSpent: parseFloat(row.totalSpent),
      orderCount: parseInt(row.orderCount),
    }));

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      averageLifetimeValue,
      topCustomers,
    };
  }

  /**
   * Get conversion metrics
   */
  async getConversionMetrics(
    storeId: string,
    dateRange: DateRangeDto,
  ): Promise<ConversionMetricsDto> {
    // Note: In a real implementation, you'd track these metrics with analytics tools
    // For now, we'll calculate based on available data

    const completedOrders = await this.orderRepository.count({
      where: {
        storeId,
        createdAt: Between(dateRange.startDate, dateRange.endDate),
        status: OrderStatus.DELIVERED,
      },
    });

    const pendingOrders = await this.orderRepository.count({
      where: {
        storeId,
        createdAt: Between(dateRange.startDate, dateRange.endDate),
        status: OrderStatus.PENDING,
      },
    });

    const cancelledOrders = await this.orderRepository.count({
      where: {
        storeId,
        createdAt: Between(dateRange.startDate, dateRange.endDate),
        status: OrderStatus.CANCELLED,
      },
    });

    const totalOrders = completedOrders + pendingOrders + cancelledOrders;

    // Calculate average cart value from pending orders (abandoned carts)
    const averageCartResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('AVG(order.total)', 'averageCartValue')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.status = :status', { status: OrderStatus.PENDING })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
      .getRawOne();

    const averageCartValue = parseFloat(averageCartResult?.averageCartValue) || 0;

    // Estimate visitors (in production, use Google Analytics or similar)
    const estimatedVisitors = totalOrders * 10; // Rough estimate

    const conversionRate = totalOrders > 0 ? (completedOrders / estimatedVisitors) * 100 : 0;
    const cartAbandonmentRate = totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;

    return {
      totalVisitors: estimatedVisitors,
      conversionRate,
      cartAbandonmentRate,
      averageCartValue,
    };
  }

  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats(storeId: string): Promise<DashboardStatsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Today's revenue and orders
    const todayOrdersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.createdAt >= :today', { today })
      .andWhere('order.createdAt < :tomorrow', { tomorrow })
      .andWhere('order.status IN (:...statuses)', {
        statuses: ['PAID', 'PROCESSING', 'FULFILLED', 'DELIVERED'],
      })
      .getRawOne();

    const todayRevenue = parseFloat(todayOrdersResult?.revenue) || 0;
    const todayOrders = parseInt(todayOrdersResult?.count) || 0;

    // Month's revenue and orders
    const monthOrdersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('SUM(order.total)', 'revenue')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.createdAt >= :monthStart', { monthStart })
      .andWhere('order.createdAt <= :monthEnd', { monthEnd })
      .andWhere('order.status IN (:...statuses)', {
        statuses: ['PAID', 'PROCESSING', 'FULFILLED', 'DELIVERED'],
      })
      .getRawOne();

    const monthRevenue = parseFloat(monthOrdersResult?.revenue) || 0;
    const monthOrders = parseInt(monthOrdersResult?.count) || 0;

    // Total customers
    const totalCustomers = await this.customerRepository.count({
      where: { storeId },
    });

    // Total products
    const totalProducts = await this.productRepository.count({
      where: { storeId },
    });

    // Pending orders
    const pendingOrders = await this.orderRepository.count({
      where: {
        storeId,
        status: OrderStatus.PENDING,
      },
    });

    // Low stock products (less than 10 items)
    const lowStockProducts = await this.productRepository.count({
      where: {
        storeId,
      },
    });

    return {
      todayRevenue,
      todayOrders,
      monthRevenue,
      monthOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
    };
  }

  /**
   * Helper function to group orders by period
   */
  private groupByPeriod(
    orders: Order[],
    groupBy: 'day' | 'week' | 'month',
  ): Record<string, Order[]> {
    const grouped: Record<string, Order[]> = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(order);
    });

    return grouped;
  }

  /**
   * Get growth metrics (comparing current period to previous period)
   */
  async getGrowthMetrics(
    storeId: string,
    currentPeriod: DateRangeDto,
    previousPeriod: DateRangeDto,
  ): Promise<{
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  }> {
    // Current period stats
    const currentRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
      })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    const currentOrders = await this.orderRepository.count({
      where: {
        storeId,
        createdAt: Between(currentPeriod.startDate, currentPeriod.endDate),
        status: OrderStatus.DELIVERED,
      },
    });

    const currentCustomers = await this.customerRepository.count({
      where: {
        storeId,
        createdAt: Between(currentPeriod.startDate, currentPeriod.endDate),
      },
    });

    // Previous period stats
    const previousRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .where('order.storeId = :storeId', { storeId })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: previousPeriod.startDate,
        endDate: previousPeriod.endDate,
      })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();

    const previousOrders = await this.orderRepository.count({
      where: {
        storeId,
        createdAt: Between(previousPeriod.startDate, previousPeriod.endDate),
        status: OrderStatus.DELIVERED,
      },
    });

    const previousCustomers = await this.customerRepository.count({
      where: {
        storeId,
        createdAt: Between(previousPeriod.startDate, previousPeriod.endDate),
      },
    });

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenue.revenue > 0
        ? ((currentRevenue.revenue - previousRevenue.revenue) /
            previousRevenue.revenue) *
          100
        : 0;

    const orderGrowth =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : 0;

    const customerGrowth =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0;

    return {
      revenueGrowth,
      orderGrowth,
      customerGrowth,
    };
  }
}
