import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FiUsers, FiShoppingBag, FiEye, FiStar, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

interface DashboardProps {
  adminId: number;
}

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

  const stats = [
    { label: 'Foydalanuvchilar', value: data?.total_users || 0, icon: FiUsers, color: 'blue' },
    { label: 'Aktiv foydalanuvchilar', value: data?.active_users_today || 0, icon: FiStar, color: 'green' },
    { label: 'Sotuvchilar', value: data?.total_sellers || 0, icon: FiTrendingUp, color: 'purple' },
    { label: 'Mahsulotlar', value: data?.total_products || 0, icon: FiShoppingBag, color: 'orange' },
    { label: "Ko'rishlar", value: data?.total_views || 0, icon: FiEye, color: 'teal' },
    { label: 'Savatcha', value: data?.total_cart_adds || 0, icon: FiDollarSign, color: 'red' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
    red: 'bg-red-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-dark-500 text-sm mt-1">Marketplace statistikasi</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-500">{stat.label}</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">
                  {isLoading ? '...' : stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${colorMap[stat.color]} bg-opacity-10 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            {/* Mini bar */}
            <div className="mt-3 h-1 bg-dark-100 rounded-full overflow-hidden">
              <div className={`h-full ${colorMap[stat.color]} rounded-full w-3/4`} />
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <h2 className="font-bold text-dark-900 mb-4">Eng ko'p ko'rilgan mahsulotlar</h2>
          {data?.top_products?.length > 0 ? (
            <div className="space-y-3">
              {data.top_products.slice(0, 5).map((product: any, i: number) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-dark-400 w-6">{i + 1}.</span>
                  <div className="w-10 h-10 rounded-lg bg-dark-100 overflow-hidden flex-shrink-0">
                    <img src={product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name_uz}</p>
                    <p className="text-xs text-dark-400">{product.views_count} ko'rish</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600">
                    {Number(product.price).toLocaleString()} so'm
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm">Ma'lumot mavjud emas</p>
          )}
        </div>

        {/* Top Sellers */}
        <div className="card">
          <h2 className="font-bold text-dark-900 mb-4">Top sotuvchilar</h2>
          {data?.top_sellers?.length > 0 ? (
            <div className="space-y-3">
              {data.top_sellers.slice(0, 5).map((seller: any, i: number) => (
                <div key={seller.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-dark-400 w-6">{i + 1}.</span>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-lg">
                    🏪
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{seller.store_name}</p>
                    <p className="text-xs text-dark-400">{seller.total_products} ta mahsulot</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-accent-600">{seller.rating}</span>
                    <span className="text-xs text-dark-400">★</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-400 text-sm">Ma'lumot mavjud emas</p>
          )}
        </div>
      </div>
    </div>
  );
}
