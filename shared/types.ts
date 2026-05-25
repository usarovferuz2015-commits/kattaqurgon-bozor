// ============================================
// Kattaqo'rg'on Bozori - Shared Types
// ============================================

// === Enums ===
export type UserRole = 'user' | 'seller' | 'admin';
export type ProductStatus = 'active' | 'inactive' | 'archived' | 'pending';
export type AdStatus = 'active' | 'inactive' | 'expired' | 'scheduled';
export type AdPosition = 'banner' | 'carousel' | 'featured' | 'sidebar' | 'homepage';
export type CartStatus = 'active' | 'abandoned' | 'converted' | 'expired';
export type NotificationType = 'order' | 'promo' | 'system' | 'message' | 'subscription';
export type EventType = 'view' | 'cart_add' | 'cart_remove' | 'favorite' | 'share' | 'contact' | 'search';

// === User ===
export interface User {
  id: string;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_blocked: boolean;
  language_code: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateInput {
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  language_code?: string;
}

// === Admin ===
export interface Admin {
  id: string;
  user_id: string;
  telegram_id: number;
  permissions: string[];
  added_by: string | null;
  is_superadmin: boolean;
  created_at: string;
}

// === Seller ===
export interface Seller {
  id: string;
  user_id: string;
  telegram_id: number;
  store_name: string;
  store_slug: string;
  store_description: string | null;
  store_address: string | null;
  store_phone: string | null;
  store_logo: string | null;
  store_banner: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_products: number;
  total_sales: number;
  total_views: number;
  subscription_tier: string;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SellerCreateInput {
  store_name: string;
  store_slug: string;
  store_description?: string;
  store_address?: string;
  store_phone?: string;
  store_logo?: string;
}

export interface SellerUpdateInput extends Partial<SellerCreateInput> {
  is_verified?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
}

// === Category ===
export interface Category {
  id: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  is_visible: boolean;
  meta_title: string | null;
  meta_description: string | null;
  product_count: number;
  level: number;
  path: string[];
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateInput {
  name_uz: string;
  name_ru?: string;
  name_en?: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  parent_id?: string | null;
  sort_order?: number;
}

export interface CategoryUpdateInput extends Partial<CategoryCreateInput> {
  is_active?: boolean;
  is_featured?: boolean;
  is_visible?: boolean;
}

// === Product ===
export interface Product {
  id: string;
  seller_id: string;
  category_id: string | null;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  slug: string;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  price: number;
  old_price: number | null;
  currency: string;
  quantity: number;
  unit: string;
  is_negotiable: boolean;
  is_wholesale: boolean;
  wholesale_min_qty: number;
  wholesale_price: number | null;
  status: ProductStatus;
  is_premium: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_percent: number;
  views_count: number;
  favorites_count: number;
  cart_adds_count: number;
  orders_count: number;
  has_variants: boolean;
  has_sizes: boolean;
  has_colors: boolean;
  weight: number | null;
  dimensions: ProductDimensions | null;
  tags: string[];
  images?: ProductImage[];
  seller?: SellerBrief;
  category?: CategoryBrief;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name_uz: string;
  name_ru: string | null;
  name_en: string | null;
  type: string;
  value: string;
  price_adjustment: number;
  stock_quantity: number;
  sort_order: number;
  created_at: string;
}

export interface ProductCreateInput {
  name_uz: string;
  name_ru?: string;
  name_en?: string;
  category_id?: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  price: number;
  old_price?: number;
  quantity?: number;
  unit?: string;
  is_negotiable?: boolean;
  is_wholesale?: boolean;
  wholesale_min_qty?: number;
  wholesale_price?: number;
  has_sizes?: boolean;
  has_colors?: boolean;
  weight?: number;
  tags?: string[];
  images?: { url: string; is_primary?: boolean; alt_text?: string }[];
}

export interface ProductUpdateInput extends Partial<ProductCreateInput> {
  status?: ProductStatus;
  is_premium?: boolean;
  is_featured?: boolean;
  is_on_sale?: boolean;
}

export interface SellerBrief {
  id: string;
  store_name: string;
  store_slug: string;
  store_logo: string | null;
  is_verified: boolean;
  telegram_id?: number;
  username?: string | null;
  store_phone?: string | null;
}

export interface CategoryBrief {
  id: string;
  name_uz: string;
  slug: string;
  icon: string | null;
}

// === Cart ===
export interface Cart {
  id: string;
  user_id: string;
  telegram_id: number | null;
  session_id: string | null;
  status: CartStatus;
  total_items: number;
  total_amount: number;
  items?: CartItem[];
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  price_at_add: number;
  total_price: number;
  product?: Product;
  variant?: ProductVariant;
  created_at: string;
}

// === Favorite ===
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

// === Premium Ad ===
export interface PremiumAd {
  id: string;
  seller_id: string;
  product_id: string | null;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  image_url: string;
  link_url: string | null;
  position: AdPosition;
  status: AdStatus;
  starts_at: string;
  expires_at: string;
  impressions: number;
  clicks: number;
  budget: number | null;
  cost_per_day: number | null;
  total_cost: number;
  seller?: SellerBrief;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface PremiumAdCreateInput {
  title_uz: string;
  title_ru?: string;
  title_en?: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  image_url: string;
  link_url?: string;
  position: AdPosition;
  seller_id?: string;
  product_id?: string;
  starts_at: string;
  expires_at: string;
  budget?: number;
  cost_per_day?: number;
}

// === Banner ===
export interface Banner {
  id: string;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  subtitle_uz: string | null;
  subtitle_ru: string | null;
  subtitle_en: string | null;
  image_url: string;
  link_type: 'product' | 'category' | 'seller' | 'external';
  link_value: string | null;
  sort_order: number;
  is_active: boolean;
  bg_color: string | null;
  text_color: string | null;
  button_text_uz: string;
  button_text_ru: string;
  button_text_en: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// === Analytics ===
export interface PageView {
  id: string;
  user_id: string | null;
  telegram_id: number | null;
  product_id: string | null;
  seller_id: string | null;
  category_id: string | null;
  page_type: string;
  session_id: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  duration_seconds: number;
  created_at: string;
}

export interface EventLog {
  id: string;
  user_id: string | null;
  telegram_id: number | null;
  event_type: EventType;
  product_id: string | null;
  seller_id: string | null;
  category_id: string | null;
  metadata: Record<string, unknown>;
  session_id: string | null;
  created_at: string;
}

export interface DailyStats {
  id: string;
  date: string;
  total_users: number;
  new_users: number;
  active_users: number;
  total_sellers: number;
  new_sellers: number;
  total_products: number;
  new_products: number;
  total_views: number;
  total_cart_adds: number;
  total_favorites: number;
  total_orders: number;
  total_revenue: number;
  premium_ads_active: number;
  premium_ads_clicks: number;
  premium_ad_revenue: number;
  created_at: string;
  updated_at: string;
}

// === Dashboard Stats (computed) ===
export interface DashboardStats {
  total_users: number;
  active_users_today: number;
  total_sellers: number;
  total_products: number;
  total_views: number;
  total_cart_adds: number;
  total_favorites: number;
  daily_stats: DailyStats;
  growth: {
    users_growth: number;
    sellers_growth: number;
    products_growth: number;
    views_growth: number;
  };
  top_products: Product[];
  top_categories: (Category & { view_count: number })[];
  top_sellers: Seller[];
  ad_performance: {
    total_ads: number;
    active_ads: number;
    total_clicks: number;
    total_impressions: number;
  };
}

// === Notification ===
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title_uz: string;
  title_ru: string | null;
  title_en: string | null;
  body_uz: string;
  body_ru: string | null;
  body_en: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

// === Search ===
export interface SearchResult {
  products: Product[];
  categories: Category[];
  sellers: SellerBrief[];
  total_results: number;
  query: string;
}

// === Pagination ===
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// === API Response ===
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// === Bot Message Types ===
export interface BotButton {
  text: string;
  callback_data?: string;
  web_app_url?: string;
  url?: string;
}

export interface BotKeyboard {
  inline_keyboard: BotButton[][];
}

// === WebApp Init ===
export interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  auth_date?: string;
  hash?: string;
  signature?: string;
}

// === Featured Product ===
export interface FeaturedProduct {
  id: string;
  product_id: string;
  section: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  product?: Product;
  created_at: string;
}
