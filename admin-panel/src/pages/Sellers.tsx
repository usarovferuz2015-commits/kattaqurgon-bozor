import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FiCheck, FiX, FiShield, FiUserCheck, FiUserX, FiSearch,
  FiStar, FiPackage, FiUsers, FiTrendingUp
} from 'react-icons/fi';
import { useState } from 'react';
import PageHeader from '../components/PageHeader';

interface SellersProps {
  adminId: number;
}

export default function Sellers({ adminId }: SellersProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'blocked'>('all');

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
      toast.success('Sotuvchi tasdiqlash statusi o\'zgartirildi');
    },
    onError: () => toast.error('Xatolik yuz berdi'),
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
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const allSellers: any[] = data?.data || [];

  const filteredSellers = allSellers.filter((s: any) => {
    const matchSearch = !search ||
      s.store_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(s.telegram_id).includes(search);

    const matchFilter =
      filter === 'all' ||
      (filter === 'verified' && s.is_verified) ||
      (filter === 'unverified' && !s.is_verified) ||
      (filter === 'blocked' && !s.is_active);

    return matchSearch && matchFilter;
  });

  const stats = {
    total: allSellers.length,
    verified: allSellers.filter(s => s.is_verified).length,
    active: allSellers.filter(s => s.is_active).length,
    blocked: allSellers.filter(s => !s.is_active).length,
  };

  const filterTabs = [
    { key: 'all', label: `Barchasi (${stats.total})`, color: 'from-primary-500 to-primary-600' },
    { key: 'verified', label: `Tasdiqlangan (${stats.verified})`, color: 'from-emerald-500 to-emerald-600' },
    { key: 'unverified', label: `Tasdiqlanmagan (${stats.total - stats.verified})`, color: 'from-amber-500 to-amber-600' },
    { key: 'blocked', label: `Bloklangan (${stats.blocked})`, color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <PageHeader
        title="Sotuvchilar"
        subtitle="Do'konlar va sotuvchilarni boshqarish"
      />
      <div className="page-container pt-5 space-y-4">
        {/* Header */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-dark-900 flex items-center gap-2">
                <FiUsers className="text-violet-500" /> Sotuvchilar
              </h1>
              <p className="text-sm text-dark-500 mt-1">Do'konlar va sotuvchilarni boshqarish markazi</p>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Qidirish..."
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Jami sotuvchilar', value: stats.total, icon: FiUsers, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 text-violet-600' },
          { label: 'Tasdiqlangan', value: stats.verified, icon: FiCheck, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 text-emerald-600' },
          { label: 'Faol', value: stats.active, icon: FiTrendingUp, gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-50 text-blue-600' },
          { label: 'Bloklangan', value: stats.blocked, icon: FiUserX, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-3 border border-dark-100 hover:border-primary-100 transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.bg} flex-shrink-0`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-dark-900">{stat.value}</p>
              <p className="text-xs text-dark-500 leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 shadow-sm
              ${filter === tab.key
                ? `bg-gradient-to-r ${tab.color} text-white shadow-md`
                : 'bg-white text-dark-600 border border-dark-100 hover:border-dark-200'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sellers Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse space-y-3 border border-dark-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-dark-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-100 rounded w-3/4" />
                  <div className="h-3 bg-dark-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-dark-100 rounded-full flex-1" />
                <div className="h-6 bg-dark-100 rounded-full flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="card border border-dark-100 py-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center text-3xl mb-4">🏪</div>
          <h3 className="font-bold text-dark-800 text-lg">Sotuvchilar Topilmadi</h3>
          <p className="text-dark-400 text-sm mt-1">Qidiruv yoki filter mezonlariga mos sotuvchi yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSellers.map((seller: any, idx: number) => (
            <div
              key={seller.id}
              className="card border border-dark-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Store Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                  🏪
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark-900 truncate">{seller.store_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <code className="text-[10px] bg-dark-50 border border-dark-100 px-1.5 py-0.5 rounded text-dark-500">
                      ID: {seller.telegram_id}
                    </code>
                    {seller.is_verified && (
                      <span className="text-[10px] font-semibold text-blue-600 flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        <FiCheck className="w-2.5 h-2.5" /> Tasdiqlangan
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="bg-dark-50 rounded-xl py-2 px-1">
                  <p className="text-base font-bold text-dark-900">{seller.total_products || 0}</p>
                  <p className="text-[9px] text-dark-400 leading-tight">Mahsulot</p>
                </div>
                <div className="bg-amber-50 rounded-xl py-2 px-1">
                  <p className="text-base font-bold text-amber-700 flex items-center justify-center gap-0.5">
                    {seller.rating || '0.0'} <span className="text-xs">★</span>
                  </p>
                  <p className="text-[9px] text-amber-500 leading-tight">Reyting</p>
                </div>
                <div className={`rounded-xl py-2 px-1 ${seller.is_active ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <p className={`text-[11px] font-bold ${seller.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {seller.is_active ? 'Faol' : 'Bloklangan'}
                  </p>
                  <p className="text-[9px] text-dark-400 leading-tight">Holat</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-3 border-t border-dark-100">
                <button
                  onClick={() => verifyMutation.mutate(seller.id)}
                  disabled={verifyMutation.isPending}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all
                    ${seller.is_verified
                      ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  <FiShield className="w-3.5 h-3.5" />
                  {seller.is_verified ? 'Bekor qilish' : 'Tasdiqlash'}
                </button>
                <button
                  onClick={() => toggleMutation.mutate(seller.id)}
                  disabled={toggleMutation.isPending}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all
                    ${seller.is_active
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {seller.is_active ? <FiUserX className="w-3.5 h-3.5" /> : <FiUserCheck className="w-3.5 h-3.5" />}
                  {seller.is_active ? 'Bloklash' : 'Faollashtirish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
