import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getCategoryById, getCategoryBreadcrumbs, getProducts } from '@/lib/api';
import { ProductGrid } from '@/components/products/product-grid';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { CategoryCard } from '@/components/categories/category-card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Package } from 'lucide-react';

interface CategoryPageProps {
  params: { id: string };
  searchParams: { page?: string };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getCategoryById(params.id);

  if (!category) {
    notFound();
  }

  const page = parseInt(searchParams.page || '1', 10);
  
  const [breadcrumbs, productsResponse] = await Promise.all([
    getCategoryBreadcrumbs(params.id),
    getProducts({ categoryId: params.id, page, limit: 20 }),
  ]);

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    ...breadcrumbs.map((cat) => ({
      label: cat.title,
      href: `/categories/${cat.id}`,
    })),
  ];

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-6">
          {category.imageUrl && (
            <img
              src={category.imageUrl}
              alt={category.title}
              className="w-24 h-24 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.title}
            </h1>
            {category.productCount && (
              <p className="text-gray-600 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                {category.productCount.toLocaleString()} products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subcategories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {category.children.map((child) => (
              <CategoryCard key={child.id} category={child} compact />
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Products ({productsResponse.total.toLocaleString()})
          </h2>
        </div>

        <Suspense fallback={<LoadingSkeleton type="grid" count={12} />}>
          <ProductGrid
            products={productsResponse.data}
            total={productsResponse.total}
            page={productsResponse.page}
            totalPages={productsResponse.totalPages}
            baseUrl={`/categories/${params.id}`}
          />
        </Suspense>
      </section>
    </div>
  );
}
