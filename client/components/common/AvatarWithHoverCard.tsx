import { type FC, type ReactNode } from "react";
import UserHoverCard from "@/components/PostCard/UserHoverCard";

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
  // If disabled, just return children without hover card
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <UserHoverCard
      author={{
        ...author,
        followers: author.followers ?? 0,
        following: author.following ?? 0,
      }}
      isFollowing={isFollowing}
      onFollowToggle={onFollowToggle ?? (() => {})}
    >
      {children}
    </UserHoverCard>
  );
};

export default AvatarWithHoverCard;
