import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiShoppingBag, FiImage, FiBarChart2, FiDollarSign,
  FiHome, FiUserCheck, FiArrowRight, FiMessageSquare
} from 'react-icons/fi';

interface HomePageProps {
  adminId: number;
}

const menuItems = [
  {
    to: '/', icon: FiHome, label: 'Dashboard', desc: 'Statistika va tahlillar',
    gradient: 'from-emerald-500 to-teal-600', count: null,
  },
  {
    to: '/categories', icon: FiGrid, label: 'Kategoriyalar', desc: 'Mahsulot kategoriyalari',
    gradient: 'from-blue-500 to-cyan-600', count: null,
  },
  {
    to: '/products', icon: FiShoppingBag, label: 'Mahsulotlar', desc: 'Barcha mahsulotlar',
    gradient: 'from-violet-500 to-purple-600', count: null,
  },
  {
    to: '/sellers', icon: FiUserCheck, label: 'Sotuvchilar', desc: 'Sotuvchilarni boshqarish',
    gradient: 'from-amber-500 to-orange-600', count: null,
  },
  {
    to: '/users', icon: FiUsers, label: 'Foydalanuvchilar', desc: 'Foydalanuvchilar ro\'yxati',
    gradient: 'from-cyan-500 to-blue-600', count: null,
  },
  {
    to: '/banners', icon: FiImage, label: 'Bannerlar', desc: 'Reklama bannerlari',
    gradient: 'from-rose-500 to-pink-600', count: null,
  },
  {
    to: '/ads', icon: FiDollarSign, label: 'Reklamalar', desc: 'Premium reklamalar',
    gradient: 'from-purple-500 to-fuchsia-600', count: null,
  },
  {
    to: '/analytics', icon: FiBarChart2, label: 'Analitika', desc: 'Batafsil statistika',
    gradient: 'from-indigo-500 to-violet-600', count: null,
  },
  {
    to: '/support', icon: FiMessageSquare, label: 'Murojaatlar', desc: 'Foydalanuvchi xabarlari',
    gradient: 'from-teal-500 to-emerald-600', count: null,
  },
];

export default function HomePage({ adminId }: HomePageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-xl shadow-primary-600/20">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-4 mb-1">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">KB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-white/70 text-sm">Kattaqo'rg'on Bozori</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex-1">
              <p className="text-white/60 text-xs">Admin</p>
              <p className="text-white font-semibold text-sm">Super Admin</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex-1">
              <p className="text-white/60 text-xs">Status</p>
              <p className="text-emerald-300 font-semibold text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="animate-slide-up bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-dark-900/5 border border-white/50 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 text-left"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-dark-900 text-sm">{item.label}</h3>
                <p className="text-xs text-dark-400 mt-0.5">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-xs text-dark-400">Kattaqo'rg'on Bozori v1.0.0</p>
      </div>
    </div>
  );
}
