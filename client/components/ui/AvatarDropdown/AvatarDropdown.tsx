import { FC, useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl } from "@/lib/avatar-utils";

// Lazy load modal to reduce initial bundle size
const LoginModal = lazy(() => import("@/components/auth/LoginModal"));

interface MenuItem {
  id: string;
  label: string;
  to?: string;
  onClick?: () => void;
  icon: JSX.Element;
  dividerAfter?: boolean;
}

export const AvatarDropdown: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialScreen, setLoginInitialScreen] = useState<'login' | 'signup'>('login');
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme label changes based on current theme
  const themeLabel = theme === 'dark' ? 'Light theme' : 'Dark theme';

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      to: "/profile",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1"/>
          <rect x="11" y="3" width="6" height="6" rx="1"/>
          <rect x="3" y="11" width="6" height="6" rx="1"/>
          <rect x="11" y="11" width="6" height="6" rx="1"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "profile",
      label: "Profile",
      to: "/profile-page",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 6.66669C12.5 8.0474 11.3807 9.16669 10 9.16669C8.61925 9.16669 7.5 8.0474 7.5 6.66669C7.5 5.28598 8.61925 4.16669 10 4.16669C11.3807 4.16669 12.5 5.28598 12.5 6.66669Z"/>
          <path d="M11.4286 11.6667H8.57143C6.59898 11.6667 5 13.2657 5 15.2381C5 16.0271 5.63959 16.6667 6.42857 16.6667H13.5714C14.3604 16.6667 15 16.0271 15 15.2381C15 13.2657 13.401 11.6667 11.4286 11.6667Z"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "settings",
      label: "Settings",
      to: "/settings",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"/>
          <path d="M16.1664 10.8333C16.2664 10.5667 16.2664 10.2833 16.1664 10L17.3997 8.75C17.4664 8.68333 17.4997 8.6 17.4997 8.5C17.4997 8.4 17.4664 8.31667 17.3997 8.25L16.1664 7C16.0997 6.93333 16.0164 6.9 15.9164 6.9C15.8164 6.9 15.7331 6.93333 15.6664 7L14.4331 8.23333C14.1664 8.13333 13.8831 8.13333 13.5831 8.23333L12.3331 7C12.2664 6.93333 12.1831 6.9 12.0831 6.9C11.9831 6.9 11.8997 6.93333 11.8331 7L10.5997 8.23333C10.3331 8.13333 10.0497 8.13333 9.74974 8.23333L8.49974 7C8.43307 6.93333 8.34974 6.9 8.24974 6.9C8.14974 6.9 8.0664 6.93333 7.99974 7L6.76641 8.23333C6.49974 8.13333 6.2164 8.13333 5.9164 8.23333L4.6664 7C4.59974 6.93333 4.5164 6.9 4.4164 6.9C4.3164 6.9 4.23307 6.93333 4.1664 7L2.93307 8.23333C2.86641 8.3 2.83307 8.38333 2.83307 8.48333C2.83307 8.58333 2.86641 8.66667 2.93307 8.73333L4.1664 9.98333C4.0664 10.25 4.0664 10.5333 4.1664 10.8333L2.93307 12.0833C2.86641 12.15 2.83307 12.2333 2.83307 12.3333C2.83307 12.4333 2.86641 12.5167 2.93307 12.5833L4.1664 13.8333C4.23307 13.9 4.3164 13.9333 4.4164 13.9333C4.5164 13.9333 4.59974 13.9 4.6664 13.8333L5.9164 12.6C6.18307 12.7 6.46641 12.7 6.76641 12.6L8.0164 13.8333C8.08307 13.9 8.1664 13.9333 8.2664 13.9333C8.3664 13.9333 8.44974 13.9 8.5164 13.8333L9.74974 12.6C10.0164 12.7 10.2997 12.7 10.5997 12.6L11.8497 13.8333C11.9164 13.9 11.9997 13.9333 12.0997 13.9333C12.1997 13.9333 12.2831 13.9 12.3497 13.8333L13.5831 12.6C13.8497 12.7 14.1331 12.7 14.4331 12.6L15.6831 13.8333C15.7497 13.9 15.8331 13.9333 15.9331 13.9333C16.0331 13.9333 16.1164 13.9 16.1831 13.8333L17.4164 12.6C17.4831 12.5333 17.5164 12.45 17.5164 12.35C17.5164 12.25 17.4831 12.1667 17.4164 12.1L16.1664 10.8333Z"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "theme",
      label: themeLabel,
      onClick: toggleTheme,
      icon: theme === 'dark' ? (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="4"/>
          <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.657 4.343l-1.414 1.414M5.757 14.243l-1.414 1.414M15.657 15.657l-1.414-1.414M5.757 5.757L4.343 4.343"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 10.8C16.4 11.5 15.1 12 13.7 12C9.3 12 5.7 8.4 5.7 4C5.7 2.6 6.2 1.3 6.9 0.2C3.4 1.1 1 4.3 1 8C1 12.4 4.6 16 9 16C12.7 16 15.9 13.6 16.8 10.1L17.5 10.8Z" transform="translate(1, 2)"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "language",
      label: "Language",
      to: "/settings/language",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/>
          <path d="M2 10h16M10 2a15.3 15.3 0 0 1 4 8 15.3 15.3 0 0 1-4 8 15.3 15.3 0 0 1-4-8 15.3 15.3 0 0 1 4-8z"/>
        </svg>
      ),
      dividerAfter: true
    },
    {
      id: "logout",
      label: "Log out",
      onClick: async () => {
        await logout();
        setIsOpen(false);
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.16699 2.5L8.61483 2.69487C6.46588 3.45333 5.39139 3.83257 4.77919 4.69785C4.16699 5.56313 4.16699 6.70258 4.16699 8.9815V11.0185C4.16699 13.2974 4.16699 14.4368 4.77919 15.3022C5.39139 16.1674 6.46588 16.5467 8.61483 17.3052L9.16699 17.5"/>
          <path d="M17.5003 9.99996H9.16699M17.5003 9.99996C17.5003 9.41646 15.8384 8.32623 15.417 7.91663M17.5003 9.99996C17.5003 10.5835 15.8384 11.6737 15.417 12.0833"/>
        </svg>
      ),
      dividerAfter: false
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  // If not authenticated, show only Sign In button (Sign Up is in Header)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setLoginInitialScreen('login');
            setIsLoginModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-semibold text-white hover:text-primary transition-colors"
        >
          Sign In
        </button>

        {isLoginModalOpen && (
          <Suspense fallback={null}>
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              initialScreen={loginInitialScreen}
            />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all duration-300 overflow-hidden"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <img
          src={getAvatarUrl(user)}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div
            className="sm:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-[260px] max-w-[280px] bg-black/50 backdrop-blur-[50px] border border-[#181B22] rounded-xl shadow-2xl shadow-black/50 py-5 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={getAvatarUrl(user)}
                alt="User avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <div className="text-white text-sm font-bold truncate">
                  {user.display_name || user.username}
                </div>
                <div className="flex items-center gap-1 text-[#B0B0B0] text-xs font-medium">
                  <span>@{user.username}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2E2744] mb-4" />

            {/* Menu Items */}
            <div className="space-y-0">
              {menuItems.map((item, index) => {
                const content = (
                  <div className="flex items-center gap-3 px-1 py-2.5 hover:opacity-70 transition-opacity duration-200 cursor-pointer">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-[#B0B0B0] text-sm font-semibold">
                      {item.label}
                    </span>
                  </div>
                );

                const element = item.to ? (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.onClick?.();
                      if (item.id !== 'theme') {
                        setIsOpen(false);
                      }
                    }}
                  >
                    {content}
                  </div>
                );

                return (
                  <div key={item.id}>
                    {element}
                    {item.dividerAfter && (
                      <div className="h-px bg-[#2E2744] my-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
