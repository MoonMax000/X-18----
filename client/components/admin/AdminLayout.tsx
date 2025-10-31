import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Flag,
  LogOut,
  ShieldCheck
} from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Проверка прав доступа
  React.useEffect(() => {
    console.log('🔍 AdminLayout - Checking access...');
    console.log('User:', user);
    console.log('User role:', user?.role);
    console.log('Is admin?', user?.role === 'admin');
    
    if (!user) {
      console.log('❌ No user - redirecting to home');
      navigate('/');
    } else if (user.role !== 'admin') {
      console.log('❌ User role is not admin - redirecting to home. Current role:', user.role);
      navigate('/');
    } else {
      console.log('✅ Access granted - user is admin');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    console.log('🚫 Rendering null because user is not admin');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Панель управления' },
    { path: '/admin/news', icon: Newspaper, label: 'Новости' },
    { path: '/admin/users', icon: Users, label: 'Пользователи' },
    { path: '/admin/reports', icon: Flag, label: 'Жалобы' },
  ];

  return (
    <div className="min-h-screen bg-richBlack">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-moonlessNight border-r border-widget-border">
        {/* Header */}
        <div className="p-6 border-b border-widget-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-tyrian/10 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-tyrian" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Админ панель
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-tyrian/20 text-tyrian shadow-lg shadow-tyrian/10'
                    : 'text-gray-400 hover:text-white hover:bg-onyxGrey'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-widget-border bg-moonlessNight">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={user.avatar_url || '/default-avatar.png'}
                alt={user.display_name}
                className="w-10 h-10 rounded-full ring-2 ring-tyrian/20"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.display_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  @{user.username}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-tyrian hover:bg-tyrian/10 rounded-lg transition-colors"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="container mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
