import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FC,
  type MouseEvent,
  useMemo,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const BRAND_COLOR = "#A06AFF";
const BRAND_HOVER_BACKGROUND = "rgba(160,106,255,0.16)";

export type FollowButtonSize = "compact" | "default";

interface FollowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isFollowing?: boolean;
  defaultFollowing?: boolean;
  onToggle?: (nextState: boolean) => void;
  size?: FollowButtonSize;
  stopPropagation?: boolean;
  profileId?: string;
}

const sizeClasses: Record<FollowButtonSize, string> = {
  compact: "h-[26px] px-3 text-xs",
  default: "h-8 px-5 text-sm",
};

const FollowButton: FC<FollowButtonProps> = ({
  isFollowing,
  defaultFollowing = false,
  onToggle,
  size = "compact",
  stopPropagation = false,
  profileId,
  className,
  onClick,
  ...rest
}) => {
  const [internalFollowing, setInternalFollowing] = useState(defaultFollowing);
  const [isHovered, setIsHovered] = useState(false);

  const following =
    typeof isFollowing === "boolean" ? isFollowing : internalFollowing;

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (onClick) {
      onClick(event);
    }

    const nextState = !following;
    if (typeof isFollowing !== "boolean") {
      setInternalFollowing(nextState);
    }

    onToggle?.(nextState);
  };

  const { buttonClasses, buttonStyle } = useMemo<{
    buttonClasses: string;
    buttonStyle: CSSProperties | undefined;
  }>(() => {
    if (following) {
      return {
        buttonClasses:
          "border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset",
        buttonStyle: {
          color: isHovered ? "#E5E7EB" : BRAND_COLOR,
        },
      };
    }

    return {
      buttonClasses:
        "border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-[#E5E7EB] font-medium transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset",
      buttonStyle: undefined,
    };
  }, [following, isHovered]);

  return (
    <button
      type="button"
      aria-pressed={following}
      data-profile={profileId}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "flex items-center justify-center rounded-full font-semibold",
        sizeClasses[size],
        buttonClasses,
        className,
      )}
      style={buttonStyle}
      {...rest}
    >
      {following ? (isHovered ? "Unfollow" : "Following") : "Follow"}
    </button>
  );
};

export default FollowButton;
