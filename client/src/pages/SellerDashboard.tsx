import { useAppStore } from '../store/appStore';
import { authService } from '../services/endpoints';
import { useEffect } from 'react';
import { FiArrowLeft, FiPackage, FiBarChart2, FiSettings, FiPlus, FiShoppingBag } from 'react-icons/fi';

const WEB_URL = 'https://client-olive-six-20.vercel.app';

export default function SellerDashboard() {
  const { seller, isSeller, telegramId, setUser, setSeller, setIsSeller, setIsAdmin } = useAppStore();

  useEffect(() => {
    if (telegramId) {
      authService.init(telegramId).then((res) => {
        if (res.success) {
          setUser(res.data.user);
          setSeller(res.data.seller);
          setIsSeller(res.data.is_seller);
          setIsAdmin(res.data.is_admin);
        }
      }).catch(console.error);
    }
  }, [telegramId]);

  if (!telegramId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-dark-500">Telegram orqali kiring</p>
      </div>
    );
  }

  if (!isSeller || !seller) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-app py-8">
          <div className="text-center mb-8">
            <span className="text-6xl">🏪</span>
            <h2 className="text-2xl font-bold mt-4">Do'kon oching</h2>
            <p className="text-dark-500 mt-2">
              O'z do'koningizni oching va mahsulotlaringizni butun bozorga ko'rsating
            </p>
          </div>
          <a
            href="https://t.me/kattaqurgon_bozori_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center block"
          >
            📱 Botga o'tish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <a href={WEB_URL} className="p-1 -ml-1">
              <FiArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="font-bold">Sotuvchi Paneli</h1>
          </div>
          <a href={`${WEB_URL}/seller/settings?user=${telegramId}`} className="p-2">
            <FiSettings className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="container-app py-4 space-y-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl">🏪</div>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <h2 className="font-bold text-lg">{seller.store_name}</h2>
                {seller.is_verified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-dark-400">{seller.store_address || 'Manzil kiritilmagan'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-primary-600">{seller.total_products}</p>
            <p className="text-xs text-dark-400">Mahsulotlar</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-accent-600">{seller.total_sales}</p>
            <p className="text-xs text-dark-400">Sotuvlar</p>
          </div>
          <div className="card p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{seller.total_views}</p>
            <p className="text-xs text-dark-400">Ko'rishlar</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href={`${WEB_URL}/seller/add-product?user=${telegramId}`}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-primary-50 transition-colors no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl">
              <FiPlus className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm font-medium">Mahsulot qo'shish</span>
          </a>

          <a
            href={`${WEB_URL}/seller/products?user=${telegramId}`}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-accent-50 transition-colors no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center text-xl">
              <FiPackage className="w-6 h-6 text-accent-600" />
            </div>
            <span className="text-sm font-medium">Mahsulotlarim</span>
          </a>

          <a
            href={`${WEB_URL}/seller/stats?user=${telegramId}`}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
              <FiBarChart2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Statistika</span>
          </a>

          <a
            href={`${WEB_URL}/seller/orders?user=${telegramId}`}
            className="card p-4 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors no-underline"
          >
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-xl">
              <FiShoppingBag className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium">Buyurtmalar</span>
          </a>
        </div>
      </div>
    </div>
  );
}
