// ============================================
// Review (Rating & Comments) Service
// ============================================
import { getSupabaseClient } from './supabase';
import { config } from '../config';
import type { ProductReview, ReviewCreateInput } from '../types';

const MIGRATION_SQL = `
  CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, user_id)
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON product_reviews(product_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON product_reviews(user_id);

  ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0;
  ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
`;

let tableReady = false;

async function ensureReviewTables(): Promise<void> {
  if (tableReady) return;

  const supabase = getSupabaseClient();
  try {
    // Check if table already exists
    await supabase.from('product_reviews').select('id').limit(1);
    tableReady = true;
    return;
  } catch {
    // Table doesn't exist
  }

  // Try to create via direct SQL using DATABASE_URL
  if (!config.database.url) {
    console.warn(
      'DATABASE_URL topilmadi. Supabase SQL Editor da quyidagi SQL-ni ishga tushiring:\n' +
      MIGRATION_SQL
    );
    tableReady = true; // Don't retry, user needs to run migration manually
    return;
  }

  try {
    // Dynamic import for pg (ESM-safe)
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: config.database.url,
    });

    try {
      await pool.query(MIGRATION_SQL);
      console.log('product_reviews table created successfully');
      tableReady = true;
    } finally {
      await pool.end();
    }
  } catch (err: any) {
    console.error('Failed to run migration:', err.message);
    console.warn(
      'Jadval yaratishda xatolik. Supabase SQL Editor da quyidagi SQL-ni ishga tushiring:\n' +
      MIGRATION_SQL
    );
    tableReady = true; // Don't retry
  }
}

export class ReviewService {
  private get db() {
    return getSupabaseClient();
  }

  async getByProductId(productId: string): Promise<ProductReview[]> {
    await ensureReviewTables();

    const { data } = await this.db
      .from('product_reviews')
      .select(`
        *,
        user:users(first_name, username)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async create(input: ReviewCreateInput): Promise<ProductReview> {
    await ensureReviewTables();

    const { data: user } = await this.db
      .from('users')
      .select('id')
      .eq('telegram_id', input.telegram_id)
      .single();

    if (!user) {
      throw new Error("Foydalanuvchi topilmadi. Iltimos, avval ro'yxatdan o'ting.");
    }

    // Upsert: update if exists, insert if not
    const { data: review, error } = await this.db
      .from('product_reviews')
      .upsert(
        {
          product_id: input.product_id,
          user_id: user.id,
          rating: input.rating,
          comment: input.comment || null,
        },
        { onConflict: 'product_id, user_id' }
      )
      .select('*')
      .single();

    if (error) throw error;

    // Recalculate average rating
    await this.recalculateRating(input.product_id);

    return review;
  }

  async recalculateRating(productId: string): Promise<void> {
    const { data } = await this.db
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    const reviews = data || [];
    const count = reviews.length;
    const avg = count > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    await this.db
      .from('products')
      .update({
        avg_rating: Math.round(avg * 10) / 10,
        rating_count: count,
      })
      .eq('id', productId);
  }

  async getUserReview(productId: string, telegramId: number): Promise<ProductReview | null> {
    await ensureReviewTables();

    const { data: user } = await this.db
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (!user) return null;

    const { data } = await this.db
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', user.id)
      .single();

    return data;
  }

  async delete(reviewId: string, telegramId: number): Promise<void> {
    await ensureReviewTables();

    const { data: user } = await this.db
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (!user) throw new Error('Foydalanuvchi topilmadi');

    const { error } = await this.db
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (error) throw error;
  }
}

export const reviewService = new ReviewService();
