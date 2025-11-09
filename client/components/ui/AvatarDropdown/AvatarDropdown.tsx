import { FC, useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl } from "@/lib/avatar-utils";
import {
  DashboardIcon,
  ProfileIcon,
  SecurityIcon,
  NotificationIcon,
  BillingIcon,
  ReferralsIcon,
  APIIcon,
  KYCIcon,
  LogoutIcon,
} from "@/components/ui/icons/MenuIcons";

// Lazy load modal to reduce initial bundle size
const LoginModal = lazy(() => import("@/components/auth/LoginModal"));

interface MenuItem {
  id: string;
  label: string;
  to?: string;
  onClick?: () => void;
  icon: JSX.Element;
}

export const AvatarDropdown: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayEmail = user?.email || "example***@yandex.ru";
  const displayUsername = user?.username || "@devidandersoncrypto";
  const displayAvatar = user?.avatar_url || getAvatarUrl(user);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      to: "/settings?tab=social&socialTab=overview",
      icon: <DashboardIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "profile",
      label: "Profile settings",
      to: "/settings?tab=profile&profileTab=profile",
      icon: <ProfileIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "security",
      label: "Security",
      to: "/settings?tab=profile&profileTab=security",
      icon: <SecurityIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      to: "/social/notifications",
      icon: <NotificationIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "billing",
      label: "Billing",
      to: "/settings?tab=profile&profileTab=billing",
      icon: <BillingIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "referrals",
      label: "Referrals",
      to: "/settings?tab=profile&profileTab=referrals",
      icon: <ReferralsIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "api",
      label: "API",
      to: "/settings?tab=profile&profileTab=api",
      icon: <APIIcon className="text-[#B0B0B0]" />,
    },
    {
      id: "kyc",
      label: "KYC",
      to: "/settings?tab=profile&profileTab=kyc",
      icon: <KYCIcon className="text-[#B0B0B0]" />,
    },
  ];

  // If not authenticated, show only Sign In button (Sign Up is in Header)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold text-white hover:text-primary transition-colors"
        >
          Sign In
        </button>

        {isLoginModalOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              initialScreen="login"
            />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all duration-300 overflow-hidden"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <img src={displayAvatar} alt="User avatar" className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div 
            className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[247px] bg-black backdrop-blur-[50px] border border-[#523A83] rounded-xl shadow-2xl shadow-black/50 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            {/* User Info Header */}
            <div className="flex items-center gap-2 mb-6">
              <img src={displayAvatar} alt="User avatar" className="w-11 h-11 rounded-full object-cover" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="text-white text-[15px] font-bold truncate">{displayEmail}</div>
                <div className="text-[#B0B0B0] text-xs font-bold truncate">{displayUsername}</div>
              </div>
            </div>

            {/* Gradient Divider */}
            <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, rgba(82, 58, 131, 0.00) 0%, #523A83 50%, rgba(82, 58, 131, 0.00) 100%)' }} />

            {/* Menu Items */}
            <div className="flex flex-col gap-6">
              {menuItems.map((item) => (
                <Link 
                  key={item.id}
                  to={item.to || '#'} 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center gap-2 text-[#B0B0B0] hover:text-white transition-colors"
                >
                  {item.icon}
                  <span className="text-[15px] font-bold">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Bottom Gradient Divider */}
            <div className="h-px my-6" style={{ background: 'linear-gradient(90deg, rgba(82, 58, 131, 0.00) 0%, #523A83 50%, rgba(82, 58, 131, 0.00) 100%)' }} />

            {/* Log out / Log in */}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="flex items-center gap-2 text-[#B0B0B0] hover:text-white transition-colors w-full">
                <LogoutIcon className="text-[#B0B0B0]" />
                <span className="text-[15px] font-bold">Log out</span>
              </button>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-[#B0B0B0] hover:text-white transition-colors w-full">
                <LogoutIcon className="text-[#B0B0B0]" />
                <span className="text-[15px] font-bold">Log in</span>
              </button>
            )}
          </div>
        </>
      )}

      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
