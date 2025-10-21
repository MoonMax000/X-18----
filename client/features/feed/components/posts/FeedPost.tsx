import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import GatedContent from "./GatedContent";
import type { Post } from "../../types";

interface FeedPostProps {
  post: Post;
  isFollowing: boolean;
  onFollowToggle: (handle: string, isFollowing: boolean) => void;
  showTopBorder?: boolean;
}

export default function FeedPost({ post, isFollowing, onFollowToggle, showTopBorder = false }: FeedPostProps) {
  const isSignal = post.type === "signal";
  const isLocked = post.accessLevel && post.accessLevel !== "public" && !post.isPurchased && !post.isSubscriber;

  const getCategoryBadge = () => {
    const badges = {
      code: { bg: "#6B6BFF", label: "Soft" },
      video: { bg: "#FF6BD4", label: "Video" },
      education: { bg: "#4FC3F7", label: "Idea" },
      analysis: { bg: "#4FC3F7", label: "Idea" },
      general: { bg: "#FF6B6B", label: "Opinion" },
      macro: { bg: "#FF6B6B", label: "Opinion" },
      onchain: { bg: "#F7A350", label: "Analytics" },
      news: { bg: "#F7A350", label: "Analytics" },
    };

    const badge = badges[post.type as keyof typeof badges];
    if (!badge) return null;

    return (
      <span
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
        style={{ backgroundColor: badge.bg }}
      >
        {badge.label}
      </span>
    );
  };

  const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  return (
    <article
      className={cn(
        "flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6 backdrop-blur-[50px] transition-colors duration-200 relative",
        showTopBorder && "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#181B22] before:to-transparent"
      )}
      style={{
        borderBottom: "1px solid transparent",
        backgroundImage: `linear-gradient(to right, transparent 0%, #181B22 20%, #181B22 80%, transparent 100%)`,
        backgroundPosition: "0 100%",
        backgroundSize: "100% 1px",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Header */}
      <header className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
        <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3 cursor-pointer">
          <Avatar className="flex-shrink-0 h-11 w-11 sm:w-12 sm:h-12">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[15px] sm:text-base md:text-[15px] font-bold md:font-semibold leading-tight text-white">
              <span className="truncate">{post.author.name}</span>
              {post.author.verified && <VerifiedBadge size={16} />}
              <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
              <svg className="hidden md:inline w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                <circle cx="2" cy="2" r="1.5" />
              </svg>
              <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">{post.timestamp}</span>
            </div>
            <div className="flex md:hidden items-center gap-1 sm:gap-1.5 text-[13px] sm:text-sm font-normal text-[#7C7C7C] mt-0.5">
              <span>{post.author.handle}</span>
              <svg className="w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                <circle cx="2" cy="2" r="1.5" />
              </svg>
              <span>{post.timestamp}</span>
            </div>

            {/* Category Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {/* Signal Sentiment Badge */}
              {isSignal && post.sentiment && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                    post.sentiment === "bullish"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                      : "border-rose-400/40 bg-rose-400/10 text-rose-300"
                  )}
                >
                  {post.sentiment === "bullish" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {post.sentiment === "bullish" ? "Bullish" : "Bearish"}
                </span>
              )}

              {/* Ticker */}
              {isSignal && post.ticker && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#482090] to-[#A06AFF] px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]">
                  {post.ticker}
                </span>
              )}

              {/* Direction */}
              {isSignal && post.direction && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white",
                    post.direction === "long"
                      ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_8px_20px_-8px_rgba(244,63,94,0.8)]"
                  )}
                >
                  {post.direction}
                </span>
              )}

              {/* Category Badge for non-signal posts */}
              {!isSignal && getCategoryBadge()}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white"
        >
          <svg className="-rotate-90 h-4 w-4" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="12.6667" cy="8" r="1.5" fill="currentColor" />
            <circle cx="3.33329" cy="8" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </header>

      {/* Content Section */}
      <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px]">
        <p className="whitespace-pre-line text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white">
          {post.text}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[#4D7CFF] font-normal text-[14px] sm:text-[15px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Signal-specific info */}
      {isSignal && !isLocked && (
        <section className="ml-[48px] sm:ml-[52px] md:ml-[56px]">
          {post.accuracy && (
            <div className="mb-3 text-[14px] sm:text-[15px] md:text-[16px] text-[#C5C9D3]">
              <span className="font-semibold text-green-400">Accuracy {post.accuracy}%</span>
              <span className="text-[#6C7280]"> · </span>
              <span className="text-[#6C7280]">{post.sampleSize} signals / 90d</span>
            </div>
          )}
          {post.entry && (
            <div className="flex gap-4 text-[14px] sm:text-[15px] md:text-[16px]">
              <div>
                <div className="text-xs text-[#6C7280]">Entry</div>
                <div className="font-semibold text-white">{post.entry}</div>
              </div>
              <div>
                <div className="text-xs text-[#6C7280]">Stop</div>
                <div className="font-semibold text-red-400">{post.stopLoss}</div>
              </div>
              <div>
                <div className="text-xs text-[#6C7280]">TP</div>
                <div className="font-semibold text-green-400">{post.takeProfit}</div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Gated/Locked Content */}
      {isLocked && (
        <section className="ml-[48px] sm:ml-[52px] md:ml-[56px]">
          <GatedContent
            accessLevel={post.accessLevel!}
            postId={post.id}
            authorId={post.author.id || post.author.handle}
            postPrice={post.postPrice}
            subscriptionPrice={post.author.subscriptionPrice}
            authorName={post.author.name}
            isPurchased={post.isPurchased}
            isSubscriber={post.isSubscriber}
          />
        </section>
      )}

      {/* Footer with engagement metrics */}
      <footer className="relative flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
        <div className="flex w-[2.75rem] sm:w-12" aria-hidden="true" />
        <div className="flex flex-1 items-center justify-between pr-2 sm:pr-3 md:pr-4 text-[11px] sm:text-xs md:text-sm font-normal text-[#6D6D6D]">
          <button className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]">
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M1.94043 9.84328C1.94043 5.61993 5.36497 2.19922 9.58927 2.19922H13.761C18.0512 2.19922 21.5283 5.67727 21.5283 9.96749C21.5283 12.7958 19.9928 15.3948 17.519 16.7612L9.82337 21.0227V17.4969H9.75935C5.46912 17.5924 1.94043 14.1431 1.94043 9.84328ZM9.58927 4.11023C6.41985 4.11023 3.85144 6.68055 3.85144 9.84328C3.85144 13.0633 6.4982 15.6528 9.71635 15.5859L10.0517 15.5763H11.7344V17.774L16.595 15.089C18.4592 14.0571 19.6173 12.0983 19.6173 9.96749C19.6173 6.72832 16.9954 4.11023 13.761 4.11023H9.58927Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(post.comments)}</span>
            <span className="md:hidden">{formatNumber(post.comments)}</span>
          </button>

          <button className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#00BA7C]">
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(post.reposts)}</span>
            <span className="md:hidden">{formatNumber(post.reposts)}</span>
          </button>

          <button className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#F91880]">
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(post.likes)}</span>
            <span className="md:hidden">{formatNumber(post.likes)}</span>
          </button>

          {typeof post.views === "number" && (
            <button className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]">
              <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden md:inline">{formatNumber(post.views)}</span>
              <span className="md:hidden">{formatNumber(post.views)}</span>
            </button>
          )}

          <button className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full text-[#B0B0B0] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white">
            <svg className="w-[14px] h-[14px]" viewBox="0 0 20 20" fill="none">
              <path
                d="M3.33301 14.9838V8.08945C3.33301 5.06164 3.33301 3.54774 4.30932 2.60712C5.28563 1.6665 6.85697 1.6665 9.99967 1.6665C13.1423 1.6665 14.7138 1.6665 15.69 2.60712C16.6663 3.54774 16.6663 5.06164 16.6663 8.08945V14.9838C16.6663 16.9054 16.6663 17.8662 16.0223 18.2101C14.7751 18.876 12.4357 16.6542 11.3247 15.9852C10.6803 15.5972 10.3582 15.4032 9.99967 15.4032C9.64117 15.4032 9.31901 15.5972 8.67467 15.9852C7.56367 16.6542 5.22423 18.876 3.97705 18.2101C3.33301 17.8662 3.33301 16.9054 3.33301 14.9838Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  );
}
