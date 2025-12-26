'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { formatCurrency } from '@afrify/shared';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0] || '/placeholder.jpg',
    });

    toast.success(`${product.name} added to cart`);
  };

  const rating = product.rating || 4.5;
  const reviewCount = product.reviewCount || 120;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {product.discount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
              -{product.discount}%
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
              <Heart className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 left-4 right-4 bg-primary text-white py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 hover:bg-primary-600"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price, 'NGN')}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.originalPrice, 'NGN')}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.inventory < 10 && product.inventory > 0 && (
            <p className="text-xs text-orange-600 mt-2">
              Only {product.inventory} left in stock
            </p>
          )}
          {product.inventory === 0 && (
            <p className="text-xs text-red-600 mt-2">Out of stock</p>
          )}
        </div>
      </div>
    </Link>
  );
}
