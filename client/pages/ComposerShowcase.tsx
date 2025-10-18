import { FC, ReactNode, useState, useEffect } from "react";
import { TweetBlock } from "../components/CreatePostBox/TweetBlock";
import { EmojiPicker } from "../components/CreatePostBox/EmojiPicker";
import CreatePostVariants from "../components/CreatePostBox/CreatePostVariants";
import {
  CHAR_LIMIT,
  MediaItem,
  ReplyPolicy,
  createDefaultTransform,
  REPLY_SUMMARY_TEXT,
} from "../components/CreatePostBox/types";

const replyOptions: { id: ReplyPolicy; label: string; description: string }[] =
  [
    {
      id: "everyone",
      label: "Everyone",
      description: "Anyone mentioned can always reply.",
    },
    {
      id: "following",
      label: "Accounts you follow",
      description: "Only people you follow can reply.",
    },
    {
      id: "verified",
      label: "Verified accounts",
      description: "Only verified users can reply.",
    },
    {
      id: "mentioned",
      label: "Only accounts you mention",
      description: "Only people you mention can reply.",
    },
  ];

type StaticCodeBlock = {
  id: string;
  code: string;
  language: string;
};

type StaticBlock = {
  id: string;
  text: string;
  media: MediaItem[];
  codeBlocks?: StaticCodeBlock[];
};

interface StaticComposerWindowProps {
  blocks: StaticBlock[];
  replyPolicy: ReplyPolicy;
  sentiment: "bullish" | "bearish" | null;
  showEmojiPicker?: boolean;
  headline?: string;
  subheadline?: string;
}

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

interface MediaEditorPreviewProps {
  variant: "crop" | "alt" | "warning";
}

type StaticDraft = {
  id: string;
  text: string;
  updatedAt: string;
  blocksCount: number;
};

const noop = () => {};
const noopText = (_text: string) => {};
const noopMediaAdd = (_files: FileList) => {};
const noopId = (_id: string) => {};
const noopClick = () => {};
const noopMedia = (_media: MediaItem) => {};
const noopReorder = (_from: number, _to: number) => {};
const noopCodeRemove = (_codeBlockId: string) => {};

const sampleMediaPrimary: MediaItem = {
  id: "media-primary",
  url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900&auto=format&fit=crop",
  type: "image",
  alt: "Morning workspace setup",
  transform: createDefaultTransform(),
  sensitiveTags: [],
};

const sampleMediaCharts: MediaItem = {
  id: "media-charts",
  url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=900&auto=format&fit=crop",
  type: "image",
  alt: "Stock market dashboard",
  transform: createDefaultTransform(),
  sensitiveTags: [],
};

const sampleMediaPortrait: MediaItem = {
  id: "media-portrait",
  url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=750&auto=format&fit=crop",
  type: "image",
  alt: "City skyline at dusk",
  transform: createDefaultTransform(),
  sensitiveTags: [],
};

const sampleMediaWarning: MediaItem = {
  id: "media-warning",
  url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop",
  type: "image",
  alt: "Abstract art with strong contrasts",
  transform: createDefaultTransform(),
  sensitiveTags: ["graphic"],
};

const codeSample: StaticCodeBlock = {
  id: "code-1",
  language: "TypeScript",
  code: `type MarketTrend = "bullish" | "bearish" | "sideways";\n\nconst describeTrend = (trend: MarketTrend) => {\n  switch (trend) {\n    case "bullish":\n      return "Buyers are in control.";\n    case "bearish":\n      return "Sellers dominate the market.";\n    default:\n      return "Price action is consolidating.";\n  }\n};`,
};

const threadBlocks: StaticBlock[] = [
  {
    id: "thread-1",
    text: "Three signals that helped me avoid last week's fake breakout:",
    media: [sampleMediaPrimary],
    codeBlocks: [],
  },
  {
    id: "thread-2",
    text: "1) Higher timeframe confluence\n2) Volume confirmation\n3) Waiting for retest before entering",
    media: [],
    codeBlocks: [],
  },
  {
    id: "thread-3",
    text: "Bonus snippet: here's the helper I use to mark retests automatically ��",
    media: [],
    codeBlocks: [codeSample],
  },
];

