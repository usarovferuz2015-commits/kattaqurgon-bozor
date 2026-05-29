// ============================================
// Supabase & Database Client
// ============================================
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { config } from '../config';
 
let supabaseAdmin: SupabaseClient;
let pgPool: Pool;
 
/**
 * Client for administrative tasks. 
 * WARNING: Bypasses all Row Level Security (RLS) policies.
 * Use ONLY for system-level operations.
 */
export function getAdminClient(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' },
    });
  }
  return supabaseAdmin;
}
 
/**
 * Client for user-level tasks.
 * Respects Row Level Security (RLS) policies.
 */
export function getUserClient(): SupabaseClient {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
 
/**
 * Raw PG Pool for operations requiring session-level context (RLS).
 */
export function getPgPool(): Pool {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pgPool;
}
 
/**
 * Executes a query with a specific user context to enforce RLS.
 * This is the ONLY secure way to use the custom Telegram Auth with Supabase RLS.
 */
export async function executeUserQuery<T>(
  telegramId: number, 
  isAdmin: boolean, 
  queryFn: (client: any) => Promise<T>
): Promise<T> {
  const pool = getPgPool();
  const client = await pool.connect();
  
  try {
    // Use parameterized queries to prevent SQL injection
    await client.query('SELECT set_config($1, $2, false)', ['app.telegram_id', String(telegramId)]);
    await client.query('SELECT set_config($1, $2, false)', ['app.is_admin', String(isAdmin)]);
    
    return await queryFn(client);
  } finally {
    client.release();
  }
}
 
// Maintain backward compatibility for now, but point to Admin Client
export function getSupabaseClient(): SupabaseClient {
  return getAdminClient();
}
