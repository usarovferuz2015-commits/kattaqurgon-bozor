import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
import MyTickets from './pages/MyTickets';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
  const { setUser, setSeller, setIsSeller, setIsAdmin, setToken, setTelegramId } = useAppStore();
  const [authReady, setAuthReady] = useState(false);
  const location = useLocation();

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    async function doAuth() {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const initData = tg?.initData;

        if (initData) {
          const res = await authService.init(initData);
          if (res.success && res.data?.token) {
            setUser(res.data.user);
            setSeller(res.data.seller);
            setIsSeller(res.data.is_seller);
            setIsAdmin(res.data.is_admin);
            setToken(res.data.token);
            setTelegramId(res.data.user?.telegram_id || null);
          }
        } else {
          const params = new URLSearchParams(window.location.search);
          const urlUserId = params.get('user');
          const storeId = useAppStore.getState().telegramId;
          const tgUserId = tg?.initDataUnsafe?.user?.id;
          const telegramId = storeId || tgUserId || (urlUserId ? parseInt(urlUserId) : null);

          if (telegramId) {
            setTelegramId(telegramId);
            const res = await authService.initById(telegramId);
            if (res.success && res.data?.token) {
              setUser(res.data.user);
              setSeller(res.data.seller);
              setIsSeller(res.data.is_seller);
              setIsAdmin(res.data.is_admin);
              setToken(res.data.token);
            }
          }
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setAuthReady(true);
      }
    }

    doAuth();
  }, []);

  // Telegram BackButton boshqaruvi
  useEffect(() => {
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.BackButton) {
        tg.BackButton.offClick(handleBack);
        if (location.pathname === '/') {
          tg.BackButton.hide();
        } else {
          tg.BackButton.onClick(handleBack);
          tg.BackButton.show();
        }
      }
    } catch (e) {
      // Telegram WebView mavjud emas
    }
    return () => {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        if (tg?.BackButton) {
          tg.BackButton.offClick(handleBack);
          tg.BackButton.hide();
        }
      } catch (e) {}
    };
  }, [location.pathname]);

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
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
