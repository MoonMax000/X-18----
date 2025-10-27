import type { FC } from "react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  return (
    <section
      className={cn(
        "rounded-3xl border border-[#1F242B] bg-[rgba(12,16,20,0.65)] p-6 text-white shadow-[0_24px_60px_-40px_rgba(12,16,20,0.9)]",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold leading-tight">{profile.name}</h1>
          <span className="text-sm text-[#8B98A5]">@{profile.username}</span>
          {profile.role && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center gap-1.5 rounded-full border border-[#A06AFF]/30 bg-[#A06AFF]/10 px-2.5 py-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#A06AFF]">
                  <path
                    d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-semibold text-[#A06AFF]">
                  {profile.role}
                </span>
              </div>
            </div>
          )}
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
        <button
          type="button"
          onClick={() => navigate(`/profile-connections/${profile.username}?tab=following`)}
          className="hover:underline cursor-pointer transition-colors"
        >
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.following)}</span>
          <span className="ml-2">Подписок</span>
        </button>
        <button
          type="button"
          onClick={() => navigate(`/profile-connections/${profile.username}?tab=followers`)}
          className="hover:underline cursor-pointer transition-colors"
        >
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.followers)}</span>
          <span className="ml-2">Подписчиков</span>
        </button>
        <div>
          <span className="text-base font-semibold text-white">{formatNumber(profile.stats.likes)}</span>
          <span className="ml-2">Лайков</span>
        </div>
      </div>
    </section>
  );
};

export default ProfileDetails;
