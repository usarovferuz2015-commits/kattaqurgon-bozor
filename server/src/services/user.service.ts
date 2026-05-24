// ============================================
// User Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { User, UserUpdateInput } from '../types';

export class UserService {
  private get db() {
    return getSupabaseClient();
  }

  async findOrCreate(telegramId: number, data: Partial<User> = {}): Promise<User> {
    const { data: existing } = await this.db
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (existing) {
      if (data.first_name || data.username) {
        await this.update(telegramId, {
          first_name: data.first_name || existing.first_name,
          username: data.username || existing.username,
          last_seen_at: new Date().toISOString(),
        } as any);
      }
      return existing;
    }

    const newUser = {
      telegram_id: telegramId,
      username: data.username || null,
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      language_code: data.language_code || 'uz',
      role: 'user' as const,
      last_seen_at: new Date().toISOString(),
    };

    const { data: created, error } = await this.db
      .from('users')
      .insert(newUser)
      .select()
      .single();

    if (error) throw error;
    return created;
  }

  async getByTelegramId(telegramId: number): Promise<User | null> {
    const { data } = await this.db
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    return data;
  }

  async getById(id: string): Promise<User | null> {
    const { data } = await this.db
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async update(telegramId: number, updates: Partial<UserUpdateInput>): Promise<User> {
    const { data, error } = await this.db
      .from('users')
      .update(updates)
      .eq('telegram_id', telegramId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRole(telegramId: number, role: User['role']): Promise<void> {
    await this.db
      .from('users')
      .update({ role })
      .eq('telegram_id', telegramId);
  }

  async getAll(page = 1, limit = 20): Promise<{ data: User[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count } = await this.db
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data || [], total: count || 0 };
  }

  async getCount(): Promise<number> {
    const { count } = await this.db
      .from('users')
      .select('*', { count: 'exact', head: true });

    return count || 0;
  }

  async blockUser(telegramId: number): Promise<void> {
    await this.db
      .from('users')
      .update({ is_blocked: true })
      .eq('telegram_id', telegramId);
  }

  async unblockUser(telegramId: number): Promise<void> {
    await this.db
      .from('users')
      .update({ is_blocked: false })
      .eq('telegram_id', telegramId);
  }
}

export const userService = new UserService();
