import { NavLink, useLocation } from 'react-router-dom';
import {
  FiGrid, FiUsers, FiShoppingBag, FiImage, FiBarChart2, FiDollarSign,
  FiMenu, FiX, FiHome, FiChevronDown, FiMessageSquare
} from 'react-icons/fi';
import { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const links = [
  { to: '/', icon: FiHome, label: 'Dashboard', color: 'from-emerald-500 to-emerald-600' },
  { to: '/categories', icon: FiGrid, label: 'Kategoriyalar', color: 'from-blue-500 to-blue-600' },
  { to: '/products', icon: FiShoppingBag, label: 'Mahsulotlar', color: 'from-violet-500 to-violet-600' },
  { to: '/sellers', icon: FiUsers, label: 'Sotuvchilar', color: 'from-amber-500 to-amber-600' },
  { to: '/users', icon: FiUsers, label: 'Foydalanuvchilar', color: 'from-cyan-500 to-cyan-600' },
  { to: '/banners', icon: FiImage, label: 'Bannerlar', color: 'from-rose-500 to-rose-600' },
  { to: '/ads', icon: FiDollarSign, label: 'Reklamalar', color: 'from-purple-500 to-purple-600' },
  { to: '/analytics', icon: FiBarChart2, label: 'Analitika', color: 'from-indigo-500 to-indigo-600' },
  { to: '/support', icon: FiMessageSquare, label: 'Murojaatlar', color: 'from-teal-500 to-teal-600' },
];

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full z-50 transition-all duration-300
        ${open ? 'w-64' : 'w-[72px]'}
      `}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 rounded-r-2xl" />
        <div className="absolute inset-0 bg-white/[0.03] rounded-r-2xl" />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-white/10">
            {open && (
              <div className="flex items-center gap-2.5 flex-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <span className="text-white font-bold text-xs">KB</span>
                </div>
                <div>
                  <span className="font-bold text-sm text-white">Admin Panel</span>
                  <p className="text-[10px] text-white/50">Kattaqo'rg'on Bozori</p>
                </div>
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white ml-auto"
            >
              {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? 'bg-white/10 text-white shadow-lg'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${link.color}`} />
                  )}
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                    ${isActive
                      ? `bg-gradient-to-br ${link.color} shadow-lg`
                      : 'bg-white/5 group-hover:bg-white/10'
                    }
                  `}>
                    <link.icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} />
                  </div>
                  {open && (
                    <span className="text-sm font-medium">{link.label}</span>
                  )}
                  {isActive && open && (
                    <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-b ${link.color} animate-pulse`} />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          {open && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">Admin</p>
                  <p className="text-[10px] text-white/50">Super Admin</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
