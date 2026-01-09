import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    return `${symbols[currency] || currency}${price.toFixed(2)}`;
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-gray-300" />
          </div>
        )}
        
        {/* Condition Badge */}
        {product.condition && (
          <span className="absolute top-2 left-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
            {product.condition}
          </span>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-1">
          {product.title}
        </h3>
        
        {product.author && (
          <p className="text-sm text-gray-500 truncate mb-2">
            by {product.author}
          </p>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary-600">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
