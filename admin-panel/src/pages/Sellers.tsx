import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiShield } from 'react-icons/fi';

interface SellersProps {
  adminId: number;
}

export default function Sellers({ adminId }: SellersProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-sellers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/sellers', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/sellers/${id}/verify`, {}, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      toast.success('Sotuvchi statusi o\'zgartirildi');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/sellers/${id}/toggle`, {}, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      toast.success('Sotuvchi holati o\'zgartirildi');
    },
  });

  const sellers = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sotuvchilar</h1>
          <p className="text-dark-500 text-sm mt-1">Barcha sotuvchilarni boshqaring</p>
        </div>
        <span className="badge-blue">{sellers.length} ta sotuvchi</span>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 skeleton rounded-lg" />
            ))}
          </div>
        ) : sellers.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Hali sotuvchilar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-dark-500 border-b">
                  <th className="pb-3 font-medium">Do'kon</th>
                  <th className="pb-3 font-medium">Telegram</th>
                  <th className="pb-3 font-medium">Mahsulotlar</th>
                  <th className="pb-3 font-medium">Reyting</th>
                  <th className="pb-3 font-medium">Holat</th>
                  <th className="pb-3 font-medium">Tasdiqlangan</th>
                  <th className="pb-3 font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sellers.map((seller: any) => (
                  <tr key={seller.id} className="text-sm hover:bg-dark-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-sm">
                          🏪
                        </div>
                        <span className="font-medium">{seller.store_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-dark-500">{seller.telegram_id}</td>
                    <td className="py-3">{seller.total_products}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <span>{seller.rating}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={seller.is_active ? 'badge-green' : 'badge-red'}>
                        {seller.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td className="py-3">
                      {seller.is_verified ? (
                        <FiCheck className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiX className="w-5 h-5 text-red-500" />
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => verifyMutation.mutate(seller.id)}
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                          title="Tasdiqlash"
                        >
                          <FiShield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(seller.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-600"
                          title="Bloklash/faollashtirish"
                        >
                          {seller.is_active ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                        </button>
                      </div>
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
