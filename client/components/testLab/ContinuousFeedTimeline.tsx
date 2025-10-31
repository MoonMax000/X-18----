import React, { useState, FC } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Lock, TrendingUp, TrendingDown } from "lucide-react";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";

interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    isPremium?: boolean;
    isFollowing?: boolean;
  };
  timestamp: string;
  type: string;
  text: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  market?: string;
  price?: string;
  ticker?: string;
  direction?: "long" | "short";
  timeframe?: string;
  risk?: "low" | "medium" | "high";
  accuracy?: number;
  sampleSize?: number;
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  language?: string;
  codeSnippet?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  isEditorPick?: boolean;
  tags?: string[];
}

interface ContinuousFeedTimelineProps {
  posts: Post[];
  onFollowToggle?: (handle: string, isFollowing: boolean) => void;
  onPostClick?: (postId: string) => void;
}

const ContinuousFeedTimeline: FC<ContinuousFeedTimelineProps> = ({ posts, onFollowToggle, onPostClick }) => {
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(new Map());
  const [bookmarkedState, setBookmarkedState] = useState<Map<string, boolean>>(new Map());

  const handleFollowToggle = (handle: string, isFollowing: boolean) => {
    const newState = new Map(followingState);
    newState.set(handle, !isFollowing);
    setFollowingState(newState);
    onFollowToggle?.(handle, !isFollowing);
  };

  const handleBookmarkToggle = (postId: string) => {
    const newState = new Map(bookmarkedState);
    const currentState = newState.get(postId) ?? false;
    newState.set(postId, !currentState);
    setBookmarkedState(newState);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm mt-2">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center pt-3 sm:pt-4 md:pt-6">
      {posts.map((post, index) => {
        const isFollowing = followingState.get(post.author.handle) ?? post.author.isFollowing ?? false;
        const isBookmarked = bookmarkedState.get(post.id) ?? false;
        const isPaidLocked = post.price !== "free";
        const sentimentClasses =
          post.sentiment === "bullish"
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-rose-400/40 bg-rose-400/10 text-rose-300";

        return (
          <React.Fragment key={post.id}>
            {index !== 0 && (
              <div
                className="post-divider w-full h-[1px] relative"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #5E5E5E 20%, #5E5E5E 80%, transparent 100%)',
                  zIndex: 0
                }}
              />
            )}
            <article
              onClick={() => onPostClick?.(post.id)}
              className="post-hover-glow group flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6 backdrop-blur-[50px] transition-colors duration-200 relative cursor-pointer"
            >
            {/* Header */}
            <header className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
              <UserHoverCard
                author={{
                  name: post.author.name,
                  handle: post.author.handle,
                  avatar: post.author.avatar,
                  verified: post.author.verified,
                  followers: Math.floor(Math.random() * 50000) + 1000,
                  following: Math.floor(Math.random() * 2000) + 100,
                  bio: "Trader and market analyst",
                }}
                isFollowing={isFollowing}
                onFollowToggle={(nextState) => handleFollowToggle(post.author.handle, isFollowing)}
                showFollowButton={true}
              >
                <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3">
                  <Avatar className="flex-shrink-0 h-11 w-11 sm:w-12 sm:h-12">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[15px] sm:text-base md:text-[15px] font-bold md:font-semibold leading-tight text-white">
                      <span className="truncate hover:underline hover:underline-offset-2 transition-all">{post.author.name}</span>
                      {post.author.verified && (
                        <VerifiedBadge size={16} />
                      )}
                      <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">
                        {post.author.handle}
                      </span>
                      {post.author.handle && (
                        <>
                          <svg className="hidden md:inline w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                            <circle cx="2" cy="2" r="1.5" />
                          </svg>
                          <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">
                            {post.timestamp}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex md:hidden items-center gap-1 sm:gap-1.5 text-[13px] sm:text-sm font-normal text-[#7C7C7C] mt-0.5">
                      <span>{post.author.handle}</span>
                      <svg className="w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                        <circle cx="2" cy="2" r="1.5" />
                      </svg>
                      <span>{post.timestamp}</span>
                    </div>
                    {/* Category Badges under author info */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                      {/* Category Badge */}
                      {post.type === "code" && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs" style={{ backgroundColor: "#6B6BFF" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.66699 4.66663L5.48469 5.37142C5.82845 5.66771 6.00033 5.81587 6.00033 5.99996C6.00033 6.18405 5.82845 6.3322 5.48469 6.6285L4.66699 7.33329" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.33301 7.33337H9.33301" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 14C10.4998 14 11.7497 14 12.6259 13.3634C12.9089 13.1578 13.1578 12.9089 13.3634 12.6259C14 11.7497 14 10.4998 14 8C14 5.50018 14 4.25027 13.3634 3.37405C13.1578 3.09107 12.9089 2.84221 12.6259 2.63661C11.7497 2 10.4998 2 8 2C5.50018 2 4.25027 2 3.37405 2.63661C3.09107 2.84221 2.84221 3.09107 2.63661 3.37405C2 4.25027 2 5.50018 2 8C2 10.4998 2 11.7497 2.63661 12.6259C2.84221 12.9089 3.09107 13.1578 3.37405 13.3634C4.25027 14 5.50018 14 8 14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Soft
                        </span>
                      )}
                      {post.type === "video" && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs" style={{ backgroundColor: "#FF6BD4" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.33301 7.33329C1.33301 5.13341 1.33301 4.03346 2.01643 3.35005C2.69984 2.66663 3.79979 2.66663 5.99967 2.66663H6.66634C8.86621 2.66663 9.96614 2.66663 10.6496 3.35005C11.333 4.03346 11.333 5.13341 11.333 7.33329V8.66663C11.333 10.8665 11.333 11.9664 10.6496 12.6499C9.96614 13.3333 8.86621 13.3333 6.66634 13.3333H5.99967C3.79979 13.3333 2.69984 13.3333 2.01643 12.6499C1.33301 11.9664 1.33301 10.8665 1.33301 8.66663V7.33329Z" stroke="white" strokeWidth="1.5"/>
                            <path d="M11.333 5.93728L11.4169 5.86802C12.8275 4.7042 13.5327 4.12228 14.0995 4.40326C14.6663 4.68423 14.6663 5.61574 14.6663 7.47878V8.52131C14.6663 10.3844 14.6663 11.3158 14.0995 11.5968C13.5327 11.8778 12.8275 11.2959 11.4169 10.132L11.333 10.0628" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M7.66699 7.33337C8.21928 7.33337 8.66699 6.88566 8.66699 6.33337C8.66699 5.78109 8.21928 5.33337 7.66699 5.33337C7.11471 5.33337 6.66699 5.78109 6.66699 6.33337C6.66699 6.88566 7.11471 7.33337 7.66699 7.33337Z" stroke="white" strokeWidth="1.5"/>
                          </svg>
                          Video
                        </span>
                      )}
                      {(post.type === "education" || post.type === "analysis") && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs" style={{ backgroundColor: "#4FC3F7" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.667 6.41383C12.667 8.13331 11.8205 9.45684 10.5325 10.3278C10.2325 10.5307 10.0825 10.6322 10.0085 10.7475C9.93446 10.8628 9.90919 11.0143 9.85873 11.3172L9.81946 11.5526C9.73079 12.0847 9.68646 12.3507 9.49993 12.5087C9.31346 12.6667 9.04373 12.6667 8.50426 12.6667H6.76326C6.22385 12.6667 5.95412 12.6667 5.76763 12.5087C5.58113 12.3507 5.53679 12.0847 5.4481 11.5526L5.40887 11.3172C5.35855 11.0153 5.3334 10.8644 5.26011 10.7496C5.18683 10.6348 5.03651 10.532 4.73587 10.3265C3.46159 9.45551 2.66699 8.13244 2.66699 6.41383C2.66699 3.60797 4.90557 1.33337 7.66699 1.33337C8.00946 1.33337 8.34386 1.36836 8.66699 1.435" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M11.0003 1.33337L11.1723 1.79806C11.3977 2.40739 11.5105 2.71205 11.7327 2.9343C11.955 3.15655 12.2597 3.26929 12.869 3.49476L13.3337 3.66671L12.869 3.83865C12.2597 4.06413 11.955 4.17687 11.7327 4.39911C11.5105 4.62136 11.3977 4.92603 11.1723 5.53535L11.0003 6.00004L10.8284 5.53535C10.6029 4.92603 10.4902 4.62136 10.2679 4.39911C10.0457 4.17687 9.74099 4.06413 9.13166 3.83865L8.66699 3.66671L9.13166 3.49476C9.74099 3.26929 10.0457 3.15655 10.2679 2.9343C10.4902 2.71205 10.6029 2.40739 10.8284 1.79806L11.0003 1.33337Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                            <path d="M8.99967 12.6666V13.3333C8.99967 13.9618 8.99967 14.2761 8.80441 14.4714C8.60914 14.6666 8.29487 14.6666 7.66634 14.6666C7.03781 14.6666 6.72354 14.6666 6.52827 14.4714C6.33301 14.2761 6.33301 13.9618 6.33301 13.3333V12.6666" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                          </svg>
                          Idea
                        </span>
                      )}
                      {(post.type === "general" || post.type === "macro") && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs" style={{ backgroundColor: "#FF6B6B" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_43_2932)">
                              <path d="M5.66699 9.66671H10.3337M5.66699 6.33337H8.00033" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9.44674 13.927C12.2354 13.7416 14.4567 11.4888 14.6395 8.66056C14.6753 8.10709 14.6753 7.53389 14.6395 6.98043C14.4567 4.15221 12.2354 1.89938 9.44674 1.71401C8.49534 1.65077 7.50207 1.6509 6.55261 1.71401C3.76393 1.89938 1.54261 4.15221 1.35983 6.98043C1.32407 7.53389 1.32407 8.10709 1.35983 8.66056C1.42641 9.69063 1.88196 10.6444 2.41828 11.4497C2.72968 12.0135 2.52417 12.7172 2.19981 13.3318C1.96595 13.775 1.84901 13.9966 1.9429 14.1567C2.03679 14.3168 2.24651 14.3219 2.66596 14.3321C3.49545 14.3523 4.05479 14.1171 4.49879 13.7897C4.75061 13.604 4.87652 13.5112 4.9633 13.5005C5.05007 13.4898 5.22085 13.5602 5.56235 13.7008C5.86927 13.8272 6.22565 13.9052 6.55261 13.927C7.50207 13.9901 8.49534 13.9902 9.44674 13.927Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_43_2932">
                                <rect width="16" height="16" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                          Opinion
                        </span>
                      )}
                      {(post.type === "onchain" || post.type === "news") && (
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs" style={{ backgroundColor: "#F7A350" }}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_43_2937)">
                              <path d="M4.66699 11.3333V8.66663" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M8 11.3333V4.66663" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M11.333 11.3334V7.33337" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                              <path d="M1.66699 7.99996C1.66699 5.0144 1.66699 3.52162 2.59449 2.59412C3.52199 1.66663 5.01477 1.66663 8.00033 1.66663C10.9859 1.66663 12.4787 1.66663 13.4062 2.59412C14.3337 3.52162 14.3337 5.0144 14.3337 7.99996C14.3337 10.9855 14.3337 12.4783 13.4062 13.4058C12.4787 14.3333 10.9859 14.3333 8.00033 14.3333C5.01477 14.3333 3.52199 14.3333 2.59449 13.4058C1.66699 12.4783 1.66699 10.9855 1.66699 7.99996Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_43_2937">
                                <rect width="16" height="16" fill="white"/>
                              </clipPath>
                            </defs>
                          </svg>
                          Analytics
                        </span>
                      )}
                      {post.type === "signal" && (
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                          sentimentClasses
                        )}>
                          {post.sentiment === "bullish" ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {post.sentiment === "bullish" ? "Bullish" : "Bearish"}
                        </span>
                      )}
                      {post.type === "signal" && post.ticker && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#482090] to-[#A06AFF] px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]">
                          {post.ticker}
                        </span>
                      )}
                      {post.type === "signal" && post.direction && (
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white",
                          post.direction === "long"
                            ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.8)]"
                            : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_8px_20px_-8px_rgba(244,63,94,0.8)]"
                        )}>
                          {post.direction}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </UserHoverCard>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="More options"
                  className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <path
                      d="M8.00004 8.66675C8.17685 8.66675 8.34642 8.59651 8.47145 8.47149C8.59647 8.34646 8.66671 8.17689 8.66671 8.00008C8.66671 7.82327 8.59647 7.6537 8.47145 7.52868C8.34642 7.40365 8.17685 7.33341 8.00004 7.33341C7.82323 7.33341 7.65366 7.40365 7.52864 7.52868C7.40361 7.6537 7.33337 7.82327 7.33337 8.00008C7.33337 8.17689 7.40361 8.34646 7.52864 8.47149C7.65366 8.59651 7.82323 8.66675 8.00004 8.66675Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12.6667 8.66675C12.8435 8.66675 13.013 8.59651 13.1381 8.47149C13.2631 8.34646 13.3333 8.17689 13.3333 8.00008C13.3333 7.82327 13.2631 7.6537 13.1381 7.52868C13.013 7.40365 12.8435 7.33341 12.6667 7.33341C12.4899 7.33341 12.3203 7.40365 12.1953 7.52868C12.0702 7.6537 12 7.82327 12 8.00008C12 8.17689 12.0702 8.34646 12.1953 8.47149C12.3203 8.59651 12.4899 8.66675 12.6667 8.66675Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.33329 8.66675C3.5101 8.66675 3.67967 8.59651 3.8047 8.47149C3.92972 8.34646 3.99996 8.17689 3.99996 8.00008C3.99996 7.82327 3.92972 7.6537 3.8047 7.52868C3.67967 7.40365 3.5101 7.33341 3.33329 7.33341C3.15648 7.33341 2.98691 7.40365 2.86189 7.52868C2.73686 7.6537 2.66663 7.82327 2.66663 8.00008C2.66663 8.17689 2.73686 8.34646 2.86189 8.47149C2.98691 8.59651 3.15648 8.66675 3.33329 8.66675Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </header>

            {/* Content Section - with margin-left to align under avatar */}
            <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px]">
              <p className="whitespace-pre-line text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white">
                {post.text}
              </p>
              {post.tags && post.tags.length > 0 ? (
                <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed mt-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[#4D7CFF] font-normal">
                      {tag}
                    </span>
                  )).reduce((prev, curr) => [prev, ' ', curr] as any)}
                </p>
              ) : null}
            </section>

            {/* Signal-specific info */}
            {post.type === "signal" && (
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

            {/* Paid/Locked Content */}
            {isPaidLocked && (
              <section className="ml-[48px] sm:ml-[52px] md:ml-[56px] relative rounded-lg overflow-hidden min-h-[200px] sm:min-h-[240px] md:min-h-[280px] flex items-center justify-center">
                {/* Background logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  <svg
                    className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64"
                    viewBox="0 0 218 267"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

                {/* Background blur overlay */}
                <div className="absolute inset-0 backdrop-blur-[8.65px]" />

                {/* Content */}
                <div className="group relative z-10 flex flex-col items-center justify-center gap-6 sm:gap-8 py-12 sm:py-16 px-4 sm:px-6">
                  {/* Lock Icon */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(160,106,255,0.6)]"
                      viewBox="0 0 41 41"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        className="transition-all duration-500 group-hover:stroke-[#A06AFF]"
                        d="M20.5 28.0003V24.667"
                        stroke="#B0B0B0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        className="transition-all duration-500 group-hover:stroke-[#A06AFF]"
                        d="M7.61298 31.9078C7.98778 34.6917 10.2935 36.8725 13.0994 37.0015C15.4604 37.11 17.8588 37.1667 20.5 37.1667C23.1411 37.1667 25.5395 37.11 27.9005 37.0015C30.7065 36.8725 33.0121 34.6917 33.387 31.9078C33.6315 30.0912 33.8333 28.2293 33.8333 26.3333C33.8333 24.4373 33.6315 22.5755 33.387 20.7588C33.0121 17.975 30.7065 15.7941 27.9005 15.6651C25.5395 15.5566 23.1411 15.5 20.5 15.5C17.8588 15.5 15.4604 15.5566 13.0994 15.6651C10.2935 15.7941 7.98778 17.975 7.61298 20.7588C7.36838 22.5755 7.16663 24.4373 7.16663 26.3333C7.16663 28.2293 7.36838 30.0912 7.61298 31.9078Z"
                        stroke="#B0B0B0"
                        strokeWidth="1.5"
                      />
                      <path
                        className="transition-all duration-500 origin-bottom group-hover:stroke-[#A06AFF] group-hover:-translate-y-1 group-hover:rotate-[-8deg]"
                        d="M13 15.4997V11.333C13 7.19087 16.3579 3.83301 20.5 3.83301C24.6422 3.83301 28 7.19087 28 11.333V15.4997"
                        stroke="#B0B0B0"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* Text */}
                    <p className="text-white text-center text-sm sm:text-[15px] font-bold leading-normal max-w-xs">
                      Access to this content is restricted.<br />
                      Purchase to gain full access.
                    </p>
                  </div>

                  {/* Button - horizontal wide with gradient */}
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-8 sm:px-12 md:px-14 py-2 text-sm sm:text-[15px] font-medium text-white shadow-[0_8px_24px_rgba(160,106,255,0.4)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(160,106,255,0.6)] hover:ring-2 hover:ring-[#A06AFF] hover:ring-offset-2 hover:ring-offset-black whitespace-nowrap"
                  >
                    Get Access
                  </button>
                </div>
              </section>
            )}

            {/* Footer with engagement metrics */}
            <footer className="relative flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
              <div className="flex w-[2.75rem] sm:w-12" aria-hidden="true" />
              <div className="flex flex-1 items-center justify-between pr-2 sm:pr-3 md:pr-4 text-[11px] sm:text-xs md:text-sm font-normal text-[#6D6D6D]">
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
                  aria-label="Comments"
                >
                  <svg
                    className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.94043 9.84328C1.94043 5.61993 5.36497 2.19922 9.58927 2.19922H13.761C18.0512 2.19922 21.5283 5.67727 21.5283 9.96749C21.5283 12.7958 19.9928 15.3948 17.519 16.7612L9.82337 21.0227V17.4969H9.75935C5.46912 17.5924 1.94043 14.1431 1.94043 9.84328ZM9.58927 4.11023C6.41985 4.11023 3.85144 6.68055 3.85144 9.84328C3.85144 13.0633 6.4982 15.6528 9.71635 15.5859L10.0517 15.5763H11.7344V17.774L16.595 15.089C18.4592 14.0571 19.6173 12.0983 19.6173 9.96749C19.6173 6.72832 16.9954 4.11023 13.761 4.11023H9.58927Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="hidden md:inline">{post.comments >= 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments}</span>
                  <span className="md:hidden">{post.comments >= 1000 ? `${(post.comments / 1000).toFixed(1)}k` : post.comments}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#00BA7C]"
                  aria-label="Retweet"
                >
                  <svg
                    className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="hidden md:inline">{post.reposts >= 1000 ? `${(post.reposts / 1000).toFixed(1)}K` : post.reposts}</span>
                  <span className="md:hidden">{post.reposts >= 1000 ? `${(post.reposts / 1000).toFixed(1)}k` : post.reposts}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#F91880]"
                  aria-label="Like"
                >
                  <svg
                    className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="hidden md:inline">{post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}</span>
                  <span className="md:hidden">{post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}</span>
                </button>

                {typeof post.views === "number" ? (
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
                    aria-label="Views"
                  >
                    <svg
                      className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="hidden md:inline">{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views}</span>
                    <span className="md:hidden">{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}k` : post.views}</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkToggle(post.id);
                  }}
                  aria-label="Save"
                  className={cn(
                    "relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors",
                    isBookmarked ? "text-[#A06AFF]" : "hover:text-[#A06AFF]"
                  )}
                >
                  <svg
                    className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px] md:w-[18px] md:h-[18px]"
                    viewBox="0 0 20 20"
                    fill={isBookmarked ? "currentColor" : "none"}
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ContinuousFeedTimeline;
