import { type FC } from "react";

import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import FollowButton from "../PostCard/FollowButton";
import VerifiedBadge from "../PostCard/VerifiedBadge";
import AvatarWithHoverCard from "../common/AvatarWithHoverCard";
import { getAvatarUrl } from "@/lib/avatar-utils";

export interface SuggestedProfile {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
}

interface SuggestedProfilesWidgetProps {
  title?: string;
  profiles: SuggestedProfile[];
}

const SuggestedProfilesWidget: FC<SuggestedProfilesWidgetProps> = ({
  title = "You might like",
  profiles,
}) => {
  return (
    <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {profiles.map((profile) => {
          const profileSlug = profile.handle ? profile.handle.replace(/^@/, "") : profile.id;
          const profileHref = `/social/profile/${profileSlug}`;

          return (
            <li
              key={profile.id}
              className="flex items-center justify-between gap-4"
            >
              <AvatarWithHoverCard
                author={{
                  name: profile.name,
                  handle: profile.handle,
                  avatar: profile.avatar,
                  verified: profile.verified,
                  followers: 0,
                  following: 0,
                }}
                isFollowing={false}
              >
                <Link
                  to={profileHref}
                  className="flex items-center gap-3 group/link"
                  aria-label={`Open profile ${profile.name}`}
                >
                  <Avatar className="h-11 w-11 bg-[rgba(25,27,34,0.9)]">
                    <AvatarImage src={getAvatarUrl({ avatar_url: profile.avatar, username: profile.handle, display_name: profile.name })} alt={profile.name} />
                    <AvatarFallback className="text-sm font-semibold text-white">
                      {profile.name
                        .split(" ")
                        .map((chunk) => chunk[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[15px] font-semibold leading-tight text-white group-hover/link:text-[#E3D8FF]">
                      <span>{profile.name}</span>
                      {profile.verified && (
                        <VerifiedBadge size={16} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#8E8E94] group-hover/link:text-[#C6C6CB]">
                      {profile.handle}
                    </span>
                  </div>
                </Link>
              </AvatarWithHoverCard>
              <FollowButton profileId={profile.id} size="compact" />
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
      >
        Show more
      </button>
    </section>
  );
};

export default SuggestedProfilesWidget;
