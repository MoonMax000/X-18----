import { type FC, useState, useRef } from "react";
import type { SocialProfileData } from "@/data/socialProfile";
import { profileButtonStyles } from "./profileButtonStyles";
import TipModal from "@/components/monetization/TipModal";
import { DollarSign, Camera } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/common/ImageCropModal";

interface ProfileHeroProps {
  profile: SocialProfileData;
  onEdit?: () => void;
  tweetsCount?: number;
  isOwnProfile?: boolean;
  isFollowing?: boolean;
  onFollowToggle?: (userId: string, currentState: boolean) => Promise<void>;
  profileUserId?: string;
}

const ProfileHero: FC<ProfileHeroProps> = ({
  profile,
  onEdit,
  tweetsCount = 0,
  isOwnProfile = true,
  isFollowing: externalIsFollowing = false,
  onFollowToggle,
  profileUserId,
}) => {
  const [localIsFollowing, setLocalIsFollowing] = useState(externalIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  
  // Avatar and cover upload states
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar);
  const [coverUrl, setCoverUrl] = useState(profile.cover);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isFollowing = externalIsFollowing !== undefined ? externalIsFollowing : localIsFollowing;

  const handleFollowClick = async () => {
    if (isLoading || !profileUserId) return;

    try {
      setIsLoading(true);
      
      if (onFollowToggle) {
        await onFollowToggle(profileUserId, isFollowing);
      } else {
        // Fallback to local state if no callback provided
        setLocalIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle avatar file selection
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempAvatarUrl(reader.result as string);
      setShowAvatarCrop(true);
    };
    reader.readAsDataURL(file);
  };

  // Handle cover file selection
  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setTempCoverUrl(reader.result as string);
      setShowCoverCrop(true);
    };
    reader.readAsDataURL(file);
  };

  // Save cropped avatar
  const handleSaveAvatar = async (croppedImageUrl: string) => {
    try {
      // TODO: Upload to backend
      setAvatarUrl(croppedImageUrl);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Failed to save avatar:', error);
      toast.error('Failed to save avatar');
    }
  };

  // Save cropped cover
  const handleSaveCover = async (croppedImageUrl: string) => {
    try {
      // TODO: Upload to backend
      setCoverUrl(croppedImageUrl);
      toast.success('Cover photo updated successfully');
    } catch (error) {
      console.error('Failed to save cover:', error);
      toast.error('Failed to save cover');
    }
  };

  return (
    <section className="mb-6">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileChange}
        className="hidden"
      />

      {/* Cover/Banner image */}
      <div
        className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#141923] to-[#0B0E13] group"
        onMouseEnter={() => isOwnProfile && setIsHoveringCover(true)}
        onMouseLeave={() => isOwnProfile && setIsHoveringCover(false)}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={`${profile.name} cover`}
            className="h-[120px] sm:h-[160px] md:h-[200px] w-full object-cover"
          />
        ) : (
          <div className="h-[120px] sm:h-[160px] md:h-[200px] w-full" />
        )}
        
        {/* Update cover overlay */}
        {isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            className={`absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200 ${
              isHoveringCover ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center gap-2 text-white">
              <Camera className="h-5 w-5" />
              <span className="font-semibold">Update cover</span>
            </div>
          </button>
        )}
      </div>

      <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="relative -mt-12 sm:-mt-14 md:-mt-16 h-20 w-20 sm:h-28 sm:w-28 md:h-[132px] md:w-[132px]">
            <div className="relative h-full w-full overflow-hidden rounded-full border-3 sm:border-4 border-[#0B0E13] bg-[#121720] group">
              <img
                src={avatarUrl}
                alt={profile.name}
                className="h-full w-full object-cover"
              />
              
              {/* Avatar upload overlay */}
              {isOwnProfile && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
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
                  onClick={onEdit}
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

      {/* Avatar Crop Modal */}
      {showAvatarCrop && tempAvatarUrl && (
        <ImageCropModal
          isOpen={showAvatarCrop}
          imageUrl={tempAvatarUrl}
          cropShape="round"
          aspect={1}
          onCropComplete={(croppedUrl, blob) => {
            handleSaveAvatar(croppedUrl);
          }}
          onClose={() => {
            setShowAvatarCrop(false);
            setTempAvatarUrl(null);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
          }}
        />
      )}

      {/* Cover Crop Modal */}
      {showCoverCrop && tempCoverUrl && (
        <ImageCropModal
          isOpen={showCoverCrop}
          imageUrl={tempCoverUrl}
          cropShape="rect"
          aspect={3}
          onCropComplete={(croppedUrl, blob) => {
            handleSaveCover(croppedUrl);
          }}
          onClose={() => {
            setShowCoverCrop(false);
            setTempCoverUrl(null);
            if (coverInputRef.current) coverInputRef.current.value = '';
          }}
        />
      )}
    </section>
  );
};

export default ProfileHero;
