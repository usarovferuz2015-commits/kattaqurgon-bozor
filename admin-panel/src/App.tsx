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
import Analytics from './pages/Analytics';

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 to-dark-100">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/30">
            <span className="text-white font-bold text-2xl">KB</span>
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Admin Panel</h1>
          <p className="text-dark-500">Iltimos, Telegram orqali kiring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-[72px] ml-0'}`}>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard adminId={adminId} />} />
            <Route path="/categories" element={<Categories adminId={adminId} />} />
            <Route path="/sellers" element={<Sellers adminId={adminId} />} />
            <Route path="/banners" element={<Banners adminId={adminId} />} />
            <Route path="/ads" element={<PremiumAds adminId={adminId} />} />
            <Route path="/users" element={<Users adminId={adminId} />} />
            <Route path="/products" element={<Products adminId={adminId} />} />
            <Route path="/analytics" element={<Analytics adminId={adminId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
