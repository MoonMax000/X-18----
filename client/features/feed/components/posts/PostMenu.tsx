import { useState, useRef, useEffect } from "react";
import { Trash2, Link2, Pin, Flag, UserX } from "lucide-react";

interface PostMenuProps {
  isOwnPost: boolean;
  postId: string;
  onDelete?: () => void;
  onCopyLink?: () => void;
  onPin?: () => void;
  onReport?: () => void;
  onBlockAuthor?: () => void;
}

export default function PostMenu({
  isOwnPost,
  postId,
  onDelete,
  onCopyLink,
  onPin,
  onReport,
  onBlockAuthor,
}: PostMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/home/post/${postId}`;
    navigator.clipboard.writeText(postUrl);
    onCopyLink?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete?.();
    setIsOpen(false);
  };

  const handlePin = () => {
    onPin?.();
    setIsOpen(false);
  };

  const handleReport = () => {
    onReport?.();
    setIsOpen(false);
  };

  const handleBlockAuthor = () => {
    onBlockAuthor?.();
    setIsOpen(false);
  };

  const menuItems = isOwnPost
    ? [
        {
          label: "Удалить",
          icon: Trash2,
          onClick: handleDelete,
          dangerous: true,
        },
        {
          label: "Копировать ссы��ку",
          icon: Link2,
          onClick: handleCopyLink,
          dangerous: false,
        },
        {
          label: "Закрепить",
          icon: Pin,
          onClick: handlePin,
          dangerous: false,
        },
      ]
    : [
        {
          label: "Копировать ссылку",
          icon: Link2,
          onClick: handleCopyLink,
          dangerous: false,
        },
        {
          label: "Пожаловаться",
          icon: Flag,
          onClick: handleReport,
          dangerous: false,
        },
        {
          label: "Заблокировать автора",
          icon: UserX,
          onClick: handleBlockAuthor,
          dangerous: true,
        },
      ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="More options"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-all duration-200 hover:bg-[#A06AFF]/[0.15] hover:text-white active:bg-[#A06AFF]/[0.25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
        >
          <path
            d="M8.00004 8.66675C8.17685 8.66675 8.34642 8.59651 8.47145 8.47149C8.59647 8.34646 8.66671 8.17689 8.66671 8.00008C8.66671 7.82327 8.59647 7.6537 8.47145 7.52868C8.34642 7.40365 8.17685 7.33341 8.00004 7.33341C7.82323 7.33341 7.65366 7.40365 7.52864 7.52868C7.40361 7.6537 7.33337 7.82327 7.33337 8.00008C7.33337 8.17689 7.40361 8.34646 7.52864 8.47149C7.65366 8.59651 7.82323 8.66675 8.00004 8.66675Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.6667 8.66675C12.8435 8.66675 13.013 8.59651 13.1381 8.47149C13.2631 8.34646 13.3333 8.17689 13.3333 8.00008C13.3333 7.82327 13.2631 7.6537 13.1381 7.52868C13.013 7.40365 12.8435 7.33341 12.6667 7.33341C12.4899 7.33341 12.3203 7.40365 12.1953 7.52868C12.0702 7.6537 12 7.82327 12 8.00008C12 8.17689 12.0702 8.34646 12.1953 8.47149C12.3203 8.59651 12.4899 8.66675 12.6667 8.66675Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.33329 8.66675C3.5101 8.66675 3.67967 8.59651 3.8047 8.47149C3.92972 8.34646 3.99996 8.17689 3.99996 8.00008C3.99996 7.82327 3.92972 7.6537 3.8047 7.52868C3.67967 7.40365 3.5101 7.33341 3.33329 7.33341C3.15648 7.33341 2.98691 7.40365 2.86189 7.52868C2.73686 7.6537 2.66663 7.82327 2.66663 8.00008C2.66663 8.17689 2.73686 8.34646 2.86189 8.47149C2.98691 8.59651 3.15648 8.66675 3.33329 8.66675Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-2xl border border-[#525252] bg-[#0A0D12] shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r ${
                item.dangerous
                  ? "text-red-400 hover:from-red-500/20 hover:via-red-500/10 hover:to-transparent"
                  : "text-[#E5E7EB] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
