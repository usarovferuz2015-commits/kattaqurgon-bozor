import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';

interface PremiumAdsProps {
  adminId: number;
}

export default function PremiumAds({ adminId }: PremiumAdsProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data } = await api.get('/admin/ads', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/ads/${id}`, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast.success('Reklama o\'chirildi');
    },
  });

  const ads = data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Premium Reklamalar</h1>
          <p className="text-dark-500 text-sm mt-1">Reklamalarni boshqaring</p>
        </div>
        <span className="badge-green">{ads.filter((a: any) => a.status === 'active').length} ta faol</span>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 skeleton rounded-lg" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Reklamalar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-dark-500 border-b">
                  <th className="pb-3 font-medium">Sarlavha</th>
                  <th className="pb-3 font-medium">Pozitsiya</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Impressions</th>
                  <th className="pb-3 font-medium">Clicks</th>
                  <th className="pb-3 font-medium">Tugash vaqti</th>
                  <th className="pb-3 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ads.map((ad: any) => (
                  <tr key={ad.id} className="text-sm hover:bg-dark-50">
                    <td className="py-3 font-medium">{ad.title_uz}</td>
                    <td className="py-3">
                      <span className="badge-blue">{ad.position}</span>
                    </td>
                    <td className="py-3">
                      <span className={ad.status === 'active' ? 'badge-green' : ad.status === 'expired' ? 'badge-red' : 'badge-yellow'}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-3">{ad.impressions}</td>
                    <td className="py-3">{ad.clicks}</td>
                    <td className="py-3 text-dark-500">
                      {new Date(ad.expires_at).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => deleteMutation.mutate(ad.id)}
                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
