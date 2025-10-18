import type { FC } from "react";

import { CalendarDays, Link2, MapPin } from "lucide-react";

import type { SocialProfileData } from "@/data/socialProfile";
import { cn } from "@/lib/utils";

interface ProfileDetailsProps {
  profile: SocialProfileData;
  className?: string;
}

const formatNumber = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }
  return value.toString();
};

const ProfileDetails: FC<ProfileDetailsProps> = ({ profile, className }) => {
  return (
    <section
      className={cn(
        "rounded-3xl border border-[#1F242B] bg-[rgba(12,16,20,0.65)] p-6 text-white shadow-[0_24px_60px_-40px_rgba(12,16,20,0.9)]",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
          <span className="text-sm text-[#8B98A5]">@{profile.username}</span>
        </div>

        <p className="max-w-[520px] text-sm leading-relaxed text-[#D9DCE6]">{profile.bio}</p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#8B98A5]">
          {profile.location ? (
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.location}</span>
          ) : null}
          {profile.website ? (
            <a
              href={profile.website.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[#A06AFF] transition hover:text-white"
            >
              <Link2 className="h-4 w-4" />
              {profile.website.label}
            </a>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Присоединился {profile.joined}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-6 text-sm text-[#8B98A5]">
        <div>
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.tweets)}</span>
          <span className="ml-2">Постов</span>
        </div>
        <div>
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.following)}</span>
          <span className="ml-2">Подписок</span>
        </div>
        <div>
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.followers)}</span>
          <span className="ml-2">Подписчиков</span>
        </div>
        <div>
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.likes)}</span>
          <span className="ml-2">Лайков</span>
        </div>
      </div>
    </section>
  );
};

export default ProfileDetails;
