import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown } from "lucide-react";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import { PostHeader } from "./PostHeader";
import { PostFooter } from "./PostFooter";
import type { Post } from "../../types";

interface SignalPostProps {
  post: Post;
  isFollowing: boolean;
  onFollowToggle: (handle: string, isFollowing: boolean) => void;
}

export default function SignalPost({ post, isFollowing, onFollowToggle }: SignalPostProps) {
  const isPaidLocked = post.price !== "free";
  const sentimentClasses =
    post.sentiment === "bullish"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : "border-rose-400/40 bg-rose-400/10 text-rose-300";

  return (
    <article className="flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6">
      <PostHeader post={post} isFollowing={isFollowing} onFollowToggle={onFollowToggle}>
        {/* Sentiment Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
            sentimentClasses
          )}
        >
          {post.sentiment === "bullish" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {post.sentiment === "bullish" ? "Bullish" : "Bearish"}
        </span>

        {/* Ticker */}
        {post.ticker && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#482090] to-[#A06AFF] px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]">
            {post.ticker}
          </span>
        )}

        {/* Direction */}
        {post.direction && (
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
      </PostHeader>

      {/* Content */}
      <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px]">
        <p className="whitespace-pre-line text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white">
          {post.text}
          {post.tags?.map((tag) => (
            <span key={tag} className="text-[#4D7CFF] font-normal">
              {" "}
              {tag}
            </span>
          ))}
        </p>
      </section>

      {/* Signal Info */}
      {!isPaidLocked && (
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

      {/* Paid Lock */}
      {isPaidLocked && (
        <section className="ml-[48px] sm:ml-[52px] md:ml-[56px] relative rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center backdrop-blur-[8.65px]">
          <div className="relative z-10 flex flex-col items-center gap-6 py-12 px-4">
            <div className="flex flex-col items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 41 41" fill="none">
                <path
                  d="M20.5 28.0003V24.667"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M13 15.4997V11.333C13 7.19087 16.3579 3.83301 20.5 3.83301C24.6422 3.83301 28 7.19087 28 11.333V15.4997"
                  stroke="#B0B0B0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-white text-center text-sm font-bold">
                Access to this content is restricted.
                <br />
                Purchase to gain full access.
              </p>
            </div>
            <button className="px-12 py-1.5 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white text-sm font-bold">
              Get Access
            </button>
          </div>
        </section>
      )}

      <PostFooter post={post} />
    </article>
  );
}
