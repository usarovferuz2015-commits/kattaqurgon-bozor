// ============================================
// Cart Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { Cart, CartItem } from '../types';

export class CartService {
  private get db() {
    return getSupabaseClient();
  }

  async getOrCreateCart(userId: string, telegramId: number): Promise<Cart> {
    const { data: existing } = await this.db
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(
            *,
            images:product_images(*),
            seller:sellers(id, store_name, store_slug, store_logo, is_verified)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existing) {
      await this.db
        .from('carts')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', existing.id);

      return existing;
    }

    const { data: cart, error } = await this.db
      .from('carts')
      .insert({
        user_id: userId,
        telegram_id: telegramId,
        status: 'active',
        total_items: 0,
        total_amount: 0,
      })
      .select(`
        *,
        items:cart_items(*)
      `)
      .single();

    if (error) throw error;
    return { ...cart, items: [] };
  }

  async addItem(userId: string, telegramId: number, productId: string, quantity = 1, variantId?: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, telegramId);

    const { data: product } = await this.db
      .from('products')
      .select('price, name_uz')
      .eq('id', productId)
      .single();

    if (!product) throw new Error('Product not found');

    const existingItem = cart.items?.find(
      (item: CartItem) => item.product_id === productId && item.variant_id === (variantId || null)
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      const totalPrice = product.price * newQty;

      await this.db
        .from('cart_items')
        .update({
          quantity: newQty,
          total_price: totalPrice,
        })
        .eq('id', existingItem.id);
    } else {
      await this.db
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId || null,
          quantity,
          price_at_add: product.price,
          total_price: product.price * quantity,
        });
    }

    await this.updateCartTotals(cart.id);

    await this.db.from('events_log').insert({
      user_id: userId,
      telegram_id: telegramId,
      event_type: 'cart_add',
      product_id: productId,
      metadata: { quantity, variant_id: variantId },
    });

    await this.db
      .from('products')
      .update({ cart_adds_count: this.db.rpc('increment', { x: 1 }) })
      .eq('id', productId);

    return this.getOrCreateCart(userId, telegramId);
  }

  async removeItem(userId: string, itemId: string): Promise<Cart> {
    const { data: item } = await this.db
      .from('cart_items')
      .select('cart_id, product_id')
      .eq('id', itemId)
      .single();

    if (!item) throw new Error('Item not found');

    await this.db
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    await this.updateCartTotals(item.cart_id);

    const { data: cart } = await this.db
      .from('carts')
      .select('user_id')
      .eq('id', item.cart_id)
      .single();

    return this.getOrCreateCart(cart!.user_id, 0);
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<Cart> {
    const { data: item } = await this.db
      .from('cart_items')
      .select('cart_id, price_at_add, product_id')
      .eq('id', itemId)
      .single();

    if (!item) throw new Error('Item not found');

    const totalPrice = item.price_at_add * quantity;

    await this.db
      .from('cart_items')
      .update({ quantity, total_price: totalPrice })
      .eq('id', itemId);

    await this.updateCartTotals(item.cart_id);

    const { data: cart } = await this.db
      .from('carts')
      .select('user_id')
      .eq('id', item.cart_id)
      .single();

    return this.getOrCreateCart(cart!.user_id, 0);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateCart(userId, 0);

    await this.db
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    await this.db
      .from('carts')
      .update({
        total_items: 0,
        total_amount: 0,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', cart.id);

    return { ...cart, items: [] };
  }

  private async updateCartTotals(cartId: string): Promise<void> {
    const { data: items } = await this.db
      .from('cart_items')
      .select('quantity, total_price')
      .eq('cart_id', cartId);

    const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalAmount = items?.reduce((sum, item) => sum + Number(item.total_price), 0) || 0;

    await this.db
      .from('carts')
      .update({
        total_items: totalItems,
        total_amount: totalAmount,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', cartId);
  }

  async getAbandonedCarts(hoursThreshold = 24): Promise<any[]> {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();

    const { data } = await this.db
      .from('carts')
      .select(`
        *,
        user:users(id, telegram_id, username, first_name),
        items:cart_items(
          *,
          product:products(id, name_uz, price, slug)
        )
      `)
      .eq('status', 'active')
      .lt('last_activity_at', threshold)
      .gt('total_items', 0);

    return data || [];
  }

  async markAbandoned(hoursThreshold = 24): Promise<void> {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000).toISOString();

    await this.db
      .from('carts')
      .update({ status: 'abandoned' })
      .eq('status', 'active')
      .lt('last_activity_at', threshold)
      .gt('total_items', 0);
  }
}

export const cartService = new CartService();
