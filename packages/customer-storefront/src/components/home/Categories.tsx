'use client';

import { Smartphone, Shirt, Home, Sparkles, Dumbbell, Package } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: 'Electronics', icon: Smartphone, href: '/shop/electronics', color: 'bg-blue-500' },
  { name: 'Fashion', icon: Shirt, href: '/shop/fashion', color: 'bg-pink-500' },
  { name: 'Home & Living', icon: Home, href: '/shop/home', color: 'bg-green-500' },
  { name: 'Beauty', icon: Sparkles, href: '/shop/beauty', color: 'bg-purple-500' },
  { name: 'Sports', icon: Dumbbell, href: '/shop/sports', color: 'bg-orange-500' },
  { name: 'More', icon: Package, href: '/shop', color: 'bg-gray-500' },
];

export default function Categories() {
  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
