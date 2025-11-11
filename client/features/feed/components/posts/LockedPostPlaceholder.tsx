import React from "react";
import { Crown, Users, Sparkles, Eye } from "lucide-react";
import type { AccessLevel } from "../../types";
import { normalizeAccessLevel } from "@/lib/access-level-utils";

interface LockedPostPlaceholderProps {
  accessLevel: AccessLevel;
  postId?: string;
  authorId?: string;
  postPrice?: number;
  subscriptionPrice?: number;
  authorName: string;
  previewImageUrl?: string;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isFollower?: boolean;
  isOwnPost?: boolean;
  isAuthorPreviewMode?: boolean;
  onToggleAuthorPreview?: () => void;
  onUnlock?: () => void;
  onSubscribe?: () => void;
  onFollow?: () => void;
  priceCents?: number;
  onGetAccess?: (action?: 'purchase' | 'subscribe' | 'follow' | 'upgrade') => void;
}

export default function LockedPostPlaceholder({
  accessLevel,
  postId,
  authorId,
  postPrice = 9,
  subscriptionPrice = 29,
  authorName,
  previewImageUrl,
  isPurchased = false,
  isSubscriber = false,
  isFollower = false,
  isOwnPost = false,
  isAuthorPreviewMode = false,
  onToggleAuthorPreview,
  onUnlock,
  onSubscribe,
  onFollow,
  priceCents,
  onGetAccess,
}: LockedPostPlaceholderProps) {
  // Normalize accessLevel for comparison
  const normalizedAccessLevel = normalizeAccessLevel(accessLevel);

  // Don't show placeholder if content is already accessible
  // But show it for author with preview option
  if (isPurchased || isSubscriber || normalizedAccessLevel === "public" || (normalizedAccessLevel === "followers" && isFollower)) {
    return null;
  }

  // Use priceCents if provided, otherwise use postPrice * 100
  const actualPriceCents = priceCents || (postPrice * 100);
  const displayPrice = actualPriceCents / 100;

  // Background image URL - use custom locked post background
  const backgroundImageUrl = previewImageUrl || '/locked-post-bg.png';

  // Prepare text and actions based on access level
  let message: string;
  let buttonLabel: string;
  let buttonAction: () => void;
  let primaryAction: 'purchase' | 'subscribe' | 'follow' | 'upgrade' = 'purchase';
  
  // Special handling for author's own post
  if (isOwnPost) {
    if (isAuthorPreviewMode) {
      message = `Вы сейчас видите пост как обычный пользователь. Нажмите кнопку, чтобы увидеть полный контент.`;
      buttonLabel = 'Показать полный контент';
      buttonAction = () => onToggleAuthorPreview?.();
    } else {
      message = `Предпросмотр для автора: нажмите "Скрыть контент", чтобы увидеть как видят пост другие пользователи.`;
      buttonLabel = 'Скрыть контент (предпросмотр)';
      buttonAction = () => onToggleAuthorPreview?.();
    }
  } else {
    switch (normalizedAccessLevel) {
    case 'subscribers':
      message = `Этот пост доступен только для подписчиков. Оформите подписку на ${authorName} за $${subscriptionPrice}/мес, чтобы читать полный текст.`;
      buttonLabel = 'Подписаться';
      buttonAction = () => onGetAccess ? onGetAccess('subscribe') : onSubscribe?.();
      primaryAction = 'subscribe';
      break;
    case 'premium':
      message = `Пост для премиум-подписчиков. Обновите свою подписку до премиум за $${subscriptionPrice + 20}/мес, чтобы получить доступ.`;
      buttonLabel = 'Получить Premium';
      buttonAction = () => onGetAccess ? onGetAccess('upgrade') : onSubscribe?.();
      primaryAction = 'upgrade';
      break;
    case 'paid':
      message = `Это платный пост. Приобретите разовый доступ за $${displayPrice.toFixed(2)}, чтобы прочитать его полностью.`;
      buttonLabel = `Купить за $${displayPrice.toFixed(2)}`;
      buttonAction = () => onGetAccess ? onGetAccess('purchase') : onUnlock?.();
      primaryAction = 'purchase';
      break;
    case 'followers':
      message = `Контент только для подписчиков. Подпишитесь на ${authorName}, чтобы получить доступ к эксклюзивному контенту.`;
      buttonLabel = 'Подписаться';
      buttonAction = () => onGetAccess ? onGetAccess('follow') : onFollow?.();
      primaryAction = 'follow';
      break;
      default:
        message = 'Контент недоступен.';
        buttonLabel = 'Получить доступ';
        buttonAction = () => onGetAccess ? onGetAccess() : onUnlock?.();
    }
  }

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden text-center min-h-[280px] sm:min-h-[320px] md:min-h-[360px]">
      {/* Background image with blur effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 opacity-30" 
        style={{ backgroundImage: `url(${backgroundImageUrl})` }} 
        aria-hidden="true"
      />
      
      {/* Dark gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black/90" />

      {/* Glass morphism effect overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.02]" />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[280px] sm:min-h-[320px] md:min-h-[360px] p-6 sm:p-8">
        {/* Animated lock icon based on access level */}
        <div className="mb-4 sm:mb-6 lock-icon-container">
          {normalizedAccessLevel === 'premium' ? (
            <Crown className="h-12 w-12 sm:h-14 sm:w-14 text-[#FFD700]" />
          ) : normalizedAccessLevel === 'followers' ? (
            <Users className="h-12 w-12 sm:h-14 sm:w-14 text-[#1D9BF0]" />
          ) : (
            /* Анимированный замок */
            <svg
              className="lock-icon w-12 h-12 sm:h-14 sm:w-14 transition-all duration-500"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Замочная скважина (вертикальная линия) */}
              <path
                className="lock-part transition-all duration-500"
                d="M20.5 28.0003V24.667"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              
              {/* Тело замка (основной корпус) */}
              <path
                className="lock-part transition-all duration-500"
                d="M7.61298 31.9078C7.98778 34.6917 10.2935 36.8725 13.0994 37.0015C15.4604 37.11 17.8588 37.1667 20.5 37.1667C23.1411 37.1667 25.5395 37.11 27.9005 37.0015C30.7065 36.8725 33.0121 34.6917 33.387 31.9078C33.6315 30.0912 33.8333 28.2293 33.8333 26.3333C33.8333 24.4373 33.6315 22.5755 33.387 20.7588C33.0121 17.975 30.7065 15.7941 27.9005 15.6651C25.5395 15.5566 23.1411 15.5 20.5 15.5C17.8588 15.5 15.4604 15.5566 13.0994 15.6651C10.2935 15.7941 7.98778 17.975 7.61298 20.7588C7.36838 22.5755 7.16663 24.4373 7.16663 26.3333C7.16663 28.2293 7.36838 30.0912 7.61298 31.9078Z"
                stroke="#B0B0B0"
                strokeWidth="1.5"
              />
              
              {/* Дужка замка (верхняя U-образная часть) - АНИМИРОВАННАЯ */}
              <path
                className="lock-shackle transition-all duration-500 origin-bottom"
                d="M13 15.4997V11.333C13 7.19087 16.3579 3.83301 20.5 3.83301C24.6422 3.83301 28 7.19087 28 11.333V15.4997"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Title and message */}
        <div className="max-w-md mx-auto text-center mb-6 sm:mb-8">
          <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            {isOwnPost ? 'Предпросмотр для автора' :
             normalizedAccessLevel === 'premium' ? 'Премиум контент' : 
             normalizedAccessLevel === 'followers' ? 'Только для подписчиков' :
             normalizedAccessLevel === 'subscribers' ? 'Контент по подписке' :
             'Платный контент'}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* Primary action button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              buttonAction();
            }}
            className={`action-button relative group px-4 sm:px-5 py-1.5 sm:py-2 text-white text-sm font-semibold rounded-full transition-all duration-300 ${
              isOwnPost 
                ? (isAuthorPreviewMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 cursor-pointer' 
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-[0_0_30px_rgba(160,106,255,0.5)] hover:scale-105 cursor-pointer')
                : 'bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:shadow-[0_0_30px_rgba(160,106,255,0.5)] hover:scale-105'
            }`}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-1.5">
              {isOwnPost ? <Eye className="h-3.5 w-3.5" /> :
               normalizedAccessLevel === 'premium' ? <Crown className="h-3.5 w-3.5" /> :
               normalizedAccessLevel === 'followers' ? <Users className="h-3.5 w-3.5" /> :
               normalizedAccessLevel === 'paid' ? <Sparkles className="h-3.5 w-3.5" /> : null}
              {buttonLabel}
            </span>
          </button>

          {/* Secondary action for paid posts - subscribe option (not shown for author) */}
          {normalizedAccessLevel === 'paid' && !isOwnPost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onGetAccess ? onGetAccess('subscribe') : onSubscribe?.();
              }}
              className="action-button px-4 sm:px-5 py-1.5 sm:py-2 border border-[#A06AFF]/50 text-[#A06AFF] text-sm font-medium rounded-full hover:bg-[#A06AFF]/10 hover:border-[#A06AFF] transition-all duration-300"
            >
              Или подписка ${subscriptionPrice}/мес
            </button>
          )}
        </div>

        {/* Additional benefits text (not shown for author) */}
        {(normalizedAccessLevel === 'paid' || normalizedAccessLevel === 'subscribers') && !isOwnPost && (
          <p className="mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm max-w-sm mx-auto text-center">
            {normalizedAccessLevel === 'paid'
              ? `Подписка дает доступ ко всем платным постам ${authorName}`
              : 'Получите доступ к эксклюзивному контенту и новым публикациям'}
          </p>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#A06AFF]/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#482090]/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
}
