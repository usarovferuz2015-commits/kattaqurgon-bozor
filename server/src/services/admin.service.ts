// ============================================
// Admin Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { Banner, PremiumAd, FeaturedProduct, Admin } from '../types';

export class AdminService {
  private get db() {
    return getSupabaseClient();
  }

  // === Admin Verification ===
  async isAdmin(telegramId: number): Promise<boolean> {
    const { data } = await this.db
      .from('admins')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    return !!data;
  }

  async addAdmin(telegramId: number, userId: string, addedBy: number, isSuperadmin = false): Promise<Admin> {
    const { data, error } = await this.db
      .from('admins')
      .insert({
        user_id: userId,
        telegram_id: telegramId,
        is_superadmin: isSuperadmin,
        added_by: addedBy,
        permissions: ['*'],
      })
      .select()
      .single();

    if (error) throw error;

    await this.db
      .from('users')
      .update({ role: 'admin' })
      .eq('telegram_id', telegramId);

    return data;
  }

  async removeAdmin(telegramId: number): Promise<void> {
    await this.db
      .from('admins')
      .delete()
      .eq('telegram_id', telegramId);

    await this.db
      .from('users')
      .update({ role: 'user' })
      .eq('telegram_id', telegramId);
  }

  async getAllAdmins(): Promise<Admin[]> {
    const { data } = await this.db
      .from('admins')
      .select('*, user:users(*)');

    return data || [];
  }

  // === Banners ===
  async createBanner(data: Partial<Banner>): Promise<Banner> {
    const { data: banner, error } = await this.db
      .from('banners')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return banner;
  }

  async updateBanner(id: string, data: Partial<Banner>): Promise<Banner> {
    const { data: banner, error } = await this.db
      .from('banners')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return banner;
  }

  async deleteBanner(id: string): Promise<void> {
    await this.db.from('banners').delete().eq('id', id);
  }

  async getAllBanners(): Promise<Banner[]> {
    const { data } = await this.db
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });

    return data || [];
  }

  async getActiveBanners(): Promise<Banner[]> {
    const now = new Date().toISOString();
    const { data } = await this.db
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order('sort_order', { ascending: true });

    return data || [];
  }

  // === Premium Ads ===
  async createPremiumAd(data: Partial<PremiumAd>): Promise<PremiumAd> {
    const { data: ad, error } = await this.db
      .from('premium_ads')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return ad;
  }

  async updatePremiumAd(id: string, data: Partial<PremiumAd>): Promise<PremiumAd> {
    const { data: ad, error } = await this.db
      .from('premium_ads')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return ad;
  }

  async deletePremiumAd(id: string): Promise<void> {
    await this.db.from('premium_ads').delete().eq('id', id);
  }

  async getAllPremiumAds(): Promise<PremiumAd[]> {
    const { data } = await this.db
      .from('premium_ads')
      .select('*, seller:sellers(id, store_name, store_slug, store_logo), product:products(id, name_uz, slug, price)')
      .order('created_at', { ascending: false });

    return data || [];
  }

  async getActivePremiumAds(position?: string): Promise<PremiumAd[]> {
    const now = new Date().toISOString();
    let query = this.db
      .from('premium_ads')
      .select('*, seller:sellers(id, store_name, store_slug, store_logo)')
      .eq('status', 'active')
      .lte('starts_at', now)
      .gte('expires_at', now);

    if (position) {
      query = query.eq('position', position);
    }

    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }

  // === Featured Products ===
  async addFeaturedProduct(productId: string, section = 'homepage', sortOrder = 0): Promise<FeaturedProduct> {
    const { data, error } = await this.db
      .from('featured_products')
      .insert({
        product_id: productId,
        section,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw error;

    await this.db
      .from('products')
      .update({ is_featured: true })
      .eq('id', productId);

    return data;
  }

  async removeFeaturedProduct(id: string): Promise<void> {
    const { data } = await this.db
      .from('featured_products')
      .select('product_id')
      .eq('id', id)
      .single();

    if (data) {
      await this.db
        .from('products')
        .update({ is_featured: false })
        .eq('id', data.product_id);
    }

    await this.db.from('featured_products').delete().eq('id', id);
  }

  async getAllFeaturedProducts(): Promise<FeaturedProduct[]> {
    const { data } = await this.db
      .from('featured_products')
      .select('*, product:products(*, images:product_images(*), seller:sellers(id, store_name, store_slug, store_logo))')
      .order('sort_order', { ascending: true });

    return data || [];
  }

  // === Seller Management ===
  async toggleSellerVerified(sellerId: string): Promise<void> {
    const { data: seller } = await this.db
      .from('sellers')
      .select('is_verified')
      .eq('id', sellerId)
      .single();

    if (seller) {
      await this.db
        .from('sellers')
        .update({ is_verified: !seller.is_verified })
        .eq('id', sellerId);
    }
  }

  async toggleSellerActive(sellerId: string): Promise<void> {
    const { data: seller } = await this.db
      .from('sellers')
      .select('is_active')
      .eq('id', sellerId)
      .single();

    if (seller) {
      await this.db
        .from('sellers')
        .update({ is_active: !seller.is_active })
        .eq('id', sellerId);
    }
  }

  async updateSellerSubscription(sellerId: string, tier: string): Promise<void> {
    await this.db
      .from('sellers')
      .update({ subscription_tier: tier })
      .eq('id', sellerId);
  }
}

export const adminService = new AdminService();
