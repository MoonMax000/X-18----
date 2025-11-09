import { type FC, useState, useEffect } from "react";
import type { SocialProfileData } from "@/data/socialProfile";
import { profileButtonStyles } from "./profileButtonStyles";
import TipModal from "@/components/monetization/TipModal";
import EditProfileModal from "./EditProfileModal";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ProfileCover from "@/components/common/ProfileCover";

interface ProfileHeroProps {
  profile: SocialProfileData;
  onEdit?: () => void;
  tweetsCount?: number;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: (userId: string, currentState: boolean) => Promise<void>;
  profileUserId?: string;
  level?: number;
}

const ProfileHero: FC<ProfileHeroProps> = ({
  profile,
  onEdit,
  tweetsCount = 0,
  isOwnProfile = true,
  isFollowing: externalIsFollowing = false,
  onFollowToggle,
  profileUserId,
  level = 1,
}) => {
  const { user } = useAuth();
  const { uploadAvatar: uploadAvatarFn, uploadCover: uploadCoverFn, uploadProgress, isUploading, uploadType } = useImageUpload();
  const [localIsFollowing, setLocalIsFollowing] = useState(externalIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Avatar and cover upload states with fallback
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar || getAvatarUrl(null));
  const [coverUrl, setCoverUrl] = useState(profile.cover || getCoverUrl(null));
  
  // Update local state when props change
  useEffect(() => {
    const newAvatarUrl = profile.avatar || getAvatarUrl(null);
    const newCoverUrl = profile.cover || getCoverUrl(null);
    setAvatarUrl(newAvatarUrl);
    setCoverUrl(newCoverUrl);
  }, [profile, profile.avatar, profile.cover]);

  const isFollowing = externalIsFollowing !== undefined ? externalIsFollowing : localIsFollowing;

  const handleFollowClick = async () => {
    if (isLoading || !profileUserId) return;

    try {
      setIsLoading(true);
      
      if (onFollowToggle) {
        await onFollowToggle(profileUserId, isFollowing);
      } else {
        setLocalIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload handlers for new components
  const handleUploadAvatar = async (blob: Blob) => {
    const mediaUrl = await uploadAvatarFn(blob);
    setAvatarUrl(mediaUrl);
  };

  const handleUploadCover = async (blob: Blob) => {
    const mediaUrl = await uploadCoverFn(blob);
    setCoverUrl(mediaUrl);
  };

  return (
    <section className="mb-6">
      {/* Cover/Banner */}
      <ProfileCover
        coverUrl={coverUrl}
        isEditable={isOwnProfile}
        size="responsive"
        onUpload={handleUploadCover}
        uploadProgress={uploadProgress}
        isUploading={isUploading && uploadType === 'cover'}
      />

      <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-4">
          {/* Avatar with negative margin to overlap banner */}
          <div className="relative -mt-12 sm:-mt-14 md:-mt-16">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              level={level}
              isEditable={isOwnProfile}
              size="responsive"
              onUpload={handleUploadAvatar}
              uploadProgress={uploadProgress}
              isUploading={isUploading && uploadType === 'avatar'}
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pt-2">
            {isOwnProfile ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    toast.error("You cannot send donations to yourself");
                  }}
                  className={profileButtonStyles.primary}
                  title="Donate"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="relative z-10 text-center font-semibold leading-5">
                    Donate
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className={profileButtonStyles.primary}
                >
                  <span className="text-center font-semibold leading-5 text-white">
                    Edit profile
                  </span>
                </button>
              </>
            ) : (
              <>
                <button type="button" className={profileButtonStyles.icon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M2.5 10.0002C2.5 9.0835 3.25 8.3335 4.16667 8.3335C5.08333 8.3335 5.83333 9.0835 5.83333 10.0002C5.83333 10.9168 5.08333 11.6668 4.16667 11.6668C3.25 11.6668 2.5 10.9168 2.5 10.0002ZM10 11.6668C10.9167 11.6668 11.6667 10.9168 11.6667 10.0002C11.6667 9.0835 10.9167 8.3335 10 8.3335C9.08333 8.3335 8.33333 9.0835 8.33333 10.0002C8.33333 10.9168 9.08333 11.6668 10 11.6668ZM15.8333 11.6668C16.75 11.6668 17.5 10.9168 17.5 10.0002C17.5 9.0835 16.75 8.3335 15.8333 8.3335C14.9167 8.3335 14.1667 9.0835 14.1667 10.0002C14.1667 10.9168 14.9167 11.6668 15.8333 11.6668Z"
                      fill="#F7F9F9"
                    />
                  </svg>
                </button>

                <button type="button" className={profileButtonStyles.icon}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M1.66501 4.58333C1.66501 3.4325 2.59751 2.5 3.74834 2.5H16.2483C17.3992 2.5 18.3317 3.4325 18.3317 4.58333V15.4167C18.3317 16.5675 17.3992 17.5 16.2483 17.5H3.74834C2.59751 17.5 1.66501 16.5675 1.66501 15.4167V4.58333ZM3.74834 4.16667C3.51834 4.16667 3.33168 4.35333 3.33168 4.58333V6.88667L9.99834 9.91833L16.665 6.88833V4.58333C16.665 4.35333 16.4783 4.16667 16.2483 4.16667H3.74834ZM16.665 8.71917L9.99834 11.7492L3.33168 8.7175V15.4167C3.33168 15.6467 3.51834 15.8333 3.74834 15.8333H16.2483C16.4783 15.8333 16.665 15.6467 16.665 15.4167V8.71917Z"
                      fill="#F7F9F9"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setShowTipModal(true)}
                  className={profileButtonStyles.primary}
                  title="Send donation"
                >
                  <DollarSign className="h-4 w-4" />
                  <span className="relative z-10 text-center font-semibold leading-5">
                    Donate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleFollowClick}
                  className={profileButtonStyles.primary}
                  disabled={isLoading}
                >
                  <span className="relative z-10 text-center font-semibold leading-5">
                    {isLoading ? 'Loading...' : isFollowing ? "Unfollow" : "Follow"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* User info section */}
        <div className="flex flex-col gap-3 pb-4">
          {/* Name and username */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold leading-6 text-[#F7F9F9]">
                {profile.name}
              </h1>
              {/* Verified badge can be added here if needed */}
            </div>
            <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
              @{profile.username}
            </p>
          </div>

          {/* Bio/Description */}
          {profile.bio && (
            <p className="text-[15px] font-normal leading-5 text-[#F7F9F9]">
              {profile.bio}
            </p>
          )}

          {/* User metadata with icons */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {/* Tier badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                TIER
              </span>
              <span className="text-[15px] font-bold leading-5 text-[#A06AFF]">
                {level}
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] font-normal leading-5 text-[#A06AFF] hover:underline"
                >
                  {profile.website.label}
                </a>
              </div>
            )}

            {/* Join date */}
            {profile.joined && (
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
            )}
          </div>

          {/* Following/Followers counts */}
          {profile.stats && (
            <div className="flex flex-wrap items-baseline gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
                  {profile.stats.following?.toLocaleString() || 0}
                </span>
                <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                  Following
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold leading-5 text-[#F7F9F9]">
                  {profile.stats.followers?.toLocaleString() || 0}
                </span>
                <span className="text-[15px] font-normal leading-5 text-[#8B98A5]">
                  Followers
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tip Modal */}
      {!isOwnProfile && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          authorId={profile.username}
          authorName={profile.name}
          authorAvatar={profile.avatar}
        />
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && user && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          currentProfile={{
            display_name: user.display_name,
            bio: user.bio,
            location: profile.location || '',
            website: profile.website?.url || '',
            avatar_url: avatarUrl,
            header_url: coverUrl,
          }}
        />
      )}
    </section>
  );
};

export default ProfileHero;
