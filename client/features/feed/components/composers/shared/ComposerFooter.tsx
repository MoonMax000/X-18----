import React from "react";
import { cn } from "@/lib/utils";

export interface ComposerFooterProps {
  charRatio: number;
  remainingChars: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
  canPost: boolean;
  onPost: () => void;
  showReplySettings?: boolean;
  replySummary?: string;
  onReplyClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isPosting?: boolean;
}

export function ComposerFooter({
  charRatio,
  remainingChars,
  isNearLimit,
  isOverLimit,
  canPost,
  onPost,
  showReplySettings = false,
  replySummary,
  onReplyClick,
  isPosting = false,
}: ComposerFooterProps) {
  const circumference = 88;
  const dashOffset = circumference - charRatio * circumference;

  return (
    <div className="flex items-center justify-between">
      {/* Reply Settings (optional, shown in modal) */}
      {showReplySettings && replySummary && onReplyClick && (
        <button
          type="button"
          onClick={onReplyClick}
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10"
          disabled={isPosting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 2v1.5M12 20.5V22M4.5 12H2M22 12h-2.5M7.05 4.05l1.06 1.06M15.89 17.95l1.06 1.06M5.56 18.44l1.06-1.06M17.38 6.62l1.06-1.06"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.75 17.5 8 14l-1-3-2.2-1.27"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m17 14-.5-3-1-3 2.5-1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{replySummary}</span>
        </button>
      )}

      {!showReplySettings && <div />}

      {/* Counter + Post Button */}
      <div className="flex items-center gap-2">
        {/* Character Counter */}
        <div className="relative flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="none" stroke="#2F3336" strokeWidth="4" />
            <circle 
              cx="16" 
              cy="16" 
              r="14" 
              fill="none" 
              stroke={isOverLimit ? "#EF454A" : isNearLimit ? "#FFD400" : "#A06AFF"} 
              strokeWidth="4" 
              strokeDasharray={`${circumference} ${circumference}`} 
              strokeDashoffset={dashOffset} 
              strokeLinecap="round" 
              className="transition-all duration-300" 
            />
          </svg>
          <span 
            className={cn(
              "absolute text-sm font-medium tabular-nums", 
              isOverLimit ? "text-[#EF454A]" : isNearLimit ? "text-[#FFD400]" : "text-[#808283]"
            )}
          >
            {remainingChars < 20 ? remainingChars : ""}
          </span>
        </div>

        {/* Post Button */}
        <button 
          onClick={onPost}
          disabled={!canPost || isPosting}
          className={cn(
            "group relative inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-xs font-semibold transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/40 focus-visible:ring-offset-0", 
            canPost && !isPosting
              ? "bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] text-white shadow-[0_20px_44px_-20px_rgba(160,106,255,0.9)] hover:shadow-[0_24px_50px_-18px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98]" 
              : "cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]"
          )}
        >
          {canPost && !isPosting && (
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0.05)_40%,_rgba(255,255,255,0)_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("transition-transform duration-200", canPost && !isPosting && "group-hover:translate-x-0.5 group-hover:scale-110")}>
              <path d="M5 12L4 5L20 12L4 19L5 12ZM5 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">{isPosting ? "Posting..." : "Post"}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
