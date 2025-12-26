'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Settings,
  BarChart3,
  CreditCard,
  FileText,
  Shield,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Tenants', href: '/admin/tenants', icon: Users },
  { name: 'Stores', href: '/admin/stores', icon: Store },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Users', href: '/admin/users', icon: Shield },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Afrify Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Platform Management</p>
      </div>

      <nav className="mt-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
