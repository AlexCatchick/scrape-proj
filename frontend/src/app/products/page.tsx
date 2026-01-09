import { Suspense } from 'react';
import { getProducts } from '@/lib/api';
import { ProductGrid } from '@/components/products/product-grid';
import { ProductFilters } from '@/components/products/product-filters';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface ProductsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    categoryId?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const { search, categoryId, sortBy, sortOrder } = searchParams;

  const productsResponse = await getProducts({
    page,
    search,
    categoryId,
    sortBy: sortBy || 'title',
    sortOrder: (sortOrder as 'ASC' | 'DESC') || 'ASC',
    limit: 24,
  });

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'All Books', href: '/products' },
  ];

  if (search) {
    breadcrumbItems.push({
      label: `Search: "${search}"`,
      href: `/products?search=${encodeURIComponent(search)}`,
    });
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {search ? `Results for "${search}"` : 'All Books'}
        </h1>
        <p className="text-gray-600">
          {productsResponse.total.toLocaleString()} books found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters
            currentSearch={search}
            currentSortBy={sortBy}
            currentSortOrder={sortOrder}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-grow">
          <Suspense fallback={<LoadingSkeleton type="grid" count={12} />}>
            {productsResponse.data.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 mb-4">
                  No books found. Try a different search or browse our categories.
                </p>
              </div>
            ) : (
              <ProductGrid
                products={productsResponse.data}
                total={productsResponse.total}
                page={productsResponse.page}
                totalPages={productsResponse.totalPages}
                baseUrl="/products"
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
