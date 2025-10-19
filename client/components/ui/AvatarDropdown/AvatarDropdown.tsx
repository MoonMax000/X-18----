import { FC, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import LoginModal from "@/components/auth/LoginModal";
import { useTheme } from "@/contexts/ThemeContext";
import { User, Settings, UserPlus, Sparkles, Sun, Moon, Languages, LogOut, LogIn } from "lucide-react";

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
      id: "login",
      label: "Login",
      onClick: () => setIsLoginModalOpen(true),
      icon: <LogIn className="w-5 h-5" style={{ color: '#A06AFF' }} />,
      dividerAfter: true
    },
    {
      id: "profile",
      label: "Мой профиль",
      to: "/profile",
      icon: <User className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: false
    },
    {
      id: "settings",
      label: "Settings and payment",
      to: "/settings",
      icon: <Settings className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: false
    },
    {
      id: "referral",
      label: "Bring a friend",
      to: "/referrals",
      icon: <UserPlus className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: false
    },
    {
      id: "updates",
      label: "What's new",
      to: "/updates",
      icon: <Sparkles className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: false
    },
    {
      id: "theme",
      label: themeLabel,
      onClick: toggleTheme,
      icon: theme === 'dark' ? <Sun className="w-5 h-5" style={{ color: '#B0B0B0' }} /> : <Moon className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: false
    },
    {
      id: "language",
      label: "Language",
      to: "/settings/language",
      icon: <Languages className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
      dividerAfter: true
    },
    {
      id: "logout",
      label: "Log out",
      onClick: () => {
        console.log("Logout clicked");
        // Add logout logic here
      },
      icon: <LogOut className="w-5 h-5" style={{ color: '#B0B0B0' }} />,
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

          <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-[300px] max-w-[320px] bg-black/50 backdrop-blur-[50px] border border-[#181B22] rounded-xl shadow-2xl shadow-black/50 py-6 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="flex items-center gap-2 mb-6">
              <img
                src={user.avatar}
                alt="User avatar"
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="text-white text-[15px] font-bold truncate">
                  {user.email}
                </div>
                <div className="flex items-center gap-1 text-[#B0B0B0] text-xs font-bold">
                  <span>ID:</span>
                  <span className="truncate">{user.id}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2E2744] mb-6" />

            {/* Menu Items */}
            <div className="space-y-0">
              {menuItems.map((item, index) => {
                const content = (
                  <div className="flex items-center gap-2 px-0 py-3 hover:opacity-70 transition-opacity duration-200 cursor-pointer">
                    <div className="flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-[#B0B0B0] text-[15px] font-bold">
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
                      <div className="h-px bg-[#2E2744] my-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};
