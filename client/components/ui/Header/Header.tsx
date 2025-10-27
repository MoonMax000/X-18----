import { FC, Dispatch, SetStateAction } from "react";
import { Link } from "react-router-dom";
import RightBarButton from "../RightBar/RightBarButton";
import { AnimatedLogo } from "../AnimatedLogo/AnimatedLogo";
import { AvatarDropdown } from "../AvatarDropdown/AvatarDropdown";
import { NotificationBell } from "./NotificationBell";
import { useCustomNotifications } from "@/hooks/useCustomNotifications";
import { useAuth } from "@/contexts/AuthContext";

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
  
  // Fetch unread notifications count
  const { unreadCount } = useCustomNotifications({
    limit: 10,
    autoRefresh: true,
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
        <div className="flex items-center gap-2 h-10 px-4 rounded-3xl border border-[#A06AFFCC] bg-black w-full md:max-w-[260px] lg:max-w-[320px] xl:max-w-[360px]">
          <svg
            className="w-6 h-6 flex-shrink-0 text-webGray"
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21C17.2467 21 21.5 16.7467 21.5 11.5C21.5 6.25329 17.2467 2 12 2C6.75329 2 2.5 6.25329 2.5 11.5C2.5 16.7467 6.75329 21 12 21Z"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22.5 22L20.5 20"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            className="bg-transparent text-white text-[14px] sm:text-[15px] font-semibold placeholder:text-webGray outline-none w-full"
            placeholder="Поиск по авторам и темам"
          />
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
        <AvatarDropdown />
          {setRightMenuOpen && (
            <RightBarButton
              isCollapsed={rightMenuOpen}
              setIsCollapsed={setRightMenuOpen}
            />
          )}
        </div>
      </div>
    </header>
  );
};
