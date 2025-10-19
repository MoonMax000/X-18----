import { type FC, type MouseEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

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

  const followers =
    typeof author.followers === "number" ? author.followers : undefined;
  const following =
    typeof author.following === "number" ? author.following : undefined;

  const followersLabel =
    typeof followers === "number" ? formatCount(followers) : null;
  const followingLabel =
    typeof following === "number" ? formatCount(following) : null;
  const shouldRenderFollowButton = showFollowButton ?? !author.isCurrentUser;
  const headerClasses = cn(
    "flex items-start gap-4",
    shouldRenderFollowButton ? "justify-between" : "justify-start",
  );

  const getProfilePath = () => {
    return author.handle
      ? `/social/profile/${author.handle.replace('@', '')}`
      : `/social/profile/${author.name.replace(/\s+/g, '-').toLowerCase()}`;
  };

  const handleProfileClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(getProfilePath());
  };

  const handleFollowersClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`${getProfilePath()}/connections?tab=followers`);
  };

  const handleFollowingClick = (e: MouseEvent) => {
    e.stopPropagation();
    navigate(`${getProfilePath()}/connections?tab=following`);
  };

  return (
    <HoverCard openDelay={150} closeDelay={200}>
      <HoverCardTrigger asChild>
        <div className="inline-block cursor-pointer" onClick={handleProfileClick}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align="start"
        sideOffset={16}
        className="w-[320px] rounded-[28px] border border-[#525252]/40 p-5 shadow-[0_24px_56px_rgba(2,6,18,0.58)] transition-all duration-300 hover:border-[#A06AFF]/60 hover:shadow-[0_24px_56px_rgba(160,106,255,0.15)]"
        style={{ backgroundColor: '#000000', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className={headerClasses}>
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <UserAvatar
              src={author.avatar}
              alt={author.name}
              size={52}
              accent={false}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-base font-semibold leading-tight text-white hover:underline hover:underline-offset-2 transition-all">
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
              isFollowing={isFollowing}
              onToggle={onFollowToggle}
              profileId={author.handle ?? author.name}
              className="gap-2"
            />
          ) : null}
        </div>

        {author.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {author.bio}
          </p>
        ) : null}

        {followersLabel || followingLabel ? (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {followingLabel ? (
              <button
                type="button"
                onClick={handleFollowingClick}
                className="text-[#8E92A0] hover:text-white hover:underline hover:underline-offset-2 transition-all cursor-pointer"
              >
                <span className="font-semibold text-white">
                  {followingLabel}
                </span>{" "}
                Following
              </button>
            ) : null}
            {followersLabel ? (
              <button
                type="button"
                onClick={handleFollowersClick}
                className="text-[#8E92A0] hover:text-white hover:underline hover:underline-offset-2 transition-all cursor-pointer"
              >
                <span className="font-semibold text-white">
                  {followersLabel}
                </span>{" "}
                Followers
              </button>
            ) : null}
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
