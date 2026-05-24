// ============================================
// Supabase Client
// ============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });
  }
  return supabase;
}

export function createAnonClient(): SupabaseClient {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function setUserContext(telegramId: number, isAdminUser: boolean = false) {
  const client = getSupabaseClient();
  await client.rpc('set_config', {
    key: 'app.telegram_id',
    value: String(telegramId),
  });
  if (isAdminUser) {
    await client.rpc('set_config', {
      key: 'app.is_admin',
      value: 'true',
    });
  }
}
