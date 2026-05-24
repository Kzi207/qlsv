import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Home, CalendarCheck, Award, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const { logout } = useAuthStore();

  const navItems = [
    { icon: Home, label: 'Trang chủ', path: '/' },
    { icon: CalendarCheck, label: 'Điểm danh', path: '/attendance/scan' },
    { icon: Award, label: 'DRL', path: '/training/evaluation/self' },
    { icon: User, label: 'Cá nhân', path: '/profile' },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-2xl shadow-slate-900/10 rounded-t-3xl px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-700 active:scale-90'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-blue-50' : ''}`}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-blue-600' : ''}
                />
              </div>
              <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>
                {label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-blue-600 rounded-full"
                />
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl text-slate-400 hover:text-rose-500 active:scale-90 transition-all duration-200"
        >
          <div className="p-1.5 rounded-xl">
            <LogOut size={22} strokeWidth={1.8} />
          </div>
          <span className="text-[10px] font-bold">Đăng xuất</span>
        </button>
      </div>
    </nav>
  );
};

const MainLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const isStudent = user?.role?.toUpperCase() === 'STUDENT';

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="lg:ml-80 min-h-screen flex flex-col transition-all duration-500">
        {/* Mobile Header - Ultra Clean */}
        <header className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="h-11 w-11 shrink-0 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl active:scale-90 transition-all border border-slate-100 shadow-sm"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="flex items-center gap-2.5 min-w-0 hover:no-underline cursor-pointer group">
               <div className="h-10 w-10 shrink-0 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300">
                  <img src="/logo-qlsv.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
               <div className="flex flex-col min-w-0">
                 <p className="text-[10px] font-extrabold uppercase tracking-tight text-slate-800 truncate leading-none">
                   ĐH Kỹ Thuật - Công Nghệ Cần Thơ
                 </p>
                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5 leading-none">
                   Khoa Kỹ Thuật Cơ Khí
                 </span>
               </div>
            </Link>
          </div>
          
          <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-blue-600 text-sm shadow-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        <main className={`flex-1 p-3 md:p-8 ${isStudent ? 'pb-24 lg:pb-8' : ''}`}>
          <Outlet />
        </main>
      </div>

      {/* Global Bottom Nav for Students */}
      {isStudent && <BottomNav />}
    </div>
  );
};

export default MainLayout;
