import axios from 'axios';
import type {
  Navigation,
  Category,
  CategoriesResponse,
  Product,
  ProductDetail,
  ProductsResponse,
  ApiResponse,
  ProductsQuery,
  CategoriesQuery,
} from './types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// Ensure /api suffix
const API_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to unwrap API response
function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

// Navigation API
export async function getNavigation(): Promise<Navigation[]> {
  try {
    const response = await api.get<ApiResponse<Navigation[]>>('/navigation');
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return [];
  }
}

export async function getNavigationById(id: string): Promise<Navigation | null> {
  try {
    const response = await api.get<ApiResponse<Navigation>>(`/navigation/${id}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return null;
  }
}

export async function getNavigationBySlug(slug: string): Promise<Navigation | null> {
  try {
    const response = await api.get<ApiResponse<Navigation>>(`/navigation/slug/${slug}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch navigation:', error);
    return null;
  }
}

// Categories API
export async function getCategories(query: CategoriesQuery = {}): Promise<CategoriesResponse> {
  try {
    const params = new URLSearchParams();
    if (query.navigationId) params.set('navigationId', query.navigationId);
    if (query.parentId !== undefined) params.set('parentId', String(query.parentId));
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const response = await api.get<ApiResponse<CategoriesResponse>>(`/categories?${params}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return { data: [], total: 0, page: 1, limit: 50 };
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const response = await api.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return null;
  }
}

export async function getCategoryBreadcrumbs(id: string): Promise<Category[]> {
  try {
    const response = await api.get<ApiResponse<Category[]>>(`/categories/${id}/breadcrumbs`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch breadcrumbs:', error);
    return [];
  }
}

// Products API
export async function getProducts(query: ProductsQuery = {}): Promise<ProductsResponse> {
  try {
    const params = new URLSearchParams();
    if (query.categoryId) params.set('categoryId', query.categoryId);
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.sortOrder) params.set('sortOrder', query.sortOrder);

    const response = await api.get<ApiResponse<ProductsResponse>>(`/products?${params}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  }
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
  try {
    const response = await api.get<ApiResponse<ProductDetail>>(`/products/${id}`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export async function getProductReviews(id: string): Promise<any[]> {
  try {
    const response = await api.get<ApiResponse<any[]>>(`/products/${id}/reviews`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export async function getRelatedProducts(id: string): Promise<Product[]> {
  try {
    const response = await api.get<ApiResponse<Product[]>>(`/products/${id}/related`);
    return unwrap(response);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

// Scraping API (for triggering refresh)
export async function triggerNavigationRefresh(): Promise<void> {
  await api.post('/navigation/refresh');
}

export async function triggerCategoryRefresh(sourceUrl: string, navigationId?: string): Promise<void> {
  await api.post('/categories/refresh', { sourceUrl, navigationId });
}

export async function triggerProductListRefresh(sourceUrl: string, categoryId?: string): Promise<void> {
  await api.post('/products/refresh', { sourceUrl, categoryId });
}

export async function triggerProductDetailRefresh(productId: string): Promise<void> {
  await api.post(`/products/${productId}/refresh`);
}
