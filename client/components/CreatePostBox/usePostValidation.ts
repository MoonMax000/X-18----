/**
 * Post Validation Hook
 * Централизованная валидация для композиторов
 */

import { useMemo } from 'react';
import { CHAR_LIMIT, countGraphemes } from '@/utils/composerText';

export type AccessType = 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium';
export type ReplyPolicy = 'everyone' | 'following' | 'verified' | 'mentioned';

export type Meta = {
  market?: string;
  category?: string;
  symbol?: string;
  timeframe?: string;
  risk?: string;
};

/**
 * Валидация метаданных по правилам категорий
 */
function validateMetadata(meta: Meta): Record<string, string> {
  const errs: Record<string, string> = {};
  
  // Market и Category всегда обязательны
  if (!meta.market) errs.market = 'Select Market';
  if (!meta.category) errs.category = 'Select Category';

  // Правила по категориям
  if (meta.category === 'Signal') {
    if (!meta.symbol) errs.symbol = 'Symbol required for Signal';
    if (!meta.timeframe) errs.timeframe = 'Timeframe required for Signal';
    if (!meta.risk) errs.risk = 'Risk required for Signal';
  }
  
  // Для Education и News Symbol опционален, но Market обязателен
  
  return errs;
}

export interface PostValidationResult {
  violations: Record<string, string | null>;
  canPost: boolean;
  charCount: number;
  remaining: number;
  charRatio: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
}

export interface UsePostValidationParams {
  text: string;
  mediaCount: number;
  accessType: AccessType;
  price?: number | null;
  meta: Meta;
}

/**
 * Хук для валидации поста перед публикацией
 * Проверяет текст, медиа, метаданные, цену для платных постов
 */
export function usePostValidation({
  text,
  mediaCount,
  accessType,
  price,
  meta,
}: UsePostValidationParams): PostValidationResult {
  return useMemo(() => {
    const charCount = countGraphemes(text);
    const remaining = CHAR_LIMIT - charCount;
    const metaErrors = validateMetadata(meta);

    // Проверка цены для платных постов
    const priceErr =
      accessType === 'pay-per-post' && (price == null || Number.isNaN(price) || price < 0);

    const violations: Record<string, string | null> = {
      text: charCount === 0 
        ? 'Text is required' 
        : charCount > CHAR_LIMIT 
          ? `Limit ${CHAR_LIMIT}` 
          : null,
      media: mediaCount > 4 ? 'Max 4 attachments' : null,
      price: priceErr ? 'Invalid price' : null,
      ...metaErrors,
    };

    const canPost = Object.values(violations).every((v) => !v);
    const charRatio = Math.min(1, Math.max(0, charCount / CHAR_LIMIT));
    const isNearLimit = remaining <= 20 && remaining >= 0;
    const isOverLimit = remaining < 0;

    return {
      violations,
      canPost,
      charCount,
      remaining,
      charRatio,
      isNearLimit,
      isOverLimit,
    };
  }, [text, mediaCount, accessType, price, meta]);
}
