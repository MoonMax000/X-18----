import { FC } from "react";

interface NotificationBellProps {
  count?: number;
}

export const NotificationBell: FC<NotificationBellProps> = ({ count = 0 }) => {
  const handleClick = () => {
    console.log("Notifications clicked");
    // Add notification logic here
  };

  const accessibleCount = count > 99 ? "99 plus" : count.toString();
  const ariaLabel =
    count > 0 ? `${accessibleCount} unread notifications` : "Notifications";

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
