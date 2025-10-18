import { FC, Dispatch, SetStateAction } from "react";

interface Props {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
}

const QRIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_grid_icon)">
      <path
        d="M1.33337 12C1.33337 10.9731 1.33337 10.4596 1.56453 10.0824C1.69387 9.87131 1.87133 9.69384 2.08239 9.56451C2.4596 9.33337 2.97308 9.33337 4.00004 9.33337C5.027 9.33337 5.54048 9.33337 5.91769 9.56451C6.12875 9.69384 6.30621 9.87131 6.43555 10.0824C6.66671 10.4596 6.66671 10.9731 6.66671 12C6.66671 13.027 6.66671 13.5405 6.43555 13.9177C6.30621 14.1288 6.12875 14.3062 5.91769 14.4356C5.54048 14.6667 5.027 14.6667 4.00004 14.6667C2.97308 14.6667 2.4596 14.6667 2.08239 14.4356C1.87133 14.3062 1.69387 14.1288 1.56453 13.9177C1.33337 13.5405 1.33337 13.027 1.33337 12Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M9.33337 12C9.33337 10.9731 9.33337 10.4596 9.56451 10.0824C9.69384 9.87131 9.87131 9.69384 10.0824 9.56451C10.4596 9.33337 10.9731 9.33337 12 9.33337C13.027 9.33337 13.5405 9.33337 13.9177 9.56451C14.1288 9.69384 14.3062 9.87131 14.4356 10.0824C14.6667 10.4596 14.6667 10.9731 14.6667 12C14.6667 13.027 14.6667 13.5405 14.4356 13.9177C14.3062 14.1288 14.1288 14.3062 13.9177 14.4356C13.5405 14.6667 13.027 14.6667 12 14.6667C10.9731 14.6667 10.4596 14.6667 10.0824 14.4356C9.87131 14.3062 9.69384 14.1288 9.56451 13.9177C9.33337 13.5405 9.33337 13.027 9.33337 12Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M1.33337 4.00004C1.33337 2.97308 1.33337 2.4596 1.56453 2.08239C1.69387 1.87133 1.87133 1.69387 2.08239 1.56453C2.4596 1.33337 2.97308 1.33337 4.00004 1.33337C5.027 1.33337 5.54048 1.33337 5.91769 1.56453C6.12875 1.69387 6.30621 1.87133 6.43555 2.08239C6.66671 2.4596 6.66671 2.97308 6.66671 4.00004C6.66671 5.027 6.66671 5.54048 6.43555 5.91769C6.30621 6.12875 6.12875 6.30621 5.91769 6.43555C5.54048 6.66671 5.027 6.66671 4.00004 6.66671C2.97308 6.66671 2.4596 6.66671 2.08239 6.43555C1.87133 6.30621 1.69387 6.12875 1.56453 5.91769C1.33337 5.54048 1.33337 5.027 1.33337 4.00004Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <path
        d="M9.33337 4.00004C9.33337 2.97308 9.33337 2.4596 9.56451 2.08239C9.69384 1.87133 9.87131 1.69387 10.0824 1.56453C10.4596 1.33337 10.9731 1.33337 12 1.33337C13.027 1.33337 13.5405 1.33337 13.9177 1.56453C14.1288 1.69387 14.3062 1.87133 14.4356 2.08239C14.6667 2.4596 14.6667 2.97308 14.6667 4.00004C14.6667 5.027 14.6667 5.54048 14.4356 5.91769C14.3062 6.12875 14.1288 6.30621 13.9177 6.43555C13.5405 6.66671 13.027 6.66671 12 6.66671C10.9731 6.66671 10.4596 6.66671 10.0824 6.43555C9.87131 6.30621 9.69384 6.12875 9.56451 5.91769C9.33337 5.54048 9.33337 5.027 9.33337 4.00004Z"
        stroke="white"
        strokeWidth="1.5"
      />
    </g>
    <defs>
      <clipPath id="clip0_grid_icon">
        <rect width="16" height="16" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const CrossIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M18 6L6 18M6 6l12 12"
      stroke="#A06AFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RightBarButton: FC<Props> = ({ isCollapsed, setIsCollapsed }) => {
  const toggleOpen = () => setIsCollapsed((prev) => !prev);

  return (
    <button
      onClick={toggleOpen}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
        isCollapsed
          ? "bg-transparent hover:bg-[#181B20]"
          : "bg-gradient-to-r from-[rgba(160,106,255,0.72)] to-[rgba(72,32,144,0.72)] hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
      }`}
      aria-label={isCollapsed ? "Close right menu" : "Open right menu"}
      aria-pressed={isCollapsed}
    >
      {isCollapsed ? <CrossIcon /> : <QRIcon />}
    </button>
  );
};

export default RightBarButton;
