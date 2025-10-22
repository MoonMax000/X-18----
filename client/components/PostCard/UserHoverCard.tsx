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
        align="start"
        sideOffset={16}
        className="w-[320px] rounded-[28px] border border-[#181B22] p-5 shadow-[0_24px_56px_rgba(2,6,18,0.58)]"
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
            ) : null}
            {followersLabel ? (
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
            ) : null}
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserHoverCard;
