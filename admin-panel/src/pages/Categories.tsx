import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

interface CategoriesProps {
  adminId: number;
}

export default function Categories({ adminId }: CategoriesProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({
    name_uz: '', slug: '', icon: '', parent_id: '', sort_order: '0', description: '',
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
      name_uz: cat.name_uz, slug: cat.slug, icon: cat.icon || '',
      parent_id: cat.parent_id || '', sort_order: String(cat.sort_order), description: cat.description || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name_uz: '', slug: '', icon: '', parent_id: '', sort_order: '0', description: '' });
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  function renderCategoryTree(items: any[], parentId: string | null = null, depth = 0): any[] {
    const children = items.filter((c: any) => c.parent_id === parentId);
    if (!children.length && depth > 0) return [];

    return children.flatMap((cat: any) => {
      const hasChildren = items.some((c: any) => c.parent_id === cat.id);
      const isExpanded = expanded.has(cat.id);

      return [
        <div
          key={cat.id}
          className={`flex items-center justify-between px-4 py-3 transition-colors animate-fade-in
            ${depth === 0 ? 'bg-white/50 border-b border-dark-100/50' : 'hover:bg-dark-50/50'}
          `}
        >
          <div
            className="flex items-center gap-2.5 flex-1 cursor-pointer"
            style={{ paddingLeft: `${depth * 20}px` }}
            onClick={() => hasChildren && toggleExpand(cat.id)}
          >
            {hasChildren ? (
              isExpanded ? <FiChevronDown className="w-4 h-4 text-dark-400" /> : <FiChevronRight className="w-4 h-4 text-dark-400" />
            ) : (
              <div className="w-4" />
            )}
            <span className="text-lg flex-shrink-0">{cat.icon || '📁'}</span>
            <div>
              <span className="text-sm font-medium text-dark-900">{cat.name_uz}</span>
              <span className="text-xs text-dark-400 ml-2">({cat.product_count || 0})</span>
            </div>
            {!cat.is_active && <span className="badge-red text-[10px]">Arxiv</span>}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => editCategory(cat)}
              className="btn-ghost p-2 rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteMutation.mutate(cat.id)}
              className="btn-ghost p-2 rounded-lg hover:bg-red-50 hover:text-red-600"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>,
        ...(hasChildren && isExpanded ? renderCategoryTree(items, cat.id, depth + 1) : []),
      ];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <PageHeader
        title="Kategoriyalar"
        subtitle="Barcha kategoriyalarni boshqaring"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2 py-2.5 px-4">
            <FiPlus className="w-4 h-4" /> Yangi
          </button>
        }
      />
      <div className="page-container pt-5 space-y-4">
        {showForm && (
          <div className="card animate-scale-in border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {editing ? <FiEdit2 className="w-4 h-4 text-white" /> : <FiPlus className="w-4 h-4 text-white" />}
            </div>
            <h2 className="font-bold text-dark-900">{editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Nomi (UZ) *</label>
              <input type="text" value={form.name_uz} onChange={(e) => setForm({ ...form, name_uz: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="Avtomatik yaratiladi" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Icon (emoji)</label>
              <input type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" placeholder="📁" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Ota-kategoriya</label>
              <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="input-field">
                <option value="">Yo'q (asosiy kategoriya)</option>
                {(categories || []).map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{'—'.repeat(cat.level)} {cat.name_uz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Tartib</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Tavsif</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="btn-primary">{editing ? 'Saqlash' : 'Qo\'shish'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      {/* Category tree */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-dark-100/50 bg-dark-50/30">
          <div className="flex items-center gap-2">
            <FiFolder className="w-4 h-4 text-dark-400" />
            <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Kategoriyalar ({categories?.length || 0})
            </span>
          </div>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-12 rounded-lg" style={{ animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
        ) : !categories?.length ? (
          <div className="text-center py-12 text-dark-400 text-sm">
            <FiFolder className="w-8 h-8 mx-auto mb-2 text-dark-300" />
            Kategoriyalar mavjud emas
          </div>
        ) : (
          <div className="divide-y divide-dark-100/50">
            {renderCategoryTree(categories, null, 0)}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
