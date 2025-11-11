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
/**
 * Маппинг значений accessLevel: frontend → backend
 * Frontend и Backend используют одинаковые значения после миграции 028
 */
function mapAccessLevel(clientValue: string): string {
  const mapping: Record<string, string> = {
    'free': 'free',                         // Бэкенд принимает 'free'
    'paid': 'pay-per-post',                 // UI использует 'paid', бэкенд ожидает 'pay-per-post'
    'pay-per-post': 'pay-per-post',         // Бэкенд принимает 'pay-per-post'
    'subscribers-only': 'subscribers-only',
    'followers-only': 'followers-only',
    'premium': 'premium'
  };
  return mapping[clientValue] || clientValue;
}

export function buildPostPayload(data: {
  text: string;
  previewText?: string;
  mediaIds: string[];
  codeBlocks: Array<{ code: string; language: string }>;
  replySetting: "everyone" | "following" | "verified" | "mentioned";
  sentiment?: "bullish" | "bearish" | "neutral";
  accessType: "free" | "paid" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium";
  postPrice?: number;
  metadata?: {
    market?: string;
    category?: string;
    symbol?: string;
    timeframe?: string;
    risk?: string;
  };
}): any {
  console.log('[buildPostPayload] ВХОД - Получили данные:', {
    accessType: data.accessType,
    postPrice: data.postPrice,
    replySetting: data.replySetting,
    text: data.text.substring(0, 50) + (data.text.length > 50 ? '...' : ''),
  });

  // Формируем базовый payload для бэкенда (используем camelCase!)
  const payload: any = {
    content: data.text.trim(),
    accessLevel: mapAccessLevel(data.accessType),  // ✅ camelCase + маппинг значений
    replyPolicy: data.replySetting,  // ✅ camelCase
  };

  // Добавляем previewText для платных постов
  if (data.previewText && data.previewText.trim()) {
    payload.previewText = data.previewText.trim();
    console.log('[buildPostPayload] Добавили previewText:', payload.previewText.substring(0, 50));
  }

  // Добавляем медиа если есть
  if (data.mediaIds.length > 0) {
    payload.mediaIds = data.mediaIds;  // ✅ camelCase
  }

  // Добавляем цену для платных постов (в центах)
  console.log('[buildPostPayload] Проверка цены - accessType:', data.accessType, 'postPrice:', data.postPrice);
  
  // Добавляем цену для ВСЕХ платных типов (paid, pay-per-post, premium)
  const paidAccessTypes = ["paid", "pay-per-post", "premium"];
  if (paidAccessTypes.includes(data.accessType) && data.postPrice) {
    payload.priceCents = Math.round(data.postPrice * 100);  // ✅ camelCase
    console.log('[buildPostPayload] Добавили priceCents для', data.accessType, ':', payload.priceCents);
  } else if (paidAccessTypes.includes(data.accessType) && !data.postPrice) {
    console.log('[buildPostPayload] ВНИМАНИЕ: платный тип без цены - accessType:', data.accessType);
  } else {
    console.log('[buildPostPayload] Не добавляем цену - бесплатный тип или подписка:', data.accessType);
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

  console.log('[buildPostPayload] ВЫХОД - Итоговый payload:', JSON.stringify(payload, null, 2));
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
