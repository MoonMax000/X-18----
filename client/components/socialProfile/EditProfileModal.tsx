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
  const [isSaving, setIsSaving] = useState(false);
  
  // Get user level from AuthContext (use type assertion since level may not be in type yet)
  const userLevel = (user as any)?.level || 1;

  // Load fresh data from API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

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
    const mediaUrl = await uploadAvatarFn(blob);
    setAvatarUrl(mediaUrl);
  };

  const handleUploadCover = async (blob: Blob) => {
    const mediaUrl = await uploadCoverFn(blob);
    setCoverUrl(mediaUrl);
  };

  // Save all changes
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
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
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Ошибка при сохранении профиля');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="rounded-2xl border border-[#181B22] bg-[#0C1015] p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Редактировать профиль</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cover Image - using compact size for modal */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Обложка профиля
              </label>
              <ProfileCover
                coverUrl={coverUrl}
                isEditable={true}
                size="small"
                onUpload={handleUploadCover}
                uploadProgress={uploadProgress}
                isUploading={isUploading && uploadType === 'cover'}
                className="rounded-xl"
              />
            </div>

            {/* Avatar - using compact size for modal */}
            <div className="mb-6 -mt-12 ml-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Аватарка
              </label>
              <ProfileAvatar
                avatarUrl={avatarUrl}
                level={userLevel}
                isEditable={true}
                size="small"
                onUpload={handleUploadAvatar}
                uploadProgress={uploadProgress}
                isUploading={isUploading && uploadType === 'avatar'}
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Отображаемое имя
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ваше имя"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  О себе
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Расскажите о себе"
                />
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/160
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Местоположение
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ваше местоположение"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Веб-сайт
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                disabled={isSaving || isUploading}
                className="flex-1 py-3 rounded-full border border-[#181B22] bg-black/40 text-white font-bold transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || isUploading}
                className={cn(
                  "flex-1 py-3 rounded-full font-bold text-white transition-opacity",
                  isSaving || isUploading
                    ? "bg-gradient-to-r from-gray-600 to-gray-700 opacity-50"
                    : "bg-gradient-to-r from-primary to-[#482090] hover:opacity-90"
                )}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохранение...
                  </span>
                ) : (
                  'Сохранить'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfileModal;
