import {
  BookOpen,
  Star,
  Calendar,
  Building2,
  FileText,
  Globe,
  Hash,
  ExternalLink,
} from 'lucide-react';
import type { ProductDetail } from '@/lib/types';

interface ProductDetailViewProps {
  product: ProductDetail;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const formatPrice = (price: number, currency: string) => {
    const symbols: Record<string, string> = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    return `${symbols[currency] || currency}${price.toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-1/3 p-8 bg-gray-50 flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-64 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <BookOpen className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="lg:w-2/3 p-8">
          {/* Category Badge */}
          {product.category && (
            <a
              href={`/categories/${product.category.id}`}
              className="inline-block text-sm text-primary-600 hover:text-primary-700 mb-2"
            >
              {product.category.title}
            </a>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.title}
          </h1>

          {product.author && (
            <p className="text-lg text-gray-600 mb-4">by {product.author}</p>
          )}

          {/* Rating */}
          {product.ratingsAvg && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.ratingsAvg || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.ratingsAvg.toFixed(1)} ({product.reviewsCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-primary-600">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Condition & Stock */}
          <div className="flex items-center gap-4 mb-6">
            {product.condition && (
              <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                {product.condition}
              </span>
            )}
            <span
              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                product.inStock
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* External Link */}
          <a
            href={product.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors mb-8"
          >
            View on World of Books
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Product Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Product Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.isbn && (
                <DetailItem icon={Hash} label="ISBN" value={product.isbn} />
              )}
              {product.publisher && (
                <DetailItem icon={Building2} label="Publisher" value={product.publisher} />
              )}
              {product.publicationDate && (
                <DetailItem icon={Calendar} label="Publication Date" value={product.publicationDate} />
              )}
              {product.format && (
                <DetailItem icon={FileText} label="Format" value={product.format} />
              )}
              {product.language && (
                <DetailItem icon={Globe} label="Language" value={product.language} />
              )}
              {product.pages && (
                <DetailItem icon={BookOpen} label="Pages" value={String(product.pages)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Customer Reviews ({product.reviews.length})
          </h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {review.author && (
                    <span className="font-medium text-gray-900">{review.author}</span>
                  )}
                  {review.reviewDate && (
                    <span className="text-sm text-gray-500">{review.reviewDate}</span>
                  )}
                </div>
                {review.title && (
                  <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                )}
                {review.text && (
                  <p className="text-gray-600">{review.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
