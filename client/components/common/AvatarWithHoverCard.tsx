import { type FC, type ReactNode } from "react";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import { DEBUG } from "@/lib/debug";
import { getAvatarUrl } from "@/lib/avatar-utils";

interface AvatarWithHoverCardProps {
  author: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
    followers?: number;
    following?: number;
    bio?: string;
  };
  isFollowing?: boolean;
  onFollowToggle?: (nextState: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}

/**
 * Reusable wrapper component that adds UserHoverCard functionality to any avatar element.
 * 
 * @example
 * <AvatarWithHoverCard
 *   author={{ name: "John", handle: "@john", avatar: "/avatar.jpg", followers: 100, following: 50 }}
 *   isFollowing={false}
 *   onFollowToggle={(nextState) => console.log('Follow toggled', nextState)}
 * >
 *   <Avatar>
 *     <AvatarImage src={author.avatar} />
 *   </Avatar>
 * </AvatarWithHoverCard>
 */
const AvatarWithHoverCard: FC<AvatarWithHoverCardProps> = ({
  author,
  isFollowing = false,
  onFollowToggle,
  children,
  disabled = false,
}) => {
  DEBUG.log('HOVER_CARDS', 'AvatarWithHoverCard render', { 
    author,
    isFollowing,
    disabled 
  });

  // If disabled, just return children without hover card
  if (disabled) {
    return <>{children}</>;
  }

  const handleFollowToggle = (nextState: boolean) => {
    DEBUG.log('HOVER_CARDS', 'AvatarWithHoverCard follow toggle', { 
      author: author.name,
      nextState 
    });
    onFollowToggle?.(nextState);
  };

  return (
    <UserHoverCard
      author={{
        ...author,
        avatar: getAvatarUrl({
          avatar_url: author.avatar,
          username: author.handle?.replace('@', ''),
          display_name: author.name
        }),
        followers: author.followers ?? 0,
        following: author.following ?? 0,
      }}
      isFollowing={isFollowing}
      onFollowToggle={handleFollowToggle}
      showFollowButton={true}
    >
      {children}
    </UserHoverCard>
  );
};

export default AvatarWithHoverCard;
