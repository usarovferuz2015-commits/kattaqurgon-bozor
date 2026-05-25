// ============================================
// Analytics Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { DailyStats, DashboardStats } from '../types';

export class AnalyticsService {
  private get db() {
    return getSupabaseClient();
  }

  async logPageView(data: {
    user_id?: string;
    telegram_id?: number;
    product_id?: string;
    seller_id?: string;
    category_id?: string;
    page_type: string;
    session_id?: string;
    referrer?: string;
    device_type?: string;
  }): Promise<void> {
    await this.db.from('page_views').insert(data);
  }

  async logEvent(data: {
    user_id?: string;
    telegram_id?: number;
    event_type: string;
    product_id?: string;
    seller_id?: string;
    category_id?: string;
    metadata?: Record<string, unknown>;
    session_id?: string;
  }): Promise<void> {
    await this.db.from('events_log').insert(data);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalUsers,
      totalSellers,
      totalProducts,
      todayStats,
      topProducts,
      topSellers,
    ] = await Promise.all([
      this.db.from('users').select('*', { count: 'exact', head: true }),
      this.db.from('sellers').select('*', { count: 'exact', head: true }),
      this.db.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      this.db.from('daily_stats').select('*').eq('date', today).single(),
      this.db.from('products')
        .select(`
          *,
          images:product_images(*),
          seller:sellers(id, store_name, store_slug, store_logo, is_verified, telegram_id, user:users(username))
        `)
        .eq('status', 'active')
        .order('views_count', { ascending: false })
        .limit(10),
      this.db.from('sellers')
        .select('*')
        .eq('is_active', true)
        .order('total_views', { ascending: false })
        .limit(10),
    ]);

    const activeUsersToday = await this.db
      .from('page_views')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', today);

    const totalCartAdds = await this.db
      .from('events_log')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'cart_add')
      .gte('created_at', today);

    const totalFavorites = await this.db
      .from('favorites')
      .select('*', { count: 'exact', head: true });

    return {
      total_users: totalUsers.count || 0,
      active_users_today: activeUsersToday.count || 0,
      total_sellers: totalSellers.count || 0,
      total_products: totalProducts.count || 0,
      total_views: (todayStats.data as any)?.total_views || 0,
      total_cart_adds: totalCartAdds.count || 0,
      total_favorites: totalFavorites.count || 0,
      daily_stats: todayStats.data as DailyStats,
      growth: {
        users_growth: 0,
        sellers_growth: 0,
        products_growth: 0,
        views_growth: 0,
      },
      top_products: topProducts.data || [],
      top_categories: [],
      top_sellers: topSellers.data || [],
      ad_performance: {
        total_ads: 0,
        active_ads: 0,
        total_clicks: 0,
        total_impressions: 0,
      },
    };
  }

  async getDailyStats(days = 30): Promise<DailyStats[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data } = await this.db
      .from('daily_stats')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true });

    return data || [];
  }

  async updateDailyStats(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const [
      { count: newUsers },
      { count: newSellers },
      { count: newProducts },
      { count: totalViews },
      { count: totalCartAdds },
    ] = await Promise.all([
      this.db.from('users').select('*', { count: 'exact', head: true }).gte('created_at', today),
      this.db.from('sellers').select('*', { count: 'exact', head: true }).gte('created_at', today),
      this.db.from('products').select('*', { count: 'exact', head: true }).gte('created_at', today),
      this.db.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', today),
      this.db.from('events_log').select('*', { count: 'exact', head: true }).eq('event_type', 'cart_add').gte('created_at', today),
    ]);

    const { data: existing } = await this.db
      .from('daily_stats')
      .select('id')
      .eq('date', today)
      .single();

    if (existing) {
      await this.db
        .from('daily_stats')
        .update({
          new_users: newUsers || 0,
          new_sellers: newSellers || 0,
          new_products: newProducts || 0,
          total_views: totalViews || 0,
          total_cart_adds: totalCartAdds || 0,
        })
        .eq('id', existing.id);
    } else {
      await this.db
        .from('daily_stats')
        .insert({
          date: today,
          new_users: newUsers || 0,
          new_sellers: newSellers || 0,
          new_products: newProducts || 0,
          total_views: totalViews || 0,
          total_cart_adds: totalCartAdds || 0,
        });
    }
  }

  async getCategoryTrends(): Promise<{ category: string; views: number; products: number }[]> {
    const { data } = await this.db
      .from('categories')
      .select(`
        id,
        name_uz,
        product_count,
        page_views!inner(count)
      `)
      .eq('is_active', true)
      .order('product_count', { ascending: false })
      .limit(10);

    return (data || []).map((c: any) => ({
      category: c.name_uz,
      views: c.page_views?.count || 0,
      products: c.product_count,
    }));
  }
}

export const analyticsService = new AnalyticsService();
