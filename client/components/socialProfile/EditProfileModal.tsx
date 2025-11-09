import { FC, useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { customBackendAPI } from "@/services/api/custom-backend";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/useImageUpload";
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ProfileCover from "@/components/common/ProfileCover";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    display_name: string;
    bio: string;
    location: string;
    website: string;
    avatar_url: string;
    header_url: string;
  };
}

const EditProfileModal: FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
}) => {
  const { refreshUser, user } = useAuth();
  const { uploadAvatar: uploadAvatarFn, uploadCover: uploadCoverFn, uploadProgress, isUploading, uploadType } = useImageUpload();
  
  // Form fields
  const [displayName, setDisplayName] = useState(currentProfile.display_name || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [location, setLocation] = useState(currentProfile.location || '');
  const [website, setWebsite] = useState(currentProfile.website || '');
  
  // Image states with fallback
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url || getAvatarUrl(null));
  const [coverUrl, setCoverUrl] = useState(currentProfile.header_url || getCoverUrl(null));
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Get user level from AuthContext (use type assertion since level may not be in type yet)
  const userLevel = (user as any)?.level || 1;

  // Load fresh data from API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const loadUserData = async () => {
    try {
      setIsLoadingData(true);
      const response = await customBackendAPI.getMe();
      
      setDisplayName(response.display_name || '');
      setBio(response.bio || '');
      setLocation(response.location || '');
      setWebsite(response.website || '');
      setAvatarUrl(response.avatar_url || getAvatarUrl(null));
      setCoverUrl(response.header_url || getCoverUrl(null));
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error('Ошибка загрузки данных профиля');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Upload handlers for new components
  const handleUploadAvatar = async (blob: Blob) => {
    try {
      const mediaUrl = await uploadAvatarFn(blob);
      setAvatarUrl(mediaUrl);
      // Don't close modal or refresh - just update local state
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Ошибка при загрузке аватара');
    }
  };

  const handleUploadCover = async (blob: Blob) => {
    try {
      const mediaUrl = await uploadCoverFn(blob);
      setCoverUrl(mediaUrl);
      // Don't close modal or refresh - just update local state
    } catch (error) {
      console.error('Failed to upload cover:', error);
      toast.error('Ошибка при загрузке обложки');
    }
  };

  // Save all changes
  const handleSave = async () => {
    // Close modal immediately
    onClose();
    
    // Save in background
    try {
      await customBackendAPI.updateProfile({
        display_name: displayName,
        bio,
        location,
        website,
        avatar_url: avatarUrl,
        header_url: coverUrl,
      });
      
      await refreshUser();
      toast.success('Профиль успешно обновлен');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Ошибка при сохранении профиля');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div 
          className="relative w-full max-w-md max-h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-[#181B22] bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
          onClick={(e) => e.stopPropagation()}
          style={{
            ['--avatar-size' as any]: 'clamp(80px, 20vw, 112px)',
            ['--avatar-overlap' as any]: '0.5',
          }}
        >
          <div className="overflow-y-auto max-h-[calc(100vh-80px)] scrollbar-hide">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#808283] transition-all hover:bg-[#2F3336] hover:text-white active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
              <button
                onClick={handleSave}
                disabled={isUploading}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border",
                  isUploading
                    ? "bg-gray-600 opacity-50 cursor-not-allowed text-white border-gray-600"
                    : "border-[#525252] bg-gradient-to-r from-[#E6E6E6]/20 via-[#E6E6E6]/5 to-transparent text-white hover:border-[#A06AFF] hover:from-[#A06AFF]/20 hover:via-[#A06AFF]/10 hover:to-transparent hover:shadow-lg hover:shadow-[#A06AFF]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-inset"
                )}
              >
                Сохранить
              </button>
            </div>

            {/* Banner + Avatar Section (Twitter-like) */}
            <section className="relative pb-[calc(var(--avatar-size)*(1-var(--avatar-overlap))+16px)]">
              {/* Cover Image with fixed aspect ratio */}
              <div className="relative w-full aspect-[3/1] overflow-hidden rounded-xl">
                <ProfileCover
                  coverUrl={coverUrl}
                  isEditable={true}
                  size="responsive"
                  onUpload={handleUploadCover}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading && uploadType === 'cover'}
                  className="rounded-xl"
                />
              </div>

              {/* Avatar overlapping the banner */}
              <div
                className="absolute left-4 aspect-square overflow-hidden rounded-full"
                style={{
                  width: 'var(--avatar-size)',
                  bottom: 'calc(var(--avatar-size) * var(--avatar-overlap) * -1)',
                }}
              >
                <ProfileAvatar
                  avatarUrl={avatarUrl}
                  level={userLevel}
                  isEditable={true}
                  size="responsive"
                  onUpload={handleUploadAvatar}
                  uploadProgress={uploadProgress}
                  isUploading={isUploading && uploadType === 'avatar'}
                  className="!w-full !h-full"
                />
              </div>
            </section>

            {/* Form Section */}
            <div className="px-4 pt-[calc(var(--avatar-size)*var(--avatar-overlap)+16px)] pb-4">
              {/* Display Name Field */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Отображаемое имя
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-3 rounded-xl border border-[#2f3336] bg-[#000000] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors hover:border-[#3f4448]"
                  placeholder="Ваше имя"
                />
              </div>

              {/* Bio */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  О себе
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-3 rounded-xl border border-[#2f3336] bg-[#000000] text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors hover:border-[#3f4448]"
                  placeholder="Расскажите о себе"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {bio.length}/160
                </div>
              </div>

              {/* Location */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Местоположение
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={30}
                  className="w-full px-3 py-3 rounded-xl border border-[#2f3336] bg-[#000000] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors hover:border-[#3f4448]"
                  placeholder="Ваше местоположение"
                />
              </div>

              {/* Website */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-[#2f3336] bg-[#000000] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors hover:border-[#3f4448]"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
