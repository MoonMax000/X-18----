import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/crop-utils';
import { cn } from '@/lib/utils';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  cropShape?: 'rect' | 'round';
  aspect?: number;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string, croppedImageBlob: Blob) => void;
}

export default function ImageCropModal({
  isOpen,
  imageUrl,
  cropShape = 'rect',
  aspect = 1,
  onClose,
  onCropComplete,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteInternal = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropImage = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedImageUrl = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation
      );

      // Convert blob URL to Blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();

      onCropComplete(croppedImageUrl, blob);
      onClose();
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Ошибка при обрезке изображения');
    } finally {
      setIsProcessing(false);
    }
  }, [croppedAreaPixels, imageUrl, rotation, onCropComplete, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-4 py-3 rounded-t-2xl bg-[#0C1015] border border-widget-border">
          <h3 className="text-lg font-bold text-white">
            {cropShape === 'round' ? 'Обрезать аватарку' : 'Обрезать изображение'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[400px] md:h-[500px] bg-black rounded-2xl overflow-hidden">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        {/* Controls */}
        <div className="mt-4 px-4 py-4 rounded-2xl bg-[#0C1015] border border-widget-border space-y-4">
          {/* Zoom Control */}
          <div className="flex items-center gap-4">
            <ZoomOut className="h-5 w-5 text-gray-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <ZoomIn className="h-5 w-5 text-gray-400" />
          </div>

          {/* Rotation Control */}
          <div className="flex items-center gap-4">
            <RotateCw className="h-5 w-5 text-gray-400" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
            <span className="text-sm text-gray-400 w-12">{rotation}°</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-full border border-widget-border bg-black/40 text-white font-bold transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleCropImage}
              disabled={isProcessing}
              className={cn(
                "flex-1 py-3 rounded-full font-bold text-white transition-opacity",
                isProcessing
                  ? "bg-gradient-to-r from-gray-600 to-gray-700 opacity-50"
                  : "bg-gradient-to-r from-primary to-[#482090] hover:opacity-90"
              )}
            >
              {isProcessing ? 'Обработка...' : 'Применить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
