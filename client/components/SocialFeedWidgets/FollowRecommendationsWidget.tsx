import { type FC } from "react";
import { Link } from "react-router-dom";

import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
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
  return (
    <section className="rounded-[24px] border border-[#181B22] bg-background p-5 backdrop-blur-[20px]">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-4 flex flex-col gap-4">
        {profiles.map((profile) => (
          <li
            key={profile.id}
            className="flex items-center justify-between gap-4"
          >
            <Link
              to={`/profile/${profile.handle}`}
              className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
            >
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
            </Link>
            <FollowButton profileId={profile.id} size="compact" />
          </li>
        ))}
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
