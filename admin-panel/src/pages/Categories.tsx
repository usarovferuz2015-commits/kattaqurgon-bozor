import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiChevronRight, FiChevronDown } from 'react-icons/fi';

interface CategoriesProps {
  adminId: number;
}

export default function Categories({ adminId }: CategoriesProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name_uz: '',
    slug: '',
    icon: '',
    parent_id: '',
    sort_order: '0',
    description: '',
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/flat');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/categories', formData, {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Kategoriya qo\'shildi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { data } = await api.put(`/categories/${id}`, formData, {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Kategoriya tahrirlandi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Kategoriya o\'chirildi');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name_uz: form.name_uz,
      slug: form.slug || form.name_uz.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: form.icon || undefined,
      parent_id: form.parent_id || undefined,
      sort_order: parseInt(form.sort_order),
      description: form.description || undefined,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const editCategory = (cat: any) => {
    setEditing(cat);
    setForm({
      name_uz: cat.name_uz,
      slug: cat.slug,
      icon: cat.icon || '',
      parent_id: cat.parent_id || '',
      sort_order: String(cat.sort_order),
      description: cat.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name_uz: '', slug: '', icon: '', parent_id: '', sort_order: '0', description: '' });
  };

  function renderCategoryTree(items: any[], parentId: string | null = null, depth = 0): any[] {
    return items
      .filter((c: any) => c.parent_id === parentId)
      .flatMap((cat: any) => [
        <div
          key={cat.id}
          className="flex items-center justify-between py-2 px-3 hover:bg-dark-50 rounded-lg group"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <div className="flex items-center gap-2">
            <span>{cat.icon || '📁'}</span>
            <span className="text-sm font-medium">{cat.name_uz}</span>
            <span className="text-xs text-dark-400">({cat.product_count || 0})</span>
            {!cat.is_active && <span className="badge-red">Arxiv</span>}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => editCategory(cat)} className="p-1.5 hover:bg-dark-100 rounded">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button onClick={() => deleteMutation.mutate(cat.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>,
        ...renderCategoryTree(items, cat.id, depth + 1),
      ]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Kategoriyalar</h1>
          <p className="text-dark-500 text-sm mt-1">Barcha kategoriyalarni boshqaring</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Yangi kategoriya
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="font-bold mb-4">{editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomi (UZ) *</label>
              <input
                type="text"
                value={form.name_uz}
                onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="input-field"
                placeholder="Avtomatik yaratiladi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="input-field"
                placeholder="📁"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ota-kategoriya</label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                className="input-field"
              >
                <option value="">Yo'q (asosiy kategoriya)</option>
                {(categories || []).map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {'—'.repeat(cat.level)} {cat.name_uz}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tartib</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tavsif</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">
                {editing ? 'Saqlash' : 'Qo\'shish'}
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category list */}
      <div className="card">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 skeleton rounded-lg" />
            ))}
          </div>
        ) : !categories?.length ? (
          <p className="text-dark-400 text-center py-8">Kategoriyalar mavjud emas</p>
        ) : (
          <div className="divide-y">
            {renderCategoryTree(categories)}
          </div>
        )}
      </div>
    </div>
  );
}
