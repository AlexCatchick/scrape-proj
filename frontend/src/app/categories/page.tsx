import { Suspense } from 'react';
import { getCategories, getNavigationById } from '@/lib/api';
import { CategoryCard } from '@/components/categories/category-card';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface CategoriesPageProps {
  searchParams: { navigationId?: string; parentId?: string };
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { navigationId, parentId } = searchParams;
  
  const [categoriesResponse, navigation] = await Promise.all([
    getCategories({ navigationId, parentId }),
    navigationId ? getNavigationById(navigationId) : null,
  ]);

  const { data: categories, total } = categoriesResponse;

  // Build breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
  ];

  if (navigation) {
    breadcrumbItems.push({
      label: navigation.title,
      href: `/categories?navigationId=${navigation.id}`,
    });
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {navigation ? navigation.title : 'All Categories'}
        </h1>
        <p className="text-gray-600">
          {total} {total === 1 ? 'category' : 'categories'} found
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton type="grid" count={8} />}>
        {categories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-4">
              No categories found. The data may still be loading.
            </p>
            <p className="text-sm text-gray-400">
              Categories are fetched on-demand from World of Books.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
