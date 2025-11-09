/**
 * File Attachments Hook
 * Безопасная работа с медиа и документами: валидация, лимиты, ревокация URL
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type MediaItem = {
  id: string;
  url: string; // objectURL
  type: 'image' | 'video';
  file: File;
  alt?: string;
};

export type DocItem = {
  id: string;
  name: string;
  size: number;
  type?: string;
  file: File;
};

const MAX_ATTACH = 4;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
const DOC_EXT = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'zip', 'rar'];
const MAX_SIZE_MB = 50; // максимальный размер файла

function extOf(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

/**
 * Хук для управления вложениями (медиа + документы)
 * Автоматическая валидация, лимиты, ревокация ObjectURL
 * 
 * @example
 * ```tsx
 * const { media, docs, errors, canAddMoreMedia, addFiles, removeMedia, removeDoc } = useFileAttachments();
 * 
 * // В input
 * <input type="file" onChange={(e) => addFiles(e.target.files)} />
 * 
 * // Отображение
 * <MediaGrid items={media} onRemove={removeMedia} />
 * <DocumentPreview docs={docs} onRemove={removeDoc} />
 * ```
 */
export function useFileAttachments() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const urlsToRevoke = useRef<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const left = MAX_ATTACH - media.length;
  const canAddMoreMedia = left > 0;

  const addFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files) return;
      
      const nextErrors: string[] = [];
      const nextMedia: MediaItem[] = [];
      const nextDocs: DocItem[] = [];

      const arr = Array.from(files);
      for (const f of arr) {
        const sizeMB = f.size / 1024 / 1024;
        if (sizeMB > MAX_SIZE_MB) {
          nextErrors.push(`"${f.name}" exceeds ${MAX_SIZE_MB}MB`);
          continue;
        }

        const mime = f.type;
        const ext = extOf(f.name);

        if (IMAGE_TYPES.includes(mime) || VIDEO_TYPES.includes(mime)) {
          if (!canAddMoreMedia) {
            nextErrors.push(`Media limit is ${MAX_ATTACH}`);
            continue;
          }
          const type: 'image' | 'video' = IMAGE_TYPES.includes(mime) ? 'image' : 'video';
          const url = URL.createObjectURL(f);
          urlsToRevoke.current.push(url);
          nextMedia.push({
            id: crypto.randomUUID(),
            url,
            type,
            file: f,
          });
        } else if (DOC_EXT.includes(ext)) {
          nextDocs.push({
            id: crypto.randomUUID(),
            name: f.name,
            size: f.size,
            type: mime || undefined,
            file: f,
          });
        } else {
          nextErrors.push(`Unsupported file: ${f.name}`);
        }
      }

      if (nextMedia.length) setMedia((prev) => [...prev, ...nextMedia].slice(0, MAX_ATTACH));
      if (nextDocs.length) setDocs((prev) => [...prev, ...nextDocs]);
      if (nextErrors.length) setErrors((prev) => [...prev, ...nextErrors]);
    },
    [canAddMoreMedia]
  );

  const removeMedia = useCallback((id: string) => {
    setMedia((prev) => {
      const it = prev.find((m) => m.id === id);
      if (it?.url) {
        try {
          URL.revokeObjectURL(it.url);
        } catch {}
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Ревокация всех URL при размонтировании
  useEffect(() => {
    return () => {
      for (const u of urlsToRevoke.current) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      }
      urlsToRevoke.current = [];
    };
  }, []);

  return {
    media,
    docs,
    errors,
    canAddMoreMedia,
    addFiles,
    removeMedia,
    removeDoc,
    resetErrors: () => setErrors([]),
  };
}
