import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiArrowLeft, FiCheck, FiX, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Kutilmoqda', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Tasdiqlangan', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Yetkazildi', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700' },
};

export default function SellerOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/seller');
      return res?.data?.data || [];
    },
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.put(`/orders/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Status yangilandi');
    },
    onError: () => toast.error('Xatolik'),
  });

  const orders = data || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-dark-900">Buyurtmalar</h1>
          <span className="text-sm text-dark-400">({orders.length} ta)</span>
        </div>
      </div>

      <div className="container-app py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">📦</span>
            <p className="text-dark-500 mt-3">Hozircha buyurtmalar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-dark-400">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-dark-500 flex items-center gap-1 mt-0.5">
                      <FiPhone className="w-3 h-3" />
                      {order.buyer_phone}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[order.status]?.color}`}>
                    {statusConfig[order.status]?.label}
                  </span>
                </div>

                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                    <span className="text-dark-700">{item.product_name} x{item.quantity}</span>
                    <span className="text-dark-500">{(item.price * item.quantity).toLocaleString()} so'm</span>
                  </div>
                ))}

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <span className="font-bold text-primary-600">{Number(order.total_amount).toLocaleString()} so'm</span>
                  <span className="text-xs text-dark-400">{new Date(order.created_at).toLocaleString('uz-UZ')}</span>
                </div>

                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateMutation.mutate({ id: order.id, status: 'confirmed' })}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FiCheck className="w-4 h-4" /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => updateMutation.mutate({ id: order.id, status: 'cancelled' })}
                      className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1 border border-red-200"
                    >
                      <FiX className="w-4 h-4" /> Bekor qilish
                    </button>
                  </div>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateMutation.mutate({ id: order.id, status: 'delivered' })}
                    className="mt-3 w-full py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
                  >
                    Yetkazildi deb belgilash
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
