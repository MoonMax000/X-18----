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
 * 
 * Важно: пустая строка '' считается валидным выбором (выбрано "None")
 * Ошибка только если значение undefined/null (не инициализировано)
 */
function validateMetadata(meta: Meta): Record<string, string> {
  const errs: Record<string, string> = {};
  
  // MARKET и CATEGORY: ошибка только если undefined/null
  // Пустая строка '' = "None" выбрано = валидно
  if (meta.market === undefined || meta.market === null) {
    errs.market = 'Select Market';
  }
  if (meta.category === undefined || meta.category === null) {
    errs.category = 'Select Category';
  }

  // SYMBOL, TIMEFRAME, RISK полностью опциональны
  
  return errs;
}

export interface PostValidationResult {
  violations: string[];
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
    
    // Показываем metadata errors только когда есть текст
    const hasContent = charCount > 0 || mediaCount > 0;
    const metaErrors = hasContent ? validateMetadata(meta) : {};

    // Проверка цены для платных постов
    const priceErr =
      accessType === 'pay-per-post' && (price == null || Number.isNaN(price) || price < 0);

    const violationsMap: Record<string, string | null> = {
      text: charCount > CHAR_LIMIT ? `Limit ${CHAR_LIMIT}` : null,
      media: mediaCount > 4 ? 'Max 4 attachments' : null,
      price: priceErr ? 'Invalid price' : null,
      ...metaErrors,
    };

    // Преобразуем Record в массив, отфильтровывая null значения
    const violations = Object.values(violationsMap).filter((v): v is string => v !== null);
    
    const canPost = violations.length === 0;
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
