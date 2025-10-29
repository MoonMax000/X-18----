import { FC } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationBellProps {
  count?: number;
}

export const NotificationBell: FC<NotificationBellProps> = ({ count = 0 }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/social/notifications');
    } else {
      // Можно показать модалку входа или просто показать tooltip
      // Для простоты просто покажем tooltip
    }
  };

  const accessibleCount = count > 99 ? "99 plus" : count.toString();
  const ariaLabel = !isAuthenticated 
    ? "Login to see notifications"
    : count > 0 
      ? `${accessibleCount} unread notifications` 
      : "Notifications";

  // Если не авторизован, показываем иконку с замком
  if (!isAuthenticated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition-transform duration-200 hover:scale-110 hover:text-white/70 active:scale-95 cursor-not-allowed"
              aria-label={ariaLabel}
              disabled
            >
              <div className="relative">
                <svg
                  className="h-6 w-6 opacity-60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-white/70" />
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Войдите для просмотра уведомлений</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-transform duration-200 hover:scale-110 hover:text-white active:scale-95"
      aria-label={ariaLabel}
    >
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {count > 0 && (
        <>
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF454A]/70" />
            <span className="relative inline-flex h-full w-full rounded-full bg-[#EF454A]" />
          </span>
          <span className="sr-only">{accessibleCount} unread notifications</span>
        </>
      )}
    </button>
  );
};
