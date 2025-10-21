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
          title: "Премиу�� контент",
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
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
        <svg className="w-48 h-56 sm:w-56 sm:h-64 md:w-72 md:h-80" viewBox="0 0 18 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 11.4935L0.000836009 11.5607C1.99496 11.1253 3.99971 10.6706 6.00816 10.215L6.01186 21.0231L12.7689 22.5C12.7689 20.1266 12.7479 13.4405 12.77 11.0677L8.04193 10.0343L7.41266 9.89685C10.9481 9.0969 14.49 8.30751 18 7.62785L17.9988 0.5C12.0625 1.79714 5.95525 3.33041 0 4.43313L0 11.4935Z"
            fill="url(#paint0_linear_gated)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_gated"
              x1="4.37143"
              y1="24.15"
              x2="13.044"
              y2="2.25457"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A06AFF"/>
              <stop offset="1" stopColor="#7F57FF"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 backdrop-blur-[12px]" />

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
                П��дписка ${accessLevel === "premium" ? subscriptionPrice + 20 : subscriptionPrice}/мес
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
