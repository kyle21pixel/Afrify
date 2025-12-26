'use client';

import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export default function Header() {
  const cartItems = useCartStore((state) => state.items);
  const [searchQuery, setSearchQuery] = useState('');

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">Afrify</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/wishlist"
              className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
            >
              <Heart className="w-5 h-5" />
            </Link>

            <Link
              href="/account"
              className="hidden sm:flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">Account</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="hidden lg:inline">Cart</span>
            </Link>

            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </nav>
        </div>

        {/* Categories */}
        <div className="hidden md:flex items-center space-x-8 py-3 border-t">
          <Link href="/shop" className="text-sm text-gray-700 hover:text-primary transition-colors">
            All Products
          </Link>
          <Link href="/shop/electronics" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Electronics
          </Link>
          <Link href="/shop/fashion" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Fashion
          </Link>
          <Link href="/shop/home" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Home & Living
          </Link>
          <Link href="/shop/beauty" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Beauty
          </Link>
          <Link href="/shop/sports" className="text-sm text-gray-700 hover:text-primary transition-colors">
            Sports
          </Link>
        </div>
      </div>
    </header>
  );
}
