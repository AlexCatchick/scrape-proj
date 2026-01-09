// Navigation types
export interface Navigation {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string;
  lastScrapedAt: string | null;
  categories?: CategorySummary[];
}

// Category types
export interface CategorySummary {
  id: string;
  title: string;
  slug: string;
  productCount?: number | null;
}

export interface Category {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string;
  productCount?: number | null;
  imageUrl?: string | null;
  lastScrapedAt?: string | null;
  navigationId?: string | null;
  parentId?: string | null;
  children?: CategorySummary[];
  navigation?: {
    id: string;
    title: string;
    slug: string;
  };
  parent?: CategorySummary;
}

export interface CategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
}

// Product types
export interface Product {
  id: string;
  sourceId: string;
  title: string;
  author?: string | null;
  price: number;
  currency: string;
  originalPrice?: number;
  imageUrl?: string | null;
  sourceUrl: string;
  condition?: string | null;
  inStock: boolean;
  lastScrapedAt?: string | null;
}

export interface Review {
  id: string;
  author?: string | null;
  rating: number;
  text?: string | null;
  title?: string | null;
  reviewDate?: string | null;
}

export interface ProductDetail extends Product {
  description?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  publicationDate?: string | null;
  format?: string | null;
  language?: string | null;
  pages?: number | null;
  specs?: Record<string, any> | null;
  ratingsAvg?: number | null;
  reviewsCount: number;
  reviews?: Review[];
  category?: CategorySummary;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Query types
export interface ProductsQuery {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CategoriesQuery {
  navigationId?: string;
  parentId?: string | null;
  page?: number;
  limit?: number;
}
