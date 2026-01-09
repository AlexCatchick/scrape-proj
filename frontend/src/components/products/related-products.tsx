import { ProductCard } from './product-card';
import type { Product } from '@/lib/types';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Related Books
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {products.slice(0, 5).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
