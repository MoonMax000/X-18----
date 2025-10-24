import { FC, useState, useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

// Lazy load LoginModal to reduce initial bundle size
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
  const { theme, toggleTheme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock user data - replace with real user data from your auth system
  const user = {
    email: "example***@yandex.ru",
    id: "12345678910111213",
    avatar: "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200"
  };

  // Theme label changes based on current theme
  const themeLabel = theme === 'dark' ? 'Light theme' : 'Dark theme';

  const menuItems: MenuItem[] = [
    {
      id: "settings",
      label: "Settings and payment",
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
      id: "referral",
      label: "Bring a friend",
      to: "/referrals",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.66699 9.99998C1.66699 7.05208 1.66699 5.57812 2.54433 4.59406C2.68465 4.43667 2.83931 4.2911 3.00654 4.15904C4.0521 3.33331 5.61818 3.33331 8.75033 3.33331H11.2503C14.3825 3.33331 15.9486 3.33331 16.9941 4.15904C17.1613 4.2911 17.316 4.43667 17.4563 4.59406C18.3337 5.57812 18.3337 7.05208 18.3337 9.99998C18.3337 12.9479 18.3337 14.4218 17.4563 15.4059C17.316 15.5633 17.1613 15.7088 16.9941 15.8409C15.9486 16.6666 14.3825 16.6666 11.2503 16.6666H8.75033C5.61818 16.6666 4.0521 16.6666 3.00654 15.8409C2.83931 15.7088 2.68465 15.5633 2.54433 15.4059C1.66699 14.4218 1.66699 12.9479 1.66699 9.99998Z"/>
          <path d="M8.33301 13.3333H9.58301" strokeMiterlimit="10"/>
          <path d="M12.083 13.3333H14.9997" strokeMiterlimit="10"/>
          <path d="M1.66699 7.5H18.3337"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "updates",
      label: "What's new",
      to: "/updates",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.5 6.66669C12.5 8.0474 11.3807 9.16669 10 9.16669C8.61925 9.16669 7.5 8.0474 7.5 6.66669C7.5 5.28598 8.61925 4.16669 10 4.16669C11.3807 4.16669 12.5 5.28598 12.5 6.66669Z"/>
          <path d="M13.333 3.33331C14.7137 3.33331 15.833 4.4526 15.833 5.83331C15.833 6.85255 15.223 7.72934 14.3483 8.11856"/>
          <path d="M11.4286 11.6667H8.57143C6.59898 11.6667 5 13.2657 5 15.2381C5 16.0271 5.63959 16.6667 6.42857 16.6667H13.5714C14.3604 16.6667 15 16.0271 15 15.2381C15 13.2657 13.401 11.6667 11.4286 11.6667Z"/>
          <path d="M14.7617 10.8333C16.7341 10.8333 18.3331 12.4323 18.3331 14.4047C18.3331 15.1937 17.6936 15.8333 16.9046 15.8333"/>
          <path d="M6.66699 3.33331C5.28628 3.33331 4.16699 4.4526 4.16699 5.83331C4.16699 6.85255 4.77693 7.72934 5.65173 8.11856"/>
          <path d="M3.09557 15.8333C2.30658 15.8333 1.66699 15.1937 1.66699 14.4047C1.66699 12.4323 3.26598 10.8333 5.23842 10.8333"/>
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
      id: "login",
      label: "Вход",
      onClick: () => {
        setIsLoginModalOpen(true);
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.833 2.5L11.3852 2.69487C13.5341 3.45333 14.6086 3.83257 15.2208 4.69785C15.833 5.56313 15.833 6.70258 15.833 8.9815V11.0185C15.833 13.2974 15.833 14.4368 15.2208 15.3022C14.6086 16.1674 13.5341 16.5467 11.3852 17.3052L10.833 17.5"/>
          <path d="M2.49967 9.99996H10.833M2.49967 9.99996C2.49967 9.41646 4.16161 8.32623 4.58301 7.91663M2.49967 9.99996C2.49967 10.5835 4.16161 11.6737 4.58301 12.0833"/>
        </svg>
      ),
      dividerAfter: false
    },
    {
      id: "logout",
      label: "Log out",
      onClick: () => {
        console.log("Logout clicked");
        // Add logout logic here
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="size-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all duration-300 overflow-hidden"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <img
          src={user.avatar}
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

          <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-[200px] max-w-[220px] bg-black/50 backdrop-blur-[50px] border border-[#181B22] rounded-xl shadow-2xl shadow-black/50 py-4 px-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="flex items-center gap-2 mb-4">
              <img
                src={user.avatar}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="text-white text-[11px] font-bold truncate">
                  {user.email}
                </div>
                <div className="flex items-center gap-1 text-[#B0B0B0] text-[9px] font-bold">
                  <span>ID:</span>
                  <span className="truncate">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2E2744] mb-4" />

            {/* Menu Items */}
            <div className="space-y-0">
              {menuItems.map((item, index) => {
                const content = (
                  <div className="flex items-center gap-2 px-0 py-2 hover:opacity-70 transition-opacity duration-200 cursor-pointer">
                    <div className="flex-shrink-0 scale-75 origin-left">
                      {item.icon}
                    </div>
                    <span className="text-[#B0B0B0] text-[11px] font-bold">
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
