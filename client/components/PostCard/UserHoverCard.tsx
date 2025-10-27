import { type FC, type MouseEvent, type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";

import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { customBackendAPI } from "@/services/api/custom-backend";

import FollowButton from "./FollowButton";
import type { FeedPostProps } from "./VideoPost";
import VerifiedBadge from "./VerifiedBadge";

interface UserHoverCardProps {
  author: FeedPostProps["author"];
  isFollowing?: boolean;
  onFollowToggle?: (nextState: boolean) => void;
  showFollowButton?: boolean;
  children: ReactNode;
}

const formatCount = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }

  return value.toLocaleString();
};

const UserHoverCard: FC<UserHoverCardProps> = ({
  author,
  isFollowing = false,
  onFollowToggle,
  showFollowButton,
  children,
}) => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for follower counts to update after follow/unfollow
  const [followersCount, setFollowersCount] = useState(
    typeof author.followers === "number" ? author.followers : 0
  );
  const [followingCountState, setFollowingCountState] = useState(
    typeof author.following === "number" ? author.following : 0
  );

  // Always show counts, even if 0
  const followers = followersCount;
  const followingCount = followingCountState;

  const handleFollowToggle = async (nextState: boolean) => {
    if (isLoading) return;
    
    setIsLoading(true);
    const previousState = following;
    
    // Optimistic update
    setFollowing(nextState);
    
    try {
      // First get user by username to get their UUID
      const username = author.handle?.replace('@', '') || author.name.replace(/\s+/g, '-').toLowerCase();
      const user = await customBackendAPI.getUserByUsername(username);
      
      if (nextState) {
        await customBackendAPI.followUser(user.id);
        // Increment followers count on successful follow
        setFollowersCount(prev => prev + 1);
      } else {
        await customBackendAPI.unfollowUser(user.id);
        // Decrement followers count on successful unfollow
        setFollowersCount(prev => Math.max(0, prev - 1));
      }
      
      // Notify parent component
      onFollowToggle?.(nextState);
    } catch (error: any) {
      // Handle 409 Conflict - Already following/unfollowing
      const errorMessage = error?.message || String(error);
      
      if (errorMessage.includes('Already following')) {
        // User is already following - update state to reflect this
        console.log('[UserHoverCard] Already following, updating state to true');
        setFollowing(true);
        onFollowToggle?.(true);
        // Don't update follower count - already counted
      } else if (errorMessage.includes('Not following')) {
        // User is not following - update state to reflect this
        console.log('[UserHoverCard] Not following, updating state to false');
        setFollowing(false);
        onFollowToggle?.(false);
        // Don't update follower count - already removed
      } else {
        // Other errors - revert to previous state
        console.error('[UserHoverCard] Failed to toggle follow:', error);
        setFollowing(previousState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Always generate labels, even for 0
  const followersLabel = formatCount(followers);
  const followingLabel = formatCount(followingCount);
  const shouldRenderFollowButton = showFollowButton ?? !author.isCurrentUser;
  const headerClasses = cn(
    "flex items-start gap-4",
    shouldRenderFollowButton ? "justify-between" : "justify-start",
  );

  const handleProfileClick = (e: MouseEvent) => {
    // На мобильных устройствах (без hover) сразу переходим в профиль
    if (window.innerWidth < 768) {
      e.stopPropagation();
      const profilePath = author.handle
        ? `/social/profile/${author.handle.replace('@', '')}`
        : `/social/profile/${author.name.replace(/\s+/g, '-').toLowerCase()}`;
      navigate(profilePath);
    }
  };

  return (
    <HoverCard openDelay={150} closeDelay={200}>
      <HoverCardTrigger asChild onClick={handleProfileClick}>{children}</HoverCardTrigger>
      <HoverCardContent
        side="bottom"
        align="start"
        sideOffset={5}
        alignOffset={-10}
        avoidCollisions={true}
        collisionPadding={16}
        className="w-[320px] rounded-[28px] border border-[#181B22] p-5 shadow-[0_24px_56px_rgba(2,6,18,0.58)] z-[100]"
        style={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className={headerClasses}>
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              const profilePath = author.handle
                ? `/social/profile/${author.handle.replace('@', '')}`
                : `/social/profile/${author.name.replace(/\s+/g, '-').toLowerCase()}`;
              navigate(profilePath);
            }}
          >
            <UserAvatar
              src={author.avatar}
              alt={author.name}
              size={52}
              accent={false}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-base font-semibold leading-tight text-white">
                <span>{author.name}</span>
                {author.verified ? <VerifiedBadge size={16} /> : null}
              </div>
              {author.handle ? (
                <span className="text-sm font-medium text-[#8E92A0]">
                  {author.handle}
                </span>
              ) : null}
            </div>
          </div>
          {shouldRenderFollowButton ? (
            <FollowButton
              size="compact"
              stopPropagation
              isFollowing={following}
              onToggle={handleFollowToggle}
              profileId={author.handle ?? author.name}
              className="gap-2"
              disabled={isLoading}
            />
          ) : null}
        </div>

        {author.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {author.bio}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const profileHandle = author.handle?.replace('@', '') || author.name.replace(/\s+/g, '-').toLowerCase();
              navigate(`/profile-connections/${profileHandle}?tab=following`);
            }}
            className="group cursor-pointer transition-colors hover:text-white"
          >
            <span className="font-semibold text-white">
              {followingLabel}
            </span>{" "}
            <span className="text-[#8E92A0] group-hover:text-white group-hover:underline transition-all">
              Following
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const profileHandle = author.handle?.replace('@', '') || author.name.replace(/\s+/g, '-').toLowerCase();
              navigate(`/profile-connections/${profileHandle}?tab=followers`);
            }}
            className="group cursor-pointer transition-colors hover:text-white"
          >
            <span className="font-semibold text-white">
              {followersLabel}
            </span>{" "}
            <span className="text-[#8E92A0] group-hover:text-white group-hover:underline transition-all">
              Followers
            </span>
          </button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