const draftsPreview: StaticDraft[] = [
  {
    id: "draft-01",
    text: "Weekly macro update: bonds, commodities and tech earnings to watch",
    updatedAt: "11 Oct 2025, 14:27",
    blocksCount: 1,
  },
  {
    id: "draft-02",
    text: "Thread: 5 lessons I learned from trading options in September",
    updatedAt: "10 Oct 2025, 19:04",
    blocksCount: 3,
  },
  {
    id: "draft-03",
    text: "Morning sentiment poll for the community — bullish or bearish today?",
    updatedAt: "09 Oct 2025, 08:11",
    blocksCount: 1,
  },
];

import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";

const ShowcaseCard: FC<ShowcaseCardProps> = ({
  title,
  description,
  children,
}) => (
  <div className="rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.45)] p-6 backdrop-blur-[60px]">
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-[#808283]">{description}</p>
    </div>
    <div className="overflow-hidden rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.35)] p-4">
      {children}
    </div>
  </div>
);

const StaticComposerWindow: FC<StaticComposerWindowProps> = ({
  blocks,
  replyPolicy,
  sentiment,
  showEmojiPicker = false,
  headline = "Create post",
  subheadline = "Share your thoughts with followers",
}) => {
  const blockCount = blocks.length || 1;
  const totalChars = blocks.reduce((sum, block) => sum + block.text.length, 0);
  const avgLimit = CHAR_LIMIT * blockCount;
  const charRatio = Math.min(totalChars / (avgLimit || CHAR_LIMIT), 1);
  const remainingChars = avgLimit - totalChars;
  const isNearLimit = remainingChars <= 20;
  const isOverLimit = remainingChars < 0;
  const circumference = 88;
  const gradientStroke = `${charRatio * circumference} ${circumference}`;
  const replySummary = REPLY_SUMMARY_TEXT[replyPolicy];
  const hasContent =
    totalChars > 0 ||
    blocks.some(
      (block) => block.media.length > 0 || (block.codeBlocks?.length ?? 0) > 0,
    );

  return (
    <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[110px]">
      <div className="flex items-center justify-between border-b border-[#181B22] px-5 py-4">
        {/* Left: close icon */}
        <div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Right: Drafts label */}
        <div className="text-sm font-semibold text-[#A06AFF]">Drafts</div>
      </div>

      <div className="max-h-[560px] space-y-6 overflow-y-auto px-5 py-5 scrollbar">
        {blocks.map((block, index) => (
          <TweetBlock
            key={block.id}
            id={block.id}
            text={block.text}
            media={block.media}
            codeBlocks={block.codeBlocks ?? []}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            canDelete={blocks.length > 1}
            onChange={noopText}
            onMediaAdd={noopMediaAdd}
            onMediaRemove={noopId}
            onMediaEdit={noopMedia}
            onMediaReorder={noopReorder}
            onDelete={noop}
            onEmojiClick={noop}
            onCodeBlockClick={noop}
            onCodeBlockRemove={noopCodeRemove}
            readOnly
          />
        ))}
      </div>

      <div className="relative px-5 py-4">
        {/* Row 1: Reply Summary */}
        <div className="mb-3">
          <button
            type="button"
            onClick={noop}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
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
        </div>

        {/* Row 2: Grid with 7 columns - 5 icons (left) + 2 buttons (right) */}
        <div className="grid grid-cols-[auto_auto_auto_auto_auto_1fr_auto] items-center gap-2">
          {/* Column 1: Video Icon */}
          <button
            type="button"
            onClick={noop}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Add video"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* Column 2: Poll Icon */}
          <button
            type="button"
            onClick={noop}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Add poll"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h4v7H3zM10 7h4v12h-4zM17 3h4v16h-4z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Column 3: Media Icon */}
          <button
            type="button"
            onClick={noopClick}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Add media"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.25 7.5C6.94036 7.5 7.5 6.94036 7.5 6.25C7.5 5.55964 6.94036 5 6.25 5C5.55964 5 5 5.55964 5 6.25C5 6.94036 5.55964 7.5 6.25 7.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2.08301 10C2.08301 6.26809 2.08301 4.40212 3.24237 3.24274C4.40175 2.08337 6.26772 2.08337 9.99967 2.08337C13.7316 2.08337 15.5976 2.08337 16.757 3.24274C17.9163 4.40212 17.9163 6.26809 17.9163 10C17.9163 13.732 17.9163 15.598 16.757 16.7574C15.5976 17.9167 13.7316 17.9167 9.99967 17.9167C6.26772 17.9167 4.40175 17.9167 3.24237 16.7574C2.08301 15.598 2.08301 13.732 2.08301 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M4.16699 17.5C7.81071 13.1458 11.8954 7.40334 17.9149 11.2853"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {/* Column 4: Emoji Icon */}
          <button
            type="button"
            onClick={noop}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Add emoji"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10.0003 18.3333C14.6027 18.3333 18.3337 14.6023 18.3337 9.99996C18.3337 5.39759 14.6027 1.66663 10.0003 1.66663C5.39795 1.66663 1.66699 5.39759 1.66699 9.99996C1.66699 14.6023 5.39795 18.3333 10.0003 18.3333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.66699 12.5C7.42709 13.512 8.63724 14.1667 10.0003 14.1667C11.3634 14.1667 12.5736 13.512 13.3337 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.67447 7.5H6.66699M13.3337 7.5H13.3262"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Column 5: Code Block Icon */}
          <button
            type="button"
            onClick={noop}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Add code block"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Column 6: Empty spacer (1fr takes remaining space) */}
          <div></div>

          {/* Column 7: Bullish & Bearish Buttons (right-aligned) */}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              className={`rounded inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors ${
                sentiment === "bullish"
                  ? "bg-[#1C3430] text-white"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M13.3333 8.66659V5.33325H10"
                  stroke="#2EBD85"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3334 5.33325L10.0001 8.66659C9.41168 9.25499 9.11755 9.54912 8.75648 9.58165C8.69675 9.58705 8.63675 9.58705 8.57702 9.58165C8.21595 9.54912 7.92181 9.25499 7.33341 8.66659C6.74501 8.07819 6.45085 7.78405 6.08979 7.75152C6.03011 7.74612 5.97005 7.74612 5.91037 7.75152C5.54931 7.78405 5.25512 8.07819 4.66675 8.66659L2.66675 10.6666"
                  stroke="#2EBD85"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Bullish
            </button>
            <button
              type="button"
              className={`rounded inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors ${
                sentiment === "bearish"
                  ? "bg-[#3A2127] text-white"
                  : "bg-white/5 text-white/40 hover:text-white"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M13.3333 7.3335V10.6668H10"
                  stroke="#EF454A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3334 10.6668L10.0001 7.3335C9.41168 6.7451 9.11755 6.45093 8.75648 6.41841C8.69675 6.41303 8.63675 6.41303 8.57702 6.41841C8.21595 6.45093 7.92181 6.7451 7.33341 7.3335C6.74501 7.9219 6.45085 8.21603 6.08979 8.24856C6.03011 8.25396 5.97005 8.25396 5.91037 8.24856C5.54931 8.21603 5.25512 7.9219 4.66675 7.3335L2.66675 5.3335"
                  stroke="#EF454A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Bearish
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center">
            <svg
              className="-rotate-90"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="rgba(113, 118, 123, 0.3)"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="rgb(29, 155, 240)"
                strokeWidth="3"
                strokeDasharray="87.96"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {hasContent && (
            <>
              <div className="h-8 w-px bg-white/15" />
              <button
                type="button"
                onClick={noop}
                aria-label="Add post"
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-[#1D9BF0] transition-colors hover:bg-white/15 hover:border-white/30"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="#1D9BF0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="h-8 w-px bg-white/15" />
            </>
          )}

          <button
            type="button"
            className={`inline-flex h-10 min-w-[100px] items-center justify-center rounded-full px-6 text-sm font-semibold transition-all ${
              hasContent
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                : "cursor-not-allowed bg-[#A06AFF]/20 text-white/40"
            }`}
          >
            Post all
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute bottom-24 left-12 z-10 h-96 w-96 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-[100px]">
          <EmojiPicker onSelect={noop} />
        </div>
      )}
    </div>
  );
};

