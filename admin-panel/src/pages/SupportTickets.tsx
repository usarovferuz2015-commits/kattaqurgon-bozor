import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { FiMessageSquare, FiChevronDown, FiSend } from 'react-icons/fi';

export default function SupportTickets() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('open');
  const [responding, setResponding] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-support', filter],
    queryFn: async () => {
      const { data } = await api.get('/admin/support-tickets', { params: { status: filter } });
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_response }: any) => {
      await api.put(`/admin/support-tickets/${id}`, { status, admin_response });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
      toast.success('Yangilandi');
      setResponding(null);
      setResponseText('');
    },
    onError: () => toast.error('Xatolik'),
  });

  const tickets = data?.data || [];
  const filters = ['open', 'in_progress', 'resolved', 'closed'];

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-700', in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600',
  };
  const statusLabels: Record<string, string> = {
    open: 'Ochiq', in_progress: 'Jarayonda', resolved: 'Hal qilindi', closed: 'Yopilgan',
  };

  const handleRespond = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, status: newStatus, admin_response: responseText || undefined });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <FiMessageSquare className="text-primary-500" /> Murojaatlar
          </h1>
          <p className="text-sm text-dark-500 mt-1">Foydalanuvchi murojaatlarini boshqarish</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0
              ${filter === f ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-dark-600 border border-dark-100'}
            `}>
            {statusLabels[f]} ({f === 'open' ? tickets.length : ''})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-dark-400">Murojaatlar yo'q</div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border border-dark-100 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-dark-900">{t.subject}</h3>
                  <p className="text-xs text-dark-400 mt-0.5">ID: {t.telegram_id} • {new Date(t.created_at).toLocaleString('uz-UZ')}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[t.status]}`}>
                  {statusLabels[t.status]}
                </span>
              </div>
              <p className="text-sm text-dark-600 mb-2">{t.message}</p>
              {t.screenshot_url && (
                <img src={t.screenshot_url} alt="" className="w-24 h-24 rounded-xl object-cover mb-2" />
              )}
              {t.admin_response && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-sm text-dark-700">
                  <span className="font-semibold text-green-700">Javob:</span> {t.admin_response}
                </div>
              )}

              {responding === t.id ? (
                <div className="space-y-2">
                  <textarea value={responseText} onChange={(e) => setResponseText(e.target.value)}
                    className="input-field text-sm min-h-[60px]" placeholder="Javob yozish..." />
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(t.id, 'resolved')} className="btn-primary text-xs px-4 py-2 flex items-center gap-1">
                      <FiSend className="w-3 h-3" /> Hal qilindi
                    </button>
                    <button onClick={() => handleRespond(t.id, 'in_progress')} className="btn-secondary text-xs px-4 py-2">
                      Jarayonga o'tkazish
                    </button>
                    <button onClick={() => setResponding(null)} className="btn-secondary text-xs px-4 py-2">Bekor</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {t.status === 'open' && (
                    <button onClick={() => setResponding(t.id)} className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-medium">
                      Javob berish
                    </button>
                  )}
                  {t.status !== 'closed' && (
                    <button onClick={() => updateMutation.mutate({ id: t.id, status: 'closed' })} className="text-xs px-3 py-1.5 bg-gray-100 text-dark-600 rounded-lg">
                      Yopish
                    </button>
                  )}
                  {t.status === 'closed' && (
                    <button onClick={() => updateMutation.mutate({ id: t.id, status: 'open' })} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg">
                      Qayta ochish
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
