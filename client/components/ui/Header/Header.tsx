import { FC, Dispatch, SetStateAction, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import RightBarButton from "../RightBar/RightBarButton";
import { AnimatedLogo } from "../AnimatedLogo/AnimatedLogo";
import { AvatarDropdown } from "../AvatarDropdown/AvatarDropdown";
import { NotificationBell } from "./NotificationBell";
import { useCustomNotifications } from "@/hooks/useCustomNotifications";
import { useAuth } from "@/contexts/AuthContext";

// Lazy load modal to reduce initial bundle size
const LoginModal = lazy(() => import("@/components/auth/LoginModal"));

interface HeaderProps {
  rightMenuOpen?: boolean;
  setRightMenuOpen?: Dispatch<SetStateAction<boolean>>;
  leftMenuOpen?: boolean;
  setLeftMenuOpen?: Dispatch<SetStateAction<boolean>>;
}

export const Header: FC<HeaderProps> = ({
  rightMenuOpen = false,
  setRightMenuOpen,
  leftMenuOpen = false,
  setLeftMenuOpen,
}) => {
  const { user } = useAuth();
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  
  // Fetch unread notifications count only if user is authenticated
  const { unreadCount } = useCustomNotifications({
    limit: 10,
    autoRefresh: !!user, // Only auto-refresh if user exists
    refreshInterval: 60000, // Refresh every minute
  });

  return (
    <header className="pb-1 pt-3 w-full px-3 sm:px-4 md:pl-[30px] md:pr-[24px] bg-background items-center gap-2 mb-6">
      {/* Mobile Layout */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex-1 flex items-center justify-start">
          {setLeftMenuOpen && (
            <button
              onClick={() => setLeftMenuOpen(!leftMenuOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 bg-transparent hover:bg-[#181B20]"
              aria-label={leftMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-pressed={leftMenuOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {leftMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
        <AnimatedLogo />
        <div className="flex-1 flex items-center justify-end gap-2">
          {!user && (
            <button
              onClick={() => setIsSignUpModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#A06AFF] to-[#7C3AED] hover:from-[#B084FF] hover:to-[#8B49FF] transition-all duration-200"
            >
              Sign Up
            </button>
          )}
          <AvatarDropdown />
          {setRightMenuOpen && (
            <RightBarButton
              isCollapsed={rightMenuOpen}
              setIsCollapsed={setRightMenuOpen}
            />
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Desktop Brand */}
        <div className="min-w-0 sm:min-w-[180px] md:min-w-[230px] justify-self-start flex items-center gap-3">
          {setLeftMenuOpen && (
            <button
              onClick={() => setLeftMenuOpen(!leftMenuOpen)}
              className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 bg-transparent hover:bg-[#181B20]"
              aria-label={leftMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-pressed={leftMenuOpen}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {leftMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
          <AnimatedLogo />
        </div>

        {/* Center: Search + Assistant (desktop) */}
        <div className="flex items-center gap-4 justify-self-center">
        <div className="group flex items-center gap-3 h-12 px-5 rounded-full border border-[#A06AFF]/30 bg-gradient-to-r from-black/50 to-[#A06AFF]/5 backdrop-blur-xl w-full md:max-w-[280px] lg:max-w-[340px] xl:max-w-[400px] hover:border-[#A06AFF]/60 hover:shadow-[0_0_20px_rgba(160,106,255,0.15)] transition-all duration-300">
          <svg
            className="w-5 h-5 flex-shrink-0 text-[#A06AFF]/70 group-hover:text-[#A06AFF] transition-colors duration-300"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17.5 17.5L14.1667 14.1667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className="bg-transparent text-white text-[14px] sm:text-[15px] font-medium placeholder:text-[#A06AFF]/50 placeholder:font-normal outline-none w-full group-hover:placeholder:text-[#A06AFF]/70 transition-colors duration-300"
            placeholder="Поиск авторов и тем..."
          />
          <kbd className="hidden sm:flex items-center gap-1 h-6 px-2 text-[11px] font-medium text-[#A06AFF]/50 border border-[#A06AFF]/20 rounded-md bg-[#A06AFF]/5">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        </div>
        {false && (
        <a
          href={"https://aihelp.tyriantrade.com/"}
          target="_blank"
          rel="noreferrer"
          className="flex gap-[6px] items-center"
          aria-label="Open AI Assistant"
        >
          <div className="p-[1px] rounded-[4px] bg-gradient-to-r from-[#A06AFF] via-[#A06AFF] to-transparent size-[32px] flex items-center justify-center">
            <div className="bg-black rounded-[4px] size-[30px] flex items-center justify-center">
              <div className="rounded-[3px] bg-background text-white flex items-center justify-center text-sm font-bold w-full h-full">
                AI
              </div>
            </div>
          </div>
          <span className="font-medium text-[15px] text-white">Assistant</span>
        </a>
        )}
        </div>

        {/* Right actions */}
        <div className="flex items-center justify-end w-full sm:max-w-[300px] md:max-w-[350px] gap-2 sm:gap-3 md:gap-4 justify-self-end">
          {user && (
            <div className="hidden md:block">
              <NotificationBell count={unreadCount} />
            </div>
          )}
          {!user && (
            <button
              onClick={() => setIsSignUpModalOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#A06AFF] to-[#7C3AED] hover:from-[#B084FF] hover:to-[#8B49FF] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </button>
          )}
          <AvatarDropdown />
          {setRightMenuOpen && (
            <RightBarButton
              isCollapsed={rightMenuOpen}
              setIsCollapsed={setRightMenuOpen}
            />
          )}
        </div>
      </div>

      {/* Sign Up Modal */}
      {isSignUpModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isSignUpModalOpen}
            onClose={() => setIsSignUpModalOpen(false)}
            initialScreen="signup"
          />
        </Suspense>
      )}
    </header>
  );
};
