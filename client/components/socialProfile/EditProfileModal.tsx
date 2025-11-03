import { FC, useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageCropModal from "@/components/common/ImageCropModal";
import { customBackendAPI } from "@/services/api/custom-backend";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { compressBlob } from "@/lib/image-compression";

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
  const { refreshUser } = useAuth();
  
  // Form fields
  const [displayName, setDisplayName] = useState(currentProfile.display_name || '');
  const [bio, setBio] = useState(currentProfile.bio || '');
  const [location, setLocation] = useState(currentProfile.location || '');
  const [website, setWebsite] = useState(currentProfile.website || '');
  
  // Image states
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatar_url);
  const [coverUrl, setCoverUrl] = useState(currentProfile.header_url);
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);
  const [showAvatarCrop, setShowAvatarCrop] = useState(false);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'avatar' | 'cover' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
    disabled: isUploading,
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
    disabled: isUploading,
    noClick: true,
  });

  // Upload with progress tracking
  const uploadWithProgress = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('custom_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (err) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${baseUrl}/api/media/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  };

  // Save cropped avatar
  const handleSaveAvatar = async (croppedImageUrl: string, blob: Blob) => {
    try {
      setIsUploading(true);
      setUploadType('avatar');
      setUploadProgress(0);
      
      // Compress before upload
      const file = await compressBlob(blob, 'avatar.jpg');
      const mediaUrl = await uploadWithProgress(file);
      
      setAvatarUrl(mediaUrl);
      toast.success('Аватар загружен');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Ошибка загрузки аватара');
    } finally {
      setIsUploading(false);
      setUploadType(null);
      setUploadProgress(0);
    }
  };

  // Save cropped cover
  const handleSaveCover = async (croppedImageUrl: string, blob: Blob) => {
    try {
      setIsUploading(true);
      setUploadType('cover');
      setUploadProgress(0);
      
      // Compress before upload
      const file = await compressBlob(blob, 'cover.jpg');
      const mediaUrl = await uploadWithProgress(file);
      
      setCoverUrl(mediaUrl);
      toast.success('Обложка загружена');
    } catch (error) {
      console.error('Failed to upload cover:', error);
      toast.error('Ошибка загрузки обложки');
    } finally {
      setIsUploading(false);
      setUploadType(null);
      setUploadProgress(0);
    }
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

            {/* Hidden inputs */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, 'avatar');
              }}
              className="hidden"
            />
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file, 'cover');
              }}
              className="hidden"
            />

            {/* Cover Image */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Обложка профиля
              </label>
              <div
                {...coverDropzone.getRootProps()}
                className="relative w-full h-32 rounded-xl overflow-hidden border border-[#181B22] bg-gradient-to-br from-[#141923] to-[#0B0E13] group cursor-pointer"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full" />
                )}
                
                {isUploading && uploadType === 'cover' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                    <Loader2 className="h-6 w-6 animate-spin text-white mb-2" />
                    <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-white text-xs mt-2">{uploadProgress}%</span>
                  </div>
                )}
                
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200",
                    coverDropzone.isDragActive || !isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  <div className="flex flex-col items-center gap-2 text-white">
                    {coverDropzone.isDragActive ? (
                      <>
                        <Upload className="h-5 w-5" />
                        <span className="text-sm font-semibold">Отпустите для загрузки</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        <span className="text-sm font-semibold">Изменить обложку</span>
                        <span className="text-xs opacity-75">Кликните или перетащите</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Avatar */}
            <div className="mb-6 -mt-12 ml-6">
              <label className="block text-sm font-semibold text-white mb-2">
                Аватарка
              </label>
              <div
                {...avatarDropzone.getRootProps()}
                className="relative w-24 h-24"
              >
                <div className="relative w-full h-full rounded-full border-4 border-[#0C1015] overflow-hidden bg-[#121720] group cursor-pointer">
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  
                  {isUploading && uploadType === 'avatar' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
                      <Loader2 className="h-5 w-5 animate-spin text-white mb-1" />
                      <span className="text-white text-xs">{uploadProgress}%</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200",
                      avatarDropzone.isDragActive || !isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    {avatarDropzone.isDragActive ? (
                      <Upload className="h-5 w-5 text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
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
    </>
  );
};

export default EditProfileModal;
