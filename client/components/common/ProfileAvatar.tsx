import { FC, useRef, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getAvatarBorderClass, getAvatarGlowClass } from "@/lib/profile-styles";
import { getAvatarUrl } from "@/lib/avatar-utils";
import ImageCropModal from "./ImageCropModal";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  level?: number;
  isEditable?: boolean;
  size?: 'small' | 'medium' | 'large' | 'responsive';
  className?: string;
  onUpload?: (blob: Blob) => Promise<void>;
  uploadProgress?: number;
  isUploading?: boolean;
}

/**
 * Переиспользуемый компонент аватара профиля
 * Поддерживает Drag & Drop, Crop, Upload, Progress bar
 */
const ProfileAvatar: FC<ProfileAvatarProps> = ({
  avatarUrl,
  level = 1,
  isEditable = false,
  size = 'responsive',
  className,
  onUpload,
  uploadProgress = 0,
  isUploading = false,
}) => {
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const finalAvatarUrl = avatarUrl || getAvatarUrl(null);

  // Size mappings
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
    responsive: 'w-20 h-20 sm:w-28 sm:h-28 md:w-[132px] md:h-[132px]',
  };

  // Handle file with validation
  const handleFile = useCallback((file: File) => {
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
      setTempAvatarUrl(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const dropzone = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: !isEditable || isUploading,
    noClick: true,
  });

  // Handle crop complete
  const handleCropComplete = async (croppedUrl: string, blob: Blob) => {
    if (onUpload) {
      await onUpload(blob);
    }
  };

  return (
    <>
      <div
        {...(isEditable ? dropzone.getRootProps() : {})}
        className={cn("relative", sizeClasses[size], className)}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />

        <div className={cn(
          "relative w-full h-full rounded-full overflow-hidden bg-[#121720] group",
          getAvatarBorderClass(level),
          getAvatarGlowClass(level),
          isEditable && "cursor-pointer"
        )}>
          <img 
            src={finalAvatarUrl} 
            alt="Avatar" 
            className="w-full h-full object-cover scale-110" 
          />

          {/* Upload progress */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
              <Loader2 className="h-6 w-6 animate-spin text-white mb-1" />
              <span className="text-white text-xs">{uploadProgress}%</span>
            </div>
          )}

          {/* Upload button (hover) */}
          {isEditable && !isUploading && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Update profile picture"
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity duration-200",
                dropzone.isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              {dropzone.isDragActive ? (
                <Upload className="h-6 w-6 text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {showCrop && tempAvatarUrl && (
        <ImageCropModal
          isOpen={showCrop}
          imageUrl={tempAvatarUrl}
          cropShape="round"
          aspect={1}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCrop(false);
            setTempAvatarUrl(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      )}
    </>
  );
};

export default ProfileAvatar;
