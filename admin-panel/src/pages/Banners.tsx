import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

interface BannersProps {
  adminId: number;
}

export default function Banners({ adminId }: BannersProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title_uz: '', subtitle_uz: '', image_url: '', link_type: 'product',
    link_value: '', sort_order: '0', bg_color: '#16a34a', button_text_uz: 'Batafsil',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/banners', { headers: { 'X-Telegram-Id': adminId } });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/admin/banners', formData, { headers: { 'X-Telegram-Id': adminId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner qo\'shildi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { data } = await api.put(`/admin/banners/${id}`, formData, { headers: { 'X-Telegram-Id': adminId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner tahrirlandi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/banners/${id}`, { headers: { 'X-Telegram-Id': adminId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner o\'chirildi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, sort_order: parseInt(form.sort_order) };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const editBanner = (banner: any) => {
    setEditing(banner);
    setForm({
      title_uz: banner.title_uz, subtitle_uz: banner.subtitle_uz || '',
      image_url: banner.image_url, link_type: banner.link_type,
      link_value: banner.link_value || '', sort_order: String(banner.sort_order || 0),
      bg_color: banner.bg_color || '#16a34a', button_text_uz: banner.button_text_uz || 'Batafsil',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title_uz: '', subtitle_uz: '', image_url: '', link_type: 'product',
      link_value: '', sort_order: '0', bg_color: '#16a34a', button_text_uz: 'Batafsil' });
  };

  const banners = data || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Bannerlar</h1>
          <p className="text-sm text-dark-500 mt-1">Marketplace bannerlarini boshqaring</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Yangi banner
        </button>
      </div>

      {showForm && (
        <div className="card animate-scale-in border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {editing ? <FiEdit2 className="w-4 h-4 text-white" /> : <FiPlus className="w-4 h-4 text-white" />}
            </div>
            <h2 className="font-bold text-dark-900">{editing ? 'Bannerni tahrirlash' : 'Yangi banner'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Sarlavha *</label>
              <input type="text" value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rasm URL *</label>
              <div className="flex gap-3">
                <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field flex-1" required />
                {form.image_url && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-dark-200 flex-shrink-0">
                    <img src={form.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Subtitle</label>
              <input type="text" value={form.subtitle_uz} onChange={(e) => setForm({ ...form, subtitle_uz: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Fon rangi</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="w-12 h-12 rounded-xl border border-dark-200 cursor-pointer" />
                <span className="text-xs text-dark-400">{form.bg_color}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Havola turi</label>
              <select value={form.link_type} onChange={(e) => setForm({ ...form, link_type: e.target.value })} className="input-field">
                <option value="product">Mahsulot</option><option value="category">Kategoriya</option>
                <option value="seller">Sotuvchi</option><option value="external">Tashqi sayt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Havola qiymati</label>
              <input type="text" value={form.link_value} onChange={(e) => setForm({ ...form, link_value: e.target.value })} className="input-field" placeholder="slug yoki URL" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Saqlash' : 'Qo\'shish'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse"><div className="skeleton h-24 rounded-xl" /></div>
          ))
        ) : banners.length === 0 ? (
          <div className="card text-center py-12">
            <FiImage className="w-10 h-10 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">Bannerlar mavjud emas</p>
          </div>
        ) : (
          banners.map((banner: any, idx: number) => (
            <div key={banner.id} className="card flex gap-4 items-center animate-slide-up card-hover" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-dark-100 flex-shrink-0 shadow-sm" style={{ backgroundColor: banner.bg_color || '#16a34a' }}>
                <img src={banner.image_url} alt="" className="w-full h-full object-cover opacity-80" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-dark-900">{banner.title_uz}</h3>
                {banner.subtitle_uz && <p className="text-xs text-dark-400 mt-0.5">{banner.subtitle_uz}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge-blue text-[10px]">{banner.link_type}</span>
                  {banner.sort_order > 0 && <span className="text-[10px] text-dark-400">Tartib: {banner.sort_order}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editBanner(banner)} className="btn-ghost p-2 rounded-lg hover:bg-primary-50 hover:text-primary-600">
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteMutation.mutate(banner.id)} className="btn-ghost p-2 rounded-lg hover:bg-red-50 hover:text-red-600">
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
