import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CHAR_LIMIT,
  MAX_PHOTOS,
  MAX_THREAD_BLOCKS,
  ReplyPolicy,
  createDefaultTransform,
  createComposerBlock,
  ComposerBlockState,
  ComposerSentiment,
  MediaItem,
} from "./types";

interface UseAdvancedComposerOptions {
  charLimit?: number;
  maxBlocks?: number;
}

const DEFAULT_REPLY_POLICY: ReplyPolicy = "everyone";
const DEFAULT_SENTIMENT: ComposerSentiment = "bullish";

const cloneMedia = (media: MediaItem[]): MediaItem[] =>
  media.map((item) => ({ ...item }));

const cloneCodeBlocks = (
  codeBlocks: ComposerBlockState["codeBlocks"],
): ComposerBlockState["codeBlocks"] =>
  codeBlocks.map((block) => ({ ...block }));

export const useAdvancedComposer = (
  options: UseAdvancedComposerOptions = {},
) => {
  const charLimit = options.charLimit ?? CHAR_LIMIT;
  const maxBlocks = options.maxBlocks ?? MAX_THREAD_BLOCKS;

  const [blocks, setBlocks] = useState<ComposerBlockState[]>([
    createComposerBlock(),
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(
    blocks[0]?.id ?? null,
  );
  const [replySetting, setReplySetting] =
    useState<ReplyPolicy>(DEFAULT_REPLY_POLICY);
  const [sentiment, setSentiment] =
    useState<ComposerSentiment>(DEFAULT_SENTIMENT);

  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const cleanupObjectUrls = useCallback(() => {
    const map = objectUrlsRef.current;
    map.forEach((url) => URL.revokeObjectURL(url));
    map.clear();
  }, []);

  useEffect(() => () => cleanupObjectUrls(), [cleanupObjectUrls]);

  const registerObjectUrl = useCallback((media: MediaItem) => {
    if (!media.file) return;
    const map = objectUrlsRef.current;
    if (!map.has(media.id)) {
      map.set(media.id, media.url);
    }
  }, []);

  const revokeObjectUrl = useCallback((mediaId: string) => {
    const map = objectUrlsRef.current;
    const url = map.get(mediaId);
    if (url) {
      URL.revokeObjectURL(url);
      map.delete(mediaId);
    }
  }, []);

  const initialize = useCallback(
    (
      initialBlocks?: ComposerBlockState[],
      initialReplySetting?: ReplyPolicy,
      initialSentiment?: ComposerSentiment,
    ) => {
      cleanupObjectUrls();

      const nextBlocks =
        initialBlocks && initialBlocks.length > 0
          ? initialBlocks.map((block) =>
              createComposerBlock({
                id: block.id,
                text: block.text,
                media: cloneMedia(block.media ?? []),
                codeBlocks: cloneCodeBlocks(block.codeBlocks ?? []),
              }),
            )
          : [createComposerBlock()];

      setBlocks(nextBlocks);
      setActiveBlockId(nextBlocks[0]?.id ?? null);
      setReplySetting(initialReplySetting ?? DEFAULT_REPLY_POLICY);
      setSentiment(initialSentiment ?? DEFAULT_SENTIMENT);
    },
    [cleanupObjectUrls],
  );

  const reset = useCallback(() => {
    initialize();
  }, [initialize]);

  const ensureActiveBlock = useCallback(() => {
    if (activeBlockId && blocks.some((block) => block.id === activeBlockId)) {
      return activeBlockId;
    }
    const fallbackId = blocks[0]?.id ?? null;
    if (fallbackId) {
      setActiveBlockId(fallbackId);
    }
    return fallbackId;
  }, [activeBlockId, blocks]);

  const updateBlockText = useCallback(
    (blockId: string, text: string) => {
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;
          const nextText =
            text.length > charLimit ? text.slice(0, charLimit) : text;
          return { ...block, text: nextText };
        }),
      );
    },
    [charLimit],
  );

  const addMedia = useCallback(
    (blockId: string, files: FileList | null) => {
      if (!files || files.length === 0) return;

      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;

          const availableSlots = Math.max(0, MAX_PHOTOS - block.media.length);
          if (availableSlots <= 0) {
            return block;
          }

          const selectedFiles = Array.from(files).slice(0, availableSlots);
          if (selectedFiles.length === 0) {
            return block;
          }

          const additions = selectedFiles.map<MediaItem>((file) => {
            const lowerType = file.type.toLowerCase();
            const isVideo = lowerType.startsWith("video/");
            const isGif = !isVideo && lowerType.includes("gif");

            const media: MediaItem = {
              id: `${Date.now()}-${Math.random()}`,
              url: URL.createObjectURL(file),
              type: isVideo ? "video" : isGif ? "gif" : "image",
              file,
              transform: createDefaultTransform(),
              alt: undefined,
              sensitiveTags: [],
            };

            registerObjectUrl(media);
            return media;
          });

          return { ...block, media: [...block.media, ...additions] };
        }),
      );
    },
    [registerObjectUrl],
  );

  const removeMedia = useCallback(
    (blockId: string, mediaId: string) => {
      revokeObjectUrl(mediaId);
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? {
                ...block,
                media: block.media.filter((item) => item.id !== mediaId),
              }
            : block,
        ),
      );
    },
    [revokeObjectUrl],
  );

  const replaceMedia = useCallback(
    (blockId: string, media: MediaItem) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? {
                ...block,
                media: block.media.map((item) =>
                  item.id === media.id ? { ...media } : item,
                ),
              }
            : block,
        ),
      );
    },
    [],
  );

  const reorderMedia = useCallback(
    (blockId: string, fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;

          const media = [...block.media];
          if (
            fromIndex < 0 ||
            fromIndex >= media.length ||
            toIndex < 0 ||
            toIndex >= media.length
          ) {
            return block;
          }

          const [moved] = media.splice(fromIndex, 1);
          media.splice(toIndex, 0, moved);
          return { ...block, media };
        }),
      );
    },
    [],
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      let nextActiveId: string | null | undefined = undefined;

      setBlocks((prev) => {
        if (prev.length <= 1) {
          nextActiveId = prev[0]?.id ?? null;
          return prev;
        }

        const target = prev.find((block) => block.id === blockId);
        target?.media.forEach((item) => revokeObjectUrl(item.id));

        const filtered = prev.filter((block) => block.id !== blockId);
        if (filtered.length === 0) {
          nextActiveId = null;
          return [createComposerBlock()];
        }

        if (activeBlockId && activeBlockId !== blockId) {
          nextActiveId = activeBlockId;
        } else {
          const removedIndex = prev.findIndex((block) => block.id === blockId);
          const fallbackIndex = Math.max(0, removedIndex - 1);
          nextActiveId = filtered[fallbackIndex]?.id ?? filtered[0].id;
        }

        return filtered;
      });

      if (nextActiveId !== undefined) {
        setActiveBlockId(nextActiveId);
      }
    },
    [activeBlockId, revokeObjectUrl],
  );

  const addBlock = useCallback(() => {
    let createdId: string | null = null;
    setBlocks((prev) => {
      if (prev.length >= maxBlocks) {
        return prev;
      }
      const newBlock = createComposerBlock();
      createdId = newBlock.id;
      return [...prev, newBlock];
    });

    if (createdId) {
      setActiveBlockId(createdId);
    }
  }, [maxBlocks]);

  const insertEmoji = useCallback(
    (blockId: string, emoji: string) => {
      let inserted = false;
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;
          if (block.text.length + emoji.length > charLimit) {
            return block;
          }
          inserted = true;
          return { ...block, text: block.text + emoji };
        }),
      );
      return inserted;
    },
    [charLimit],
  );

  const insertCodeBlock = useCallback(
    (blockId: string, code: string, language: string) => {
      let inserted = false;
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id !== blockId) return block;
          inserted = true;
          return {
            ...block,
            codeBlocks: [
              ...block.codeBlocks,
              { id: `code-${Date.now()}`, code, language },
            ],
          };
        }),
      );
      return inserted;
    },
    [],
  );

  const removeCodeBlock = useCallback(
    (blockId: string, codeBlockId: string) => {
      setBlocks((prev) =>
        prev.map((block) =>
          block.id === blockId
            ? {
                ...block,
                codeBlocks: block.codeBlocks.filter(
                  (codeBlock) => codeBlock.id !== codeBlockId,
                ),
              }
            : block,
        ),
      );
    },
    [],
  );

  const totalChars = useMemo(
    () => blocks.reduce((sum, block) => sum + block.text.length, 0),
    [blocks],
  );

  const averageLimit = useMemo(
    () => charLimit * Math.max(blocks.length, 1),
    [charLimit, blocks.length],
  );

  const charRatio = useMemo(() => {
    if (averageLimit === 0) return 0;
    return Math.min(totalChars / averageLimit, 1);
  }, [averageLimit, totalChars]);

  const remainingChars = useMemo(
    () => averageLimit - totalChars,
    [averageLimit, totalChars],
  );

  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;

  const canPost = useMemo(() => {
    const hasContent = blocks.some(
      (block) =>
        block.text.trim().length > 0 ||
        block.media.length > 0 ||
        block.codeBlocks.length > 0,
    );
    const withinLimit = blocks.every((block) => block.text.length <= charLimit);
    return hasContent && withinLimit;
  }, [blocks, charLimit]);

  const canAddBlock = blocks.length < maxBlocks;

  return {
    blocks,
    activeBlockId,
    setActiveBlockId,
    replySetting,
    setReplySetting,
    sentiment,
    setSentiment,
    charLimit,
    totalChars,
    charRatio,
    remainingChars,
    isNearLimit,
    isOverLimit,
    canPost,
    canAddBlock,
    initialize,
    reset,
    ensureActiveBlock,
    updateBlockText,
    addMedia,
    removeMedia,
    replaceMedia,
    reorderMedia,
    deleteBlock,
    addBlock,
    insertEmoji,
    insertCodeBlock,
    removeCodeBlock,
  } as const;
};

export type UseAdvancedComposerReturn = ReturnType<typeof useAdvancedComposer>;
