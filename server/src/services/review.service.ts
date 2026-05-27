// ============================================
// Review (Rating & Comments) Service
// ============================================
// Requires the following Supabase table:
// 
//   CREATE TABLE IF NOT EXISTS product_reviews (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
//     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//     rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
//     comment TEXT,
//     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
//     UNIQUE(product_id, user_id)
//   );
//   ALTER TABLE products ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT 0;
//   ALTER TABLE products ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
//
// ============================================
import { getSupabaseClient } from './supabase';
import type { ProductReview, ReviewCreateInput } from '../types';

export class ReviewService {
  private get db() {
    return getSupabaseClient();
  }

  async getByProductId(productId: string): Promise<ProductReview[]> {
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
    const { data: user } = await this.db
      .from('users')
      .select('id')
      .eq('telegram_id', input.telegram_id)
      .single();

    if (!user) {
      throw new Error('Foydalanuvchi topilmadi. Iltimos, avval ro\'yxatdan o\'ting.');
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
