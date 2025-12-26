'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail, Phone, MapPin, Download } from 'lucide-react';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  shippingFee: number;
  items: OrderItem[];
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery?: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const clearCart = useCartStore((state) => state.clearCart);

  // Clear cart on success
  useEffect(() => {
    if (orderId) {
      clearCart();
    }
  }, [orderId, clearCart]);

  // Fetch order details
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('No order ID provided');
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find your order. Please check your email for order details.</p>
          <Link
            href="/shop"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We&apos;ve sent a confirmation email to{' '}
            <span className="font-semibold">{order.customerEmail}</span>
          </p>
          <div className="inline-block bg-gray-100 px-6 py-3 rounded-lg">
            <span className="text-sm text-gray-600">Order Number: </span>
            <span className="text-lg font-bold text-primary-600">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Order Placed</span>
              <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-2">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Processing</span>
              <span className="text-xs text-gray-400">1-2 business days</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center mb-2">
                <Truck className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Shipped</span>
              <span className="text-xs text-gray-400">
                {order.estimatedDelivery 
                  ? new Date(order.estimatedDelivery).toLocaleDateString()
                  : '3-5 days'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Invoice
            </button>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={item.productImage || '/placeholder-product.png'}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₦{item.total.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-2">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `₦${order.shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-4">
              <span>Tax</span>
              <span>₦{order.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Shipping Address</h3>
            </div>
            <div className="text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-gray-900">Contact Information</h3>
            </div>
            <div className="text-gray-600 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{order.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm">
                  <span className="font-semibold">Payment Method:</span>{' '}
                  {order.paymentMethod === 'card' ? 'Credit/Debit Card' : 'M-Pesa'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">What&apos;s Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
              <p className="text-sm text-gray-600">
                We&apos;ve sent a confirmation email with your order details and tracking information.
              </p>
            </div>
            <div>
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">We&apos;re Preparing Your Order</h3>
              <p className="text-sm text-gray-600">
                Our team is carefully packing your items. You&apos;ll receive a shipping notification soon.
              </p>
            </div>
            <div>
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Track Your Package</h3>
              <p className="text-sm text-gray-600">
                Once shipped, you can track your order status in your account or via the tracking link in your email.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/account/orders/${order.id}`}
            className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors text-center"
          >
            View Order Details
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Need help with your order?</p>
          <p className="text-sm text-gray-500">
            Contact us at{' '}
            <a href="mailto:support@afrify.com" className="text-primary-600 hover:underline">
              support@afrify.com
            </a>{' '}
            or call{' '}
            <a href="tel:+2348012345678" className="text-primary-600 hover:underline">
              +234 801 234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
