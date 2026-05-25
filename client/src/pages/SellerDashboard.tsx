import { useAppStore } from '../store/appStore';
import { FiPackage, FiPlus, FiShoppingBag } from 'react-icons/fi';

const WEB_URL = 'https://client-olive-six-20.vercel.app';

export default function SellerDashboard() {
  const { seller, isSeller, telegramId, setSeller, setIsSeller } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {!isSeller || !seller ? (
        <div className="container-app py-8">
          <div className="text-center mb-8">
            <span className="text-6xl">🏪</span>
            <h2 className="text-2xl font-bold mt-4">Do'kon oching</h2>
            <p className="text-dark-500 mt-2">O'z do'koningizni oching va mahsulotlaringizni butun bozorga ko'rsating</p>
          </div>
          <a href="https://t.me/kattaqurgon_bozori_bot" target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
            📱 Botga o'tish
          </a>
        </div>
      ) : (
        <>
          <div className="bg-primary-600 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🏪</div>
              <div className="flex-1">
                <h2 className="font-bold text-lg">{seller.store_name}</h2>
                <p className="text-sm text-white/80">{seller.total_products} ta mahsulot</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-white shadow-sm">
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-primary-600">{seller.total_products}</p>
              <p className="text-xs text-dark-400">Mahsulotlar</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-accent-600">{seller.total_sales}</p>
              <p className="text-xs text-dark-400">Sotuvlar</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{seller.total_views}</p>
              <p className="text-xs text-dark-400">Ko'rishlar</p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <a href={`${WEB_URL}/seller/add-product?user=${telegramId}`} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 no-underline">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <FiPlus className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-900">Mahsulot qo'shish</p>
                <p className="text-sm text-dark-400">Yangi mahsulot qo'shing</p>
              </div>
              <span className="text-dark-300">→</span>
            </a>

            <a href={`${WEB_URL}/seller/products?user=${telegramId}`} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 no-underline">
              <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-accent-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-900">Mahsulotlarim</p>
                <p className="text-sm text-dark-400">Barcha mahsulotlaringiz</p>
              </div>
              <span className="text-dark-300">→</span>
            </a>

            <a href={`${WEB_URL}/cart?user=${telegramId}`} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 no-underline">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-dark-900">Buyurtmalar</p>
                <p className="text-sm text-dark-400">Buyurtmalaringizni ko'ring</p>
              </div>
              <span className="text-dark-300">→</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
