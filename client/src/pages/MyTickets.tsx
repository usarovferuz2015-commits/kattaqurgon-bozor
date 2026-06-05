import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: '⏳ Ochiq', color: 'bg-red-100 text-red-700' },
  in_progress: { label: '🔄 Jarayonda', color: 'bg-blue-100 text-blue-700' },
  resolved: { label: '✅ Hal qilindi', color: 'bg-green-100 text-green-700' },
  closed: { label: '🔒 Yopilgan', color: 'bg-gray-100 text-gray-600' },
};

export default function MyTickets() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      try {
        const res = await api.get('/support/my');
        return res?.data?.data || [];
      } catch {
        return [];
      }
    },
  });

  const tickets = data || [];

  if (isError || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 h-12 px-4">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-dark-900">Mening murojaatlarim</h1>
          </div>
        </div>
        <div className="container-app py-4">
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-dark-900">Mening murojaatlarim</h1>
        </div>
      </div>

      <div className="container-app py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-dark-500">Hozircha murojaatlar yo'q</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t: any) => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-dark-400">#{t.id.slice(0, 8)}</p>
                    <h3 className="font-medium text-dark-900">{t.subject}</h3>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig[t.status]?.color}`}>
                    {statusConfig[t.status]?.label}
                  </span>
                </div>
                <p className="text-sm text-dark-600 mb-2">{t.message.slice(0, 150)}</p>
                {t.admin_response && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                    <span className="font-semibold text-green-700">Admin javobi:</span>{' '}
                    <span className="text-dark-700">{t.admin_response}</span>
                  </div>
                )}
                <p className="text-[10px] text-dark-400 mt-2">{new Date(t.created_at).toLocaleString('uz-UZ')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
