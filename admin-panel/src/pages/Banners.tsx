import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiUpload, FiX } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

interface BannersProps {
  adminId: number;
}

export default function Banners({ adminId }: BannersProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title_uz: '', subtitle_uz: '', image_url: '', link_type: 'product',
    link_value: '', sort_order: '0', bg_color: '#16a34a', button_text_uz: 'Batafsil',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data } = await api.get('/admin/banners');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/admin/banners', formData);
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
      const { data } = await api.put(`/admin/banners/${id}`, formData);
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
      await api.delete(`/admin/banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner o\'chirildi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error('Rasm yuklash yoki URL kiritish majburiy');
      return;
    }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        try {
          const { data } = await api.post('/upload', { file: reader.result });
          if (data.success && data.data?.url) {
            setForm({ ...form, image_url: data.data.url });
            toast.success('Rasm yuklandi!');
          } else {
            toast.error(data.error || 'Rasm yuklashda xatolik');
          }
        } catch (err: any) {
          toast.error(err.response?.data?.error || 'Serverga ulanishda xatolik');
        } finally {
          setUploadingImage(false);
        }

    };
  };

  const banners = data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <PageHeader
        title="Bannerlar"
        subtitle="Marketplace bannerlarini boshqaring"
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
            <h2 className="font-bold text-dark-900">{editing ? 'Bannerni tahrirlash' : 'Yangi banner'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Sarlavha *</label>
              <input type="text" value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} className="input-field" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rasm *</label>
              <div className="space-y-3">
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${uploadingImage ? 'border-primary-300 bg-primary-50' : 'border-dark-200 hover:border-primary-400 hover:bg-primary-50/50'}`}>
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
                        <p className="text-sm font-medium text-primary-600">Yuklanmoqda...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FiUpload className="w-6 h-6 text-dark-400" />
                        <p className="text-sm font-medium text-dark-600">Rasm yuklash</p>
                        <p className="text-xs text-dark-400">Kompyuter yoki telefondan rasm tanlang</p>
                      </div>
                    )}
                  </div>
                </label>

                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-dark-200 bg-dark-50">
                    <img src={form.image_url} alt="" className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600">
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <details className="group">
                  <summary className="text-xs text-dark-400 cursor-pointer hover:text-primary-600 transition-colors font-medium">
                    Yoki rasm URL manzilini kiriting
                  </summary>
                  <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field mt-2 text-sm" placeholder="https://example.com/rasm.jpg" />
                </details>
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
              <input type="text" value={form.link_value} onChange={(e) => setForm({ ...form, link_value: e.target.value })} className="input-field" placeholder={form.link_type === 'seller' ? "store_slug (sotuvchi slug)" : form.link_type === 'product' ? "product_slug" : form.link_type === 'category' ? "category_slug" : "URL"} />
              <p className="text-[10px] text-dark-400 mt-1">
                {form.link_type === 'seller' ? 'Sotuvchi do\'konining slug manzili' : 'Qayerga o\'tishi kerak'}
              </p>
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
    </div>
  );
}
