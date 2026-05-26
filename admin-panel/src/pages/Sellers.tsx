import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiShield, FiUserCheck, FiUserX, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

interface SellersProps {
  adminId: number;
}

export default function Sellers({ adminId }: SellersProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

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

  const sellers = (data?.data || []).filter((s: any) =>
    !search || s.store_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Sotuvchilar</h1>
          <p className="text-sm text-dark-500 mt-1">Barcha sotuvchilarni boshqaring</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm w-48"
            />
          </div>
          <span className="badge-blue">{sellers.length} ta sotuvchi</span>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : sellers.length === 0 ? (
            <div className="text-center py-12 text-dark-400 text-sm">Hali sotuvchilar mavjud emas</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50/50">
                  <th className="table-header">Do'kon</th>
                  <th className="table-header">Telegram</th>
                  <th className="table-header">Mahsulotlar</th>
                  <th className="table-header">Reyting</th>
                  <th className="table-header">Holat</th>
                  <th className="table-header">Tasdiqlangan</th>
                  <th className="table-header">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100/50">
                {sellers.map((seller: any, idx: number) => (
                  <tr key={seller.id} className="hover:bg-dark-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-base shadow-sm">
                          🏪
                        </div>
                        <div>
                          <span className="font-medium text-dark-900">{seller.store_name}</span>
                          {seller.is_verified && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-600">
                              <FiCheck className="w-3 h-3" /> Tasdiqlangan
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <code className="text-xs bg-dark-100/50 px-2 py-1 rounded-lg">{seller.telegram_id}</code>
                    </td>
                    <td className="table-cell">
                      <span className="font-semibold text-dark-900">{seller.total_products}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-dark-900">{seller.rating}</span>
                        <span className="text-amber-500 text-sm">★</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={seller.is_active ? 'badge-green' : 'badge-red'}>
                        {seller.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {seller.is_verified ? (
                        <span className="badge-green"><FiCheck className="w-3 h-3 mr-1" /> Ha</span>
                      ) : (
                        <span className="badge-yellow"><FiX className="w-3 h-3 mr-1" /> Yo'q</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyMutation.mutate(seller.id)}
                          className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Tasdiqlash"
                        >
                          <FiShield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleMutation.mutate(seller.id)}
                          className={`p-2 rounded-xl transition-colors ${
                            seller.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={seller.is_active ? 'Bloklash' : 'Faollashtirish'}
                        >
                          {seller.is_active ? <FiUserX className="w-4 h-4" /> : <FiUserCheck className="w-4 h-4" />}
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
