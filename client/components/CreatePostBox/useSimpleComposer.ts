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
  ReplyPolicy,
  createDefaultTransform,
  ComposerSentiment,
  MediaItem,
} from "./types";

interface UseSimpleComposerOptions {
  charLimit?: number;
}

const DEFAULT_REPLY_POLICY: ReplyPolicy = "everyone";
const DEFAULT_SENTIMENT: ComposerSentiment = "bullish";

const cloneMedia = (media: MediaItem[]): MediaItem[] =>
  media.map((item) => ({ ...item }));

/**
 * Simplified composer hook for single-block posts
 * Replaces useAdvancedComposer with single block support
 */
export const useSimpleComposer = (
  options: UseSimpleComposerOptions = {},
) => {
  const charLimit = options.charLimit ?? CHAR_LIMIT;

  const [text, setText] = useState<string>("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [codeBlocks, setCodeBlocks] = useState<Array<{ id: string; code: string; language: string }>>([]);
  const [replySetting, setReplySetting] = useState<ReplyPolicy>(DEFAULT_REPLY_POLICY);
  const [sentiment, setSentiment] = useState<ComposerSentiment>(DEFAULT_SENTIMENT);

  // Monetization settings
  const [accessType, setAccessType] = useState<"free" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium">("free");
  const [postPrice, setPostPrice] = useState<number>(5.0);

  // Post metadata for filtering and categorization
  const [postMarket, setPostMarket] = useState<string>('Crypto');
  const [postCategory, setPostCategory] = useState<string>('General');
  const [postSymbol, setPostSymbol] = useState<string>('');
  const [postTimeframe, setPostTimeframe] = useState<string>('');
  const [postRisk, setPostRisk] = useState<string>('');

  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const cleanupObjectUrls = useCallback(() => {
    const map = objectUrlsRef.current;
    map.forEach((url) => URL.revokeObjectURL(url));
    map.clear();
  }, []);

  useEffect(() => () => cleanupObjectUrls(), [cleanupObjectUrls]);

  const registerObjectUrl = useCallback((mediaItem: MediaItem) => {
    if (!mediaItem.file) return;
    const map = objectUrlsRef.current;
    if (!map.has(mediaItem.id)) {
      map.set(mediaItem.id, mediaItem.url);
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
      initialText?: string,
      initialMedia?: MediaItem[],
      initialCodeBlocks?: Array<{ id: string; code: string; language: string }>,
      initialReplySetting?: ReplyPolicy,
      initialSentiment?: ComposerSentiment,
      initialAccessType?: "free" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium",
      initialPostPrice?: number,
      initialMetadata?: {
        market?: string;
        category?: string;
        symbol?: string;
        timeframe?: string;
        risk?: string;
      }
    ) => {
      cleanupObjectUrls();
      
      setText(initialText || "");
      setMedia(initialMedia ? cloneMedia(initialMedia) : []);
      setCodeBlocks(initialCodeBlocks || []);
      setReplySetting(initialReplySetting ?? DEFAULT_REPLY_POLICY);
      setSentiment(initialSentiment ?? DEFAULT_SENTIMENT);
      setAccessType(initialAccessType ?? "free");
      setPostPrice(initialPostPrice ?? 5.0);
      
      // Initialize metadata
      setPostMarket(initialMetadata?.market ?? 'Crypto');
      setPostCategory(initialMetadata?.category ?? 'General');
      setPostSymbol(initialMetadata?.symbol ?? '');
      setPostTimeframe(initialMetadata?.timeframe ?? '');
      setPostRisk(initialMetadata?.risk ?? '');
    },
    [cleanupObjectUrls],
  );

  const reset = useCallback(() => {
    initialize();
  }, [initialize]);

  const updateText = useCallback(
    (newText: string) => {
      const nextText = newText.length > charLimit ? newText.slice(0, charLimit) : newText;
      setText(nextText);
    },
    [charLimit],
  );

  const addMedia = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const availableSlots = Math.max(0, MAX_PHOTOS - media.length);
      if (availableSlots <= 0) return;

      const selectedFiles = Array.from(files).slice(0, availableSlots);
      if (selectedFiles.length === 0) return;

      const additions = selectedFiles.map<MediaItem>((file) => {
        const lowerType = file.type.toLowerCase();
        const isVideo = lowerType.startsWith("video/");
        const isGif = !isVideo && lowerType.includes("gif");

        const mediaItem: MediaItem = {
          id: `${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(file),
          type: isVideo ? "video" : isGif ? "gif" : "image",
          file,
          transform: createDefaultTransform(),
          alt: undefined,
          sensitiveTags: [],
        };

        registerObjectUrl(mediaItem);
        return mediaItem;
      });

      setMedia((prev) => [...prev, ...additions]);
    },
    [media.length, registerObjectUrl],
  );

  const removeMedia = useCallback(
    (mediaId: string) => {
      revokeObjectUrl(mediaId);
      setMedia((prev) => prev.filter((item) => item.id !== mediaId));
    },
    [revokeObjectUrl],
  );

  const replaceMedia = useCallback(
    (mediaItem: MediaItem) => {
      setMedia((prev) =>
        prev.map((item) => (item.id === mediaItem.id ? mediaItem : item)),
      );
    },
    [],
  );

  const reorderMedia = useCallback((fromIndex: number, toIndex: number) => {
    setMedia((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, removed);
      return next;
    });
  }, []);

  const insertEmoji = useCallback(
    (emoji: string) => {
      if (text.length + emoji.length > charLimit) return false;
      setText((prev) => prev + emoji);
      return true;
    },
    [text.length, charLimit],
  );

  const insertCodeBlock = useCallback(
    (code: string, language: string) => {
      const id = `code-${Date.now()}`;
      setCodeBlocks((prev) => [...prev, { id, code, language }]);
      return true;
    },
    [],
  );

  const removeCodeBlock = useCallback((codeBlockId: string) => {
    setCodeBlocks((prev) => prev.filter((cb) => cb.id !== codeBlockId));
  }, []);

  // Character count calculations
  const charRatio = useMemo(() => Math.min(text.length / charLimit, 1), [text.length, charLimit]);
  const remainingChars = useMemo(() => charLimit - text.length, [charLimit, text.length]);
  const isNearLimit = useMemo(() => remainingChars < 20 && remainingChars >= 0, [remainingChars]);
  const isOverLimit = useMemo(() => remainingChars < 0, [remainingChars]);
  const canPost = useMemo(() => text.trim().length > 0 && !isOverLimit, [text, isOverLimit]);

  return {
    text,
    media,
    codeBlocks,
    replySetting,
    sentiment,
    accessType,
    postPrice,
    postMarket,
    postCategory,
    postSymbol,
    postTimeframe,
    postRisk,
    charRatio,
    remainingChars,
    isNearLimit,
    isOverLimit,
    canPost,
    updateText,
    addMedia,
    removeMedia,
    replaceMedia,
    reorderMedia,
    setReplySetting,
    setSentiment,
    setAccessType,
    setPostPrice,
    setPostMarket,
    setPostCategory,
    setPostSymbol,
    setPostTimeframe,
    setPostRisk,
    insertEmoji,
    insertCodeBlock,
    removeCodeBlock,
    initialize,
    reset,
  };
};
