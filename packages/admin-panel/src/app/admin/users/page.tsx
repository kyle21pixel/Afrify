'use client';

import { useState } from 'react';
import { Search, Shield, UserCheck, UserX } from 'lucide-react';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: '1', name: 'John Doe', email: 'john@fashionhub.ng', role: 'Tenant Admin', tenant: 'Fashion Hub Nigeria', status: 'Active', lastActive: '2 hours ago' },
    { id: '2', name: 'Jane Smith', email: 'jane@ghanatechstore.com', role: 'Store Manager', tenant: 'Ghana Tech Store', status: 'Active', lastActive: '5 minutes ago' },
    { id: '3', name: 'Mike Johnson', email: 'mike@kenyancrafts.ke', role: 'Tenant Admin', tenant: 'Kenyan Crafts', status: 'Inactive', lastActive: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage users and their permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
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
              <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenant</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary-600" />
                    <span className="text-gray-700">{user.role}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">{user.tenant}</td>
                <td className="py-3 px-4">
                  {user.status === 'Active' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <UserCheck className="h-4 w-4" />
                      <span className="text-sm">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <UserX className="h-4 w-4" />
                      <span className="text-sm">Inactive</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">{user.lastActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
