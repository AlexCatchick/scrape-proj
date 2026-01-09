import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductById, getRelatedProducts } from '@/lib/api';
import { ProductDetailView } from '@/components/products/product-detail-view';
import { RelatedProducts } from '@/components/products/related-products';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductById(params.id);
  
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: `${product.title} | Book Explorer`,
    description: product.description?.slice(0, 160) || `${product.title} by ${product.author}`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, relatedProducts] = await Promise.all([
    getProductById(params.id),
    getRelatedProducts(params.id),
  ]);

  if (!product) {
    notFound();
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'All Books', href: '/products' },
  ];

  if (product.category) {
    breadcrumbItems.push({
      label: product.category.title,
      href: `/categories/${product.category.id}`,
    });
  }

  breadcrumbItems.push({
    label: product.title.slice(0, 50) + (product.title.length > 50 ? '...' : ''),
    href: `/products/${product.id}`,
  });

  return (
    <div className="space-y-12">
      <Breadcrumbs items={breadcrumbItems} />

      <ProductDetailView product={product} />

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
}
