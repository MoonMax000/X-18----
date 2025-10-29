import { FC, useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import classNames from "clsx";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/crop-utils";
import { Loader2 } from "lucide-react";

interface CoverCropModalProps {
  imageUrl: string;
  onSave: (croppedImageUrl: string) => Promise<void>;
  onClose: () => void;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const CoverCropModal: FC<CoverCropModalProps> = ({
  imageUrl,
  onSave,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPx: CroppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPx);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels || isSaving) return;

    try {
      setIsSaving(true);
      const croppedImageUrl = await getCroppedImg(imageUrl, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });

      await onSave(croppedImageUrl);
      onClose();
    } catch (error) {
      console.error("Failed to save cover:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[920px] overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181B22] px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h2 className="text-base font-semibold text-white">
              Crop cover photo
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cropper Container */}
          <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border-2 border-[#1D9BF0] bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              minZoom={1}
              maxZoom={3}
              zoomSpeed={0.1}
              objectFit="horizontal-cover"
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#000",
                },
                cropAreaStyle: {
                  border: "2px solid #1D9BF0",
                },
              }}
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-3 rounded-full bg-black/40 px-4 py-3 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setZoom(Math.max(1, zoom * 0.9))}
              disabled={isSaving}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white disabled:opacity-50"
              aria-label="Zoom out"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M11 4c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.93 0 3.68-.78 4.95-2.05C17.21 14.68 18 12.93 18 11c0-3.87-3.14-7-7-7zm-9 7c0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.12-.74 4.08-1.97 5.62l3.68 3.67-1.42 1.42-3.67-3.68C15.08 19.26 13.12 20 11 20c-4.97 0-9-4.03-9-9zm12.5 1h-7v-2h7v2z" />
              </svg>
            </button>

            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isSaving}
              className="h-1 flex-1 cursor-pointer accent-[#1D9BF0] disabled:opacity-50"
              aria-label="Zoom level"
            />

            <button
              type="button"
              onClick={() => setZoom(Math.min(3, zoom * 1.1))}
              disabled={isSaving}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white disabled:opacity-50"
              aria-label="Zoom in"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M11 4c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.93 0 3.68-.78 4.95-2.05C17.21 14.68 18 12.93 18 11c0-3.87-3.14-7-7-7zm-9 7c0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.12-.74 4.08-1.97 5.62l3.68 3.67-1.42 1.42-3.67-3.68C15.08 19.26 13.12 20 11 20c-4.97 0-9-4.03-9-9zm8-1V7.5h2V10h2.5v2H12v2.5h-2V12H7.5v-2H10z" />
              </svg>
            </button>
          </div>

          {/* Preview Sizes Info */}
          <div className="grid grid-cols-2 gap-4 text-center text-xs text-[#808283]">
            <div>
              <div className="mb-2 text-white font-semibold">Desktop Preview</div>
              <div className="aspect-[16/9] rounded-lg border border-[#181B22] bg-black/40 flex items-center justify-center">
                1200 x 200px
              </div>
            </div>
            <div>
              <div className="mb-2 text-white font-semibold">Mobile Preview</div>
              <div className="aspect-[16/9] rounded-lg border border-[#181B22] bg-black/40 flex items-center justify-center">
                600 x 200px
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#181B22] px-6 py-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full border border-[#181B22] bg-transparent px-5 py-2 text-sm font-semibold text-[#E7E9EA] transition-all hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
            className={classNames(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all",
              isSaving || !croppedAreaPixels
                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
            )}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
