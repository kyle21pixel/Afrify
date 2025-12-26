'use client';

import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value="$12,543"
          change="+12.5%"
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          positive
        />
        <StatCard
          title="Orders"
          value="156"
          change="+8.2%"
          icon={<ShoppingBag className="h-6 w-6 text-blue-600" />}
          positive
        />
        <StatCard
          title="Customers"
          value="1,243"
          change="+5.1%"
          icon={<Users className="h-6 w-6 text-purple-600" />}
          positive
        />
        <StatCard
          title="Conversion Rate"
          value="3.2%"
          change="-0.3%"
          icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
          positive={false}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          <div className="space-y-4">
            <OrderItem orderId="#1234" customer="John Doe" amount="$125.00" status="Completed" />
            <OrderItem orderId="#1235" customer="Jane Smith" amount="$89.50" status="Processing" />
            <OrderItem orderId="#1236" customer="Mike Johnson" amount="$234.00" status="Shipped" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            <ProductItem name="Premium T-Shirt" sales={45} revenue="$1,350" />
            <ProductItem name="Classic Jeans" sales={38} revenue="$2,280" />
            <ProductItem name="Running Shoes" sales={32} revenue="$3,200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      <div className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last month
      </div>
    </div>
  );
}

function OrderItem({
  orderId,
  customer,
  amount,
  status,
}: {
  orderId: string;
  customer: string;
  amount: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <div className="font-medium text-gray-900">{orderId}</div>
        <div className="text-sm text-gray-600">{customer}</div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-900">{amount}</div>
        <div className="text-sm text-gray-600">{status}</div>
      </div>
    </div>
  );
}

function ProductItem({
  name,
  sales,
  revenue,
}: {
  name: string;
  sales: number;
  revenue: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="font-medium text-gray-900">{name}</div>
      <div className="text-right">
        <div className="text-sm text-gray-600">{sales} sales</div>
        <div className="font-medium text-gray-900">{revenue}</div>
      </div>
    </div>
  );
}
