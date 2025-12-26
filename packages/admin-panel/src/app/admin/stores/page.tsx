'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ExternalLink } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  tenant: string;
  domain: string;
  status: string;
  products: number;
  orders: number;
  revenue: number;
}

export default function StoresPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'Electronics Express',
          tenant: 'Fashion Hub Nigeria',
          domain: 'electronics.afrify.shop',
          status: 'ACTIVE',
          products: 234,
          orders: 567,
          revenue: 1234500,
        },
        {
          id: '2',
          name: 'Fashion Boutique',
          tenant: 'Ghana Tech Store',
          domain: 'fashion.afrify.shop',
          status: 'ACTIVE',
          products: 189,
          orders: 423,
          revenue: 989000,
        },
        {
          id: '3',
          name: 'Home & Garden',
          tenant: 'Kenyan Crafts',
          domain: 'home.afrify.shop',
          status: 'ACTIVE',
          products: 312,
          orders: 298,
          revenue: 756000,
        },
      ];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Stores</h1>
        <p className="text-gray-600 mt-1">Manage all stores across the platform</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Store</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Products</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => (
              <tr key={store.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{store.name}</p>
                    <p className="text-sm text-gray-500">{store.domain}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">{store.tenant}</td>
                <td className="py-3 px-4">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    {store.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-900">{store.products}</td>
                <td className="py-3 px-4 text-right text-gray-900">{store.orders}</td>
                <td className="py-3 px-4 text-right font-semibold text-primary-600">
                  ₦{store.revenue.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
