import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface UsersProps {
  adminId: number;
}

export default function Users({ adminId }: UsersProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
  });

  const users = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Foydalanuvchilar</h1>
          <p className="text-dark-500 text-sm mt-1">Barcha foydalanuvchilar ro'yxati</p>
        </div>
        <span className="badge-blue">{data?.total || 0} ta foydalanuvchi</span>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 skeleton rounded-lg" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-dark-400 text-center py-8">Foydalanuvchilar mavjud emas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-dark-500 border-b">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Ism</th>
                  <th className="pb-3 font-medium">Username</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Telegram ID</th>
                  <th className="pb-3 font-medium">Ro'yxatdan o'tgan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user: any) => (
                  <tr key={user.id} className="text-sm hover:bg-dark-50">
                    <td className="py-3 text-dark-500 font-mono">{user.id.slice(0, 8)}...</td>
                    <td className="py-3 font-medium">{user.first_name || 'Noma\'lum'}</td>
                    <td className="py-3 text-dark-500">@{user.username || '-'}</td>
                    <td className="py-3">
                      <span className={user.role === 'admin' ? 'badge-red' : user.role === 'seller' ? 'badge-green' : 'badge-blue'}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-dark-500">{user.telegram_id}</td>
                    <td className="py-3 text-dark-500">
                      {new Date(user.created_at).toLocaleDateString('uz-UZ')}
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
