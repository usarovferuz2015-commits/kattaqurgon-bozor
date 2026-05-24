import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Sellers from './pages/Sellers';
import Banners from './pages/Banners';
import PremiumAds from './pages/PremiumAds';
import Users from './pages/Users';
import Products from './pages/Products';

export default function App() {
  const [adminId, setAdminId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('admin');
    if (id) setAdminId(parseInt(id));
  }, []);

  if (!adminId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Admin Panel</h1>
          <p className="text-dark-500">Iltimos, Telegram orqali kiring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-50 flex">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`flex-1 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard adminId={adminId} />} />
            <Route path="/categories" element={<Categories adminId={adminId} />} />
            <Route path="/sellers" element={<Sellers adminId={adminId} />} />
            <Route path="/banners" element={<Banners adminId={adminId} />} />
            <Route path="/ads" element={<PremiumAds adminId={adminId} />} />
            <Route path="/users" element={<Users adminId={adminId} />} />
            <Route path="/products" element={<Products adminId={adminId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
