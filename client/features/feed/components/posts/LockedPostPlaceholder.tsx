import React from "react";
import { Lock, Crown, DollarSign, Users, Sparkles } from "lucide-react";
import type { AccessLevel } from "../../types";

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
  onUnlock,
  onSubscribe,
  onFollow,
  priceCents,
  onGetAccess,
}: LockedPostPlaceholderProps) {
  // Don't show placeholder if content is already accessible
  if (isPurchased || isSubscriber || accessLevel === "public" || (accessLevel === "followers" && isFollower) || isOwnPost) {
    return null;
  }

  // Use priceCents if provided, otherwise use postPrice * 100
  const actualPriceCents = priceCents || (postPrice * 100);
  const displayPrice = actualPriceCents / 100;

  // Background image URL - use preview or generate gradient
  const backgroundImageUrl = previewImageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23A06AFF;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23482090;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)" /%3E%3C/svg%3E';

  // Prepare text and actions based on access level
  let message: string;
  let buttonLabel: string;
  let buttonAction: () => void;
  let primaryAction: 'purchase' | 'subscribe' | 'follow' | 'upgrade' = 'purchase';
  
  switch (accessLevel) {
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
        <div className="mb-4 sm:mb-6">
          {accessLevel === 'premium' ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 group-hover:scale-110 transition-transform duration-500">
                <Crown className="h-10 w-10 sm:h-12 sm:w-12 text-[#FFD700] animate-pulse" />
              </div>
            </div>
          ) : accessLevel === 'followers' ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-[#1D9BF0]/20 to-[#0EA5E9]/20 border border-[#1D9BF0]/30 group-hover:scale-110 transition-transform duration-500">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-[#1D9BF0] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative p-4 rounded-full bg-gradient-to-br from-[#A06AFF]/20 to-[#482090]/20 border border-[#A06AFF]/30 group-hover:scale-110 transition-transform duration-500">
                <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-[#A06AFF] animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Title and message */}
        <div className="max-w-md mx-auto text-center mb-6 sm:mb-8">
          <h3 className="text-white text-lg sm:text-xl font-bold mb-2 sm:mb-3">
            {accessLevel === 'premium' ? 'Премиум контент' : 
             accessLevel === 'followers' ? 'Только для подписчиков' :
             accessLevel === 'subscribers' ? 'Контент по подписке' :
             'Платный контент'}
          </h3>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* Primary action button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              buttonAction();
            }}
            className="relative group px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(160,106,255,0.5)] transition-all duration-300 hover:scale-105"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
              {accessLevel === 'premium' && <Crown className="h-4 w-4" />}
              {accessLevel === 'followers' && <Users className="h-4 w-4" />}
              {accessLevel === 'paid' && <Sparkles className="h-4 w-4" />}
              {buttonLabel}
            </span>
          </button>

          {/* Secondary action for paid posts - subscribe option */}
          {accessLevel === 'paid' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onGetAccess ? onGetAccess('subscribe') : onSubscribe?.();
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-[#A06AFF]/50 text-[#A06AFF] font-semibold rounded-full hover:bg-[#A06AFF]/10 hover:border-[#A06AFF] transition-all duration-300"
            >
              Или подпишитесь за ${subscriptionPrice}/мес
            </button>
          )}
        </div>

        {/* Additional benefits text */}
        {(accessLevel === 'paid' || accessLevel === 'subscribers') && (
          <p className="mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm max-w-sm mx-auto text-center">
            {accessLevel === 'paid' 
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
