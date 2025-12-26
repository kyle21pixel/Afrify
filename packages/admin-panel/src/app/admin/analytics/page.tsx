'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const revenueData = [
    { date: 'Week 1', revenue: 850000, orders: 234 },
    { date: 'Week 2', revenue: 920000, orders: 267 },
    { date: 'Week 3', revenue: 1100000, orders: 312 },
    { date: 'Week 4', revenue: 1250000, orders: 356 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 3500000 },
    { name: 'Fashion', value: 2800000 },
    { name: 'Home & Garden', value: 1900000 },
    { name: 'Beauty', value: 1200000 },
    { name: 'Sports', value: 900000 },
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform performance metrics</p>
        </div>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <TrendingUp className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-purple-100 text-sm mb-1">Total GMV</p>
          <p className="text-3xl font-bold">₦12.5M</p>
          <p className="text-purple-100 text-xs mt-2">+18.3% from last month</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <ShoppingBag className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-blue-100 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">12,547</p>
          <p className="text-blue-100 text-xs mt-2">1,834 this month</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <Users className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-green-100 text-sm mb-1">Active Users</p>
          <p className="text-3xl font-bold">8,423</p>
          <p className="text-green-100 text-xs mt-2">+12.5% growth</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <DollarSign className="h-8 w-8 mb-4 opacity-80" />
          <p className="text-orange-100 text-sm mb-1">Avg Order Value</p>
          <p className="text-3xl font-bold">₦997</p>
          <p className="text-orange-100 text-xs mt-2">+5.2% increase</p>
        </div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue & Orders Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} name="Revenue (₦)" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} name="Orders" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tenants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Performing Tenants</h2>
          <div className="space-y-4">
            {[
              { name: 'Fashion Hub Nigeria', revenue: 2400000, percentage: 19.2 },
              { name: 'South African Goods', revenue: 2100000, percentage: 16.8 },
              { name: 'Ghana Tech Store', revenue: 1800000, percentage: 14.4 },
              { name: 'Kenyan Crafts', revenue: 1500000, percentage: 12.0 },
            ].map((tenant, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                  <span className="text-sm font-semibold text-primary-600">₦{(tenant.revenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${tenant.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
