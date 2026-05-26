import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  FiUsers, FiShoppingBag, FiEye, FiStar, FiTrendingUp, FiDollarSign,
  FiArrowUp, FiArrowDown
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  adminId: number;
}

const statCards = [
  { label: 'Foydalanuvchilar', key: 'total_users', icon: FiUsers, gradient: 'from-blue-500 to-cyan-500', trend: '+12%' },
  { label: 'Aktiv foydalanuvchilar', key: 'active_users_today', icon: FiStar, gradient: 'from-emerald-500 to-green-500', trend: '+8%' },
  { label: 'Sotuvchilar', key: 'total_sellers', icon: FiTrendingUp, gradient: 'from-violet-500 to-purple-500', trend: '+5%' },
  { label: 'Mahsulotlar', key: 'total_products', icon: FiShoppingBag, gradient: 'from-orange-500 to-amber-500', trend: '+15%' },
  { label: "Ko'rishlar", key: 'total_views', icon: FiEye, gradient: 'from-teal-500 to-cyan-500', trend: '+23%' },
  { label: 'Savatcha', key: 'total_cart_adds', icon: FiDollarSign, gradient: 'from-rose-500 to-pink-500', trend: '+10%' },
];

const chartColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Dashboard({ adminId }: DashboardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard', {
        headers: { 'X-Telegram-Id': adminId },
      });
      return data.data;
    },
    enabled: !!adminId,
  });

  // Sample chart data (replace with real API data when available)
  const weeklyData = [
    { name: 'Du', views: 120, users: 45 },
    { name: 'Se', views: 180, users: 62 },
    { name: 'Ch', views: 150, users: 58 },
    { name: 'Pa', views: 210, users: 75 },
    { name: 'Ju', views: 190, users: 70 },
    { name: 'Sh', views: 250, users: 88 },
    { name: 'Ya', views: 220, users: 82 },
  ];

  const pieData = [
    { name: 'Oziq-ovqat', value: 35 },
    { name: 'Kiyim-kechak', value: 25 },
    { name: 'Elektronika', value: 20 },
    { name: 'Boshqa', value: 20 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-8 w-32 mb-2" />
              <div className="skeleton h-2 w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-sm text-dark-500 mt-1">Marketplace statistikasi va tahlillar</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl border border-dark-100/50">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-dark-500">So'nggi 7 kun</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          const value = data?.[stat.key] || 0;
          return (
            <div
              key={stat.key}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <p className="stat-value">
                    {value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5 mt-3">
                    <FiArrowUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">{stat.trend}</span>
                    <span className="text-sm text-dark-400">o'tgan hafta</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="mt-4 h-1.5 bg-dark-100/50 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000`}
                  style={{ width: `${Math.min((value / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Views Chart */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-dark-900">Haftalik ko'rishlar</h2>
              <p className="text-xs text-dark-500 mt-0.5">Oxirgi 7 kunlik statistika</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-dark-500">Ko'rishlar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs text-dark-500">Foydalanuvchilar</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-dark-900">Kategoriyalar bo'yicha</h2>
              <p className="text-xs text-dark-500 mt-0.5">Mahsulot taqsimoti</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-48 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, idx) => (
                      <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {pieData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[idx] }} />
                  <span className="text-xs text-dark-600">{item.name}</span>
                  <span className="text-xs font-bold text-dark-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products & Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-dark-900">Eng ko'p ko'rilgan</h2>
              <p className="text-xs text-dark-500 mt-0.5">Top 5 mahsulot</p>
            </div>
            <FiShoppingBag className="w-5 h-5 text-dark-300" />
          </div>
          {data?.top_products?.length > 0 ? (
            <div className="space-y-2">
              {data.top_products.slice(0, 5).map((product: any, i: number) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-50/50 transition-colors"
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-dark-100 text-dark-500'}
                  `}>
                    {i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-dark-100 overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{product.name_uz}</p>
                    <p className="text-xs text-dark-400">{product.views_count} ko'rish</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600 whitespace-nowrap">
                    {Number(product.price).toLocaleString()} so'm
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400 text-sm">Ma'lumot mavjud emas</div>
          )}
        </div>

        {/* Top Sellers */}
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-dark-900">Top sotuvchilar</h2>
              <p className="text-xs text-dark-500 mt-0.5">Eng yaxshi sotuvchilar</p>
            </div>
            <FiUsers className="w-5 h-5 text-dark-300" />
          </div>
          {data?.top_sellers?.length > 0 ? (
            <div className="space-y-2">
              {data.top_sellers.slice(0, 5).map((seller: any, i: number) => (
                <div
                  key={seller.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-50/50 transition-colors"
                >
                  <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-slate-100 text-slate-600' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-dark-100 text-dark-500'}
                  `}>
                    {i + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-base flex-shrink-0">
                    🏪
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark-900">{seller.store_name}</p>
                    <p className="text-xs text-dark-400">{seller.total_products} ta mahsulot</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/50">
                    <span className="text-sm font-bold text-amber-700">{seller.rating}</span>
                    <span className="text-xs text-amber-500">★</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-400 text-sm">Ma'lumot mavjud emas</div>
          )}
        </div>
      </div>
    </div>
  );
}
