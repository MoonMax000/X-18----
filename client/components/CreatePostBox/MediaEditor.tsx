import {
  FC,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import classNames from "clsx";
import Cropper from "react-easy-crop";
import { MediaItem, CropTransform, createDefaultTransform } from "./types";
import { getCroppedImg, revokeCroppedImg } from "../../lib/crop-utils";

interface MediaEditorProps {
  media: MediaItem | null;
  onSave: (media: MediaItem) => void;
  onClose: () => void;
}

type EditorTab = "crop" | "alt" | "warning";
type AspectPreset = "original" | "wide" | "square";

const ALT_LIMIT = 1000;

const WARNING_OPTIONS = [
  {
    id: "nudity",
    label: "Nudity",
    description: "Includes partial or full nudity.",
  },
  {
    id: "violence",
    label: "Violence",
    description: "Graphic or physical violence present.",
  },
  {
    id: "sensitive",
    label: "Sensitive",
    description: "Potentially distressing or triggering content.",
  },
];

// Типы для react-easy-crop
interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MediaEditor: FC<MediaEditorProps> = ({
  media,
  onSave,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>("crop");
  const [altText, setAltText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [transform, setTransform] = useState<CropTransform>(
    createDefaultTransform(),
  );
  const [showAltHelp, setShowAltHelp] = useState(false);

  // Состояние для react-easy-crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>("original");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
  const [naturalDimensions, setNaturalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const [initialState, setInitialState] = useState<{
    crop: { x: number; y: number };
    zoom: number;
    aspect: AspectPreset;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Сохраняем состояние для каждого пресета
  const presetStates = useRef<{
    [key in AspectPreset]: { 
      crop: { x: number; y: number }; 
      zoom: number;
    };
  }>({
    original: { crop: { x: 0, y: 0 }, zoom: 1 },
    wide: { crop: { x: 0, y: 0 }, zoom: 1 },
    square: { crop: { x: 0, y: 0 }, zoom: 1 },
  });

  // Получаем aspect ratio для текущего пресета
  const getAspectRatio = (preset: AspectPreset): number | undefined => {
    if (!naturalDimensions) return undefined;
    
    switch (preset) {
      case 'original':
        return naturalDimensions.width / naturalDimensions.height;
      case 'square':
        return 1;
      case 'wide':
        return 16 / 9;
      default:
        return 1;
    }
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (media) {
      const savedTransform = media.transform || createDefaultTransform();
      setTransform(savedTransform);
      setAltText(media.alt || "");
      setWarnings(media.sensitiveTags || []);
      
      // Преобразуем сохраненные translateX, translateY в crop координаты
      const savedCrop = {
        x: savedTransform.translateX,
        y: savedTransform.translateY
      };
      setCrop(savedCrop);
      setZoom(savedTransform.scale);
      setHasChanges(false);
    }
  }, [media]);
  
  // Отслеживаем изменения
  useEffect(() => {
    if (initialState) {
      const hasStateChanged = 
        crop.x !== initialState.crop.x ||
        crop.y !== initialState.crop.y ||
        zoom !== initialState.zoom ||
        aspectPreset !== initialState.aspect;
      setHasChanges(hasStateChanged);
    }
  }, [crop, zoom, aspectPreset, initialState]);

  // Callback когда crop завершен
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPx: CroppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  // Callback когда изображение загружено - заменяет ручную загрузку Image()
  const onMediaLoaded = useCallback((mediaSize: { width: number; height: number; naturalWidth: number; naturalHeight: number }) => {
    const natW = mediaSize.naturalWidth;
    const natH = mediaSize.naturalHeight;
    setNaturalDimensions({ width: natW, height: natH });

    // По умолчанию всегда "original" (показывает фото целиком)
    const selectedPreset: AspectPreset = "original";
    
    setAspectPreset(selectedPreset);
    
    // Сохраняем начальное состояние
    const savedCrop = {
      x: transform.translateX,
      y: transform.translateY
    };
    const initialStateData = {
      crop: savedCrop,
      zoom: transform.scale,
      aspect: selectedPreset
    };
    setInitialState(initialStateData);
  }, [transform]);

  const handleSave = async () => {
    if (!media || !croppedAreaPixels) return;

    const updatedTransform: CropTransform = {
      ...transform,
      scale: zoom,
      translateX: crop.x,
      translateY: crop.y,
      aspectRatio:
        aspectPreset === "original"
          ? "original"
          : aspectPreset === "wide"
            ? "16:9"
            : "1:1",
      grid: transform.grid || "thirds",
      cropRect: {
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        w: Math.round(croppedAreaPixels.width),
        h: Math.round(croppedAreaPixels.height),
      },
    };

    // Генерируем обрезанное превью-изображение
    let croppedPreviewUrl: string | undefined;
    try {
      croppedPreviewUrl = await getCroppedImg(media.url, {
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });
    } catch (error) {
      console.error('Failed to generate cropped preview:', error);
    }

    // Освобождаем старый blob URL если он существует
    if (media.croppedPreviewUrl) {
      revokeCroppedImg(media.croppedPreviewUrl);
    }

    onSave({
      ...media,
      transform: updatedTransform,
      alt: altText,
      sensitiveTags: warnings,
      croppedPreviewUrl,
    });
  };

  // Переключение пресетов
  const handleAspectChange = (preset: AspectPreset) => {
    // Сохраняем текущее состояние для текущего пресета
    presetStates.current[aspectPreset] = {
      crop: { ...crop },
      zoom: zoom
    };

    // Переключаемся на новый пресет
    setAspectPreset(preset);
    
    // Загружаем сохраненное состояние для нового пресета
    const savedState = presetStates.current[preset];
    setCrop(savedState.crop);
    setZoom(savedState.zoom);
  };

  if (!mounted || !media) return null;

  const isImage = media.type === "image";
  const altChars = altText.length;
  const currentAspect = getAspectRatio(aspectPreset);

  // Проверка соответствия изображения пресету
  const matchesPreset = (preset: AspectPreset): boolean => {
    if (!naturalDimensions) return false;
    const ratio = naturalDimensions.width / naturalDimensions.height;
    
    switch (preset) {
      case "square":
        return ratio >= 0.9 && ratio <= 1.1;
      case "wide":
        return ratio >= 1.6 && ratio <= 1.9;
      case "original":
        return true;
      default:
        return false;
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-[920px] overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[100px] outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative flex items-center border-b border-[#181B22] px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
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
            <h2 className="text-base font-semibold text-white">Crop media</h2>
          </div>

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
            <button
              className={classNames(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === "crop"
                  ? "bg-[#1D9BF0]/20 text-[#1D9BF0]"
                  : "text-[#E7E9EA] hover:bg-white/10",
              )}
              onClick={() => setActiveTab("crop")}
              disabled={!isImage}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 3V17C6 18.1046 6.89543 19 8 19H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M3 6H17C18.1046 6 19 6.89543 19 8V21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Crop
            </button>

            {/* TODO: Re-enable ALT and warning tabs after MVP */}
            {false && (
              <>
                <button
                  className={classNames(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    activeTab === "alt"
                      ? "bg-[#1D9BF0]/20 text-[#1D9BF0]"
                      : "text-[#E7E9EA] hover:bg-white/10",
                  )}
                  onClick={() => setActiveTab("alt")}
                >
                  ALT
                </button>

                <button
                  className={classNames(
                    "flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    activeTab === "warning"
                      ? "bg-[#F97316]/20 text-[#F97316]"
                      : "text-[#E7E9EA] hover:bg-white/10",
                  )}
                  onClick={() => setActiveTab("warning")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <div className="w-9" />
        </div>

        {/* Content */}
        {activeTab === "crop" && (
          <div className="space-y-6 p-6">
            {!isImage ? (
              <div className="rounded-2xl border border-[#181B22] bg-white/5 px-4 py-6 text-center text-sm text-[#808283]">
                Cropping is available for images only.
              </div>
            ) : (
              <>
                <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border-2 border-[#1D9BF0] bg-black">
                  <Cropper
                    image={media.url}
                    crop={crop}
                    zoom={zoom}
                    aspect={currentAspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    onMediaLoaded={onMediaLoaded}
                    minZoom={1}
                    maxZoom={3}
                    zoomSpeed={0.1}
                    showGrid={true}
                    objectFit={aspectPreset === "original" ? "contain" : "horizontal-cover"}
                    style={{
                      containerStyle: {
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000',
                      },
                      mediaStyle: {},
                      cropAreaStyle: {
                        border: '2px solid #1D9BF0',
                      },
                    }}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      title="Original"
                      onClick={() => handleAspectChange("original")}
                      className={classNames(
                        "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:backdrop-blur-sm focus-visible:outline-none",
                        aspectPreset === "original"
                          ? "text-[#1D9BF0]"
                          : matchesPreset("original")
                            ? "text-[#1D9BF0]/70"
                            : "text-[#71767B] hover:text-white",
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                      >
                        <path d="M3 7.5C3 6.119 4.119 5 5.5 5h13C19.881 5 21 6.119 21 7.5v9c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 19 3 17.881 3 16.5v-9zM5.5 7c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-9c0-.276-.224-.5-.5-.5h-13z" />
                      </svg>
                      {matchesPreset("original") && aspectPreset !== "original" && (
                        <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#1D9BF0]" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Wide"
                      onClick={() => handleAspectChange("wide")}
                      className={classNames(
                        "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:backdrop-blur-sm focus-visible:outline-none",
                        aspectPreset === "wide"
                          ? "text-[#1D9BF0]"
                          : matchesPreset("wide")
                            ? "text-[#1D9BF0]/70"
                            : "text-[#71767B] hover:text-white",
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                      >
                        <path d="M3 9.5C3 8.119 4.119 7 5.5 7h13C19.881 7 21 8.119 21 9.5v5c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 17 3 15.881 3 14.5v-5zM5.5 9c-.276 0-.5.224-.5.5v5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-5c0-.276-.224-.5-.5-.5h-13z" />
                      </svg>
                      {matchesPreset("wide") && aspectPreset !== "wide" && (
                        <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#1D9BF0]" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Square"
                      onClick={() => handleAspectChange("square")}
                      className={classNames(
                        "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:backdrop-blur-sm focus-visible:outline-none",
                        aspectPreset === "square"
                          ? "text-[#1D9BF0]"
                          : matchesPreset("square")
                            ? "text-[#1D9BF0]/70"
                            : "text-[#71767B] hover:text-white",
                      )}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="currentColor"
                      >
                        <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v13c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13z" />
                      </svg>
                      {matchesPreset("square") && aspectPreset !== "square" && (
                        <div className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#1D9BF0]" />
                      )}
                    </button>
                  </div>

                  <div className="h-6 w-px bg-[#2F3336]" />

                  <div className="flex flex-1 items-center gap-3 rounded-full bg-black/40 px-3 py-2 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setZoom(Math.max(1, zoom * 0.9))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:outline-none"
                      aria-label="Zoom out"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
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
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                          e.preventDefault();
                          setZoom(Math.min(3, zoom + 0.1));
                        } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                          e.preventDefault();
                          setZoom(Math.max(1, zoom - 0.1));
                        }
                      }}
                      className="h-1 flex-1 cursor-pointer accent-[#1D9BF0]"
                      aria-label="Zoom level"
                      aria-valuemin={1}
                      aria-valuemax={3}
                      aria-valuenow={zoom}
                      aria-valuetext={`${Math.round(zoom * 100)}%`}
                    />

                    <button
                      type="button"
                      onClick={() => setZoom(Math.min(3, zoom * 1.1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:outline-none"
                      aria-label="Zoom in"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="currentColor"
                      >
                        <path d="M11 4c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.93 0 3.68-.78 4.95-2.05C17.21 14.68 18 12.93 18 11c0-3.87-3.14-7-7-7zm-9 7c0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.12-.74 4.08-1.97 5.62l3.68 3.67-1.42 1.42-3.67-3.68C15.08 19.26 13.12 20 11 20c-4.97 0-9-4.03-9-9zm8-1V7.5h2V10h2.5v2H12v2.5h-2V12H7.5v-2H10z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === "alt" && (
          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-semibold text-[#E7E9EA]"
                htmlFor="alt-editor"
              >
                Description (ALT text)
              </label>
              <button
                type="button"
                className="text-xs font-semibold text-[#A06AFF] underline-offset-4 hover:underline"
                onClick={() => setShowAltHelp(!showAltHelp)}
              >
                What is alt text?
              </button>
            </div>

            {showAltHelp && (
              <div className="rounded-2xl border border-[#181B22] bg-white/5 p-4 text-xs text-[#E7E9EA]">
                Describe who or what is important in the image, the setting, and
                any visible text.
              </div>
            )}

            <textarea
              id="alt-editor"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              maxLength={ALT_LIMIT}
              placeholder="Describe this image for people who can't see it"
              className="h-32 w-full resize-none rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 text-sm text-[#E7E9EA] placeholder:text-[#808283] outline-none backdrop-blur-[50px] transition-colors focus:border-[#A06AFF]"
            />

            <div
              className={classNames(
                "text-xs",
                altChars >= ALT_LIMIT ? "text-[#EF454A]" : "text-[#808283]",
              )}
            >
              {altChars} / {ALT_LIMIT}
            </div>
          </div>
        )}

        {activeTab === "warning" && (
          <div className="space-y-4 p-6">
            <p className="text-sm text-[#E7E9EA]">
              Helps people avoid content they don't want to see. Select all that
              apply.
            </p>

            <div className="space-y-3">
              {WARNING_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start gap-3 rounded-2xl border border-[#181B22] bg-white/5 p-4 hover:bg-white/10"
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-[#181B22] bg-[#0C1014] text-[#A06AFF] focus:ring-[#A06AFF]"
                    checked={warnings.includes(option.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWarnings([...warnings, option.id]);
                      } else {
                        setWarnings(warnings.filter((id) => id !== option.id));
                      }
                    }}
                  />
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-[#808283]">
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#181B22] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-[#181B22] bg-transparent px-5 py-2 text-sm font-semibold text-[#E7E9EA] transition-all hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={classNames(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all",
              hasChanges
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                : "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
            )}
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
