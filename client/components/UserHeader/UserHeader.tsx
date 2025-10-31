import { FC, useRef } from "react";
import { cn } from "@/lib/utils";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";

interface ProfileData {
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  joined: string;
  avatar: string;
  cover?: string;
  stats: {
    tweets: number;
    following: number;
    followers: number;
  };
  isVerified?: boolean;
  isPremium?: boolean;
  tradingStyle?: string;
}

interface Props {
  isOwn?: boolean;
  className?: string;
  onEditProfile?: () => void;
  profileData?: ProfileData;
  onAvatarUpload?: (file: File) => Promise<void>;
  onCoverUpload?: (file: File) => Promise<void>;
}

const UserHeader: FC<Props> = ({
  isOwn = true,
  className,
  onEditProfile,
  profileData,
  onAvatarUpload,
  onCoverUpload
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isOwn) {
      avatarInputRef.current?.click();
    }
  };

  const handleCoverClick = () => {
    if (isOwn) {
      coverInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      await onAvatarUpload(file);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onCoverUpload) {
      await onCoverUpload(file);
    }
  };

  // Default data if not provided
  const data = profileData || {
    name: "Jane Doe",
    username: "beautydoe",
    bio: "Designing Products that Users Love",
    location: "United States",
    website: "https://beautydoe.com",
    joined: "November 2010",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500",
    cover: "https://api.builder.io/api/v1/image/assets/TEMP/df14e9248350a32d57d5b54a31308a2e855bb11e?width=2118",
    stats: { tweets: 0, following: 143, followers: 149 },
    isVerified: true,
    isPremium: false,
  };
  const iconButtonClass =
    "group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-[#F7F9F9] shadow-[0_8px_20px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0 before:absolute before:inset-x-3 before:-top-1 before:h-1 before:rounded-full before:bg-white/40 before:opacity-0 before:transition-opacity before:duration-200 group-hover:before:opacity-70";

  const primaryActionButtonClass =
    "group relative flex items-center justify-center overflow-hidden rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-white bg-[rgba(25,25,25,0.65)] shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-primary hover:to-[#482090] hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.95)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      {/* Cover/Banner image */}
      <div className="group relative w-full overflow-hidden rounded-3xl border border-[#16C784] bg-[#16181C]">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/df14e9248350a32d57d5b54a31308a2e855bb11e?width=2118"
          alt="Profile cover"
          className="h-[120px] sm:h-[160px] md:h-[180px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
        <button
          type="button"
          className="group/btn absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black opacity-0 group-hover:opacity-100"
        >
          <svg
            className="h-5 w-5 text-[#D6DAE2]"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4.16602 17.4996C7.67433 13.5402 11.617 8.28922 17.4993 12.2275"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M11.666 2.50193C11.2743 2.5 10.0249 2.5 9.58268 2.5C5.85073 2.5 3.98476 2.5 2.82538 3.65937C1.66602 4.81874 1.66602 6.68472 1.66602 10.4167C1.66602 14.1486 1.66602 16.0146 2.82538 17.174C3.98476 18.3333 5.85073 18.3333 9.58268 18.3333C13.3146 18.3333 15.1806 18.3333 16.34 17.174C17.4554 16.0586 17.4977 14.2892 17.4993 10.8333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M14.166 6.25033C14.5756 6.67174 15.6658 8.33366 16.2493 8.33366M16.2493 8.33366C16.8328 8.33366 17.9231 6.67174 18.3327 6.25033M16.2493 8.33366V1.66699"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="whitespace-nowrap">Update cover</span>
        </button>
      </div>

      {/* Avatar and action buttons container */}
      <div className="relative px-3 sm:px-4 md:px-6">
        {/* Avatar positioned to overlap banner */}
        <div className="absolute -top-12 sm:-top-14 md:-top-16 left-3 sm:left-4 md:left-4">
          <div className="group relative h-20 w-20 sm:h-28 sm:w-28 md:h-[132px] md:w-[132px] overflow-hidden rounded-full border-3 sm:border-4 border-[#0B0E13]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500"
              alt="Profile"
              className="h-full w-full object-cover scale-110"
            />
            <button
              type="button"
              aria-label="Update profile picture"
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white transition-all duration-200 group-hover:bg-black/55 group-hover:backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <svg
                className="h-5 w-5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5.83268 5C4.81548 5.00305 4.25254 5.02738 3.78995 5.22154C3.14201 5.4935 2.61435 5.99586 2.3061 6.63425C2.0545 7.15532 2.01333 7.82292 1.93098 9.15813L1.80195 11.2504C1.59717 14.5707 1.49478 16.2309 2.46909 17.2819C3.44339 18.3329 5.08479 18.3329 8.36761 18.3329H11.6311C14.9139 18.3329 16.5553 18.3329 17.5296 17.2819C18.5039 16.2309 18.4015 14.5707 18.1968 11.2504L18.0677 9.15813C17.9854 7.82292 17.9442 7.15532 17.6926 6.63425C17.3844 5.99586 16.8567 5.4935 16.2088 5.22154C15.7462 5.02738 15.1832 5.00305 14.166 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M14.1673 5.83366L13.4292 3.98818C13.1107 3.19196 12.8335 2.28874 12.0145 1.88328C11.5777 1.66699 11.052 1.66699 10.0007 1.66699C8.94932 1.66699 8.42365 1.66699 7.98678 1.88328C7.16782 2.28874 6.89066 3.19196 6.57218 3.98818L5.83398 5.83366"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.9173 11.6667C12.9173 13.2775 11.6115 14.5833 10.0007 14.5833C8.38982 14.5833 7.08398 13.2775 7.08398 11.6667C7.08398 10.0558 8.38982 8.75 10.0007 8.75C11.6115 8.75 12.9173 10.0558 12.9173 11.6667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 5H10.0075"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100">
              Update profile picture
            </span>
          </div>
        </div>

        {/* Action buttons panel */}
        <div className="flex items-start justify-end gap-2 sm:gap-3 py-3">
          {isOwn ? (
            <button type="button" className={primaryActionButtonClass} onClick={onEditProfile}>
              <span className="relative z-10 text-center font-semibold leading-5">
                Edit profile
              </span>
            </button>
          ) : (
            <button type="button" className={primaryActionButtonClass}>
              <span className="relative z-10 text-center font-semibold leading-5">
                Follow
              </span>
            </button>
          )}
        </div>
      </div>

      {/* User info section */}
      <div className="flex flex-col gap-3 px-3 sm:px-4 md:px-6 pb-4 pt-4">
        {/* Name and username */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold leading-6 text-[#F7F9F9]">
              {data.name}
            </h1>
            {data.isVerified && <VerifiedBadge size={20} />}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{display: 'none'}}>
              <path
                d="M18.9999 10.5C18.9837 9.9156 18.8054 9.34658 18.4843 8.85717C18.1641 8.36867 17.7135 7.97786 17.1834 7.72999C17.3852 7.18087 17.4277 6.58653 17.3101 6.01389C17.1916 5.44035 16.9147 4.91204 16.5122 4.48776C16.087 4.0852 15.5596 3.80928 14.986 3.68987C14.4134 3.57226 13.8191 3.61478 13.2699 3.81652C13.023 3.28549 12.6331 2.83408 12.1437 2.51384C11.6543 2.19359 11.0852 2.01447 10.4999 2C9.91554 2.01538 9.34833 2.19269 8.85983 2.51384C8.37132 2.83498 7.98323 3.2864 7.73807 3.81652C7.18805 3.61478 6.59189 3.57046 6.01745 3.68987C5.443 3.80747 4.91379 4.08429 4.4886 4.48776C4.08604 4.91294 3.81103 5.44216 3.69433 6.01479C3.57673 6.58743 3.62196 7.18178 3.8246 7.72999C3.29357 7.97786 2.84125 8.36776 2.5192 8.85627C2.19715 9.34477 2.01713 9.9147 1.99994 10.5C2.01803 11.0853 2.19715 11.6543 2.5192 12.1437C2.84125 12.6322 3.29357 13.023 3.8246 13.27C3.62196 13.8182 3.57673 14.4126 3.69433 14.9852C3.81193 15.5587 4.08604 16.0871 4.4877 16.5122C4.91288 16.913 5.44119 17.188 6.01383 17.3065C6.58646 17.4259 7.18081 17.3825 7.72993 17.1835C7.9778 17.7136 8.3677 18.1641 8.85711 18.4853C9.34562 18.8055 9.91554 18.9837 10.4999 19C11.0852 18.9855 11.6543 18.8073 12.1437 18.4871C12.6331 18.1668 13.023 17.7145 13.2699 17.1844C13.8164 17.4006 14.4152 17.4522 14.9915 17.3327C15.5668 17.2133 16.0951 16.9284 16.5113 16.5122C16.9274 16.0961 17.2133 15.5678 17.3327 14.9915C17.4521 14.4153 17.4005 13.8164 17.1834 13.27C17.7135 13.0221 18.1641 12.6322 18.4852 12.1428C18.8054 11.6543 18.9837 11.0853 18.9999 10.5Z"
                fill="#A06AFF"
              />
            </svg>
          </div>
          <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
            @{data.username}
          </p>
        </div>

        {/* Bio/Description */}
        {data.bio && (
          <p className="text-[15px] font-normal leading-5 text-[#F7F9F9]">
            {data.bio}
          </p>
        )}

        {/* User metadata with icons */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* Tier badge */}
          <div className="flex items-center gap-1">
            <svg width="20" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M18 9.1833V6.28029C18 4.64029 18 3.82028 17.5959 3.28529C17.1918 2.75029 16.2781 2.49056 14.4507 1.9711C13.2022 1.6162 12.1016 1.18863 11.2223 0.79829C10.0234 0.2661 9.424 0 9 0C8.576 0 7.9766 0.2661 6.77771 0.79829C5.89839 1.18863 4.79784 1.61619 3.54933 1.9711C1.72193 2.49056 0.80822 2.75029 0.40411 3.28529C-5.96046e-08 3.82028 0 4.64029 0 6.28029V9.1833C0 14.8085 5.06277 18.1835 7.594 19.5194C8.2011 19.8398 8.5046 20 9 20C9.4954 20 9.7989 19.8398 10.406 19.5194C12.9372 18.1835 18 14.8085 18 9.1833Z"
                fill="#8B98A5"
              />
            </svg>
            <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
              Tier 4
            </span>
          </div>

          {/* Location */}
          {data.location && (
            <div className="flex items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 5.83317C8.39169 5.83317 7.08335 7.1415 7.08335 8.74984C7.08335 10.3582 8.39169 11.6665 10 11.6665C11.6084 11.6665 12.9167 10.3582 12.9167 8.74984C12.9167 7.1415 11.6084 5.83317 10 5.83317ZM10 9.99984C9.31085 9.99984 8.75002 9.439 8.75002 8.74984C8.75002 8.06067 9.31085 7.49984 10 7.49984C10.6892 7.49984 11.25 8.06067 11.25 8.74984C11.25 9.439 10.6892 9.99984 10 9.99984ZM10 1.6665C6.09419 1.6665 2.91669 4.844 2.91669 8.74984C2.91669 13.7223 9.26752 18.0132 9.53752 18.1932L10 18.5015L10.4625 18.1932C10.7325 18.0132 17.0834 13.7223 17.0834 8.74984C17.0834 4.844 13.9059 1.6665 10 1.6665ZM10 16.4748C8.61252 15.4407 4.58335 12.1448 4.58335 8.74984C4.58335 5.76317 7.01335 3.33317 10 3.33317C12.9867 3.33317 15.4167 5.76317 15.4167 8.74984C15.4167 12.144 11.3875 15.4398 10 16.4748Z"
                  fill="#8B98A5"
                />
              </svg>
              <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                {data.location}
              </span>
            </div>
          )}

          {/* Website link */}
          {data.website && (
            <div className="flex items-center gap-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15.3 4.70013C13.675 3.0668 11.0417 3.0668 9.40834 4.70013L8.23334 5.87513L7.05001 4.70013L8.23334 3.5168C10.5083 1.2418 14.2 1.2418 16.4833 3.5168C18.7583 5.80013 18.7583 9.4918 16.4833 11.7668L15.3 12.9501L14.125 11.7668L15.3 10.5918C16.9333 8.95846 16.9333 6.32513 15.3 4.70013ZM13.5333 7.6418L7.64168 13.5335L6.46668 12.3585L12.3583 6.4668L13.5333 7.6418ZM3.51667 8.23346L4.70001 7.05013L5.87501 8.23346L4.70001 9.40846C3.06668 11.0418 3.06668 13.6751 4.70001 15.3001C6.32501 16.9335 8.95834 16.9335 10.5917 15.3001L11.7667 14.1251L12.95 15.3001L11.7667 16.4835C9.49168 18.7585 5.80001 18.7585 3.51667 16.4835C1.24167 14.2001 1.24167 10.5085 3.51667 8.23346Z"
                  fill="#8B98A5"
                />
              </svg>
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[15px] font-normal leading-5 text-[#A06AFF] hover:underline"
              >
                {data.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}

          {/* Join date */}
          <div className="flex items-center gap-1">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5.83333 3.33333V2.5H7.5V3.33333H12.5V2.5H14.1667V3.33333H15.4167C16.575 3.33333 17.5 4.26667 17.5 5.41667V15.4167C17.5 16.5667 16.575 17.5 15.4167 17.5H4.58333C3.43333 17.5 2.5 16.5667 2.5 15.4167V5.41667C2.5 4.26667 3.43333 3.33333 4.58333 3.33333H5.83333ZM5.83333 5H4.58333C4.35833 5 4.16667 5.18333 4.16667 5.41667V15.4167C4.16667 15.65 4.35833 15.8333 4.58333 15.8333H15.4167C15.65 15.8333 15.8333 15.65 15.8333 15.4167V5.41667C15.8333 5.18333 15.65 5 15.4167 5H14.1667V5.83333H12.5V5H7.5V5.83333H5.83333V5ZM5.83333 10H7.5V8.33333H5.83333V10ZM5.83333 13.3333H7.5V11.6667H5.83333V13.3333ZM9.16667 10H10.8333V8.33333H9.16667V10ZM9.16667 13.3333H10.8333V11.6667H9.16667V13.3333ZM12.5 10H14.1667V8.33333H12.5V10Z"
                fill="#8B98A5"
              />
            </svg>
            <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
              Joined {data.joined}
            </span>
          </div>
        </div>

        {/* Following/Followers counts */}
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
              {data.stats.following.toLocaleString()}
            </span>
            <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
              Following
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
              {data.stats.followers.toLocaleString()}
            </span>
            <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
              Followers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
