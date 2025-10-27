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
          <path d="M2.08301 9.99998C2.08301 6.26803 2.08301 4.40205 3.24237 3.24268C4.40175 2.08331 6.26772 2.08331 9.99967 2.08331C13.7316 2.08331 15.5976 2.08331 16.757 3.24268C17.9163 4.40205 17.9163 6.26803 17.9163 9.99998C17.9163 13.7319 17.9163 15.5979 16.757 16.7573C15.5976 17.9166 13.7316 17.9166 9.99967 17.9166C6.26772 17.9166 4.40175 17.9166 3.24237 16.7573C2.08301 15.5979 2.08301 13.7319 2.08301 9.99998Z"/>
          <path d="M13.333 7.91663H6.66634M10.833 12.0833H6.66634M10.833 14.5833H6.66634" strokeLinecap="round"/>
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
          <path d="M2.10794 12.308C1.93073 13.4697 2.72301 14.276 3.69305 14.6779C7.41202 16.2185 12.5873 16.2185 16.3063 14.6779C17.2763 14.276 18.0686 13.4697 17.8914 12.308C17.7825 11.5941 17.244 10.9996 16.845 10.4191C16.3224 9.64944 16.2705 8.80985 16.2704 7.91669C16.2704 4.4649 13.4629 1.66669 9.99968 1.66669C6.53645 1.66669 3.72895 4.4649 3.72895 7.91669C3.72887 8.80985 3.67694 9.64944 3.15435 10.4191C2.75538 10.9996 2.21685 11.5941 2.10794 12.308Z"/>
          <path d="M6.66699 15.8333C7.04907 17.271 8.39658 18.3333 10.0003 18.3333C11.6041 18.3333 12.9516 17.271 13.3337 15.8333"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "theme",
      label: themeLabel,
      onClick: toggleTheme,
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5">
          <path d="M2.08301 9.99998C2.08301 6.26803 2.08301 4.40205 3.24237 3.24268C4.40175 2.08331 6.26772 2.08331 9.99967 2.08331C13.7316 2.08331 15.5976 2.08331 16.757 3.24268C17.9163 4.40205 17.9163 6.26803 17.9163 9.99998C17.9163 13.7319 17.9163 15.5979 16.757 16.7573C15.5976 17.9166 13.7316 17.9166 9.99967 17.9166C6.26772 17.9166 4.40175 17.9166 3.24237 16.7573C2.08301 15.5979 2.08301 13.7319 2.08301 9.99998Z"/>
          <path d="M4.99967 11.25L6.24967 7.5L7.81217 11.25M4.99967 11.25L4.58301 12.5M4.99967 11.25H7.81217M7.81217 11.25L8.33301 12.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.417 10V8.08333C10.417 7.92822 10.417 7.85068 10.4374 7.78791C10.4786 7.66106 10.5781 7.56161 10.7049 7.52039C10.7677 7.5 10.8452 7.5 11.0003 7.5H12.0837C12.774 7.5 13.3337 8.05964 13.3337 8.75C13.3337 9.44033 12.774 10 12.0837 10H10.417ZM10.417 10V12.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.417 7.5V12.5" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M12.0833 7.08329C12.0833 4.78211 10.2178 2.91663 7.91667 2.91663C5.61548 2.91663 3.75 4.78211 3.75 7.08329C3.75 9.38446 5.61548 11.25 7.91667 11.25C10.2178 11.25 12.0833 9.38446 12.0833 7.08329Z"/>
          <path d="M13.7497 17.0833C13.7497 13.8617 11.138 11.25 7.91634 11.25C4.69468 11.25 2.08301 13.8617 2.08301 17.0833"/>
          <path d="M14.583 8.20508C14.583 7.35542 15.3292 6.66663 16.2497 6.66663C17.1702 6.66663 17.9163 7.35542 17.9163 8.20508C17.9163 8.51138 17.8194 8.79671 17.6523 9.03646C17.1542 9.75096 16.2497 10.0157 16.2497 10.8654V11.25M16.2415 13.3333H16.249"/>
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

  // If not authenticated, show Sign In / Sign Up buttons
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
        <button
          onClick={() => {
            setLoginInitialScreen('signup');
            setIsLoginModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Sign Up
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
