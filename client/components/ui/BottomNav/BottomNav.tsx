import { FC, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onTweetClick: () => void;
}

const BottomNav: FC<BottomNavProps> = ({ onTweetClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isHubOpen, setIsHubOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/social/explore';
    return location.pathname.startsWith(path);
  };

  const products = [
    {
      name: 'Marketplace',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      path: '/marketplace'
    },
    {
      name: 'Trading',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      path: '/trading'
    },
    {
      name: 'Portfolio',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      path: '/portfolios'
    },
    {
      name: 'Analytics',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      path: '/dashboard'
    },
    {
      name: 'Settings',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m6-12l-4.2 4.2m-3.6 3.6L6 19m12-12l-4.2 4.2m-3.6 3.6L6 5m12 12l-4.2-4.2m-3.6-3.6L6 5" />
        </svg>
      ),
      path: '/settings'
    },
    {
      name: 'Messages',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      path: '/messages'
    }
  ];

  const handleProductClick = (path: string) => {
    navigate(path);
    setIsHubOpen(false);
  };

  return (
    <>
      {/* Hub Menu Overlay */}
      {isHubOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 animate-in fade-in duration-200"
          onClick={() => setIsHubOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Menu Panel */}
          <div
            className="absolute top-0 left-0 right-0 mx-3 mt-3 animate-in slide-in-from-top duration-300 rounded-[24px] border border-[#181B22] p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Сервисы</h3>
              <button
                onClick={() => setIsHubOpen(false)}
                className="text-[#8E92A0] hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-3 gap-4">
              {products.map((product) => (
                <button
                  key={product.path}
                  onClick={() => handleProductClick(product.path)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200",
                    isActive(product.path)
                      ? "bg-gradient-to-br from-[#A06AFF]/20 to-[#482090]/20 text-[#A06AFF] ring-1 ring-[#A06AFF]/30"
                      : "bg-[rgba(255,255,255,0.03)] text-[#8E92A0] hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
                  )}
                >
                  {product.icon}
                  <span className="text-xs font-medium text-center leading-tight">{product.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
        {/* Background with gradient border */}
        <div className="relative mx-3 mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-[#523A83] via-transparent to-[#523A83] rounded-[24px] p-[1px]">
            <div className="h-full w-full bg-black backdrop-blur-xl rounded-[24px]" />
          </div>
          
          {/* Nav content */}
          <div className="relative flex items-center justify-around h-16 px-2">
            {/* Home */}
            <button
              onClick={() => navigate('/social/explore')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-colors",
                isActive('/social/explore') || isActive('/')
                  ? "text-[#A06AFF]"
                  : "text-[#8E92A0] hover:text-white"
              )}
              aria-label="Explore"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>

            {/* Explore/Social */}
            <button
              onClick={() => navigate('/social/explore')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-colors",
                isActive('/social/explore') 
                  ? "text-[#A06AFF]" 
                  : "text-[#8E92A0] hover:text-white"
              )}
              aria-label="Explore"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
            </button>

            {/* Tweet Button (Center FAB with cutout) */}
            <div className="relative -mt-8">
              <button
                onClick={onTweetClick}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_24px_-4px_rgba(160,106,255,0.8)] transition-all duration-200 hover:shadow-[0_12px_32px_-4px_rgba(160,106,255,0.9)] hover:scale-105 active:scale-95"
                aria-label="Create post"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" />
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
                </svg>
              </button>
            </div>

            {/* Notifications */}
            <button
              onClick={() => navigate('/social/notifications')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-colors relative",
                isActive('/social/notifications') 
                  ? "text-[#A06AFF]" 
                  : "text-[#8E92A0] hover:text-white"
              )}
              aria-label="Notifications"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {/* Notification badge */}
              <span className="absolute top-0 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF454A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF454A]"></span>
              </span>
            </button>

            {/* Hub Button */}
            <button
              onClick={() => setIsHubOpen(!isHubOpen)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-colors",
                isHubOpen
                  ? "text-[#A06AFF]"
                  : "text-[#8E92A0] hover:text-white"
              )}
              aria-label="Hub"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
