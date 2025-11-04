import { FC } from "react";
import { FileText, FileSpreadsheet, FileType, X } from "lucide-react";
import { MediaItem } from "./types";

interface DocumentPreviewProps {
  document: MediaItem;
  onRemove?: (documentId: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  isDragging?: boolean;
  draggedIndex?: number | null;
  index?: number;
  readOnly?: boolean;
  onDownload?: (e?: React.MouseEvent) => void;
}

// Функция для форматирования размера файла
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Функция для получения иконки в зависимости от расширения
const getDocumentIcon = (extension?: string) => {
  switch (extension) {
    case 'pdf':
      return (
        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <FileType className="w-5 h-5 text-red-400" />
        </div>
      );
    case 'doc':
    case 'docx':
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
      );
    case 'xls':
    case 'xlsx':
      return (
        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="w-5 h-5 text-green-400" />
        </div>
      );
    case 'ppt':
    case 'pptx':
      return (
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <FileType className="w-5 h-5 text-orange-400" />
        </div>
      );
    case 'txt':
      return (
        <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-gray-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-lg bg-[#A06AFF]/20 flex items-center justify-center flex-shrink-0">
          <FileType className="w-5 h-5 text-[#A06AFF]" />
        </div>
      );
  }
};

export const DocumentPreview: FC<DocumentPreviewProps> = ({
  document,
  onRemove,
  onReorder,
  isDragging = false,
  draggedIndex,
  index = 0,
  readOnly = false,
  onDownload,
}) => {
  const isInteractive = !readOnly && !onDownload;

  return (
    <div
      draggable={isInteractive}
      onDragStart={isInteractive && onReorder ? () => {} : undefined}
      onDragEnd={isInteractive && onReorder ? () => {} : undefined}
      onDragOver={isInteractive ? (event) => event.preventDefault() : undefined}
      onDrop={
        isInteractive && onReorder
          ? () => {
              if (draggedIndex !== null && draggedIndex !== index) {
                onReorder(draggedIndex, index);
              }
            }
          : undefined
      }
      onClick={(e) => {
        if (onDownload) {
          onDownload(e);
        }
      }}
      className={`
        group relative flex items-center gap-3 p-3 
        rounded-xl border backdrop-blur-[50px] 
        transition-all duration-200
        ${isInteractive ? "cursor-move" : onDownload ? "cursor-pointer" : "cursor-default"}
        ${
          isInteractive && isDragging && draggedIndex === index
            ? "opacity-50 scale-95 border-[#A06AFF]"
            : isInteractive && isDragging && draggedIndex !== null
              ? "border-[#A06AFF]/50 bg-black/50"
              : "border-[#181B22] bg-black/30"
        }
        hover:bg-black/40 hover:border-[#A06AFF]/30
      `}
    >
      {/* Иконка документа */}
      {getDocumentIcon(document.fileExtension)}

      {/* Информация о файле */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">
          {document.fileName || 'Document'}
        </p>
        <p className="text-[10px] text-[#808283]">
          {document.fileSize ? formatFileSize(document.fileSize) : 'Unknown size'}
          {onDownload && <span className="ml-1">• Нажмите для скачивания</span>}
        </p>
      </div>

      {/* Кнопка удаления */}
      {isInteractive && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(document.id);
          }}
          className={`
            absolute top-1 right-1 
            flex h-6 w-6 items-center justify-center 
            rounded-full bg-black/60 text-white/70 
            backdrop-blur-sm transition-all duration-200 
            opacity-0 group-hover:opacity-100
            hover:bg-red-500/20 hover:text-red-400
          `}
          title="Remove document"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Индикатор перетаскивания */}
      {isInteractive && (
        <div className={`
          absolute left-1 top-1/2 -translate-y-1/2
          opacity-0 group-hover:opacity-60 transition-opacity duration-200
        `}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#A06AFF]" fill="none">
            <path d="M19 10h-14v2h14v-2zm0-4h-14v2h14v-2zm0 8h-14v2h14v-2z" fill="currentColor" />
          </svg>
        </div>
      )}
    </div>
  );
};
