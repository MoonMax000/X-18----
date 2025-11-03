import { FC, useRef, memo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { type RootState } from "@/store/store";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import { TierBadge } from "@/components/common/TierBadge";
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/common/ImageCropModal";
import { useImageUpload } from "@/hooks/useImageUpload";

interface ProfileData {
  name: string;
  username: string;
  bio?: string;
  role?: string;
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
  level?: number;
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
  const { uploadAvatar: uploadAvatarFn, uploadCover: uploadCoverFn, uploadProgress, isUploading, uploadType } = useImageUpload();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);
  
  // Local UI states
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  
  // Debug logs
  console.log('👤 UserHeader - currentUser from Redux:', currentUser);
  console.log('📸 UserHeader - avatar from Redux:', currentUser.avatar);
  console.log('🖼️ UserHeader - cover from Redux:', currentUser.cover);

  // Use centralized avatar utilities for consistency
  const data = profileData || (isOwn ? {
    name: currentUser.name,
    username: currentUser.username,
    bio: currentUser.bio,
    role: currentUser.role,
    location: currentUser.location,
    website: currentUser.website,
    joined: currentUser.joined,
    avatar: getAvatarUrl(currentUser),
    cover: getCoverUrl(currentUser.cover),
    stats: currentUser.stats || { tweets: 0, following: 0, followers: 0 },
    isVerified: currentUser.isVerified,
    isPremium: currentUser.isPremium,
    level: currentUser.level,
  } : {
    name: "User",
    username: "user",
    bio: "",
    role: "",
    location: "",
    website: "",
    joined: "Recently",
    avatar: getAvatarUrl(null),
    cover: getCoverUrl(null),
    stats: { tweets: 0, following: 0, followers: 0 },
    isVerified: false,
    isPremium: false,
    level: 1,
  });
  
  // Initialize and sync state
  useEffect(() => {
    setAvatarUrl(data.avatar);
    setCoverUrl(data.cover || '');
  }, [data.avatar, data.cover]);
  
  console.log('🔧 UserHeader - isOwn:', isOwn);
  console.log('📦 UserHeader - profileData prop:', profileData);
  console.log('✅ UserHeader - final data object:', data);
  console.log('📸 UserHeader - final avatar URL:', data.avatar);
  console.log('🖼️ UserHeader - final cover URL:', data.cover);

  // Handle file with validation
  const handleFile = useCallback((file: File, type: 'avatar' | 'cover') => {
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Файл слишком большой. Максимум: 50MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'avatar') {
        setTempAvatarUrl(reader.result as string);
        setShowAvatarCrop(true);
      } else {
        setTempCoverUrl(reader.result as string);
        setShowCoverCrop(true);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Dropzone for avatar
  const onDropAvatar = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0], 'avatar');
    }
  }, [handleFile]);

  const avatarDropzone = useDropzone({
    onDrop: onDropAvatar,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: !isOwn || isUploading,
    noClick: true,
  });

  // Dropzone for cover
  const onDropCover = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0], 'cover');
    }
  }, [handleFile]);

  const coverDropzone = useDropzone({
    onDrop: onDropCover,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: !isOwn || isUploading,
    noClick: true,
  });

  // Save cropped avatar using hook
  const handleSaveAvatar = async (croppedImageUrl: string, blob: Blob) => {
    try {
      const mediaUrl = await uploadAvatarFn(blob);
      setAvatarUrl(mediaUrl);
    } catch (error) {
      // Error already handled in hook
    }
  };

  // Save cropped cover using hook
  const handleSaveCover = async (croppedImageUrl: string, blob: Blob) => {
    try {
      const mediaUrl = await uploadCoverFn(blob);
      setCoverUrl(mediaUrl);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const primaryActionButtonClass =
    "group relative flex items-center justify-center overflow-hidden rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-white bg-[rgba(25,25,25,0.65)] shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-primary hover:to-[#482090] hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.95)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  const getAvatarBorderClass = (level: number = 1) => {
    if (level >= 76) return "ring-4 ring-offset-2 ring-offset-[#0B0E13] ring-yellow-400 animate-pulse";
    if (level >= 51) return "border-4 border-yellow-400";
    if (level >= 26) return "border-4 border-purple-500";
    if (level >= 11) return "border-4 border-blue-500";
    return "border-3 sm:border-4 border-[#0B0E13]";
  };

  const getAvatarGlowClass = (level: number = 1) => {
    if (level >= 76) return "shadow-[0_0_30px_rgba(250,204,21,0.6)]";
    if (level >= 51) return "shadow-[0_0_20px_rgba(250,204,21,0.4)]";
    if (level >= 26) return "shadow-[0_0_20px_rgba(168,85,247,0.4)]";
    if (level >= 11) return "shadow-[0_0_20px_rgba(59,130,246,0.4)]";
    return "";
  };

  return (
    <div className={cn("w-full max-w-[720px]", className)}>
      <div className="flex flex-col gap-4">
        {/* Cover/Banner image with Dropzone */}
        <div 
          {...(isOwn ? coverDropzone.getRootProps() : {})}
          className="group relative w-full overflow-hidden rounded-3xl border border-widget-border bg-[#16181C]"
          onMouseEnter={() => isOwn && !isUploading && setIsHoveringCover(true)}
          onMouseLeave={() => isOwn && setIsHoveringCover(false)}
        >
          <img
            src={coverUrl || data.cover}
            alt="Profile cover"
            className="h-[120px] sm:h-[160px] md:h-[180px] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
          
          {/* Upload progress for cover */}
          {isUploading && uploadType === 'cover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-white text-sm mt-2">{uploadProgress}%</span>
            </div>
          )}
          
          {isOwn && !isUploading && (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200",
                isHoveringCover || coverDropzone.isDragActive ? 'opacity-100' : 'opacity-0'
              )}
            >
              <div className="flex flex-col items-center gap-2 text-white">
                {coverDropzone.isDragActive ? (
                  <>
                    <Upload className="h-6 w-6" />
                    <span className="font-semibold">Отпустите чтобы загрузить</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5" />
                    <span className="font-semibold">Update cover</span>
                    <span className="text-xs opacity-75">или перетащите файл</span>
                  </>
                )}
              </div>
            </button>
          )}
          
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file, 'cover');
            }}
          />
        </div>

        {/* Avatar and action buttons container */}
        <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar with Dropzone and negative margin to overlap banner */}
            <div 
              {...(isOwn ? avatarDropzone.getRootProps() : {})}
              className="relative -mt-12 sm:-mt-14 md:-mt-16"
            >
              <div className={cn(
                "group relative h-20 w-20 sm:h-28 sm:w-28 md:h-[132px] md:w-[132px] overflow-hidden rounded-full",
                getAvatarBorderClass(data.level),
                getAvatarGlowClass(data.level)
              )}>
                <img
                  src={avatarUrl || data.avatar}
                  alt="Profile"
                  className="h-full w-full object-cover scale-110"
                />
                
                {/* Upload progress for avatar */}
                {isUploading && uploadType === 'avatar' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                    <Loader2 className="h-6 w-6 animate-spin text-white mb-1" />
                    <span className="text-white text-xs">{uploadProgress}%</span>
                  </div>
                )}
                
                {isOwn && !isUploading && (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    aria-label="Update profile picture"
                    className={cn(
                      "absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity duration-200",
                      avatarDropzone.isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {avatarDropzone.isDragActive ? (
                      <Upload className="h-6 w-6 text-white" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                )}
                
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file, 'avatar');
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3 pt-2">
              {!isOwn && (
                <button type="button" className={primaryActionButtonClass}>
                  <span className="relative z-10 text-center font-semibold leading-5">
                    Follow
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* User info section */}
        <div className="flex flex-col gap-3 px-3 sm:px-4 md:px-6 pb-4">
          {/* Name and username */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <h1 className="text-xl font-bold leading-6 text-[#F7F9F9]">
                {data.name}
              </h1>
              {data.isVerified && <VerifiedBadge size={20} />}
            </div>
            <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
              @{data.username}
            </p>
            {data.role && (
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
                    {data.role}
                  </span>
                </div>
              </div>
            )}
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
            <TierBadge tier={4} />

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
      
      {/* Avatar Crop Modal */}
      {showAvatarCrop && tempAvatarUrl && (
        <ImageCropModal
          isOpen={showAvatarCrop}
          imageUrl={tempAvatarUrl}
          cropShape="round"
          aspect={1}
          onCropComplete={(croppedUrl, blob) => {
            handleSaveAvatar(croppedUrl, blob);
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
            handleSaveCover(croppedUrl, blob);
          }}
          onClose={() => {
            setShowCoverCrop(false);
            setTempCoverUrl(null);
            if (coverInputRef.current) coverInputRef.current.value = '';
          }}
        />
      )}
    </div>
  );
};

export default memo(UserHeader);
