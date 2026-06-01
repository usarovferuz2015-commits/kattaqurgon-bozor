import { FiPlus, FiPackage, FiShoppingBag, FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const seller = useAppStore((s) => s.seller);
  const telegramId = new URLSearchParams(window.location.search).get('user');
  const role = new URLSearchParams(window.location.search).get('role');

  const isSeller = telegramId && role === 'seller';

  if (!isSeller) {
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
          <a href="https://t.me/kattaqurgon_bozori_bot" target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center block">
            📱 Botga o'tish
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-primary-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">🏪</div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">Mening do'konim</h2>
            <p className="text-sm text-white/80">Sotuvchi paneli</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <button onClick={() => navigate('/seller/add-product')} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full text-left">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <FiPlus className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-900">Mahsulot qo'shish</p>
            <p className="text-sm text-dark-400">Yangi mahsulot qo'shing</p>
          </div>
          <span className="text-dark-300">→</span>
        </button>

        <button onClick={() => navigate('/seller/products')} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full text-left">
          <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
            <FiPackage className="w-6 h-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-900">Mahsulotlarim</p>
            <p className="text-sm text-dark-400">Barcha mahsulotlaringiz</p>
          </div>
          <span className="text-dark-300">→</span>
        </button>

        {seller?.store_slug && (
          <button onClick={() => navigate(`/seller/${seller.store_slug}`)} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <FiEye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-dark-900">Mening do'konim</p>
              <p className="text-sm text-dark-400">Do'koningizni ko'ring</p>
            </div>
            <span className="text-dark-300">→</span>
          </button>
        )}

        <button onClick={() => navigate('/cart')} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full text-left">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <FiShoppingBag className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark-900">Buyurtmalar</p>
            <p className="text-sm text-dark-400">Buyurtmalaringizni ko'ring</p>
          </div>
          <span className="text-dark-300">→</span>
        </button>
      </div>
    </div>
  );
}
