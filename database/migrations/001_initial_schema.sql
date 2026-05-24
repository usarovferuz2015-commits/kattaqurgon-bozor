-- ============================================
-- KATTAGO'RG'ON BOZORI - Initial Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('user', 'seller', 'admin');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'archived', 'pending');
CREATE TYPE ad_status AS ENUM ('active', 'inactive', 'expired', 'scheduled');
CREATE TYPE ad_position AS ENUM ('banner', 'carousel', 'featured', 'sidebar', 'homepage');
CREATE TYPE cart_status AS ENUM ('active', 'abandoned', 'converted', 'expired');
CREATE TYPE notification_type AS ENUM ('order', 'promo', 'system', 'message', 'subscription');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  language_code TEXT DEFAULT 'uz',
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]',
  added_by UUID REFERENCES admins(id),
  is_superadmin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  store_slug TEXT UNIQUE NOT NULL,
  store_description TEXT,
  store_address TEXT,
  store_phone TEXT,
  store_logo TEXT,
  store_banner TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table (unlimited nested)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  meta_title TEXT,
  meta_description TEXT,
  product_count INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0,
  path TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  price DECIMAL(12,2) NOT NULL,
  old_price DECIMAL(12,2),
  currency TEXT DEFAULT 'UZS',
  quantity INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'dona',
  is_negotiable BOOLEAN DEFAULT FALSE,
  is_wholesale BOOLEAN DEFAULT FALSE,
  wholesale_min_qty INTEGER DEFAULT 0,
  wholesale_price DECIMAL(12,2),
  status product_status DEFAULT 'active',
  is_premium BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_on_sale BOOLEAN DEFAULT FALSE,
  discount_percent INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  cart_adds_count INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  has_variants BOOLEAN DEFAULT FALSE,
  has_sizes BOOLEAN DEFAULT FALSE,
  has_colors BOOLEAN DEFAULT FALSE,
  weight DECIMAL(10,2),
  dimensions JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  search_vector TSVECTOR,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  name_en TEXT,
  type TEXT NOT NULL, -- 'size', 'color', 'material', etc.
  value TEXT NOT NULL,
  price_adjustment DECIMAL(12,2) DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  telegram_id BIGINT,
  session_id TEXT,
  status cart_status DEFAULT 'active',
  total_items INTEGER DEFAULT 0,
  total_amount DECIMAL(14,2) DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_add DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Premium advertisements
CREATE TABLE IF NOT EXISTS premium_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  title_en TEXT,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position ad_position DEFAULT 'banner',
  status ad_status DEFAULT 'active',
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  budget DECIMAL(14,2),
  cost_per_day DECIMAL(10,2),
  total_cost DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  title_en TEXT,
  subtitle_uz TEXT,
  subtitle_ru TEXT,
  subtitle_en TEXT,
  image_url TEXT NOT NULL,
  link_type TEXT DEFAULT 'product', -- 'product', 'category', 'seller', 'external'
  link_value TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  bg_color TEXT,
  text_color TEXT,
  button_text_uz TEXT DEFAULT 'Batafsil',
  button_text_ru TEXT DEFAULT 'Подробнее',
  button_text_en TEXT DEFAULT 'Learn more',
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured products
CREATE TABLE IF NOT EXISTS featured_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  section TEXT NOT NULL DEFAULT 'homepage', -- 'homepage', 'top', 'recommended', 'category'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics / Page views
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  telegram_id BIGINT,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL, -- 'product', 'category', 'seller', 'homepage', 'search'
  session_id TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events log (for detailed analytics)
