import type { MediaItem } from "@/components/CreatePostBox/types";

/**
 * Типы данных для создания поста
 */
export interface PostPayload {
  text: string;
  media_ids?: string[];
  code_blocks?: Array<{
    code: string;
    language: string;
  }>;
  reply_policy: "everyone" | "following" | "verified" | "mentioned";
  sentiment?: "bullish" | "bearish" | "neutral";
  access_level: "free" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium";
  price?: number; // В центах для pay-per-post
  metadata?: {
    market?: string;
    category?: string;
    symbol?: string;
    timeframe?: string;
    risk?: string;
  };
}

export interface MediaUploadPayload {
  file: File;
  alt?: string;
  type: "image" | "video" | "gif" | "document";
  // Для изображений/видео - передаем полный transform
  transform?: {
    scale: number;
    translateX: number;
    translateY: number;
    angle: number;
    aspectRatio: string;
    fitMode: string;
    flipH: boolean;
    flipV: boolean;
    straighten: number;
    cropRect?: { x: number; y: number; w: number; h: number };
  };
  // Для документов
  fileName?: string;
  fileExtension?: string;
}

/**
 * Преобразует данные композера в payload для API бэкенда
 * Маппинг: frontend PostPayload → backend CreatePostData
 */
export function buildPostPayload(data: {
  text: string;
  mediaIds: string[];
  codeBlocks: Array<{ code: string; language: string }>;
  replySetting: "everyone" | "following" | "verified" | "mentioned";
  sentiment?: "bullish" | "bearish" | "neutral";
  accessType: "free" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium";
  postPrice?: number;
  metadata?: {
    market?: string;
    category?: string;
    symbol?: string;
    timeframe?: string;
    risk?: string;
  };
}): any {
  // Формируем базовый payload для бэкенда
  const payload: any = {
    content: data.text.trim(),
    access_level: data.accessType,
    reply_policy: data.replySetting,
  };

  // Добавляем медиа если есть
  if (data.mediaIds.length > 0) {
    payload.media_ids = data.mediaIds;
  }

  // Добавляем цену для платных постов (в центах)
  if (data.accessType === "pay-per-post" && data.postPrice) {
    payload.price_cents = Math.round(data.postPrice * 100);
  }

  // Формируем метаданные для бэкенда
  const metadata: Record<string, any> = {};
  
  // Добавляем code blocks в метаданные если есть
  if (data.codeBlocks.length > 0) {
    metadata.code_blocks = data.codeBlocks.map(cb => ({
      code: cb.code,
      language: cb.language,
    }));
  }

  // Добавляем sentiment в метаданные если указан
  if (data.sentiment) {
    metadata.sentiment = data.sentiment;
  }

  // Добавляем trading метаданные если есть
  if (data.metadata) {
    const { market, category, symbol, timeframe, risk } = data.metadata;
    if (market) metadata.market = market;
    if (category) metadata.category = category;
    if (symbol) metadata.symbol = symbol;
    if (timeframe) metadata.timeframe = timeframe;
    if (risk) metadata.risk = risk;
  }

  // Добавляем метаданные в payload если что-то есть
  if (Object.keys(metadata).length > 0) {
    payload.metadata = metadata;
  }

  return payload;
}

/**
 * Преобразует MediaItem в payload для загрузки на бэкенд
 */
export function buildMediaUploadPayload(mediaItem: MediaItem): MediaUploadPayload {
  if (!mediaItem.file) {
    throw new Error("MediaItem must have a file to upload");
  }

  const payload: MediaUploadPayload = {
    file: mediaItem.file,
    type: mediaItem.type,
  };

  // Добавляем alt текст если есть
  if (mediaItem.alt) {
    payload.alt = mediaItem.alt;
  }

  // Для изображений/видео добавляем transform
  if (mediaItem.type !== "document" && mediaItem.transform) {
    payload.transform = {
      scale: mediaItem.transform.scale,
      translateX: mediaItem.transform.translateX,
      translateY: mediaItem.transform.translateY,
      angle: mediaItem.transform.angle,
      aspectRatio: mediaItem.transform.aspectRatio,
      fitMode: mediaItem.transform.fitMode,
      flipH: mediaItem.transform.flipH,
      flipV: mediaItem.transform.flipV,
      straighten: mediaItem.transform.straighten,
      cropRect: mediaItem.transform.cropRect,
    };
  }

  // Для документов добавляем информацию о файле
  if (mediaItem.type === "document") {
    if (mediaItem.fileName) payload.fileName = mediaItem.fileName;
    if (mediaItem.fileExtension) payload.fileExtension = mediaItem.fileExtension;
  }

  return payload;
}

/**
 * Валидирует payload перед отправкой
 */
export function validatePostPayload(payload: PostPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Проверяем текст
  if (!payload.text || payload.text.trim().length === 0) {
    errors.push("Post text cannot be empty");
  }

  // Проверяем цену для платных постов
  if (payload.access_level === "pay-per-post") {
    if (!payload.price || payload.price <= 0) {
      errors.push("Price must be greater than 0 for pay-per-post");
    }
  }

  // Проверяем метаданные для Signal категории
  if (payload.metadata?.category === "Signal") {
    if (!payload.metadata.symbol) {
      errors.push("Symbol is required for Signal posts");
    }
    if (!payload.metadata.timeframe) {
      errors.push("Timeframe is required for Signal posts");
    }
    if (!payload.metadata.risk) {
      errors.push("Risk level is required for Signal posts");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
