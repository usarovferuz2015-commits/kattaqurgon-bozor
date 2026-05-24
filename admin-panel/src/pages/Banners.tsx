import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface BannersProps {
  adminId: number;
}

export default function Banners({ adminId }: BannersProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title_uz: '',
    subtitle_uz: '',
    image_url: '',
    link_type: 'product',
    link_value: '',
    sort_order: '0',
    bg_color: '#16a34a',
    button_text_uz: 'Batafsil',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/banners', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/admin/banners', formData, {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner qo\'shildi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/banners/${id}`, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner o\'chirildi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      sort_order: parseInt(form.sort_order),
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      title_uz: '', subtitle_uz: '', image_url: '',
      link_type: 'product', link_value: '', sort_order: '0',
      bg_color: '#16a34a', button_text_uz: 'Batafsil',
    });
  };

  const banners = data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bannerlar</h1>
          <p className="text-dark-500 text-sm mt-1">Marketplace bannerlarini boshqaring</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" /> Yangi banner
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-bold mb-4">Yangi banner</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Sarlavha *</label>
              <input
                type="text"
                value={form.title_uz}
                onChange={(e) => setForm({ ...form, title_uz: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Rasm URL *</label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle_uz}
                onChange={(e) => setForm({ ...form, subtitle_uz: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fon rangi</label>
              <input
                type="color"
                value={form.bg_color}
                onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                className="input-field h-10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Havola turi</label>
              <select
                value={form.link_type}
                onChange={(e) => setForm({ ...form, link_type: e.target.value })}
                className="input-field"
              >
                <option value="product">Mahsulot</option>
                <option value="category">Kategoriya</option>
                <option value="seller">Sotuvchi</option>
                <option value="external">Tashqi sayt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Havola qiymati</label>
              <input
                type="text"
                value={form.link_value}
                onChange={(e) => setForm({ ...form, link_value: e.target.value })}
                className="input-field"
                placeholder="slug yoki URL"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Qo'shish</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      {/* Banner list */}
      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-24 skeleton" />
          ))
        ) : banners.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-dark-400">Bannerlar mavjud emas</p>
          </div>
        ) : (
          banners.map((banner: any) => (
            <div key={banner.id} className="card flex gap-4 items-center">
              <div className="w-24 h-16 rounded-lg overflow-hidden bg-dark-100 flex-shrink-0">
                <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{banner.title_uz}</h3>
                <p className="text-xs text-dark-400 mt-0.5">{banner.subtitle_uz}</p>
                <span className="badge-blue text-xs mt-1 inline-block">{banner.link_type}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 hover:bg-dark-100 rounded"><FiEdit2 className="w-4 h-4" /></button>
                <button
                  onClick={() => deleteMutation.mutate(banner.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-500"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
