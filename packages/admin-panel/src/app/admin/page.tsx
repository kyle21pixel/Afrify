'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Store, ShoppingBag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '@/lib/api';

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalStores: number;
  activeStores: number;
  totalOrders: number;
  monthOrders: number;
  totalRevenue: number;
  monthRevenue: number;
  tenantsGrowth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      // Mock data for now
      return {
        totalTenants: 145,
        activeTenants: 132,
        totalStores: 423,
        activeStores: 398,
        totalOrders: 12547,
        monthOrders: 1834,
        totalRevenue: 4567890,
        monthRevenue: 678900,
        tenantsGrowth: 12.5,
        revenueGrowth: 18.3,
      };
    },
  });

  const revenueData = [
    { month: 'Jan', revenue: 320000 },
    { month: 'Feb', revenue: 380000 },
    { month: 'Mar', revenue: 420000 },
    { month: 'Apr', revenue: 450000 },
    { month: 'May', revenue: 510000 },
    { month: 'Jun', revenue: 678900 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of the entire Afrify platform</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-10 w-10 text-blue-500" />
            {stats && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+{stats.tenantsGrowth}%</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Tenants</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
          <p className="text-gray-500 text-xs mt-2">Active: {stats?.activeTenants || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Store className="h-10 w-10 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Stores</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalStores || 0}</p>
          <p className="text-gray-500 text-xs mt-2">Active: {stats?.activeStores || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="h-10 w-10 text-purple-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders.toLocaleString() || 0}</p>
          <p className="text-gray-500 text-xs mt-2">This month: {stats?.monthOrders.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-10 w-10 text-orange-500" />
            {stats && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+{stats.revenueGrowth}%</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">Platform Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₦{((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M</p>
          <p className="text-gray-500 text-xs mt-2">This month: ₦{((stats?.monthRevenue || 0) / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Platform Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`₦${value.toLocaleString()}`, 'Revenue']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Revenue (₦)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Tenants</h2>
          <div className="space-y-3">
            {[
              { name: 'Fashion Hub Nigeria', stores: 3, status: 'Active' },
              { name: 'Ghana Tech Store', stores: 1, status: 'Active' },
              { name: 'Kenyan Crafts', stores: 2, status: 'Pending' },
              { name: 'South African Goods', stores: 5, status: 'Active' },
            ].map((tenant, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">{tenant.stores} stores</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  tenant.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {tenant.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top Performing Stores</h2>
          <div className="space-y-3">
            {[
              { name: 'Electronics Express', revenue: 234500, orders: 567 },
              { name: 'Fashion Boutique', revenue: 189000, orders: 423 },
              { name: 'Home & Garden', revenue: 156000, orders: 312 },
              { name: 'Beauty Store', revenue: 134000, orders: 289 },
            ].map((store, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{store.name}</p>
                  <p className="text-sm text-gray-500">{store.orders} orders</p>
                </div>
                <p className="font-semibold text-primary-600">₦{store.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
