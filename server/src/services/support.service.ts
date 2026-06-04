// ============================================
// Support Ticket Service
// ============================================
import { getSupabaseClient } from './supabase';

export const supportService = {
  async create(data: {
    telegram_id: number;
    user_id?: string;
    subject: string;
    message: string;
    screenshot_url?: string;
    page_url?: string;
    device_info?: string;
  }) {
    const db = getSupabaseClient();
    const { data: ticket, error } = await db
      .from('support_tickets')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return ticket;
  },

  async getAll(filters?: { status?: string; page?: number; limit?: number }) {
    const db = getSupabaseClient();
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = db
      .from('support_tickets')
      .select('*', { count: 'exact' });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return { data: data || [], total: count || 0, page, limit };
  },

  async updateStatus(id: string, status: string, adminResponse?: string) {
    const db = getSupabaseClient();
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (adminResponse) updateData.admin_response = adminResponse;

    const { data, error } = await db
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const db = getSupabaseClient();
    const { data, error } = await db
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByTelegramId(telegramId: number) {
    const db = getSupabaseClient();
    const { data, error } = await db
      .from('support_tickets')
      .select('*')
      .eq('telegram_id', telegramId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data || [];
  },
};
