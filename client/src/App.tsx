import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
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
  const { initTg, token, setUser, setSeller, setIsSeller, setIsAdmin, setToken } = useAppStore();

  useEffect(() => {
    initTg();
  }, [initTg]);

  useEffect(() => {
    if (token) return; // Already have a token

    const tg = (window as any)?.Telegram?.WebApp;
    const initData = tg?.initData;

    if (initData) {
      authService.init(initData)
        .then((res) => {
          if (res.success) {
            setUser(res.data.user);
            setSeller(res.data.seller);
            setIsSeller(res.data.is_seller);
            setIsAdmin(res.data.is_admin);
            setToken(res.data.token);
          }
        })
        .catch(console.error);
    }
  }, []);

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
