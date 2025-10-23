import { type FC, useState } from "react";

import type { SocialProfileData } from "@/data/socialProfile";

interface ProfileHeroProps {
  profile: SocialProfileData;
  onEdit?: () => void;
  tweetsCount?: number;
  isOwnProfile?: boolean;
}

const ProfileHero: FC<ProfileHeroProps> = ({
  profile,
  onEdit,
  tweetsCount = 0,
  isOwnProfile = true,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };

  const iconButtonClass =
    "flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-[#F7F9F9] transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset";

  const primaryActionButtonClass =
    "group relative flex items-center justify-center overflow-hidden rounded-full border border-black/30 bg-[rgba(25,25,25,0.65)] px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-[15px] font-semibold text-[#F7F9F9] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#A06AFF]/40 hover:bg-[rgba(32,32,32,0.75)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_18px_36px_rgba(0,0,0,0.5)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black before:absolute before:inset-x-4 before:-top-1 before:h-1 before:rounded-full before:bg-white/50 before:opacity-0 before:transition-opacity before:duration-200 group-hover:before:opacity-100";

  return (
    <section className="mb-6">
      {/* Cover/Banner image */}
      <div className="w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#141923] to-[#0B0E13]">
        {profile.cover ? (
          <img
            src={profile.cover}
            alt={`${profile.name} cover`}
            className="h-[120px] sm:h-[160px] md:h-[200px] w-full object-cover"
          />
        ) : (
          <div className="h-[120px] sm:h-[160px] md:h-[200px] w-full" />
        )}
      </div>

      <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="relative -mt-12 sm:-mt-14 md:-mt-16 h-20 w-20 sm:h-28 sm:w-28 md:h-[132px] md:w-[132px] overflow-hidden rounded-full border-3 sm:border-4 border-[#0B0E13] bg-[#121720]">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pt-2">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center justify-center rounded-full border border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus:ring-2 focus:ring-[#A06AFF] focus:ring-inset"
              >
                <span className="text-center font-semibold leading-5 text-white">
                  Edit profile
                </span>
              </button>
            ) : (
              <>
                <button type="button" className={iconButtonClass}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2.5 10.0002C2.5 9.0835 3.25 8.3335 4.16667 8.3335C5.08333 8.3335 5.83333 9.0835 5.83333 10.0002C5.83333 10.9168 5.08333 11.6668 4.16667 11.6668C3.25 11.6668 2.5 10.9168 2.5 10.0002ZM10 11.6668C10.9167 11.6668 11.6667 10.9168 11.6667 10.0002C11.6667 9.0835 10.9167 8.3335 10 8.3335C9.08333 8.3335 8.33333 9.0835 8.33333 10.0002C8.33333 10.9168 9.08333 11.6668 10 11.6668ZM15.8333 11.6668C16.75 11.6668 17.5 10.9168 17.5 10.0002C17.5 9.0835 16.75 8.3335 15.8333 8.3335C14.9167 8.3335 14.1667 9.0835 14.1667 10.0002C14.1667 10.9168 14.9167 11.6668 15.8333 11.6668Z"
                      fill="#F7F9F9"
                    />
                  </svg>
                </button>

                <button type="button" className={iconButtonClass}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M1.66501 4.58333C1.66501 3.4325 2.59751 2.5 3.74834 2.5H16.2483C17.3992 2.5 18.3317 3.4325 18.3317 4.58333V15.4167C18.3317 16.5675 17.3992 17.5 16.2483 17.5H3.74834C2.59751 17.5 1.66501 16.5675 1.66501 15.4167V4.58333ZM3.74834 4.16667C3.51834 4.16667 3.33168 4.35333 3.33168 4.58333V6.88667L9.99834 9.91833L16.665 6.88833V4.58333C16.665 4.35333 16.4783 4.16667 16.2483 4.16667H3.74834ZM16.665 8.71917L9.99834 11.7492L3.33168 8.7175V15.4167C3.33168 15.6467 3.51834 15.8333 3.74834 15.8333H16.2483C16.4783 15.8333 16.665 15.6467 16.665 15.4167V8.71917Z"
                      fill="#F7F9F9"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleFollowClick}
                  className={primaryActionButtonClass}
                >
                  <span className="relative z-10 text-center font-semibold leading-5">
                    {isFollowing ? "Unfollow" : "Follow"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
