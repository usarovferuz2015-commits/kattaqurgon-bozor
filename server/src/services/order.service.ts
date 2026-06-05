// ============================================
// Order Service
// ============================================
import { getSupabaseClient } from './supabase';

export const orderService = {
  async create(data: {
    buyer_telegram_id: number;
    buyer_phone: string;
    seller_telegram_id: number;
    seller_id?: string;
    total_amount: number;
    items: { product_id: string; product_name: string; quantity: number; price: number }[];
  }) {
    const db = getSupabaseClient();

    const { data: order, error } = await db
      .from('orders')
      .insert({
        buyer_telegram_id: data.buyer_telegram_id,
        buyer_phone: data.buyer_phone,
        seller_telegram_id: data.seller_telegram_id,
        seller_id: data.seller_id,
        total_amount: data.total_amount,
      })
      .select()
      .single();
    if (error) throw error;

    const items = data.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
    }));

    await db.from('order_items').insert(items);

    return order;
  },

  async getBySeller(sellerTelegramId: number) {
    const db = getSupabaseClient();
    const { data: orders, error } = await db
      .from('orders')
      .select('*')
      .eq('seller_telegram_id', sellerTelegramId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;

    if (!orders?.length) return [];

    const orderIds = orders.map(o => o.id);
    const { data: allItems } = await db
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    return orders.map(order => ({
      ...order,
      items: (allItems || []).filter(i => i.order_id === order.id),
    }));
  },

  async updateStatus(id: string, status: string, sellerTelegramId: number) {
    const db = getSupabaseClient();
    const { data, error } = await db
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('seller_telegram_id', sellerTelegramId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
