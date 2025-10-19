import { type FC, useState } from "react";
import { Link } from "react-router-dom";

import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { SuggestedProfile } from "./sidebarData";

interface FollowRecommendationsWidgetProps {
  title?: string;
  profiles: SuggestedProfile[];
  showMoreLabel?: string;
  onShowMore?: () => void;
}

const FollowRecommendationsWidget: FC<FollowRecommendationsWidgetProps> = ({
  title = "Who to follow",
  profiles,
  showMoreLabel = "Show more",
  onShowMore,
}) => {
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});

  return (
    <section className="rounded-[24px] border border-[#5E5E5E] bg-background p-5 backdrop-blur-[20px] transition-all duration-300 hover:border-[#B87AFF] hover:shadow-[0_0_20px_rgba(184,122,255,0.3)]">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-4 flex flex-col gap-4">
        {profiles.map((profile) => {
          const isFollowing = followingState[profile.id] ?? false;
          return (
            <li
              key={profile.id}
              className="flex items-center justify-between gap-4"
            >
              <UserHoverCard
                author={{
                  name: profile.name,
                  handle: `@${profile.handle}`,
                  avatar: profile.avatar || "",
                  verified: profile.isVerified,
                  followers: Math.floor(Math.random() * 50000) + 1000,
                  following: Math.floor(Math.random() * 2000) + 100,
                  bio: "Crypto enthusiast and blockchain developer",
                }}
                isFollowing={isFollowing}
                onFollowToggle={(nextState) => setFollowingState(prev => ({ ...prev, [profile.id]: nextState }))}
                showFollowButton={true}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                  <Avatar className="h-11 w-11 bg-[rgba(25,27,34,0.9)] flex-shrink-0">
                    {profile.avatar ? (
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                    ) : null}
                    <AvatarFallback className="text-sm font-semibold text-white">
                      {profile.name
                        .split(" ")
                        .map((chunk) => chunk[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 text-[15px] font-semibold leading-tight text-white">
                      <span className="truncate hover:underline hover:underline-offset-2 transition-all">{profile.name}</span>
                      {profile.isVerified && (
                        <VerifiedBadge size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#8E8E94] truncate">
                      @{profile.handle}
                    </span>
                  </div>
                </div>
              </UserHoverCard>
              <FollowButton
                profileId={profile.id}
                size="compact"
                isFollowing={isFollowing}
                onToggle={(nextState) => setFollowingState(prev => ({ ...prev, [profile.id]: nextState }))}
              />
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
        onClick={onShowMore}
      >
        {showMoreLabel}
      </button>
    </section>
  );
};

export default FollowRecommendationsWidget;
