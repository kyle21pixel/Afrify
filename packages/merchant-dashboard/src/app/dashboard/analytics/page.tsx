'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  monthRevenue: number;
  monthOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

interface ProductRevenue {
  productId: string;
  productName: string;
  revenue: number;
  quantity: number;
  orders: number;
}

interface CustomerInsights {
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

interface GrowthMetrics {
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Calculate date ranges
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch dashboard stats
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    },
  });

  // Fetch sales report
  const { data: salesData = [] } = useQuery<SalesData[]>({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/sales', {
        params: { startDate, endDate, groupBy: 'day' },
      });
      return response.data;
    },
  });

  // Fetch revenue by product
  const { data: productRevenue = [] } = useQuery<ProductRevenue[]>({
    queryKey: ['product-revenue', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/revenue', {
        params: { startDate, endDate, limit: 10 },
      });
      return response.data;
    },
  });

  // Fetch customer insights
  const { data: customerInsights } = useQuery<CustomerInsights>({
    queryKey: ['customer-insights', startDate, endDate],
    queryFn: async () => {
      const response = await api.get('/analytics/customers', {
        params: { startDate, endDate },
      });
      return response.data;
    },
  });

  // Fetch growth metrics
  const { data: growthMetrics } = useQuery<GrowthMetrics>({
    queryKey: ['growth-metrics', dateRange],
    queryFn: async () => {
      const current = getDateRange();
      const previous = {
        startDate: new Date(new Date(current.startDate).getTime() - (new Date(current.endDate).getTime() - new Date(current.startDate).getTime())).toISOString(),
        endDate: current.startDate,
      };
      
      const response = await api.get('/analytics/growth', {
        params: {
          currentStart: current.startDate,
          currentEnd: current.endDate,
          previousStart: previous.startDate,
          previousEnd: previous.endDate,
        },
      });
      return response.data;
    },
  });

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Track your store performance and insights</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range as typeof dateRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateRange === range
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' :
               range === '30d' ? 'Last 30 Days' :
               range === '90d' ? 'Last 90 Days' : 'Last Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-10 w-10 opacity-80" />
            {growthMetrics && (
              <div className="flex items-center gap-1 text-sm">
                {growthMetrics.revenueGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>+{growthMetrics.revenueGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span>{growthMetrics.revenueGrowth.toFixed(1)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">₦{stats?.monthRevenue.toLocaleString() || 0}</p>
          <p className="text-blue-100 text-xs mt-2">Today: ₦{stats?.todayRevenue.toLocaleString() || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="h-10 w-10 opacity-80" />
            {growthMetrics && (
              <div className="flex items-center gap-1 text-sm">
                {growthMetrics.orderGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>+{growthMetrics.orderGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span>{growthMetrics.orderGrowth.toFixed(1)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-green-100 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{stats?.monthOrders.toLocaleString() || 0}</p>
          <p className="text-green-100 text-xs mt-2">Pending: {stats?.pendingOrders || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-10 w-10 opacity-80" />
            {growthMetrics && (
              <div className="flex items-center gap-1 text-sm">
                {growthMetrics.customerGrowth >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>+{growthMetrics.customerGrowth.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span>{growthMetrics.customerGrowth.toFixed(1)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Customers</p>
          <p className="text-3xl font-bold">{stats?.totalCustomers.toLocaleString() || 0}</p>
          <p className="text-purple-100 text-xs mt-2">New: {customerInsights?.newCustomers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 opacity-80" />
          </div>
          <p className="text-orange-100 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold">{stats?.totalProducts.toLocaleString() || 0}</p>
          <p className="text-orange-100 text-xs mt-2">Low Stock: {stats?.lowStockProducts || 0}</p>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="period"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (₦)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Orders Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="period"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="orders"
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                name="Orders"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Products by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productRevenue.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.productName.substring(0, 15)}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {productRevenue.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `₦${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Top 10 Products by Revenue</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Units Sold</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
              </tr>
            </thead>
            <tbody>
              {productRevenue.map((product, index) => (
                <tr key={product.productId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-600">#{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{product.productName}</td>
                  <td className="py-3 px-4 text-right font-semibold text-primary-600">
                    ₦{product.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{product.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{product.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      {customerInsights && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Customers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">New Customers</p>
              <p className="text-2xl font-bold text-blue-900">{customerInsights.newCustomers}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Returning Customers</p>
              <p className="text-2xl font-bold text-green-900">{customerInsights.returningCustomers}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 mb-1">Avg Lifetime Value</p>
              <p className="text-2xl font-bold text-purple-900">
                ₦{customerInsights.averageLifetimeValue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Spent</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                </tr>
              </thead>
              <tbody>
                {customerInsights.topCustomers.map((customer, index) => (
                  <tr key={customer.customerId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">#{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{customer.customerName}</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary-600">
                      ₦{customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{customer.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
