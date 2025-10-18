import { FC, useState } from "react";
import { MediaItem } from "./types";

interface MediaGridProps {
  media: MediaItem[];
  onRemove: (mediaId: string) => void;
  onEdit: (media: MediaItem) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  readOnly?: boolean;
}

export const MediaGrid: FC<MediaGridProps> = ({
  media,
  onRemove,
  onEdit,
  onReorder,
  readOnly = false,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const gridClass = media.length === 1 ? "grid-cols-1" : "grid-cols-2";
  const heightClass = media.length === 1 ? "max-h-[400px]" : "max-h-[280px]";
  const isInteractive = !readOnly;

  return (
    <div className={`mt-3 grid gap-3 ${gridClass}`}>
      {media.map((item, index) => (
        <div
          key={item.id}
          draggable={isInteractive}
          onDragStart={isInteractive ? () => setDraggedIndex(index) : undefined}
          onDragEnd={isInteractive ? () => setDraggedIndex(null) : undefined}
          onDragOver={
            isInteractive ? (event) => event.preventDefault() : undefined
          }
          onDrop={
            isInteractive
              ? () => {
                  if (draggedIndex !== null && draggedIndex !== index) {
                    onReorder(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }
              : undefined
          }
          className={`group relative overflow-hidden rounded-2xl border backdrop-blur-[50px] transition-all ${heightClass} ${
            isInteractive ? "cursor-move" : "cursor-default"
          } ${
            isInteractive && draggedIndex === index
              ? "opacity-50 scale-95 border-[#A06AFF]"
              : isInteractive && draggedIndex !== null
                ? "border-[#A06AFF]/50 bg-black"
                : "border-[#181B22] bg-black"
          }`}
        >
          {item.type === "video" ? (
            <video
              src={item.url}
              className="h-full w-full object-cover"
              style={{ aspectRatio: media.length === 1 ? "auto" : "16/9" }}
            />
          ) : (
            <img
              src={item.url}
              alt={item.alt || `Media ${index + 1}`}
              className="h-full w-full object-cover"
              style={{ aspectRatio: media.length === 1 ? "auto" : "16/9" }}
            />
          )}

          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30 pointer-events-none" />

          {item.sensitiveTags && item.sensitiveTags.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-center text-xs font-semibold uppercase tracking-wide text-[#E7E9EA] backdrop-blur-[6px]">
              <span>Sensitive content</span>
              <span className="text-[10px] text-[#A06AFF]">
                {item.sensitiveTags.join(" • ")}
              </span>
            </div>
          )}

          <div className={`absolute top-3 left-3 flex items-center gap-2 transition-opacity ${isInteractive ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
            <button
              aria-label="Drag and drop media"
              role="button"
              type="button"
              onClick={(e) => { e.stopPropagation(); }}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,0,0.72)] text-white/90 backdrop-blur-sm transition-colors duration-200 ${
                isInteractive
                  ? "hover:bg-[rgba(255,255,255,0.08)]"
                  : "opacity-60 cursor-default"
              }`}
            >
              <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none">
                <g>
                  <path d="M19.996 10h-16V8h16v2zm0 6h-16v-2h16v2z" fill="currentColor" />
                </g>
              </svg>
            </button>

            <button
              type="button"
              onClick={isInteractive ? () => onEdit(item) : undefined}
              disabled={!isInteractive}
              className={`flex h-9 items-center justify-center rounded-full px-3 bg-[rgba(0,0,0,0.72)] text-white/90 backdrop-blur-sm transition-colors duration-200 ${
                isInteractive
                  ? "hover:bg-[rgba(255,255,255,0.18)]"
                  : "opacity-60 cursor-default"
              }`}
              title="Edit"
            >
              <span className="text-xs font-semibold">Edit</span>
            </button>
          </div>

          <div className={`absolute top-3 right-3 flex gap-2 transition-opacity ${isInteractive ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}>
            <button
              type="button"
              onClick={isInteractive ? () => onRemove(item.id) : undefined}
              disabled={!isInteractive}
              className={`flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,0,0.72)] text-white/90 backdrop-blur-sm transition-colors duration-200 ${
                isInteractive
                  ? "hover:bg-[rgba(255,255,255,0.18)]"
                  : "opacity-60 cursor-default"
              }`}
              title="Remove"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2">
            {item.sensitiveTags && item.sensitiveTags.length > 0 && (
              <span className="rounded-full bg-[#A06AFF]/20 px-3 py-1 text-xs font-semibold text-[#A06AFF]">
                Warning
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
