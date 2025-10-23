import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defaultProfile, getProfileTimeline } from "@/data/socialProfile";
import type { SocialProfileData } from "@/data/socialProfile";
import type { SocialPost } from "@/data/socialPosts";
import ProfileHero from "./ProfileHero";
import ProfileBioClassic from "./ProfileBioClassic";
import TabListClassic from "./TabListClassic";
import ProfileTweetsClassic from "./ProfileTweetsClassic";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";

interface ProfileContentClassicProps {
  isOwnProfile?: boolean;
}

export default function ProfileContentClassic({
  isOwnProfile = true,
}: ProfileContentClassicProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SocialProfileData | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handle, user_id } = useParams();

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // For now, always use defaultProfile
      // In real app, fetch profile by handle or user_id
      setProfile(defaultProfile);

      const allPosts = getProfileTimeline(defaultProfile);

      // Filter posts based on profile ownership
      if (isOwnProfile) {
        // On My Profile page, show only posts by @TyrianTrade (current user)
        const userPosts = allPosts.filter(
          post => post.author.handle?.toLowerCase() === "@tyriantrade"
        );
        setPosts(userPosts);
      } else {
        // On other profile pages, show all posts from that profile
        setPosts(allPosts);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [handle, user_id, isOwnProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  const tweetsCount = posts.length;

  return (
    <div
      className="min-h-screen"
      style={{ "--profile-image-size": "120px" } as CSSProperties}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-black/80">
        <div className="flex items-center gap-9 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-[#ffffff]/[0.15] active:bg-[#ffffff]/[0.25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M11.6667 5L6.66675 10L11.6667 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold leading-6 text-[#F7F9F9]">
                {profile.name}
              </h2>
              <VerifiedBadge size={20} />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{display: 'none'}}>
                <path
                  d="M18.9999 10.5C18.9837 9.9156 18.8054 9.34658 18.4843 8.85717C18.1641 8.36867 17.7135 7.97786 17.1834 7.72999C17.3852 7.18087 17.4277 6.58653 17.3101 6.01389C17.1916 5.44035 16.9147 4.91204 16.5122 4.48776C16.087 4.0852 15.5596 3.80928 14.986 3.68987C14.4134 3.57226 13.8191 3.61478 13.2699 3.81652C13.023 3.28549 12.6331 2.83408 12.1437 2.51384C11.6543 2.19359 11.0852 2.01447 10.4999 2C9.91554 2.01538 9.34833 2.19269 8.85983 2.51384C8.37132 2.83498 7.98323 3.2864 7.73807 3.81652C7.18805 3.61478 6.59189 3.57046 6.01745 3.68987C5.443 3.80747 4.91379 4.08429 4.4886 4.48776C4.08604 4.91294 3.81103 5.44216 3.69433 6.01479C3.57673 6.58743 3.62196 7.18178 3.8246 7.72999C3.29357 7.97786 2.84125 8.36776 2.5192 8.85627C2.19715 9.34477 2.01713 9.9147 1.99994 10.5C2.01803 11.0853 2.19715 11.6543 2.5192 12.1437C2.84125 12.6322 3.29357 13.023 3.8246 13.27C3.62196 13.8182 3.57673 14.4126 3.69433 14.9852C3.81193 15.5587 4.08604 16.0871 4.4877 16.5122C4.91288 16.913 5.44119 17.188 6.01383 17.3065C6.58646 17.4259 7.18081 17.3825 7.72993 17.1835C7.9778 17.7136 8.3677 18.1641 8.85711 18.4853C9.34562 18.8055 9.91554 18.9837 10.4999 19C11.0852 18.9855 11.6543 18.8073 12.1437 18.4871C12.6331 18.1668 13.023 17.7145 13.2699 17.1844C13.8164 17.4006 14.4152 17.4522 14.9915 17.3327C15.5668 17.2133 16.0951 16.9284 16.5113 16.5122C16.9274 16.0961 17.2133 15.5678 17.3327 14.9915C17.4521 14.4153 17.4005 13.8164 17.1834 13.27C17.7135 13.0221 18.1641 12.6322 18.4852 12.1428C18.8054 11.6543 18.9837 11.0853 18.9999 10.5018V10.5Z"
                  fill="#A06AFF"
                />
              </svg>
            </div>
            <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
              {tweetsCount} post
            </p>
          </div>
        </div>
      </div>

      <ProfileHero
        profile={profile}
        tweetsCount={tweetsCount}
        isOwnProfile={isOwnProfile}
      />
      <main className="mt-4 sm:mt-5 md:mt-6">
        <div className="px-3 sm:px-4 md:px-6">
          {/* User info section */}
          <div className="flex flex-col gap-3 pb-4">
            {/* Name and username */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <h1 className="text-xl font-bold leading-6 text-[#F7F9F9]">
                  {profile.name}
                </h1>
                <VerifiedBadge size={20} />
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{display: 'none'}}>
                  <path
                    d="M18.9999 10.5C18.9837 9.9156 18.8054 9.34658 18.4843 8.85717C18.1641 8.36867 17.7135 7.97786 17.1834 7.72999C17.3852 7.18087 17.4277 6.58653 17.3101 6.01389C17.1916 5.44035 16.9147 4.91204 16.5122 4.48776C16.087 4.0852 15.5596 3.80928 14.986 3.68987C14.4134 3.57226 13.8191 3.61478 13.2699 3.81652C13.023 3.28549 12.6331 2.83408 12.1437 2.51384C11.6543 2.19359 11.0852 2.01447 10.4999 2C9.91554 2.01538 9.34833 2.19269 8.85983 2.51384C8.37132 2.83498 7.98323 3.2864 7.73807 3.81652C7.18805 3.61478 6.59189 3.57046 6.01745 3.68987C5.443 3.80747 4.91379 4.08429 4.4886 4.48776C4.08604 4.91294 3.81103 5.44216 3.69433 6.01479C3.57673 6.58743 3.62196 7.18178 3.8246 7.72999C3.29357 7.97786 2.84125 8.36776 2.5192 8.85627C2.19715 9.34477 2.01713 9.9147 1.99994 10.5C2.01803 11.0853 2.19715 11.6543 2.5192 12.1437C2.84125 12.6322 3.29357 13.023 3.8246 13.27C3.62196 13.8182 3.57673 14.4126 3.69433 14.9852C3.81193 15.5587 4.08604 16.0871 4.4877 16.5122C4.91288 16.913 5.44119 17.188 6.01383 17.3065C6.58646 17.4259 7.18081 17.3825 7.72993 17.1835C7.9778 17.7136 8.3677 18.1641 8.85711 18.4853C9.34562 18.8055 9.91554 18.9837 10.4999 19C11.0852 18.9855 11.6543 18.8073 12.1437 18.4871C12.6331 18.1668 13.023 17.7145 13.2699 17.1844C13.8164 17.4006 14.4152 17.4522 14.9915 17.3327C15.5668 17.2133 16.0951 16.9284 16.5113 16.5122C16.9274 16.0961 17.2133 15.5678 17.3327 14.9915C17.4521 14.4153 17.4005 13.8164 17.1834 13.27C17.7135 13.0221 18.1641 12.6322 18.4852 12.1428C18.8054 11.6543 18.9837 11.0853 18.9999 10.5018V10.5Z"
                    fill="#A06AFF"
                  />
                </svg>
              </div>
              <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
                @{profile.username}
              </p>
            </div>

            {/* Bio/Description */}
            <p className="text-[15px] font-normal leading-5 text-[#F7F9F9]">
              {profile.bio}
            </p>

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
              {profile.location && (
                <div className="flex items-center gap-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 5.83317C8.39169 5.83317 7.08335 7.1415 7.08335 8.74984C7.08335 10.3582 8.39169 11.6665 10 11.6665C11.6084 11.6665 12.9167 10.3582 12.9167 8.74984C12.9167 7.1415 11.6084 5.83317 10 5.83317ZM10 9.99984C9.31085 9.99984 8.75002 9.439 8.75002 8.74984C8.75002 8.06067 9.31085 7.49984 10 7.49984C10.6892 7.49984 11.25 8.06067 11.25 8.74984C11.25 9.439 10.6892 9.99984 10 9.99984ZM10 1.6665C6.09419 1.6665 2.91669 4.844 2.91669 8.74984C2.91669 13.7223 9.26752 18.0132 9.53752 18.1932L10 18.5015L10.4625 18.1932C10.7325 18.0132 17.0834 13.7223 17.0834 8.74984C17.0834 4.844 13.9059 1.6665 10 1.6665ZM10 16.4748C8.61252 15.4407 4.58335 12.1448 4.58335 8.74984C4.58335 5.76317 7.01335 3.33317 10 3.33317C12.9867 3.33317 15.4167 5.76317 15.4167 8.74984C15.4167 12.144 11.3875 15.4398 10 16.4748Z"
                      fill="#8B98A5"
                    />
                  </svg>
                  <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                    {profile.location}
                  </span>
                </div>
              )}

              {/* Website link */}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M15.3 4.70013C13.675 3.0668 11.0417 3.0668 9.40834 4.70013L8.23334 5.87513L7.05001 4.70013L8.23334 3.5168C10.5083 1.2418 14.2 1.2418 16.4833 3.5168C18.7583 5.80013 18.7583 9.4918 16.4833 11.7668L15.3 12.9501L14.125 11.7668L15.3 10.5918C16.9333 8.95846 16.9333 6.32513 15.3 4.70013ZM13.5333 7.6418L7.64168 13.5335L6.46668 12.3585L12.3583 6.4668L13.5333 7.6418ZM3.51667 8.23346L4.70001 7.05013L5.87501 8.23346L4.70001 9.40846C3.06668 11.0418 3.06668 13.6751 4.70001 15.3001C6.32501 16.9335 8.95834 16.9335 10.5917 15.3001L11.7667 14.1251L12.95 15.3001L11.7667 16.4835C9.49168 18.7585 5.80001 18.7585 3.51667 16.4835C1.24167 14.2001 1.24167 10.5085 3.51667 8.23346Z"
                      fill="#8B98A5"
                    />
                  </svg>
                  <a
                    href={profile.website.url}
                    className="text-[15px] font-normal leading-5 text-[#A06AFF] hover:underline"
                  >
                    {profile.website.label}
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
                  Joined {profile.joined}
                </span>
              </div>
            </div>

            {/* Following/Followers counts */}
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
                  {profile.stats.following}
                </span>
                <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                  Following
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
                  {profile.stats.followers}
                </span>
                <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                  Followers
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <TabListClassic />
          </div>
        </div>
        <ProfileTweetsClassic posts={posts} />
      </main>
    </div>
  );
}
