'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  stores: number;
  revenue: number;
  createdAt: string;
}

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tenants = [] } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: '1',
          name: 'Fashion Hub Nigeria',
          email: 'admin@fashionhub.ng',
          plan: 'Professional',
          status: 'ACTIVE',
          stores: 3,
          revenue: 1250000,
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Ghana Tech Store',
          email: 'contact@ghanatechstore.com',
          plan: 'Basic',
          status: 'ACTIVE',
          stores: 1,
          revenue: 450000,
          createdAt: '2024-02-20',
        },
        {
          id: '3',
          name: 'Kenyan Crafts',
          email: 'info@kenyancrafts.ke',
          plan: 'Professional',
          status: 'SUSPENDED',
          stores: 2,
          revenue: 780000,
          createdAt: '2024-03-10',
        },
        {
          id: '4',
          name: 'South African Goods',
          email: 'hello@sagoods.co.za',
          plan: 'Enterprise',
          status: 'ACTIVE',
          stores: 5,
          revenue: 2100000,
          createdAt: '2024-01-05',
        },
      ];
    },
  });

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">Manage all tenants on the platform</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          <Plus className="h-5 w-5" />
          Add Tenant
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Plans</option>
            <option>Basic</option>
            <option>Professional</option>
            <option>Enterprise</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Stores</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{tenant.name}</p>
                    <p className="text-sm text-gray-500">{tenant.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    tenant.plan === 'Enterprise' 
                      ? 'bg-purple-100 text-purple-700'
                      : tenant.plan === 'Professional'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tenant.plan}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {tenant.status === 'ACTIVE' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-700 text-sm">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-700 text-sm">Suspended</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-900">{tenant.stores}</td>
                <td className="py-3 px-4 text-right font-semibold text-primary-600">
                  ₦{tenant.revenue.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredTenants.length}</span> of <span className="font-medium">{tenants.length}</span> tenants
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
