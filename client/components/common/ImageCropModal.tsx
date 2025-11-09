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

// Константы для zoom
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

// Константы для магнитного прилипания поворота
const SNAP_DEG = 2;
const SNAP_POINTS = [0, 90, 180, 270, 360];

// Вспомогательные функции
const clamp = (value: number, min: number, max: number) => 
  Math.min(max, Math.max(min, value));

const round2 = (value: number) => 
  Math.round(value * 100) / 100;

// Магнитное прилипание к кратным 90°
const snapRotation = (deg: number) => {
  for (const t of SNAP_POINTS) {
    if (Math.abs(deg - t) <= SNAP_DEG) return t;
  }
  return deg;
};

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

  // Обработчик изменения zoom с нормализацией
  const handleZoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setZoom(round2(clamp(value, MIN_ZOOM, MAX_ZOOM)));
  };

  // Обработчик изменения rotation с магнитным прилипанием
  const handleRotationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setRotation(snapRotation(value));
  };

  // Сброс rotation
  const handleResetRotation = () => {
    setRotation(0);
  };

  // Предотвращение прокрутки колесом мыши
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
  };

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

  // Кросс-браузерные стили для слайдеров (WebKit + Firefox)
  const rangeBase = cn(
    "appearance-none cursor-pointer touch-pan-y",
    "h-2 rounded-lg bg-gray-700",
    // Thumb WebKit
    "[&::-webkit-slider-thumb]:appearance-none",
    "[&::-webkit-slider-thumb]:h-4",
    "[&::-webkit-slider-thumb]:w-4",
    "[&::-webkit-slider-thumb]:rounded-full",
    "[&::-webkit-slider-thumb]:bg-primary",
    "[&::-webkit-slider-thumb]:cursor-pointer",
    // Track/Thumb Firefox
    "[&::-moz-range-track]:h-2",
    "[&::-moz-range-track]:bg-gray-700",
    "[&::-moz-range-track]:rounded-lg",
    "[&::-moz-range-thumb]:h-4",
    "[&::-moz-range-thumb]:w-4",
    "[&::-moz-range-thumb]:border-0",
    "[&::-moz-range-thumb]:rounded-full",
    "[&::-moz-range-thumb]:bg-primary"
  );

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(100%,720px)] rounded-2xl overflow-hidden border border-widget-border bg-[#0C1015] text-white shadow-xl select-none">
        
        {/* Header с компактными кнопками */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-widget-border bg-[#0C1015]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className={cn(
                "h-8 px-3 text-sm rounded-md border border-transparent text-gray-300 hover:bg-white/5",
                isProcessing && "opacity-50 pointer-events-none"
              )}
            >
              Отмена
            </button>

            <button
              type="button"
              onClick={handleCropImage}
              disabled={isProcessing}
              className={cn(
                "h-8 px-3 text-sm rounded-md font-medium text-white bg-gradient-to-r from-primary to-[#482090] hover:opacity-90",
                isProcessing && "opacity-50 pointer-events-none"
              )}
            >
              {isProcessing ? "Обработка…" : "Применить"}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/5 text-gray-300"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Область кропа */}
        <div 
          className="relative w-full h-[420px] md:h-[520px] bg-black"
          onWheel={handleWheel}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape={cropShape}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteInternal}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoomWithScroll={false}
            restrictPosition
          />
        </div>

        {/* Панель управления: всё в одну строку */}
        <div
          className="px-4 py-3 border-t border-widget-border bg-[#0C1015]"
          onWheel={handleWheel}
        >
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Zoom */}
            <ZoomOut className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={ZOOM_STEP}
              value={zoom}
              onChange={handleZoomInput}
              aria-label="Масштаб"
              className={cn(rangeBase, "min-w-[140px] sm:min-w-[180px] md:min-w-[220px]")}
            />
            <ZoomIn className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
            <span className="text-sm tabular-nums text-gray-400">{zoom.toFixed(2)}×</span>

            {/* Divider */}
            <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />

            {/* Rotation */}
            <RotateCw className="h-5 w-5 text-gray-400 shrink-0" aria-hidden="true" />
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={handleRotationInput}
              aria-label="Поворот"
              className={cn(rangeBase, "min-w-[160px] sm:min-w-[200px] md:min-w-[240px]")}
            />
            <span className="text-sm tabular-nums text-gray-400 w-12 text-right">{rotation}°</span>

            <button
              type="button"
              onClick={handleResetRotation}
              className="ml-auto h-8 px-3 text-xs rounded-md border border-white/10 hover:bg-white/5"
              aria-label="Сбросить поворот"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
