// ============================================
// Product Service
// ============================================
import { getAdminClient, getUserClient } from './supabase';
import type { Product, ProductCreateInput, ProductUpdateInput, PaginatedResponse } from '../types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

export class ProductService {
  private get adminDb() {
    return getAdminClient();
  }

  private get userDb() {
    return getUserClient();
  }
 
  async create(sellerId: string, data: ProductCreateInput): Promise<Product> {
    const slug = generateSlug(data.name_uz);
 
    const productData: any = {
      seller_id: sellerId,
      category_id: data.category_id || null,
      name_uz: data.name_uz,
      name_ru: data.name_ru || null,
      name_en: data.name_en || null,
      slug,
      description_uz: data.description_uz || null,
      description_ru: data.description_ru || null,
      description_en: data.description_en || null,
      price: data.price,
      old_price: data.old_price || null,
      quantity: data.quantity || 0,
      unit: data.unit || 'dona',
      is_negotiable: data.is_negotiable || false,
      is_wholesale: data.is_wholesale || false,
      wholesale_min_qty: data.wholesale_min_qty || 0,
      wholesale_price: data.wholesale_price || null,
      has_sizes: data.has_sizes || false,
      has_colors: data.has_colors || false,
      weight: data.weight || null,
      tags: data.tags || [],
    };
 
    const { data: product, error } = await this.adminDb
      .from('products')
      .insert(productData)
      .select()
      .single();
 
    if (error) throw error;
 
    if (data.images && data.images.length > 0) {
      const images = data.images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || data.name_uz,
        sort_order: index,
        is_primary: img.is_primary || index === 0,
      }));
 
      await this.adminDb.from('product_images').insert(images);
    }
 
    return this.getById(product.id) as Promise<Product>;
  }
 
  async getById(id: string, includeRelations = true): Promise<Product | null> {
    let query = this.adminDb
      .from('products')
      .select('*');
 
    if (includeRelations) {
      query = this.adminDb
        .from('products')
        .select(`
          *,
          images:product_images(*),
          seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
          category:categories(id, name_uz, slug, icon)
        `);
    }
 
    const { data } = await query.eq('id', id).single();
    return data;
  }
 
  async getBySlug(slug: string): Promise<Product | null> {
    const { data } = await this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `)
      .eq('slug', slug)
      .single();
 
    return data;
  }
 
  async getBySeller(sellerId: string, page = 1, limit = 20, search?: string, categoryId?: string): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
 
    let query = this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username))
      `, { count: 'exact' })
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.textSearch('search_vector', search, { config: 'simple' });
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, count } = await query.range(from, to);
 
    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: (from + limit) < (count || 0),
      has_prev: page > 1,
    };
  }
 
  async getByCategory(categoryId: string, page = 1, limit = 20, sortBy = 'created_at', sortOrder: 'asc' | 'desc' = 'desc'): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
 
    const { data, count } = await this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `, { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);
 
    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: (from + limit) < (count || 0),
      has_prev: page > 1,
    };
  }
 
  async search(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
 
    const { data, count } = await this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `, { count: 'exact' })
      .textSearch('search_vector', query, { config: 'simple' })
      .eq('status', 'active')
      .order('views_count', { ascending: false })
      .range(from, to);
 
    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
      has_next: (from + limit) < (count || 0),
      has_prev: page > 1,
    };
  }
 
  async getHomepageProducts(): Promise<{
    featured: Product[];
    top: Product[];
    recommended: Product[];
    most_viewed: Product[];
    premium: Product[];
  }> {
    const featuredPromise = this.adminDb
      .from('featured_products')
      .select(`
        product:products(
          *,
          images:product_images(*),
          seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
          category:categories(id, name_uz, slug, icon)
        )
      `)
      .eq('is_active', true)
      .eq('section', 'homepage')
      .order('sort_order');
 
    const topPromise = this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('views_count', { ascending: false })
      .limit(10);
 
    const recommendedPromise = this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);
 
    const mostViewedPromise = this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `)
      .eq('status', 'active')
      .order('views_count', { ascending: false })
      .limit(10);
 
    const premiumPromise = this.adminDb
      .from('products')
      .select(`
        *,
        images:product_images(*),
        seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username)),
        category:categories(id, name_uz, slug, icon)
      `)
      .eq('status', 'active')
      .eq('is_premium', true)
      .order('created_at', { ascending: false })
      .limit(10);
 
    const [featuredRes, topRes, recommendedRes, mostViewedRes, premiumRes] = await Promise.all([
      featuredPromise,
      topPromise,
      recommendedPromise,
      mostViewedPromise,
      premiumPromise,
    ]);
 
    return {
      featured: (featuredRes.data || []).map((f: any) => f.product).filter(Boolean),
      top: topRes.data || [],
      recommended: recommendedRes.data || [],
      most_viewed: mostViewedRes.data || [],
      premium: premiumRes.data || [],
    };
  }
 
  async update(id: string, updates: ProductUpdateInput): Promise<Product> {
    const updateData: any = { ...updates };
 
    if (updates.images) {
      delete updateData.images;
    }
 
    const { data, error } = await this.adminDb
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
 
    if (error) throw error;
 
    if (updates.images) {
      await this.adminDb.from('product_images').delete().eq('product_id', id);
 
      const images = updates.images.map((img, index) => ({
        product_id: id,
        url: img.url,
        alt_text: img.alt_text || data.name_uz,
        sort_order: index,
        is_primary: img.is_primary || index === 0,
      }));
 
      await this.adminDb.from('product_images').insert(images);
    }
 
    return this.getById(id) as Promise<Product>;
  }
 
  async delete(id: string): Promise<void> {
    await this.adminDb.from('product_images').delete().eq('product_id', id);
    await this.adminDb.from('cart_items').delete().eq('product_id', id);
    await this.adminDb.from('favorites').delete().eq('product_id', id);
    await this.adminDb.from('products').delete().eq('id', id);
  }
 
  async incrementViews(id: string): Promise<void> {
    const { data } = await this.adminDb
      .from('products')
      .select('views_count')
      .eq('id', id)
      .single();
    const current = data?.views_count ?? 0;
    await this.adminDb
      .from('products')
      .update({ views_count: current + 1 })
      .eq('id', id);
  }
 
  async getCount(): Promise<number> {
    const { count } = await this.userDb
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
 
    return count || 0;
  }
 
  async getSellerProductCount(sellerId: string): Promise<number> {
    const { count } = await this.adminDb
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId);
 
    return count || 0;
  }
}
 
export const productService = new ProductService();

