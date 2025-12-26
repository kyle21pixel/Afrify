'use client';

import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@afrify/shared';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 10000 ? 0 : 500;
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link href="/shop" className="inline-flex items-center gap-2 btn btn-primary">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop" className="text-gray-600 hover:text-primary">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <span className="text-gray-600">({items.length} items)</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-lg shadow-sm p-4 flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                {item.variantName && (
                  <p className="text-sm text-gray-600 mb-2">{item.variantName}</p>
                )}
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(item.price, 'NGN')}
                </p>
              </div>

              <div className="flex flex-col items-end gap-4">
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1), item.variantId)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, 'NGN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping, 'NGN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (7.5%)</span>
                <span>{formatCurrency(tax, 'NGN')}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total, 'NGN')}</span>
              </div>
            </div>

            {shipping > 0 && (
              <p className="text-sm text-gray-600 mb-4 p-3 bg-blue-50 rounded-lg">
                💡 Add {formatCurrency(10000 - subtotal, 'NGN')} more to get FREE shipping!
              </p>
            )}

            <Link
              href="/checkout"
              className="block w-full btn btn-primary text-center mb-3"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/shop"
              className="block w-full btn btn-secondary text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