const MediaEditorPreview: FC<MediaEditorPreviewProps> = ({ variant }) => {
  const isCrop = variant === "crop";
  const isAlt = variant === "alt";
  const isWarning = variant === "warning";

  return (
    <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[110px]">
      <div className="flex items-center justify-between border-b border-[#181B22] px-6 py-4">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-[#E7E9EA] opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <span className="text-sm font-semibold text-[#808283]">Crop media</span>
        <button
          type="button"
          className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-5 py-2 text-sm font-semibold text-white"
        >
          Save
        </button>
      </div>

      <div className="flex items-center justify-center gap-6 border-b border-[#181B22] px-6 py-3">
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isCrop
              ? "bg-[#1D9BF0]/20 text-[#1D9BF0]"
              : "text-[#E7E9EA] hover:bg-white/10"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 3V17C6 18.1046 6.89543 19 8 19H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M3 6H17C18.1046 6 19 6.89543 19 8V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Crop
        </button>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isAlt
              ? "bg-[#A06AFF]/20 text-[#A06AFF]"
              : "text-[#E7E9EA] hover:bg-white/10"
          }`}
        >
          ALT
        </button>
        <button
          type="button"
          className={`flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isWarning
              ? "bg-[#F97316]/20 text-[#F97316]"
              : "text-[#E7E9EA] hover:bg-white/10"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M3 2h18.61l-3.5 7 3.5 7H5v6H3V2zm2 12h13.38l-2.5-5 2.5-5H5v10z" />
          </svg>
        </button>
      </div>

      <div className="space-y-6 p-6">
        {isCrop && (
          <>
            <div className="relative flex h-[420px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-[#1D9BF0] bg-black">
              <img
                src={sampleMediaPortrait.url}
                alt="Crop preview"
                className="pointer-events-none absolute left-1/2 top-1/2 h-auto w-[140%] -translate-x-1/2 -translate-y-1/2 rotate-[2deg] scale-105"
              />
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="border border-white/10" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Aspect ratio: original"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:bg-[rgba(255,255,255,0.18)] focus-visible:text-white focus-visible:backdrop-blur-sm focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M3 7.5C3 6.119 4.119 5 5.5 5h13C19.881 5 21 6.119 21 7.5v9c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 19 3 17.881 3 16.5v-9zM5.5 7c-.276 0-.5.224-.5.5v9c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-9c0-.276-.224-.5-.5-.5h-13z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Aspect ratio: portrait"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:bg-[rgba(255,255,255,0.18)] focus-visible:text-white focus-visible:backdrop-blur-sm focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M3 9.5C3 8.119 4.119 7 5.5 7h13C19.881 7 21 8.119 21 9.5v5c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 17 3 15.881 3 14.5v-5zM5.5 9c-.276 0-.5.224-.5.5v5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-5c0-.276-.224-.5-.5-.5h-13z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Aspect ratio: landscape"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:bg-[rgba(255,255,255,0.18)] focus-visible:text-white focus-visible:backdrop-blur-sm focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="currentColor"
                  >
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v13c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-13c0-.276-.224-.5-.5-.5h-13z" />
                  </svg>
                </button>
              </div>
              <div className="h-6 w-px bg-[#2F3336]" />
              <div className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  aria-label="Adjust"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:bg-[rgba(255,255,255,0.18)] focus-visible:text-white focus-visible:backdrop-blur-sm focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M11 4c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.93 0 3.68-.78 4.95-2.05C17.21 14.68 18 12.93 18 11c0-3.87-3.14-7-7-7zm-9 7c0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.12-.74 4.08-1.97 5.62l3.68 3.67-1.42 1.42-3.67-3.68C15.08 19.26 13.12 20 11 20c-4.97 0-9-4.03-9-9zm12.5 1h-7v-2h7v2z" />
                  </svg>
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={70}
                  readOnly
                  className="h-1 flex-1 cursor-default accent-[#1D9BF0]"
                />
                <button
                  type="button"
                  aria-label="Zoom in"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#71767B] transition-all duration-200 hover:bg-[rgba(255,255,255,0.18)] hover:text-white hover:backdrop-blur-sm focus-visible:bg-[rgba(255,255,255,0.18)] focus-visible:text-white focus-visible:backdrop-blur-sm focus-visible:outline-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="currentColor"
                  >
                    <path d="M11 4c-3.87 0-7 3.13-7 7s3.13 7 7 7c1.93 0 3.68-.78 4.95-2.05C17.21 14.68 18 12.93 18 11c0-3.87-3.14-7-7-7zm-9 7c0-4.97 4.03-9 9-9s9 4.03 9 9c0 2.12-.74 4.08-1.97 5.62l3.68 3.67-1.42 1.42-3.67-3.68C15.08 19.26 13.12 20 11 20c-4.97 0-9-4.03-9-9zm8-1V7.5h2V10h2.5v2H12v2.5h-2V12H7.5v-2H10z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}

        {isWarning && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#181B22] bg-[#0C1014] p-4 text-sm text-[#E7E9EA]">
              Let people know what to expect before they view this media.
            </div>
            <div className="space-y-3">
              {[
                { id: "violence", label: "Violence" },
                { id: "graphic", label: "Graphic content" },
                { id: "sensitive", label: "Other sensitive" },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 rounded-2xl border border-[#181B22] bg-[#0C1014] p-4 text-sm ${
                    option.id === "graphic" ? "border-[#A06AFF]" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-[#181B22] text-[#A06AFF]"
                    defaultChecked={option.id === "graphic"}
                    disabled
                  />
                  <span className="text-[#E7E9EA]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CodeBlockModalPreview: FC = () => (
  <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[110px]">
    <div className="flex items-center justify-between border-b border-[#181B22] px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#482090]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-white">Insert Code Block</h2>
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>

    <div className="space-y-4 p-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#E7E9EA]">
          Language
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-4 py-3 pr-10 text-sm text-white outline-none"
            defaultValue="typescript"
            disabled
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="#A06AFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-[#E7E9EA]">
          Code
        </label>
        <textarea
          className="h-64 w-full resize-none rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 font-mono text-sm text-[#E7E9EA] outline-none"
          defaultValue={codeSample.code}
          readOnly
        />
      </div>
    </div>

    <div className="flex items-center justify-end gap-3 border-t border-[#181B22] px-6 py-4">
      <button
        type="button"
        className="rounded-full border border-[#181B22] px-5 py-2 text-sm font-semibold text-[#E7E9EA]"
      >
        Cancel
      </button>
      <button
        type="button"
        className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-5 py-2 text-sm font-semibold text-white"
      >
        Insert Code
      </button>
    </div>
  </div>
);

const DraftsListPreview: FC = () => (
  <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-[110px]">
    <div className="flex items-center justify-between border-b border-[#181B22] px-5 py-4">
      <h2 className="text-lg font-bold text-white">Drafts</h2>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>

    <div className="max-h-[60vh] space-y-3 overflow-y-auto p-5 scrollbar">
      {draftsPreview.map((draft) => (
        <div
          key={draft.id}
          className="rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 backdrop-blur-[60px]"
        >
          <div className="mb-2 flex items-start justify-between gap-3">
            <p className="flex-1 text-sm text-[#E7E9EA] line-clamp-2">
              {draft.text}
            </p>
            {draft.blocksCount > 1 && (
              <span className="rounded-full bg-[#A06AFF]/20 px-2 py-0.5 text-xs font-semibold text-[#A06AFF]">
                Thread ({draft.blocksCount})
              </span>
            )}
          </div>
          <div className="mb-3 text-xs text-[#808283]">{draft.updatedAt}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-1.5 text-xs font-semibold text-white"
            >
              Open
            </button>
            <button
              type="button"
              className="rounded-full border border-[#181B22] px-4 py-1.5 text-xs font-semibold text-[#EF454A]"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ComposerShowcase: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [topMenuActive, setTopMenuActive] = useState<"foryou" | "following">(
    "foryou",
  );

  // Open composer modal when other parts of the app dispatch the 'open-composer' event
  useEffect(() => {
    const handler = () => setIsModalOpen(true);
    window.addEventListener("open-composer", handler as EventListener);
    return () =>
      window.removeEventListener("open-composer", handler as EventListener);
  }, []);

  // Shared composer state between page empty state and modal
  const [sharedBlocks, setSharedBlocks] = useState<StaticBlock[]>([
    { id: "empty", text: "", media: [], codeBlocks: [] },
  ]);
  const [sharedReply, setSharedReply] = useState<ReplyPolicy>("everyone");
  const [sharedSentiment, setSharedSentiment] = useState<
    "bullish" | "bearish" | null
  >(null);

  return (
    <div className="min-h-screen py-12 px-6">
      <CreatePostModal
        isOpen={isModalOpen}
        initialBlocks={sharedBlocks.map((b) => ({
          ...b,
          codeBlocks: b.codeBlocks ?? [],
        }))}
        initialReplySetting={sharedReply}
        initialSentiment={sharedSentiment}
        onBlocksChange={(newBlocks) => {
          setSharedBlocks(
            newBlocks.map((b) => ({
              id: b.id,
              text: b.text,
              media: b.media,
              codeBlocks: b.codeBlocks,
            })),
          );
        }}
        onClose={(newBlocks) => {
          // update shared state when modal closes (newBlocks may be undefined)
          if (newBlocks) {
            setSharedBlocks(
              newBlocks.map((b) => ({
                id: b.id,
                text: b.text,
                media: b.media,
                codeBlocks: b.codeBlocks,
              })),
            );
          }
          setIsModalOpen(false);
        }}
      />
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Top social-style menu (moved from /social/home) */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-1">
            {(["foryou", "following"] as const).map((value) => {
              const isActive = topMenuActive === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTopMenuActive(value)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                      : "text-[#B0B0B0] hover:text-white"
                  }`}
                >
                  <span>{value === "foryou" ? "For you" : "Following"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-[720px]">
          <CreatePostVariants />
        </div>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <header>
              <h2 className="text-2xl font-semibold text-white">
                Основ��ое окно композера
              </h2>
              <p className="text-sm text-[#808283]">
                Вариации с ����кстом, медиа, код-блоками и тредами, доступн��е
                для точечной стилизации.
              </p>
            </header>

            <div>
              <button
                type="button"
                onClick={() => setIsModalOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.6)] px-3 py-2 text-sm font-semibold text-white hover:bg-[rgba(160,106,255,0.12)] transition"
              >
                {isModalOpen ? "Close Composer" : "Open Composer"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ShowcaseCard
              title="Empty state"
              description="Пустое окно по умолчан��ю."
            >
              <StaticComposerWindow
                blocks={sharedBlocks}
                replyPolicy={sharedReply}
                sentiment={sharedSentiment}
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Text + media"
              description="Пост с текстом и одним влож��нием."
            >
              <StaticComposerWindow
                blocks={[
                  {
                    id: "media",
                    text: "Launching our new analytics dashboard today — here is a first look!",
                    media: [sampleMediaPrimary],
                    codeBlocks: [],
                  },
                ]}
                replyPolicy="following"
                sentiment="bullish"
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Gallery"
              description="Не��колько изображений и ALT подписи."
            >
              <StaticComposerWindow
                blocks={[
                  {
                    id: "gallery",
                    text: "Four charts I monitor before the U.S. open. Which one do you watch?",
                    media: [
                      sampleMediaPrimary,
                      sampleMediaCharts,
                      sampleMediaPortrait,
                      sampleMediaWarning,
                    ],
                    codeBlocks: [],
                  },
                ]}
                replyPolicy="everyone"
                sentiment="bearish"
                showEmojiPicker
              />
            </ShowcaseCard>

            <ShowcaseCard
              title="Thread + code"
              description="Тред из нескольких блоков и вставкой кода."
            >
              <StaticComposerWindow
                blocks={threadBlocks}
                replyPolicy="verified"
                sentiment="bullish"
              />
            </ShowcaseCard>
          </div>
        </section>

        <section className="space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-white">
              Редактор медиа
            </h2>
            <p className="text-sm text-[#808283]">
              Статичные экземпляры вкладок Crop, ALT и Content warning.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <ShowcaseCard
              title="Crop"
              description="Вкладка обрезки с активными пресетами."
            >
              <MediaEditorPreview variant="crop" />
            </ShowcaseCard>
            <ShowcaseCard
              title="ALT"
              description="Р��дактирован��е ALT-текста для доступности."
            >
              <MediaEditorPreview variant="alt" />
            </ShowcaseCard>
            <ShowcaseCard
              title="Content warning"
              description="Список предупреждений по кон��енту."
            >
              <MediaEditorPreview variant="warning" />
            </ShowcaseCard>
          </div>
        </section>

        <section className="space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-white">
              Всп��могательные окна
            </h2>
            <p className="text-sm text-[#808283]">
              Окна выб��ра эмодзи, ��ста��ки кода и управления черновиками.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6">
            <ShowcaseCard
              title="Emoji picker"
              description="Категории эм��дзи с поиском."
            >
              <div className="mx-auto h-96 w-96 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] p-4 backdrop-blur-[100px]">
                <EmojiPicker onSelect={noop} />
              </div>
            </ShowcaseCard>
            <ShowcaseCard
              title="Code block modal"
              description="Фор��а добав����ения блока с к����ом."
            >
              <CodeBlockModalPreview />
            </ShowcaseCard>
            <ShowcaseCard
              title="Drafts list"
              description="Спис��к сохранённых черновиков."
            >
              <DraftsListPreview />
            </ShowcaseCard>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ComposerShowcase;
