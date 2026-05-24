import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { FiShoppingCart, FiHeart, FiSearch } from 'react-icons/fi';

export default function Header() {
  const { cartCount, telegramId } = useAppStore();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="container-app">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">KB</span>
            </div>
            <span className="font-bold text-dark-900 text-sm">Kattaqo'rg'on</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/search"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiSearch className="w-5 h-5 text-dark-600" />
            </Link>

            <Link
              to="/favorites"
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiHeart className="w-5 h-5 text-dark-600" />
            </Link>

            <Link
              to="/cart"
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <FiShoppingCart className="w-5 h-5 text-dark-600" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
