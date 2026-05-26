import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiShield, FiUserX, FiUserCheck, FiX, FiCalendar } from 'react-icons/fi';
import { useState } from 'react';

interface UsersProps {
  adminId: number;
}

export default function Users({ adminId }: UsersProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'seller' | 'user'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data;
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (telegramId: number) => {
      await api.post(`/admin/users/${telegramId}/block`, {}, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Foydalanuvchi bloklandi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const unblockMutation = useMutation({
    mutationFn: async (telegramId: number) => {
      await api.post(`/admin/users/${telegramId}/unblock`, {}, {
        headers: { 'X-Telegram-Id': adminId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Foydalanuvchi blokdan chiqarildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const allUsers: any[] = data?.data || [];

  const filtered = allUsers.filter((u: any) => {
    const matchSearch = !search ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      String(u.telegram_id).includes(search);
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const roleCounts = {
    all: allUsers.length,
    admin: allUsers.filter(u => u.role === 'admin').length,
    seller: allUsers.filter(u => u.role === 'seller').length,
    user: allUsers.filter(u => u.role === 'user' || !u.role).length,
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-rose-100 text-rose-700 border-rose-200',
    seller: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    user: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  const roleLabels: Record<string, string> = {
    admin: '👑 Admin',
    seller: '🏪 Sotuvchi',
    user: '👤 Foydalanuvchi',
  };

  const filterTabs = [
    { key: 'all', label: `Barchasi (${roleCounts.all})`, active: 'from-primary-500 to-primary-600' },
    { key: 'admin', label: `Adminlar (${roleCounts.admin})`, active: 'from-rose-500 to-rose-600' },
    { key: 'seller', label: `Sotuvchilar (${roleCounts.seller})`, active: 'from-emerald-500 to-emerald-600' },
    { key: 'user', label: `Foydalanuvchilar (${roleCounts.user})`, active: 'from-sky-500 to-sky-600' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <FiUsers className="text-sky-500" /> Foydalanuvchilar
          </h1>
          <p className="text-sm text-dark-500 mt-1">
            Jami <span className="font-semibold text-dark-700">{data?.total || 0}</span> ta ro'yxatdan o'tgan foydalanuvchi
          </p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Ism, username yoki Telegram ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm w-full sm:w-72 rounded-xl"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700">
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 shadow-sm
              ${filter === tab.key
                ? `bg-gradient-to-r ${tab.active} text-white shadow-md`
                : 'bg-white text-dark-600 border border-dark-100 hover:border-dark-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Table Card */}
      <div className="card overflow-hidden p-0 border border-dark-100">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-dark-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-dark-100 rounded w-1/3" />
                  <div className="h-3 bg-dark-100 rounded w-1/4" />
                </div>
                <div className="h-6 w-20 bg-dark-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center mb-4">
              <FiUsers className="w-8 h-8 text-dark-300" />
            </div>
            <h3 className="font-bold text-dark-700">Topilmadi</h3>
            <p className="text-dark-400 text-sm mt-1">
              {search ? `"${search}" bo'yicha foydalanuvchi topilmadi` : 'Hali foydalanuvchilar yo\'q'}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-5 py-3 bg-dark-50/60 border-b border-dark-100 grid grid-cols-12 gap-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">
              <div className="col-span-4">Foydalanuvchi</div>
              <div className="col-span-2 hidden sm:block">Username</div>
              <div className="col-span-2">Rol</div>
              <div className="col-span-2 hidden md:block">Telegram ID</div>
              <div className="col-span-2 text-right">Amallar</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-dark-50">
              {filtered.map((user: any, idx: number) => {
                const role = user.role || 'user';
                const initials = (user.first_name?.[0] || '?').toUpperCase();
                const gradients = ['from-violet-400 to-purple-500', 'from-sky-400 to-blue-500', 'from-emerald-400 to-green-500', 'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500'];
                const grad = gradients[user.telegram_id % gradients.length];

                return (
                  <div
                    key={user.id}
                    className="px-5 py-3.5 grid grid-cols-12 gap-3 items-center hover:bg-dark-50/40 transition-colors animate-fade-in"
                    style={{ animationDelay: `${idx * 20}ms` }}
                  >
                    {/* Name */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-dark-900 truncate">
                          {user.first_name || 'Noma\'lum'}
                          {user.last_name && <span className="font-normal text-dark-500"> {user.last_name}</span>}
                        </p>
                        <p className="text-[10px] text-dark-400 flex items-center gap-1 mt-0.5">
                          <FiCalendar className="w-2.5 h-2.5" />
                          {new Date(user.created_at).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="col-span-2 hidden sm:block">
                      {user.username ? (
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100">
                          @{user.username}
                        </span>
                      ) : (
                        <span className="text-dark-300 text-xs">—</span>
                      )}
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg border ${roleColors[role] || roleColors.user}`}>
                        {roleLabels[role] || roleLabels.user}
                      </span>
                    </div>

                    {/* Telegram ID */}
                    <div className="col-span-2 hidden md:block">
                      <code className="text-xs bg-dark-50 border border-dark-100 px-2 py-1 rounded-lg text-dark-500">
                        {user.telegram_id}
                      </code>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-1.5">
                      {role !== 'admin' && (
                        <button
                          onClick={() => user.is_blocked
                            ? unblockMutation.mutate(user.telegram_id)
                            : blockMutation.mutate(user.telegram_id)
                          }
                          disabled={blockMutation.isPending || unblockMutation.isPending}
                          className={`p-2 rounded-xl transition-all text-xs ${
                            user.is_blocked
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title={user.is_blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                        >
                          {user.is_blocked ? <FiUserCheck className="w-3.5 h-3.5" /> : <FiUserX className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 bg-dark-50/40 border-t border-dark-100 text-xs text-dark-400 text-right">
              Ko'rsatilmoqda: <span className="font-semibold text-dark-600">{filtered.length}</span> / {allUsers.length} ta foydalanuvchi
            </div>
          </>
        )}
      </div>
    </div>
  );
}
