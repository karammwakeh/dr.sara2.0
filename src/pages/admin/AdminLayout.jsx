import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Calendar, Mail,
  BookOpen, Settings, LogOut, Menu, X, ChevronLeft, Bell
} from 'lucide-react';
import AdminHome from './sections/AdminHome';
import AdminProducts from './sections/AdminProducts';
import AdminOrders from './sections/AdminOrders';
import AdminBookings from './sections/AdminBookings';
import AdminMessages from './sections/AdminMessages';
import AdminBlog from './sections/AdminBlog';

const nav = [
  { path: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'المنتجات', icon: Package },
  { path: '/admin/orders', label: 'الطلبات', icon: ShoppingCart },
  { path: '/admin/bookings', label: 'الحجوزات', icon: Calendar },
  { path: '/admin/messages', label: 'الرسائل', icon: Mail },
  { path: '/admin/blog', label: 'المدونة', icon: BookOpen },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path) && path !== '/admin' || location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100 font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen && <span className="text-xl font-bold text-yellow-400">لوحة التحكم</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors mr-auto">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = item.exact ? location.pathname === item.path : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-yellow-500 text-gray-900 font-bold' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                {user?.full_name?.[0] || 'أ'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-red-400 hover:bg-red-900/30 transition-all">
            <LogOut size={18} />
            {sidebarOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-800">
            {nav.find(n => n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'لوحة التحكم'}
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="text-sm text-gray-500 hover:text-gray-800 border px-3 py-1 rounded-lg">
              عرض الموقع ↗
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<AdminHome />} />
            <Route path="/products/*" element={<AdminProducts />} />
            <Route path="/orders" element={<AdminOrders />} />
            <Route path="/bookings" element={<AdminBookings />} />
            <Route path="/messages" element={<AdminMessages />} />
            <Route path="/blog/*" element={<AdminBlog />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
