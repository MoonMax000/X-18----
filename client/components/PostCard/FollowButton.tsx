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
          "border bg-transparent font-semibold transition-colors duration-200",
        buttonStyle: {
          borderColor: BRAND_COLOR,
          color: BRAND_COLOR,
          backgroundColor: isHovered ? BRAND_HOVER_BACKGROUND : "transparent",
        },
      };
    }

    return {
      buttonClasses:
        "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_24px_rgba(160,106,255,0.25)] transition-colors duration-200 hover:from-[#B57FFF] hover:to-[#5A2BA0]",
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
