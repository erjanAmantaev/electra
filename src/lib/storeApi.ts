export type Product = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  category_label: string;
  short_description: string;
  description?: string;
  specs?: Record<string, string>;
  gallery?: string[];
  stock?: number;
  price: string;
  compare_at_price: string | null;
  rating: string;
  review_count: number;
  badge: string;
  image_url: string;
  is_featured: boolean;
  in_stock: boolean;
};

export type ProductFilters = {
  categories: Array<{ value: string; label: string; count: number }>;
  brands: Array<{ value: string; label: string; count: number }>;
  price_range: { min: string | number; max: string | number };
};

export type ProductOrdering = 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating';

export type ProductQueryParams = {
  search?: string;
  category?: string[];
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  ordering?: ProductOrdering;
};

export type BillingProfile = {
  is_card_linked: boolean;
  card_holder_name: string;
  card_brand: string;
  card_last4: string;
  wallet_balance: string;
  total_spent: string;
};

export type LinkCardPayload = {
  card_holder_name: string;
  card_number: string;
  expiry: string;
  cvv: string;
  card_brand?: string;
};

export type CheckoutSimulationPayload = {
  amount: number;
  item_count: number;
  delivery_method: 'standard' | 'express';
};

export type CheckoutSimulationResult = {
  message: string;
  order_id?: number;
  order_number: string;
  item_count?: number;
  charged_amount: string;
  used_wallet: boolean;
  wallet_balance: string;
  card_last4: string;
  card_brand: string;
};

