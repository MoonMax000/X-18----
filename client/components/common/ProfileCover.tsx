import { FC, useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ImageCropModal from './ImageCropModal';
import { getCoverUrl } from '@/lib/avatar-utils';

export type CoverSize = 'small' | 'medium' | 'large' | 'responsive';

interface ProfileCoverProps {
  coverUrl?: string | null;
  isEditable?: boolean;
  size?: CoverSize;
  className?: string;
  onUpload?: (blob: Blob) => Promise<void>;
  uploadProgress?: number;
  isUploading?: boolean;
}

/**
 * Reusable profile cover/banner component with upload and crop functionality
 * 
 * @param coverUrl - URL of the cover image
 * @param isEditable - Whether the cover can be edited (shows upload UI)
 * @param size - Size variant: 'small' (128px), 'medium' (160px), 'large' (200px), 'responsive' (120-180px)
 * @param className - Additional CSS classes
 * @param onUpload - Callback when cover is uploaded (receives cropped blob)
 * @param uploadProgress - Upload progress percentage (0-100)
 * @param isUploading - Whether an upload is in progress
 */
const ProfileCover: FC<ProfileCoverProps> = ({
  coverUrl,
  isEditable = false,
  size = 'responsive',
  className,
  onUpload,
  uploadProgress = 0,
  isUploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tempCoverUrl, setTempCoverUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Get final cover URL with fallback
  const finalCoverUrl = getCoverUrl(coverUrl);

  // Size classes mapping
  const sizeClasses: Record<CoverSize, string> = {
    small: 'h-32',      // 128px - compact for modals
    medium: 'h-40',     // 160px - medium size
    large: 'h-50',      // 200px - large display
    responsive: 'h-[120px] sm:h-[160px] md:h-[180px]', // Responsive sizing
  };

  // Handle file selection with validation
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
      setTempCoverUrl(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFile(acceptedFiles[0]);
    }
  }, [handleFile]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
    disabled: !isEditable || isUploading,
    noClick: true,
  });

  // Handle crop completion
  const handleCropComplete = async (croppedImageUrl: string, blob: Blob) => {
    try {
      if (onUpload) {
        await onUpload(blob);
      }
      setShowCropModal(false);
      setTempCoverUrl(null);
    } catch (error) {
      console.error('Error uploading cover:', error);
      toast.error('Не удалось загрузить обложку');
    }
  };

  // Handle crop cancel
  const handleCropCancel = () => {
    setShowCropModal(false);
    setTempCoverUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <>
      <div
        {...(isEditable ? getRootProps() : {})}
        className={cn(
          'group relative w-full overflow-hidden rounded-3xl border border-widget-border bg-[#16181C]',
          className
        )}
        onMouseEnter={() => isEditable && !isUploading && setIsHovering(true)}
        onMouseLeave={() => isEditable && setIsHovering(false)}
      >
        {/* Cover Image */}
        <img
          src={finalCoverUrl}
          alt="Profile cover"
          className={cn('w-full object-cover', sizeClasses[size])}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Upload Progress Overlay */}
        {isUploading && (
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

        {/* Upload Button Overlay (only in editable mode) */}
        {isEditable && !isUploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200',
              isHovering || isDragActive ? 'opacity-100' : 'opacity-0'
            )}
          >
            <div className="flex flex-col items-center gap-2 text-white">
              {isDragActive ? (
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

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Crop Modal */}
      {showCropModal && tempCoverUrl && (
        <ImageCropModal
          isOpen={showCropModal}
          imageUrl={tempCoverUrl}
          cropShape="rect"
          aspect={3} // 3:1 aspect ratio for cover images
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
        />
      )}
    </>
  );
};

export default ProfileCover;
