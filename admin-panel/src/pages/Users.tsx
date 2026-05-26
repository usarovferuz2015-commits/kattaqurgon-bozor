import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FiUsers, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

interface UsersProps {
  adminId: number;
}

export default function Users({ adminId }: UsersProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
  });

  const users = (data?.data || []).filter((u: any) =>
    !search ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'seller': return 'badge-green';
      default: return 'badge-blue';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Foydalanuvchilar</h1>
          <p className="text-sm text-dark-500 mt-1">Barcha foydalanuvchilar ro'yxati</p>
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
          <span className="badge-purple">{data?.total || 0} ta foydalanuvchi</span>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-12 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="w-8 h-8 mx-auto text-dark-300 mb-2" />
              <p className="text-dark-400 text-sm">Foydalanuvchilar mavjud emas</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-dark-50/50">
                  <th className="table-header">ID</th>
                  <th className="table-header">Foydalanuvchi</th>
                  <th className="table-header">Username</th>
                  <th className="table-header">Rol</th>
                  <th className="table-header">Telegram ID</th>
                  <th className="table-header">Ro'yxatdan o'tgan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100/50">
                {users.map((user: any, idx: number) => (
                  <tr key={user.id} className="hover:bg-dark-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
                    <td className="table-cell">
                      <code className="text-xs bg-dark-100/50 px-2 py-1 rounded-lg font-mono">
                        {user.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-sm font-medium text-primary-700">
                          {(user.first_name || '?')[0]}
                        </div>
                        <div>
                          <span className="font-medium text-dark-900">{user.first_name || 'Noma\'lum'}</span>
                          {user.last_name && <span className="text-dark-500"> {user.last_name}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {user.username ? (
                        <span className="text-primary-600 font-medium">@{user.username}</span>
                      ) : (
                        <span className="text-dark-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <span className={getRoleBadge(user.role)}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'seller' ? 'Sotuvchi' : 'Foydalanuvchi'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <code className="text-xs bg-dark-100/50 px-2 py-1 rounded-lg">{user.telegram_id}</code>
                    </td>
                    <td className="table-cell text-dark-500">
                      {new Date(user.created_at).toLocaleDateString('uz-UZ', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
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
