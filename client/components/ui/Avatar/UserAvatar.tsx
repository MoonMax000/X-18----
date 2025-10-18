import { useState, type CSSProperties, type FC } from "react";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  containerClassName?: string;
  style?: CSSProperties;
  accent?: boolean;
}

const DEFAULT_AVATAR = "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200";

const UserAvatar: FC<UserAvatarProps> = ({
  src,
  alt = "User avatar",
  size = 40,
  className,
  containerClassName,
  style,
  accent = true,
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = !src || src.includes("placeholder") || hasError ? DEFAULT_AVATAR : src;
  const dimensionStyle: CSSProperties = {
    width: size,
    height: size,
    ...style,
  };

  return (
    <div
      className={cn(
        "flex-shrink-0 overflow-hidden rounded-full",
        accent && "bg-gradient-to-br from-[#A06AFF]/40 to-[#482090]/40 p-[1.5px]",
        containerClassName,
      )}
      style={dimensionStyle}
    >
      <div className={cn("h-full w-full overflow-hidden rounded-full", accent ? "bg-[#0F1319]" : "bg-transparent")}>
        <img
          src={resolvedSrc}
          alt={alt}
          className={cn("h-full w-full object-cover", className)}
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
};

export default UserAvatar;