export type ProductReview = {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRatingBucket = {
  rating: number;
  count: number;
};

export type ProductReviewListResponse = {
  product_slug: string;
  rating: string;
  review_count: number;
  can_review: boolean;
  rating_distribution: ProductRatingBucket[];
  results: ProductReview[];
};

export type ProductReviewUpsertResponse = {
  message: string;
  review: ProductReview;
  rating: string;
  review_count: number;
  rating_distribution: ProductRatingBucket[];
};

export type ProductReviewDeleteResponse = {
  message: string;
  rating: string;
  review_count: number;
  rating_distribution: ProductRatingBucket[];
};

export type ProductReviewPayload = {
  rating: number;
  title?: string;
  comment?: string;
};

export type OrderItem = {
  id: number;
  product_name: string;
  product_brand: string;
  product_slug: string;
  image_url: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type OrderHistoryItem = {
  id: number;
  order_number: string;
  status: 'completed' | 'processing' | 'cancelled';
  delivery_method: 'standard' | 'express';
  item_count: number;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  total_amount: string;
  payment_brand: string;
  payment_last4: string;
  used_wallet: boolean;
  placed_at: string;
  items: OrderItem[];
};

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  category_label: string;
  price: string;
  image_url: string;
  in_stock: boolean;
  stock: number;
};

export type CartItem = {
  id: number;
  product: CartProduct;
  quantity: number;
  line_total: string;
  updated_at: string;
};

export type CartSummary = {
  items: CartItem[];
  item_count: number;
  subtotal: string;
};

export type AdminDashboardStats = {
  products_total: number;
  products_active: number;
  products_inactive: number;
  orders_total: number;
  orders_today: number;
  users_total: number;
  revenue_total: string;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminCategoryPayload = {
  name: string;
  slug?: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  category: string;
  category_label: string;
  short_description: string;
  description: string;
  specs: Record<string, string>;
  gallery: string[];
  price: string;
  compare_at_price: string | null;
  rating: string;
  review_count: number;
  stock: number;
  in_stock: boolean;
  image_url: string;
  badge: string;
  is_active: boolean;
  is_featured: boolean;
  released_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminProductPayload = {
  name: string;
  brand: string;
  category: string;
  short_description: string;
  description: string;
  specs?: Record<string, string>;
  gallery?: string[];
  price: string;
  compare_at_price?: string | null;
  stock: number;
  image_url: string;
  badge?: string;
  is_active?: boolean;
  is_featured?: boolean;
  released_at?: string | null;
};

export type AdminOrder = OrderHistoryItem & {
  user_id: number;
  user_email: string;
  user_name: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://electra-production.up.railway.app/api';
const STORAGE_TOKEN_KEY = 'electra_access_token';
const STORAGE_REFRESH_KEY = 'electra_refresh_token';
const STORAGE_USER_KEY = 'electra_user';

function getErrorMessage(errorData: unknown) {
  if (errorData && typeof errorData === 'object') {
    const detail = (errorData as { detail?: unknown }).detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
  }
  return 'Failed to load data from backend.';
}

function isTokenInvalidError(status: number, errorData: unknown, init?: RequestInit) {
  if (status !== 401) return false;

  const headers = new Headers(init?.headers ?? undefined);
  if (!headers.get('Authorization')) return false;

  if (!errorData || typeof errorData !== 'object') return false;

  const payload = errorData as { code?: string; detail?: string };
  return payload.code === 'token_not_valid' || payload.detail === 'Given token not valid for any token type';
}

function dispatchAuthEvent(name: 'electra-token-refreshed' | 'electra-auth-invalidated', detail?: unknown) {
  if (typeof window === 'undefined') return;

  const event = typeof detail === 'undefined' ? new Event(name) : new CustomEvent(name, { detail });
  window.dispatchEvent(event);
}

function clearStoredSession() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_TOKEN_KEY);
  localStorage.removeItem(STORAGE_REFRESH_KEY);
  localStorage.removeItem(STORAGE_USER_KEY);
  dispatchAuthEvent('electra-auth-invalidated');
}

async function refreshAccessToken() {
  if (typeof window === 'undefined') return null;

  const refreshToken = localStorage.getItem(STORAGE_REFRESH_KEY);
  if (!refreshToken) {
    clearStoredSession();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    clearStoredSession();
    return null;
  }

  const data = (await response.json().catch(() => null)) as { access?: string } | null;
  const accessToken = data?.access;

  if (!accessToken) {
    clearStoredSession();
    return null;
  }

  localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
  dispatchAuthEvent('electra-token-refreshed', { accessToken });
  return accessToken;
}

function withAuthToken(init: RequestInit | undefined, accessToken: string): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return {
    ...init,
    headers,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, init);

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const errorData = await response.json().catch(() => null);

  if (isTokenInvalidError(response.status, errorData, init)) {
    const refreshedToken = await refreshAccessToken();
    if (refreshedToken) {
      const retryResponse = await fetch(url, withAuthToken(init, refreshedToken));
      if (retryResponse.ok) {
        return retryResponse.json() as Promise<T>;
      }

      const retryErrorData = await retryResponse.json().catch(() => null);
      throw new Error(getErrorMessage(retryErrorData));
    }

    throw new Error('Your session expired. Please sign in again.');
  }

  throw new Error(getErrorMessage(errorData));
}

export async function getProductFilters(): Promise<ProductFilters> {
  return apiFetch<ProductFilters>('/products/filters/');
}

export async function getProducts(params: ProductQueryParams = {}): Promise<Product[]> {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  params.category?.forEach(value => query.append('category', value));
  params.brand?.forEach(value => query.append('brand', value));
  if (typeof params.minPrice === 'number') query.set('min_price', String(params.minPrice));
  if (typeof params.maxPrice === 'number') query.set('max_price', String(params.maxPrice));
  if (typeof params.minRating === 'number') query.set('min_rating', String(params.minRating));
  if (params.ordering) query.set('ordering', params.ordering);

  const queryString = query.toString();
  return apiFetch<Product[]>(`/products/${queryString ? `?${queryString}` : ''}`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}/`);
}

export async function getProductReviews(slug: string, token?: string): Promise<ProductReviewListResponse> {
  return apiFetch<ProductReviewListResponse>(`/products/${slug}/reviews/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

function getAuthHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getBillingProfile(token: string): Promise<BillingProfile> {
  return apiFetch<BillingProfile>('/billing/card/', {
    headers: getAuthHeaders(token),
  });
}

export async function linkBillingCard(token: string, payload: LinkCardPayload): Promise<BillingProfile> {
  return apiFetch<BillingProfile>('/billing/card/', {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function topUpWallet(token: string, amount: number): Promise<{ message: string; wallet_balance: string }> {
  return apiFetch<{ message: string; wallet_balance: string }>('/billing/top-up/', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ amount }),
  });
}

export async function simulateCheckout(token: string, payload: CheckoutSimulationPayload): Promise<CheckoutSimulationResult> {
  return apiFetch<CheckoutSimulationResult>('/checkout/simulate/', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function upsertProductReview(
  token: string,
  slug: string,
  payload: ProductReviewPayload
): Promise<ProductReviewUpsertResponse> {
  return apiFetch<ProductReviewUpsertResponse>(`/products/${slug}/reviews/`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteProductReview(token: string, slug: string): Promise<ProductReviewDeleteResponse> {
  return apiFetch<ProductReviewDeleteResponse>(`/products/${slug}/reviews/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function getOrderHistory(token: string): Promise<OrderHistoryItem[]> {
  return apiFetch<OrderHistoryItem[]>('/orders/', {
    headers: getAuthHeaders(token),
  });
}

export async function getOrderByNumber(token: string, orderNumber: string): Promise<OrderHistoryItem> {
  return apiFetch<OrderHistoryItem>(`/orders/${encodeURIComponent(orderNumber)}/`, {
    headers: getAuthHeaders(token),
  });
}

export async function getCart(token: string): Promise<CartSummary> {
  return apiFetch<CartSummary>('/cart/', {
    headers: getAuthHeaders(token),
  });
}

export async function addCartItem(token: string, productSlug: string, quantity = 1): Promise<CartSummary> {
  return apiFetch<CartSummary>('/cart/', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ product_slug: productSlug, quantity }),
  });
}

export async function updateCartItem(token: string, itemId: number, quantity: number): Promise<CartSummary> {
  return apiFetch<CartSummary>(`/cart/items/${itemId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(token: string, itemId: number): Promise<CartSummary> {
  return apiFetch<CartSummary>(`/cart/items/${itemId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function clearCart(token: string): Promise<CartSummary> {
  return apiFetch<CartSummary>('/cart/', {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function getAdminDashboard(token: string): Promise<AdminDashboardStats> {
  return apiFetch<AdminDashboardStats>('/admin/dashboard/', {
    headers: getAuthHeaders(token),
  });
}

export async function getAdminCategories(token: string): Promise<AdminCategory[]> {
  return apiFetch<AdminCategory[]>('/admin/categories/', {
    headers: getAuthHeaders(token),
  });
}

export async function createAdminCategory(token: string, payload: AdminCategoryPayload): Promise<AdminCategory> {
  return apiFetch<AdminCategory>('/admin/categories/', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(token: string, categoryId: number, payload: Partial<AdminCategoryPayload>): Promise<AdminCategory> {
  return apiFetch<AdminCategory>(`/admin/categories/${categoryId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCategory(token: string, categoryId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/admin/categories/${categoryId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function getAdminProducts(token: string, search?: string): Promise<AdminProduct[]> {
  const query = new URLSearchParams();
  if (search) query.set('search', search);

  const queryString = query.toString();
  return apiFetch<AdminProduct[]>(`/admin/products/${queryString ? `?${queryString}` : ''}`, {
    headers: getAuthHeaders(token),
  });
}

export async function createAdminProduct(token: string, payload: AdminProductPayload): Promise<AdminProduct> {
  return apiFetch<AdminProduct>('/admin/products/', {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function updateAdminProduct(token: string, productId: number, payload: Partial<AdminProductPayload>): Promise<AdminProduct> {
  return apiFetch<AdminProduct>(`/admin/products/${productId}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });
}

export async function deactivateAdminProduct(token: string, productId: number): Promise<{ message: string; id: number; is_active: boolean }> {
  return apiFetch<{ message: string; id: number; is_active: boolean }>(`/admin/products/${productId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
}

export async function getAdminOrders(token: string): Promise<AdminOrder[]> {
  return apiFetch<AdminOrder[]>('/admin/orders/', {
    headers: getAuthHeaders(token),
  });
}
