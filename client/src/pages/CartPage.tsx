import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { productService } from '../services/endpoints';
import { FiArrowLeft, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { goBack } from '../utils/navigation';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, updateCartQuantity, removeFromCart, clearCart, telegramId } = useAppStore();
  const [contacting, setContacting] = useState(false);

  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';

  const handleContactSellers = async () => {
    if (!telegramId) {
      toast.error('Telegram profilingiz aniqlanmadi');
      return;
    }

    const tg = (window as any)?.Telegram?.WebApp;
    setContacting(true);

    try {
      // Avval API orqali xabar yuborishga urinamiz
      for (const item of cart) {
        try {
          const res = await productService.contactSeller(item.slug, telegramId);
          // Agar sotuvchining usernamesi bo'lsa, to'g'ridan-to'g'ri chat ochamiz
          if (res.username && tg?.openTelegramLink) {
            tg.openTelegramLink(`https://t.me/${res.username}`);
          }
        } catch {
          // API xatolik bersa, to'g'ridan-to'g'ri chat ochishga harakat qilamiz
          if (tg?.openTelegramLink) {
            tg.openTelegramLink(`https://t.me/${item.seller_name}`);
          }
        }
      }
      toast.success('Xaridor bilan bog\'lanish uchun so\'rov yuborildi');
    } catch {
      toast.error('Xabar yuborishda xatolik yuz berdi');
    } finally {
      setContacting(false);
    }
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cart.find((i) => i.product_id === productId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeFromCart(productId);
        toast.success('Savatchadan olib tashlandi');
      } else {
        updateCartQuantity(productId, newQty);
      }
    }
  };

  const handleClear = () => {
    clearCart();
    toast.success('Savatcha tozalandi');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3 h-12 px-4">
            <button onClick={() => goBack(navigate, '/')} className="p-1 -ml-1">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold">Savatcha</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-dark-500 text-lg font-medium">Savatcha bo'sh</p>
          <p className="text-dark-400 text-sm mt-1">Mahsulot qo'shish uchun katalogni ko'ring</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">Katalogga o'tish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => goBack(navigate, '/')} className="p-1 -ml-1">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold">Savatcha</h1>
            <span className="text-sm text-dark-400">({cartCount} ta)</span>
          </div>
          <button onClick={handleClear} className="text-sm text-red-500 font-medium">
            Tozalash
          </button>
        </div>
      </div>

      <div className="container-app py-4 space-y-3">
        {cart.map((item) => (
          <div key={item.product_id} className="card p-3 flex gap-3 animate-fade-in">
            <Link to={`/product/${item.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </Link>

            <div className="flex-1 min-w-0">
              <Link to={`/product/${item.slug}`}>
                <h3 className="text-sm font-medium text-dark-900 line-clamp-2">{item.name}</h3>
              </Link>
              <p className="text-xs text-dark-400 mt-0.5">{item.seller_name}</p>

              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-primary-600">
                  {formatPrice(item.price)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.product_id, -1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs"
                  >
                    <FiMinus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product_id, 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-xs"
                  >
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                removeFromCart(item.product_id);
                toast.success('Olib tashlandi');
              }}
              className="p-1 self-start text-gray-400 hover:text-red-500"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-dark-500">Jami:</span>
            <span className="text-xl font-bold text-primary-600">{formatPrice(cartTotal)}</span>
          </div>
          <button 
            onClick={handleContactSellers}
            disabled={contacting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {contacting ? 'Yuborilmoqda...' : <><FiMessageCircle className="w-5 h-5" /> Sotuvchiga yozish</>}
          </button>
          <p className="text-xs text-dark-400 text-center mt-2">
            To'lov sotuvchi bilan kelishilgan holda amalga oshiriladi
          </p>
        </div>
      </div>
    </div>
  );
}