CREATE TABLE IF NOT EXISTS events_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  telegram_id BIGINT,
  event_type TEXT NOT NULL, -- 'view', 'cart_add', 'cart_remove', 'favorite', 'share', 'contact', 'search'
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller subscriptions
CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- 'free', 'basic', 'premium', 'vip'
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  features JSONB DEFAULT '[]',
  max_products INTEGER DEFAULT 10,
  max_images INTEGER DEFAULT 5,
  has_premium_ads BOOLEAN DEFAULT FALSE,
  has_analytics BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type DEFAULT 'system',
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  title_en TEXT,
  body_uz TEXT NOT NULL,
  body_ru TEXT,
  body_en TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  telegram_id BIGINT,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews / Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_uz TEXT,
  comment_ru TEXT,
  comment_en TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Daily stats cache (for quick dashboard loading)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_sellers INTEGER DEFAULT 0,
  new_sellers INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  new_products INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_cart_adds INTEGER DEFAULT 0,
  total_favorites INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue DECIMAL(16,2) DEFAULT 0,
  premium_ads_active INTEGER DEFAULT 0,
  premium_ads_clicks INTEGER DEFAULT 0,
  premium_ad_revenue DECIMAL(14,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Users
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sellers
CREATE INDEX idx_sellers_telegram_id ON sellers(telegram_id);
CREATE INDEX idx_sellers_store_slug ON sellers(store_slug);
CREATE INDEX idx_sellers_is_active ON sellers(is_active);
CREATE INDEX idx_sellers_is_verified ON sellers(is_verified);
CREATE INDEX idx_sellers_is_featured ON sellers(is_featured);
CREATE INDEX idx_sellers_rating ON sellers(rating DESC);

-- Categories
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_path ON categories USING GIN(path);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- Products
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_views_count ON products(views_count DESC);
CREATE INDEX idx_products_is_premium ON products(is_premium);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- Product images
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_sort_order ON product_images(sort_order);

-- Cart
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_telegram_id ON carts(telegram_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- Premium ads
CREATE INDEX idx_premium_ads_seller_id ON premium_ads(seller_id);
CREATE INDEX idx_premium_ads_position ON premium_ads(position);
CREATE INDEX idx_premium_ads_status ON premium_ads(status);
CREATE INDEX idx_premium_ads_expires_at ON premium_ads(expires_at);

-- Banners
CREATE INDEX idx_banners_is_active ON banners(is_active);
CREATE INDEX idx_banners_sort_order ON banners(sort_order);

-- Analytics
CREATE INDEX idx_page_views_user_id ON page_views(user_id);
CREATE INDEX idx_page_views_product_id ON page_views(product_id);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_page_type ON page_views(page_type);
CREATE INDEX idx_events_log_user_id ON events_log(user_id);
CREATE INDEX idx_events_log_event_type ON events_log(event_type);
CREATE INDEX idx_events_log_created_at ON events_log(created_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Search
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
  BEFORE UPDATE ON daily_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update category path and level on insert/update
CREATE OR REPLACE FUNCTION update_category_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 0;
    NEW.path = ARRAY[NEW.slug];
  ELSE
    SELECT level + 1, path || NEW.slug
    INTO NEW.level, NEW.path
    FROM categories
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_category_path
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_category_path();

-- Auto-update product search vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('simple',
    COALESCE(NEW.name_uz, '') || ' ' ||
    COALESCE(NEW.name_ru, '') || ' ' ||
    COALESCE(NEW.name_en, '') || ' ' ||
    COALESCE(NEW.description_uz, '') || ' ' ||
    COALESCE(NEW.description_ru, '') || ' ' ||
    COALESCE(NEW.description_en, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Increment product views
CREATE OR REPLACE FUNCTION increment_product_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET views_count = views_count + 1
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_product_views_on_page_view
  AFTER INSERT ON page_views
  FOR EACH ROW
  WHEN (NEW.product_id IS NOT NULL)
  EXECUTE FUNCTION increment_product_views();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can view product images"
  ON product_images FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can view active banners"
  ON banners FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can view active premium ads"
  ON premium_ads FOR SELECT
  USING (status = 'active');

CREATE POLICY "Public can view featured products"
  ON featured_products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can view active sellers"
  ON sellers FOR SELECT
  USING (is_active = TRUE);

-- User policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (telegram_id = current_setting('app.telegram_id')::BIGINT);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (telegram_id = current_setting('app.telegram_id')::BIGINT)
  WITH CHECK (telegram_id = current_setting('app.telegram_id')::BIGINT);

-- Seller policies
CREATE POLICY "Sellers can manage own products"
  ON products FOR ALL
  USING (seller_id IN (
    SELECT id FROM sellers WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
  ));

CREATE POLICY "Sellers can manage own product images"
  ON product_images FOR ALL
  USING (product_id IN (
    SELECT id FROM products WHERE seller_id IN (
      SELECT id FROM sellers WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
    )
  ));

-- Cart policies
CREATE POLICY "Users can manage own cart"
  ON carts FOR ALL
  USING (telegram_id = current_setting('app.telegram_id')::BIGINT);

CREATE POLICY "Users can manage own cart items"
  ON cart_items FOR ALL
  USING (cart_id IN (
    SELECT id FROM carts WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
  ));

-- Favorites policies
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id IN (
    SELECT id FROM users WHERE telegram_id = current_setting('app.telegram_id')::BIGINT
  ));

-- Admin policies
CREATE POLICY "Admins can do everything"
  ON categories FOR ALL
  USING (current_setting('app.is_admin')::BOOLEAN = TRUE);

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  USING (current_setting('app.is_admin')::BOOLEAN = TRUE);

CREATE POLICY "Admins can manage premium ads"
  ON premium_ads FOR ALL
  USING (current_setting('app.is_admin')::BOOLEAN = TRUE);

CREATE POLICY "Admins can manage featured products"
  ON featured_products FOR ALL
  USING (current_setting('app.is_admin')::BOOLEAN = TRUE);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (current_setting('app.is_admin')::BOOLEAN = TRUE);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name_uz, slug, icon, description, sort_order) VALUES
  ('Kiyim-kechak', 'kiym-kechak', '👕', 'Barcha turdagi kiyimlar', 1),
  ('Elektronika', 'elektronika', '📱', 'Telefon, kompyuter va boshqa elektronika', 2),
  ('Qurilish mollari', 'qurilish-mollari', '🔨', 'Qurilish va taʼmirlash materiallari', 3),
  ('Oziq-ovqat', 'oziq-ovqat', '🍎', 'Oziq-ovqat mahsulotlari', 4),
  ('Goʻsht mahsulotlari', 'gosht-mahsulotlari', '🥩', 'Goʻsht va goʻsht mahsulotlari', 5),
  ('Mevalar', 'mevalar', '🍇', 'Yangi meva va sabzavotlar', 6),
  ('Maishiy texnika', 'maishiy-texnika', '🔌', 'Uy uchun texnika va jihozlar', 7),
  ('Uy-roʻzgʻor buyumlari', 'uy-rozgor-buyumlari', '🏠', 'Uy-roʻzgʻor uchun kerakli narsalar', 8),
  ('Bolalar dunyosi', 'bolalar-dunyosi', '🧸', 'Bolalar uchun mahsulotlar', 9),
  ('Sport va dam olish', 'sport-dam-olish', '⚽', 'Sport anjomlari va dam olish vositalari', 10),
  ('Avtomahsus', 'avtomahsus', '🚗', 'Avto ehtiyot qismlar va aksessuarlar', 11),
  ('Kitob va oʻquv qurollari', 'kitob-oquv-qurollari', '📚', 'Kitob va oʻquv qurollari', 12);

-- Insert subcategories for Kiyim-kechak (id will be auto-generated)
DO $$
DECLARE
  parent_id UUID;
BEGIN
  SELECT id INTO parent_id FROM categories WHERE slug = 'kiym-kechak' LIMIT 1;
  
  INSERT INTO categories (name_uz, slug, parent_id, sort_order) VALUES
    ('Erkaklar kiyimi', 'erkaklar-kiyimi', parent_id, 1),
    ('Ayollar kiyimi', 'ayollar-kiyimi', parent_id, 2),
    ('Qizlar kiyimi', 'qizlar-kiyimi', parent_id, 3),
    ('Bolalar kiyimi', 'bolalar-kiyimi', parent_id, 4),
    ('Chaqaloqlar kiyimi', 'chaqaloqlar-kiyimi', parent_id, 5),
    ('Poyabzallar', 'poyabzallar', parent_id, 6),
    ('Aksessuarlar', 'aksessuarlar', parent_id, 7);
END $$;

-- Create daily stats entry for today
INSERT INTO daily_stats (date) VALUES (CURRENT_DATE) ON CONFLICT (date) DO NOTHING;
