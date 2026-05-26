import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiBarChart2, FiClock, FiTarget } from 'react-icons/fi';

interface PremiumAdsProps {
  adminId: number;
}

export default function PremiumAds({ adminId }: PremiumAdsProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ads', { headers: { 'X-Telegram-Id': adminId } });
      return data.data;
    },
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
          <span className="badge-blue">{ads.length} ta jami</span>
        </div>
      </div>

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

      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-dark-100/50 bg-dark-50/30">
          <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">Reklamalar ro'yxati</span>
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
                  <th className="table-header">Tugash vaqti</th>
                  <th className="table-header">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100/50">
                {ads.map((ad: any, idx: number) => (
                  <tr key={ad.id} className="hover:bg-dark-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="table-cell font-medium text-dark-900">{ad.title_uz}</td>
                    <td className="table-cell">
                      <span className={getPositionBadge(ad.position)}>{ad.position}</span>
                    </td>
                    <td className="table-cell">
                      <span className={getStatusBadge(ad.status)}>{ad.status}</span>
                    </td>
                    <td className="table-cell font-semibold">{ad.impressions?.toLocaleString() || 0}</td>
                    <td className="table-cell font-semibold">{ad.clicks?.toLocaleString() || 0}</td>
                    <td className="table-cell">
                      {ad.impressions > 0
                        ? <span className="font-medium text-primary-600">{((ad.clicks / ad.impressions) * 100).toFixed(2)}%</span>
                        : <span className="text-dark-400">-</span>
                      }
                    </td>
                    <td className="table-cell text-dark-500">
                      {ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => deleteMutation.mutate(ad.id)}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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
