import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { authService } from './services/endpoints';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import CategoriesPage from './pages/CategoriesPage';
import SellerPage from './pages/SellerPage';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerAddProduct from './pages/SellerAddProduct';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const { initTg, setUser, setSeller, setIsSeller, setIsAdmin, setToken } = useAppStore();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    async function doAuth() {
      try {
        // initTg ni shu yerda chaqiring
        initTg();

        const tg = (window as any)?.Telegram?.WebApp;

        // WebApp tayyor bo'lishini kuting
        if (tg) {
          tg.ready();
        }

        const initData = tg?.initData;

        console.log('=== AUTH DEBUG ===');
        console.log('tg:', !!tg);
        console.log('initData:', initData);
        console.log('token before auth:', useAppStore.getState().token);

        if (!initData) {
          console.warn('initData not available, dev fallback');
          setAuthReady(true);
          return;
        }

        const res = await authService.init(initData);
        if (res.success && res.data?.token) {
          setUser(res.data.user);
          setSeller(res.data.seller);
          setIsSeller(res.data.is_seller);
          setIsAdmin(res.data.is_admin);
          setToken(res.data.token);
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setAuthReady(true);
      }
    }

    doAuth();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-500 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/:slug" element={<SellerPage />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/add-product" element={<SellerAddProduct />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export { API_BASE };
export default App;
