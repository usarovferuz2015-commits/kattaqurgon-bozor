// ============================================
// API Validation Schemas
// ============================================
import { z } from 'zod';

export const AuthSchema = {
  init: z.object({
    body: z.object({
      initData: z.string().min(1, 'initData is required'),
    }),
  }),
};

export const ProductSchema = {
  create: z.object({
    body: z.object({
      name_uz: z.string().min(1, 'Mahsulot nomi kerak'),
      price: z.number().positive('Narx musbat bo\'lishi kerak'),
      category_id: z.string().uuid().optional(),
      description_uz: z.string().optional(),
      quantity: z.number().int().min(0).optional(),
      unit: z.string().optional(),
      is_negotiable: z.boolean().optional(),
      is_wholesale: z.boolean().optional(),
      wholesale_min_qty: z.number().int().min(0).optional(),
      wholesale_price: z.number().positive().optional(),
      images: z.array(z.object({
        url: z.string().url(),
        alt_text: z.string().optional(),
        is_primary: z.boolean().optional(),
      })).optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      name_uz: z.string().min(1).optional(),
      price: z.number().positive().optional(),
      category_id: z.string().uuid().optional(),
      description_uz: z.string().optional(),
      quantity: z.number().int().min(0).optional(),
      status: z.enum(['active', 'inactive', 'archived', 'pending']).optional(),
      images: z.array(z.object({
        url: z.string().url(),
        alt_text: z.string().optional(),
        is_primary: z.boolean().optional(),
      })).optional(),
    }),
  }),
};

export const SellerSchema = {
  register: z.object({
    body: z.object({
      store_name: z.string().min(2, 'Do\'kon nomi kamida 2 ta belgi bo\'lishi kerak'),
      store_slug: z.string().min(2).optional(),
      store_description: z.string().optional(),
      store_address: z.string().optional(),
      store_phone: z.string().optional(),
      store_logo: z.string().url().optional(),
    }),
  }),
  update: z.object({
    body: z.object({
      store_name: z.string().min(2).optional(),
      store_description: z.string().optional(),
      store_address: z.string().optional(),
      store_phone: z.string().optional(),
      store_logo: z.string().url().optional(),
    }),
  }),
};

export const ReviewSchema = {
  create: z.object({
    body: z.object({
      product_id: z.string().uuid('Noto\'g\'ri mahsulot ID'),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(1000).optional(),
    }),
  }),
};
