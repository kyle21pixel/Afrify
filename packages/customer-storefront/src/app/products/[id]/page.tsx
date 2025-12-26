'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Minus, Plus, Truck, Shield, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  attributes: Record<string, string>;
  images?: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  inventory: number;
  variants?: ProductVariant[];
  features?: string[];
  specifications?: Record<string, string>;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    },
  });

  // Fetch product reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    },
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ['related-products', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const response = await api.get(`/products?category=${product.category}&limit=4`);
      return response.data.filter((p: Product) => p.id !== productId);
    },
    enabled: !!product?.category,
  });

  const handleAddToCart = () => {
    if (!product) return;

    const selectedVariantData = product.variants?.find(v => v.id === selectedVariant);
    
    addItem({
      id: selectedVariant || product.id,
      productId: product.id,
      variantId: selectedVariant || undefined,
      name: selectedVariantData ? `${product.name} - ${selectedVariantData.name}` : product.name,
      price: selectedVariantData?.price || product.price,
      image: selectedVariantData?.images?.[0] || product.images[0],
      quantity,
    });

    toast.success('Added to cart!', {
      description: `${quantity} × ${product.name}`,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.inventory || 99)));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600">The product you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const displayPrice = currentVariant?.price || product.price;
  const displayComparePrice = currentVariant?.compareAtPrice || product.compareAtPrice;
  const displayInventory = currentVariant?.inventory || product.inventory;
  const images = currentVariant?.images || product.images;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm">
          <a href="/" className="text-gray-500 hover:text-gray-700">Home</a>
          <span className="mx-2 text-gray-400">/</span>
          <a href="/shop" className="text-gray-500 hover:text-gray-700">Shop</a>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square mb-4 bg-white rounded-lg overflow-hidden">
              <Image
                src={images[selectedImage] || '/placeholder-product.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
              {displayComparePrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Save {Math.round((1 - displayPrice / displayComparePrice) * 100)}%
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <Image src={image} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                ₦{displayPrice.toLocaleString()}
              </span>
              {displayComparePrice && (
                <span className="text-xl text-gray-400 line-through">
                  ₦{displayComparePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Variant
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                        selectedVariant === variant.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={quantity >= displayInventory}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {displayInventory} available
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={displayInventory === 0}
                className="flex-1 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {displayInventory > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors">
                <Heart className="h-6 w-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="flex flex-col items-center text-center">
                <Truck className="h-8 w-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium">Free Shipping</span>
                <span className="text-xs text-gray-500">Orders over ₦10,000</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield className="h-8 w-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium">Secure Payment</span>
                <span className="text-xs text-gray-500">100% protected</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RefreshCw className="h-8 w-8 text-primary-600 mb-2" />
                <span className="text-sm font-medium">Easy Returns</span>
                <span className="text-xs text-gray-500">30-day guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8">
              <button className="pb-4 border-b-2 border-primary-600 text-primary-600 font-medium">
                Description
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Specifications
              </button>
              <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-bold mb-4">Product Description</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            {product.features && (
              <>
                <h4 className="font-semibold mt-6 mb-3">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{review.customerName}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Related Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <a
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={relatedProduct.images[0] || '/placeholder-product.png'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold mb-2 truncate">{relatedProduct.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary-600">
                        ₦{relatedProduct.price.toLocaleString()}
                      </span>
                      {relatedProduct.compareAtPrice && (
                        <span className="text-sm text-gray-400 line-through">
                          ₦{relatedProduct.compareAtPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
