import { NavLink } from 'react-router-dom';
import { FiGrid, FiUsers, FiShoppingBag, FiImage, FiBarChart2, FiDollarSign, FiMenu, FiX, FiHome } from 'react-icons/fi';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const links = [
    { to: '/', icon: FiHome, label: 'Dashboard' },
    { to: '/categories', icon: FiGrid, label: 'Kategoriyalar' },
    { to: '/products', icon: FiShoppingBag, label: 'Mahsulotlar' },
    { to: '/sellers', icon: FiUsers, label: 'Sotuvchilar' },
    { to: '/users', icon: FiUsers, label: 'Foydalanuvchilar' },
    { to: '/banners', icon: FiImage, label: 'Bannerlar' },
    { to: '/ads', icon: FiDollarSign, label: 'Reklamalar' },
    { to: '/analytics', icon: FiBarChart2, label: 'Analitika' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-dark-900 text-white transition-all duration-200 z-50 ${open ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-dark-700">
        {open && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">KB</span>
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        )}
        <button onClick={onToggle} className="p-1.5 hover:bg-dark-700 rounded-lg">
          {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? 'bg-primary-600 text-white' : 'text-dark-300 hover:bg-dark-700 hover:text-white'
              }`
            }
          >
            <link.icon className="w-5 h-5 flex-shrink-0" />
            {open && <span className="text-sm font-medium">{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
