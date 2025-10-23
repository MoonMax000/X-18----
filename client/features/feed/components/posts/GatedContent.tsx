import React, { useState } from "react";
import { Crown } from "lucide-react";
import type { AccessLevel } from "../../types";
import { PaymentModal, FollowModal } from "@/components/monetization";

interface GatedContentProps {
  accessLevel: AccessLevel;
  postId?: string;
  authorId?: string;
  postPrice?: number;
  subscriptionPrice?: number;
  authorName: string;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isFollower?: boolean;
  isOwnPost?: boolean; // NEW: Is this the creator's own post?
  onUnlock?: () => void;
  onSubscribe?: () => void;
  onFollow?: () => void;
}

export default function GatedContent({
  accessLevel,
  postId,
  authorId,
  postPrice = 9,
  subscriptionPrice = 29,
  authorName,
  isPurchased = false,
  isSubscriber = false,
  isFollower = false,
  isOwnPost = false, // NEW: Check if this is creator's own post
  onUnlock,
  onSubscribe,
  onFollow,
}: GatedContentProps) {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);

  // Unlock conditions: purchased, subscribed, (followers-only + is follower), OR is own post
  if (isPurchased || isSubscriber || accessLevel === "public" || (accessLevel === "followers" && isFollower) || isOwnPost) {
    return null;
  }

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onUnlock) {
      onUnlock();
    } else {
      setShowUnlockModal(true);
    }
  };

  const handleSubscribeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onSubscribe) {
      onSubscribe();
    } else {
      setShowSubscribeModal(true);
    }
  };

  const handleUnlockSuccess = () => {
    setShowUnlockModal(false);
    // Reload или refetch для обновления поста
    window.location.reload();
  };

  const handleSubscribeSuccess = () => {
    setShowSubscribeModal(false);
    // Reload или refetch для обновлени�� всех постов автора
    window.location.reload();
  };

  const getContentMessage = () => {
    switch (accessLevel) {
      case "paid":
        return {
          title: "Paid Content",
          description: `Unlock this post for $${postPrice} or subscribe to ${authorName} to access all paid posts`,
        };
      case "subscribers":
        return {
          title: "Subscribers Only",
          description: `Subscribe to ${authorName} for $${subscriptionPrice}/mo to access this content`,
        };
      case "followers":
        return {
          title: "Followers Only",
          description: `Follow ${authorName} to access this exclusive content for followers`,
        };
      case "premium":
        return {
          title: "Premium Content",
          description: `Get premium subscription for $${subscriptionPrice + 20}/mo for exclusive content`,
        };
      default:
        return {
          title: "Limited Access",
          description: "This content is unavailable",
        };
    }
  };

  const { title, description } = getContentMessage();

  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden rounded-lg min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
      {/* Background logo with gradient */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <svg className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64" viewBox="0 0 218 267" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 133.143L0.010125 133.958C24.1612 128.685 48.4409 123.177 72.7655 117.659L72.8103 248.557L154.645 266.444C154.645 237.7 154.392 156.724 154.659 127.987L97.3967 115.471L89.7755 113.806C132.594 104.118 175.489 94.5576 218 86.3261L217.986 0C146.091 15.7098 72.1247 34.2794 0 47.6345L0 133.143Z"
            fill="url(#paint0_linear_premium)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_premium"
              x1="52.9429"
              y1="286.428"
              x2="157.977"
              y2="21.2498"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#A06AFF"/>
              <stop offset="1" stopColor="#482090"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[8.65px]" />

      {/* Content */}
      <div className="group relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8 py-12 sm:py-16 px-4 sm:px-6">
        {/* Icon and text */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Animated Lock Icon */}
          {accessLevel === "premium" ? (
            <div className="p-4 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30">
              <Crown className="w-10 h-10 text-[#FFD700]" />
            </div>
          ) : (
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(160,106,255,0.6)]"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Lock key line */}
              <path
                className="transition-all duration-500 group-hover:stroke-[#A06AFF]"
                d="M20.5 28.0003V24.667"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              
              {/* Lock body */}
              <path
                className="transition-all duration-500 group-hover:stroke-[#A06AFF]"
                d="M7.61298 31.9078C7.98778 34.6917 10.2935 36.8725 13.0994 37.0015C15.4604 37.11 17.8588 37.1667 20.5 37.1667C23.1411 37.1667 25.5395 37.11 27.9005 37.0015C30.7065 36.8725 33.0121 34.6917 33.387 31.9078C33.6315 30.0912 33.8333 28.2293 33.8333 26.3333C33.8333 24.4373 33.6315 22.5755 33.387 20.7588C33.0121 17.975 30.7065 15.7941 27.9005 15.6651C25.5395 15.5566 23.1411 15.5 20.5 15.5C17.8588 15.5 15.4604 15.5566 13.0994 15.6651C10.2935 15.7941 7.98778 17.975 7.61298 20.7588C7.36838 22.5755 7.16663 24.4373 7.16663 26.3333C7.16663 28.2293 7.36838 30.0912 7.61298 31.9078Z"
                stroke="#B0B0B0"
                strokeWidth="1.5"
              />
              
              {/* Lock shackle (animated) */}
              <path
                className="transition-all duration-500 origin-bottom group-hover:stroke-[#A06AFF] group-hover:-translate-y-1 group-hover:rotate-[-8deg]"
                d="M13 15.4997V11.333C13 7.19087 16.3579 3.83301 20.5 3.83301C24.6422 3.83301 28 7.19087 28 11.333V15.4997"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          <div className="flex flex-col items-center text-center space-y-2 w-full max-w-md mx-auto">
            <h3 className="text-white text-sm sm:text-[15px] font-bold leading-normal w-full">
              {title}
            </h3>
            <p className="text-[#B0B0B0] text-xs sm:text-sm leading-relaxed w-full">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {/* Show Follow button for followers-only content */}
          {accessLevel === "followers" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (onFollow) {
                  onFollow();
                } else {
                  setShowFollowModal(true);
                }
              }}
              className="group/btn relative flex items-center justify-center px-8 sm:px-12 md:px-14 py-2 rounded-full bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] text-white text-sm sm:text-[15px] font-medium shadow-[0_8px_24px_rgba(29,155,240,0.4)] hover:shadow-[0_12px_32px_rgba(29,155,240,0.6)] hover:ring-2 hover:ring-[#1D9BF0] hover:ring-offset-2 hover:ring-offset-black transition-all duration-300 whitespace-nowrap w-full sm:w-auto overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors duration-300" />
              <span className="relative">Follow {authorName}</span>
            </button>
          )}

          {/* Show unlock button only for paid posts */}
          {accessLevel === "paid" && (
            <button
              onClick={handleUnlockClick}
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-8 sm:px-12 md:px-14 py-2 text-sm sm:text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(160,106,255,0.4)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(160,106,255,0.6)] hover:ring-2 hover:ring-[#A06AFF] hover:ring-offset-2 hover:ring-offset-black whitespace-nowrap w-full sm:w-auto"
            >
              Unlock for ${postPrice}
            </button>
          )}

          {/* Show subscription button for paid, subscribers, and premium posts */}
          {(accessLevel === "paid" || accessLevel === "subscribers" || accessLevel === "premium") && (
            <button
              onClick={handleSubscribeClick}
              className="flex items-center justify-center gap-2 px-8 sm:px-12 md:px-14 py-2 rounded-full border-2 border-[#A06AFF] bg-transparent text-white text-sm sm:text-[15px] font-medium hover:bg-[#A06AFF]/10 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
            >
              {accessLevel === "premium" && <Crown className="w-4 h-4" />}
              <span>Subscribe ${accessLevel === "premium" ? subscriptionPrice + 20 : subscriptionPrice}/mo</span>
            </button>
          )}
        </div>

        {/* Additional info */}
        {accessLevel === "paid" && (
          <p className="text-[#6D6D6D] text-xs text-center max-w-sm">
            Subscription gives access to all paid posts and new publications
          </p>
        )}
      </div>

      {/* Payment Modals */}
      {postId && (
        <PaymentModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          type="unlock"
          amount={postPrice}
          postId={postId}
          onSuccess={handleUnlockSuccess}
        />
      )}

      {authorId && (
        <PaymentModal
          isOpen={showSubscribeModal}
          onClose={() => setShowSubscribeModal(false)}
          type="subscribe"
          amount={accessLevel === "premium" ? subscriptionPrice + 20 : subscriptionPrice}
          authorId={authorId}
          authorName={authorName}
          plan="monthly"
          onSuccess={handleSubscribeSuccess}
        />
      )}

      {/* Follow Modal for followers-only content */}
      {authorId && (
        <FollowModal
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
          authorId={authorId}
          authorName={authorName}
          authorAvatar="https://i.pravatar.cc/120?img=45"
          authorBio="Macro-focused trading desk delivering distilled hedge fund tactics."
          followersCount={28400}
        />
      )}
    </section>
  );
}
