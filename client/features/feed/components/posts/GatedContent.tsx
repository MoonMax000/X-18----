import React from "react";
import { Lock, Crown } from "lucide-react";
import type { AccessLevel } from "../../types";

interface GatedContentProps {
  accessLevel: AccessLevel;
  postPrice?: number;
  subscriptionPrice?: number;
  authorName: string;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  onUnlock?: () => void;
  onSubscribe?: () => void;
}

export default function GatedContent({
  accessLevel,
  postPrice = 9,
  subscriptionPrice = 29,
  authorName,
  isPurchased = false,
  isSubscriber = false,
  onUnlock,
  onSubscribe,
}: GatedContentProps) {
  if (isPurchased || isSubscriber || accessLevel === "public") {
    return null;
  }

  const getContentMessage = () => {
    switch (accessLevel) {
      case "paid":
        return {
          title: "Платный контент",
          description: `Разблокируйте этот пост за $${postPrice} или подпишитесь на ${authorName} и получайте доступ ко всем платным постам`,
        };
      case "subscribers":
        return {
          title: "Только для подписчиков",
          description: `Подпишитесь на ${authorName} за $${subscriptionPrice}/мес, чтобы получить доступ к этому контенту`,
        };
      case "premium":
        return {
          title: "Премиум контент",
          description: `Оформите премиум подписку за $${subscriptionPrice + 20}/мес для доступа к эксклюзивному контенту`,
        };
      default:
        return {
          title: "Ограниченный доступ",
          description: "Этот контент недоступен",
        };
    }
  };

  const { title, description } = getContentMessage();

  return (
    <section className="relative rounded-xl overflow-hidden min-h-[280px] sm:min-h-[320px] md:min-h-[360px] flex items-center justify-center border border-[#181B22]/50">
      {/* Background logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72" viewBox="0 0 218 267" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 133.143L0.010125 133.958C24.1612 128.685 48.4409 123.177 72.7655 117.659L72.8103 248.557L154.645 266.444C154.645 237.7 154.392 156.724 154.659 127.987L97.3967 115.471L89.7755 113.806C132.594 104.118 175.489 94.5576 218 86.3261L217.986 0C146.091 15.7098 72.1247 34.2794 0 47.6345L0 133.143Z"
            fill="url(#paint0_linear_gated)"
          />
          <defs>
            <linearGradient id="paint0_linear_gated" x1="52.9429" y1="286.428" x2="157.977" y2="21.2498" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A06AFF" />
              <stop offset="1" stopColor="#482090" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-[12px]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8 py-12 sm:py-16 px-4 sm:px-6 max-w-lg">
        {/* Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-[#A06AFF]/20 to-[#482090]/20 border border-[#A06AFF]/30">
            {accessLevel === "premium" ? (
              <Crown className="w-10 h-10 text-[#FFD700]" />
            ) : (
              <Lock className="w-10 h-10 text-[#A06AFF]" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-white text-lg sm:text-xl font-bold">{title}</h3>
            <p className="text-[#B0B0B0] text-sm sm:text-base leading-relaxed max-w-md">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Show unlock button only for paid posts */}
          {accessLevel === "paid" && (
            <button
              onClick={onUnlock}
              className="group relative flex items-center justify-center px-8 sm:px-10 py-3 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white text-sm sm:text-[15px] font-bold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 whitespace-nowrap w-full sm:w-auto overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
              <span className="relative">Разблокировать за ${postPrice}</span>
            </button>
          )}

          {/* Show subscription button for paid, subscribers, and premium posts */}
          {(accessLevel === "paid" || accessLevel === "subscribers" || accessLevel === "premium") && (
            <button
              onClick={onSubscribe}
              className="group relative flex items-center justify-center gap-2 px-8 sm:px-10 py-3 rounded-full border-2 border-[#A06AFF] bg-transparent text-white text-sm sm:text-[15px] font-bold hover:bg-[#A06AFF]/10 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
            >
              {accessLevel === "premium" && <Crown className="w-4 h-4" />}
              <span>
                Подписка ${accessLevel === "premium" ? subscriptionPrice + 20 : subscriptionPrice}/мес
              </span>
            </button>
          )}
        </div>

        {/* Additional info */}
        {accessLevel === "paid" && (
          <p className="text-[#6D6D6D] text-xs text-center max-w-sm">
            Подписка дает доступ ко всем платным постам автора и новым публикациям
          </p>
        )}
      </div>
    </section>
  );
}
