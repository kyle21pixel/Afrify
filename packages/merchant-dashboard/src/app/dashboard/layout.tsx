'use client';

import { useRouter } from 'next/navigation';
import { Store, Package, ShoppingCart, Users, Settings, BarChart3, Bell, Search } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Afrify</span>
              </Link>
              
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  M
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            <NavLink href="/dashboard" icon={<BarChart3 />} label="Dashboard" />
            <NavLink href="/dashboard/products" icon={<Package />} label="Products" />
            <NavLink href="/dashboard/orders" icon={<ShoppingCart />} label="Orders" />
            <NavLink href="/dashboard/customers" icon={<Users />} label="Customers" />
            <NavLink href="/dashboard/settings" icon={<Settings />} label="Settings" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
    >
      <span className="h-5 w-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
