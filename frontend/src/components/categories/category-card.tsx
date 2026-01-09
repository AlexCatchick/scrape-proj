import Link from 'next/link';
import { ChevronRight, Folder, Package } from 'lucide-react';
import type { Category, CategorySummary } from '@/lib/types';

interface CategoryCardProps {
  category: Category | CategorySummary;
  compact?: boolean;
}

export function CategoryCard({ category, compact = false }: CategoryCardProps) {
  if (compact) {
    return (
      <Link
        href={`/categories/${category.id}`}
        className="group block bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600 truncate">
              {category.title}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
        </div>
        {category.productCount && (
          <p className="text-xs text-gray-500 mt-1 ml-6">
            {category.productCount.toLocaleString()} items
          </p>
        )}
      </Link>
    );
  }

  const fullCategory = category as Category;

  return (
    <Link
      href={`/categories/${category.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
    >
      {fullCategory.imageUrl ? (
        <div className="aspect-video relative overflow-hidden bg-gray-100">
          <img
            src={fullCategory.imageUrl}
            alt={category.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <h3 className="absolute bottom-3 left-4 right-4 text-white font-semibold text-lg">
            {category.title}
          </h3>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors">
              <Folder className="h-6 w-6 text-primary-600" />
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {category.title}
          </h3>
        </div>
      )}

      <div className="px-4 pb-4">
        {category.productCount && (
          <div className="flex items-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-1" />
            {category.productCount.toLocaleString()} products
          </div>
        )}
      </div>
    </Link>
  );
}
