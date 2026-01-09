import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  baseUrl: string;
}

export function ProductGrid({
  products,
  total,
  page,
  totalPages,
  baseUrl,
}: ProductGridProps) {
  const buildPageUrl = (pageNum: number) => {
    const url = new URL(baseUrl, 'http://localhost');
    url.searchParams.set('page', String(pageNum));
    return `${url.pathname}${url.search}`;
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Link
                  key={pageNum}
                  href={buildPageUrl(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    pageNum === page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </nav>
      )}

      <p className="text-center text-sm text-gray-500 mt-4">
        Showing {(page - 1) * products.length + 1} -{' '}
        {Math.min(page * products.length, total)} of {total.toLocaleString()} books
      </p>
    </div>
  );
}
