import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiEye, FiBarChart2 } from 'react-icons/fi';

interface AnalyticsProps {
  adminId: number;
}

const weeklyData = [
  { name: 'Du', views: 1200, users: 450, orders: 85, revenue: 8500000 },
  { name: 'Se', views: 1800, users: 620, orders: 120, revenue: 12400000 },
  { name: 'Ch', views: 1500, users: 580, orders: 95, revenue: 9800000 },
  { name: 'Pa', views: 2100, users: 750, orders: 150, revenue: 15600000 },
  { name: 'Ju', views: 1900, users: 700, orders: 135, revenue: 14200000 },
  { name: 'Sh', views: 2500, users: 880, orders: 180, revenue: 18900000 },
  { name: 'Ya', views: 2200, users: 820, orders: 160, revenue: 16800000 },
];

const monthlyData = [
  { name: 'Yan', products: 45, sellers: 12, users: 230 },
  { name: 'Fev', products: 62, sellers: 18, users: 340 },
  { name: 'Mar', products: 78, sellers: 22, users: 420 },
  { name: 'Apr', products: 95, sellers: 28, users: 510 },
  { name: 'May', products: 112, sellers: 35, users: 680 },
  { name: 'Iyun', products: 128, sellers: 42, users: 820 },
];

const formatCurrency = (value: number) => {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toString();
};

export default function Analytics({ adminId }: AnalyticsProps) {
  const { data } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard', { headers: { 'X-Telegram-Id': adminId } });
      return data.data;
    },
  });

  const stats = [
    { label: 'Haftalik ko\'rishlar', value: '12,400', change: '+23%', icon: FiEye, color: 'from-emerald-500 to-teal-500' },
    { label: 'Faol foydalanuvchilar', value: '4,820', change: '+18%', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
    { label: 'Buyurtmalar', value: '925', change: '+15%', icon: FiShoppingBag, color: 'from-violet-500 to-purple-500' },
    { label: "Daromad", value: '96.2M so\'m', change: '+32%', icon: FiTrendingUp, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Analitika</h1>
          <p className="text-sm text-dark-500 mt-1">Batafsil statistika va tahlillar</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-white/60 rounded-xl border border-dark-100/50">
          <FiBarChart2 className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-medium text-dark-500">Oxirgi 30 kun</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
              <p className="text-sm text-dark-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card animate-slide-up">
          <h2 className="font-bold text-dark-900 mb-1">Haftalik daromad</h2>
          <p className="text-xs text-dark-500 mb-6">So'nggi 7 kunlik daromad dinamikasi</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Views vs Users */}
        <div className="card animate-slide-up">
          <h2 className="font-bold text-dark-900 mb-1">Ko'rishlar va foydalanuvchilar</h2>
          <p className="text-xs text-dark-500 mb-6">So'nggi 7 kunlik taqqoslash</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                />
                <Bar dataKey="views" fill="#10b981" radius={[6, 6, 0, 0]} name="Ko'rishlar" />
                <Bar dataKey="users" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Foydalanuvchilar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Growth */}
      <div className="card animate-slide-up">
        <h2 className="font-bold text-dark-900 mb-1">O'sish dinamikasi</h2>
        <p className="text-xs text-dark-500 mb-6">Yillik o'sish ko'rsatkichlari</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Line type="monotone" dataKey="products" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981' }} name="Mahsulotlar" />
              <Line type="monotone" dataKey="sellers" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6' }} name="Sotuvchilar" />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6' }} name="Foydalanuvchilar" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
