// ============================================
// Category Service
// ============================================
import { getSupabaseClient } from './supabase';
import type { Category, CategoryCreateInput, CategoryUpdateInput } from '../types';

export class CategoryService {
  private get db() {
    return getSupabaseClient();
  }

  async create(data: CategoryCreateInput): Promise<Category> {
    const { data: category, error } = await this.db
      .from('categories')
      .insert({
        name_uz: data.name_uz,
        name_ru: data.name_ru || null,
        name_en: data.name_en || null,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        image_url: data.image_url || null,
        parent_id: data.parent_id || null,
        sort_order: data.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return category;
  }

  async getAll(): Promise<Category[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    return data || [];
  }

  async getActive(): Promise<Category[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return data || [];
  }

  async getById(id: string): Promise<Category | null> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    return data;
  }

  async getChildren(parentId: string): Promise<Category[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('sort_order', { ascending: true });

    return data || [];
  }

  async getRootCategories(): Promise<Category[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    return data || [];
  }

  async update(id: string, updates: CategoryUpdateInput): Promise<Category> {
    const { data, error } = await this.db
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const children = await this.getChildren(id);
    for (const child of children) {
      await this.delete(child.id);
    }

    await this.db
      .from('products')
      .update({ category_id: null })
      .eq('category_id', id);

    const { error } = await this.db
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getTree(): Promise<Category[]> {
    const all = await this.getActive();
    return this.buildTree(all);
  }

  private buildTree(categories: Category[], parentId: string | null = null): Category[] {
    return categories
      .filter(c => c.parent_id === parentId)
      .map(c => ({
        ...c,
        children: this.buildTree(categories, c.id),
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async getFeatured(): Promise<Category[]> {
    const { data } = await this.db
      .from('categories')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(8);

    return data || [];
  }

  async getBreadcrumb(categoryId: string): Promise<Category[]> {
    const breadcrumb: Category[] = [];
    let current = await this.getById(categoryId);

    while (current) {
      breadcrumb.unshift(current);
      if (current.parent_id) {
        current = await this.getById(current.parent_id);
      } else {
        break;
      }
    }

    return breadcrumb;
  }
}

export const categoryService = new CategoryService();
