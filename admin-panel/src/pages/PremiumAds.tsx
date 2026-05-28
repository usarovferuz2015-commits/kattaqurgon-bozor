import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiBarChart2, FiClock, FiTarget, FiPlus, FiEdit2, FiUpload, FiX } from 'react-icons/fi';

interface PremiumAdsProps {
  adminId: number;
}

export default function PremiumAds({ adminId }: PremiumAdsProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title_uz: '', position: 'featured', status: 'active',
    image_url: '', link_url: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ads', { headers: { 'X-Telegram-Id': adminId } });
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/admin/ads', formData, { headers: { 'X-Telegram-Id': adminId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast.success('Reklama qo\'shildi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { data } = await api.put(`/admin/ads/${id}`, formData, { headers: { 'X-Telegram-Id': adminId } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast.success('Reklama tahrirlandi');
      resetForm();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/ads/${id}`, { headers: { 'X-Telegram-Id': adminId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast.success('Reklama o\'chirildi');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateMutation.mutate({ id: editing.id, ...form });
    else createMutation.mutate(form);
  };

  const editAd = (ad: any) => {
    setEditing(ad);
    setForm({
      title_uz: ad.title_uz, position: ad.position, status: ad.status,
      image_url: ad.image_url || '', link_url: ad.link_url || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ title_uz: '', position: 'featured', status: 'active', image_url: '', link_url: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Rasm hajmi 5MB dan oshmasligi kerak'); return; }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result }),
        });
        const json = await res.json();
        if (json.success && json.data?.url) {
          setForm({ ...form, image_url: json.data.url });
          toast.success('Rasm yuklandi!');
        } else { toast.error(json.error || 'Xatolik'); }
      } catch { toast.error('Serverga ulanishda xatolik'); }
      finally { setUploadingImage(false); }
    };
  };

  const ads = data || [];
  const activeAds = ads.filter((a: any) => a.status === 'active');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'expired': return 'badge-red';
      case 'scheduled': return 'badge-blue';
      default: return 'badge-yellow';
    }
  };

  const getPositionBadge = (pos: string) => {
    switch (pos) {
      case 'banner': return 'badge-purple';
      case 'carousel': return 'badge-blue';
      case 'featured': return 'badge-green';
      case 'sidebar': return 'badge-yellow';
      case 'homepage': return 'badge-red';
      default: return 'badge-blue';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Premium Reklamalar</h1>
          <p className="text-sm text-dark-500 mt-1">Reklamalarni boshqaring</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge-green flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeAds.length} ta faol
          </span>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Yangi reklama
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <FiBarChart2 className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{ads.reduce((s: number, a: any) => s + (a.impressions || 0), 0).toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Jami ko'rsatilish</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0">
          <FiTarget className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{ads.reduce((s: number, a: any) => s + (a.clicks || 0), 0).toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Jami bosilish</p>
        </div>
        <div className="card bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
          <FiClock className="w-5 h-5 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{activeAds.length}</p>
          <p className="text-sm opacity-80 mt-1">Faol reklamalar</p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card animate-scale-in border-l-4 border-l-primary-500">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              {editing ? <FiEdit2 className="w-4 h-4 text-white" /> : <FiPlus className="w-4 h-4 text-white" />}
            </div>
            <h2 className="font-bold text-dark-900">{editing ? 'Reklamani tahrirlash' : 'Yangi reklama'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Sarlavha *</label>
              <input type="text" value={form.title_uz} onChange={(e) => setForm({ ...form, title_uz: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Pozitsiya</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field">
                <option value="banner">Banner</option>
                <option value="carousel">Carousel</option>
                <option value="featured">Featured</option>
                <option value="sidebar">Sidebar</option>
                <option value="homepage">Homepage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Rasm *</label>
              <div className="space-y-2">
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${uploadingImage ? 'border-primary-300 bg-primary-50' : 'border-dark-200 hover:border-primary-400 hover:bg-primary-50/50'}`}>
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-6 h-6 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
                        <p className="text-xs font-medium text-primary-600">Yuklanmoqda...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FiUpload className="w-5 h-5 text-dark-400" />
                        <p className="text-xs font-medium text-dark-600">Rasm yuklash</p>
                      </div>
                    )}
                  </div>
                </label>
                {form.image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-dark-200">
                    <img src={form.image_url} alt="" className="w-full h-24 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"><FiX className="w-3.5 h-3.5" /></button>
                  </div>
                )}
                <details className="group">
                  <summary className="text-[10px] text-dark-400 cursor-pointer hover:text-primary-600 font-medium">Yoki URL kiriting</summary>
                  <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field mt-1.5 text-xs" placeholder="https://..." />
                </details>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1.5">Havola URL</label>
              <input type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className="input-field" placeholder="https://..." />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">{editing ? 'Saqlash' : 'Qo\'shish'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Bekor qilish</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-dark-100/50 bg-dark-50/30 flex items-center justify-between">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Reklamalar ro'yxati</span>
          <span className="text-xs text-dark-400">{ads.length} ta</span>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12 text-dark-400 text-sm">Reklamalar mavjud emas</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50/50">
                  <th className="table-header">Sarlavha</th>
                  <th className="table-header">Pozitsiya</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Impressions</th>
                  <th className="table-header">Clicks</th>
                  <th className="table-header">CTR</th>
                  <th className="table-header">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100/50">
                {ads.map((ad: any, idx: number) => (
                  <tr key={ad.id} className="hover:bg-dark-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="table-cell font-medium text-dark-900">{ad.title_uz}</td>
                    <td className="table-cell"><span className={getPositionBadge(ad.position)}>{ad.position}</span></td>
                    <td className="table-cell"><span className={getStatusBadge(ad.status)}>{ad.status}</span></td>
                    <td className="table-cell font-semibold">{ad.impressions?.toLocaleString() || 0}</td>
                    <td className="table-cell font-semibold">{ad.clicks?.toLocaleString() || 0}</td>
                    <td className="table-cell">
                      {ad.impressions > 0
                        ? <span className="font-medium text-primary-600">{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</span>
                        : <span className="text-dark-400">-</span>
                      }
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button onClick={() => editAd(ad)} className="p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(ad.id)} className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
