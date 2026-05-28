// ============================================
// Seller Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { Seller, SellerCreateInput, SellerUpdateInput } from '../types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    + '-' + Math.random().toString(36).substring(2, 6);
}

export class SellerService {
  private get db() {
    return getSupabaseClient();
  }

  async create(telegramId: number, userId: string, data: SellerCreateInput): Promise<Seller> {
    const slug = data.store_slug || generateSlug(data.store_name);

    const { data: seller, error } = await this.db
      .from('sellers')
      .insert({
        user_id: userId,
        telegram_id: telegramId,
        store_name: data.store_name,
        store_slug: slug,
        store_description: data.store_description || null,
        store_address: data.store_address || null,
        store_phone: data.store_phone || null,
        store_logo: data.store_logo || null,
      })
      .select()
      .single();

    if (error) throw error;

    await this.db
      .from('users')
      .update({ role: 'seller' })
      .eq('telegram_id', telegramId);

    return seller;
  }

  async getByTelegramId(telegramId: number): Promise<Seller | null> {
    const { data } = await this.db
      .from('sellers')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    return data;
  }

  async getById(id: string): Promise<Seller | null> {
    const { data } = await this.db
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async getBySlug(slug: string): Promise<Seller | null> {
    const { data } = await this.db
      .from('sellers')
      .select('*')
      .eq('store_slug', slug)
      .single();

    return data;
  }

  async update(telegramId: number, updates: SellerUpdateInput): Promise<Seller> {
    const { data, error } = await this.db
      .from('sellers')
      .update(updates)
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAll(page = 1, limit = 20): Promise<{ data: Seller[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await this.db
      .from('sellers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data || [], total: count || 0 };
  }

  async getActiveSellers(): Promise<Seller[]> {
    const { data } = await this.db
      .from('sellers')
      .select('*')
      .eq('is_active', true)
      .order('total_products', { ascending: false });

    return data || [];
  }

  async getTopSellers(limit = 10): Promise<Seller[]> {
    const { data } = await this.db
      .from('sellers')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async getCount(): Promise<number> {
    const { count } = await this.db
      .from('sellers')
      .select('*', { count: 'exact', head: true });

    return count || 0;
  }

  async toggleVerify(telegramId: number): Promise<Seller> {
    const seller = await this.getByTelegramId(telegramId);
    if (!seller) throw new Error('Seller not found');

    const { data, error } = await this.db
      .from('sellers')
      .update({ is_verified: !seller.is_verified })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleActive(telegramId: number): Promise<Seller> {
    const seller = await this.getByTelegramId(telegramId);
    if (!seller) throw new Error('Seller not found');

    const { data, error } = await this.db
      .from('sellers')
      .update({ is_active: !seller.is_active })
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    // Delete all products of this seller
    await this.db.from('products').delete().eq('seller_id', id);
    // Delete the seller
    const { error } = await this.db.from('sellers').delete().eq('id', id);
    if (error) throw error;
  }
}

export const sellerService = new SellerService();
