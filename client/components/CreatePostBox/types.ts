export type TweetBlockPayload = {
  id: string;
  text: string;
  entities?: {
    mentions: { start: number; end: number; userId: string }[];
    hashtags: { start: number; end: number; tag: string }[];
    urls: { start: number; end: number; expandedUrl: string }[];
  };
  mediaIds?: string[];
  media?: {
    id: string;
    transform?: CropTransform;
    alt?: string;
    sensitiveTags?: string[];
  }[];
  codeBlocks?: { id: string; code: string; language: string }[];
  poll?: { options: string[]; durationHours: number };
};

export type ComposerSentiment = "bullish" | "bearish" | null;

export interface ComposerCodeBlock {
  id: string;
  code: string;
  language: string;
}

export interface ComposerBlockState {
  id: string;
  text: string;
  media: MediaItem[];
  codeBlocks: ComposerCodeBlock[];
}

const generateComposerBlockId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

export const createComposerBlock = (
  overrides: Partial<ComposerBlockState> = {},
): ComposerBlockState => {
  const id = overrides.id ?? generateComposerBlockId();
  return {
    id,
    text: overrides.text ?? "",
    media: overrides.media ? overrides.media.map((item) => ({ ...item })) : [],
    codeBlocks: overrides.codeBlocks
      ? overrides.codeBlocks.map((block) => ({ ...block }))
      : [],
  };
};

export type ReplyPolicy = "everyone" | "following" | "verified" | "mentioned";

export const REPLY_SUMMARY_TEXT: Record<ReplyPolicy, string> = {
  everyone: "Everyone can reply",
  following: "People you follow can reply",
  verified: "Only verified accounts can reply",
  mentioned: "Only accounts you mention can reply",
};

export type ComposerDraft = {
  id: string;
  blocks: TweetBlockPayload[];
  replyPolicy: ReplyPolicy;
  createdAt: string;
  updatedAt: string;
};

export type CropTransform = {
  scale: number;
  translateX: number;
  translateY: number;
  angle: number;
  aspectRatio:
    | "original"
    | "free"
    | "1:1"
    | "4:5"
    | "3:2"
    | "2:3"
    | "4:3"
    | "3:4"
    | "16:9"
    | "9:16";
  fitMode: "fit" | "fill";
  flipH: boolean;
  flipV: boolean;
  straighten: number;
  grid: "thirds" | "golden" | "center" | "off";
  // Crop export data (coordinates in original image pixels)
  cropRect?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

export type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video" | "gif";
  alt?: string;
  transform?: CropTransform;
  sensitiveTags?: string[];
  file?: File;
  // URL обрезанного превью (blob URL)
  croppedPreviewUrl?: string;
};

export const CHAR_LIMIT = 280;
export const MAX_PHOTOS = 4;
export const MAX_VIDEO = 1;
export const MAX_GIF = 1;
export const MAX_THREAD_BLOCKS = 25;
export const MAX_DRAFTS = 5;

export const createDefaultTransform = (): CropTransform => ({
  scale: 1,
  translateX: 0,
  translateY: 0,
  angle: 0,
  straighten: 0,
  aspectRatio: "original",
  fitMode: "fit",
  flipH: false,
  flipV: false,
  grid: "thirds",
});
