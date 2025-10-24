import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Code, X, ChevronDown, Newspaper, GraduationCap, BarChart3, Brain, Code2, Video, TrendingUp, MessageCircle } from "lucide-react";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { MediaGrid } from "@/components/CreatePostBox/MediaGrid";
import { useAdvancedComposer } from "@/components/CreatePostBox/useAdvancedComposer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ComposerData, DirectionType, TimeframeType } from "../../types";
import type { MediaItem } from "@/components/CreatePostBox/types";

type Props = { onExpand: (data: Partial<ComposerData>) => void };

export default function QuickComposer({ onExpand }: Props) {
  const [sentiment, setSentiment] = useState<"bullish" | "bearish" | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [replySetting, setReplySetting] = useState<"everyone" | "following" | "verified" | "mentioned">("everyone");
  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [replyMenuPosition, setReplyMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);

  // Post metadata for filtering
  const [postMarket, setPostMarket] = useState<string>('Crypto');
  const [postCategory, setPostCategory] = useState<string>('General');
  const [postSymbol, setPostSymbol] = useState<string>('');
  const [postTimeframe, setPostTimeframe] = useState<string>('');
  const [postRisk, setPostRisk] = useState<string>('');

  // Category configuration with icons and colors (aligned with feed tabs)
  const categoryConfig = {
    'Signal': { icon: TrendingUp, color: '#2EBD85', bg: 'bg-[#2EBD85]/15' },
    'News': { icon: Newspaper, color: '#4D7CFF', bg: 'bg-[#4D7CFF]/15' },
    'Education': { icon: GraduationCap, color: '#F78DA7', bg: 'bg-[#F78DA7]/15' },
    'Analysis': { icon: BarChart3, color: '#A06AFF', bg: 'bg-[#A06AFF]/15' },
    'Macro': { icon: Brain, color: '#FFD166', bg: 'bg-[#FFD166]/15' },
    'Code': { icon: Code2, color: '#64B5F6', bg: 'bg-[#64B5F6]/15' },
    'Video': { icon: Video, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
    'General': { icon: MessageCircle, color: '#9CA3AF', bg: 'bg-[#9CA3AF]/15' },
  };

  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
    blocks,
    activeBlockId,
    addMedia,
    insertCodeBlock,
    removeCodeBlock,
    updateBlockText,
    addBlock,
    deleteBlock,
    removeMedia,
    reorderMedia
  } = useAdvancedComposer();

  const MAX_CHARS = 300;
  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];
  const text = activeBlock?.text || "";
  const charRatio = Math.min(text.length / MAX_CHARS, 1);
  const remainingChars = MAX_CHARS - text.length;
  const isNearLimit = remainingChars < 20 && remainingChars >= 0;
  const isOverLimit = remainingChars < 0;
  const circumference = 88;
  const dashOffset = circumference - charRatio * circumference;
  const canAddBlock = blocks.length < 10 && text.trim().length > 0;

  const replyOptions = [
    { id: "everyone" as const, label: "Everyone", description: "Anyone can reply." },
    { id: "following" as const, label: "Accounts you follow", description: "Only people you follow can reply." },
    { id: "verified" as const, label: "Verified accounts", description: "Only verified users can reply." },
    { id: "mentioned" as const, label: "Only accounts you mention", description: "Only people you mention can reply." }
  ];

  const replySummary = replyOptions.find(opt => opt.id === replySetting)?.label || "Everyone";

  const openMediaPicker = () => mediaInputRef.current?.click();

  const handleAddBlock = () => {
    addBlock();
  };

  const handleReplyButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setReplyMenuPosition({ top: rect.top - 10, left: rect.left });
    setIsReplyMenuOpen(prev => !prev);
  };

  const handleEmojiToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isEmojiPickerOpen) {
      const rect = event.currentTarget.getBoundingClientRect();
      setEmojiPickerPosition({ top: rect.bottom + 10, left: rect.left });
    }
    setIsEmojiPickerOpen(prev => !prev);
  };

  const handleEmojiSelect = (emoji: string) => {
    const id = activeBlockId ?? blocks[0]?.id;
    if (!id) return;
    const b = blocks.find(x => x.id === id);
    if (!b || b.text.length + emoji.length > MAX_CHARS) return;
    updateBlockText(id, b.text + emoji);
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  const handleCloseEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEmojiPickerOpen &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        handleCloseEmojiPicker();
      }
    };

    if (isEmojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isEmojiPickerOpen]);

  useEffect(() => {
    const handleScroll = () => {
      if (isEmojiPickerOpen && emojiButtonRef.current) {
        const rect = emojiButtonRef.current.getBoundingClientRect();
        setEmojiPickerPosition({ top: rect.bottom + 10, left: rect.left });
      }
    };

    if (isEmojiPickerOpen) {
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isEmojiPickerOpen]);

  const handleCodeBlockInsert = (code: string, language: string) => {
    const id = activeBlockId ?? blocks[0]?.id;
    if (!id) return;
    insertCodeBlock(id, code, language);
    setIsCodeBlockOpen(false);
  };

  const handleBoldToggle = () => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (!blockId) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const boldText = `**${block.text}**`;
    updateBlockText(blockId, boldText);
    setIsBoldActive(!isBoldActive);
  };

  useEffect(() => {
    const mTicker = text.match(/\$[A-Z]{2,5}/);
    const mTf = text.match(/\b(15m|1h|4h|1d|1w)\b/i);
    const mDir = text.match(/\b(long|short)\b/i);
    if (mTicker && mTf && mDir && !sentiment) {
      const s = mDir[0].toLowerCase() === "long" ? "bullish" : "bearish";
      setSentiment(s);
      onExpand({
        text: blocks[0]?.text || text,
        sentiment: s as any,
        ticker: mTicker[0],
        timeframe: mTf[0].toLowerCase() as TimeframeType,
        direction: mDir[0].toLowerCase() as DirectionType
      });
    }
  }, [text, sentiment, onExpand, blocks]);

  useEffect(() => {
    const MEDIA_LIMIT = 4;
    const mlen = activeBlock?.media?.length ?? 0;
    if (isPaid || sentiment || mlen > MEDIA_LIMIT) {
      onExpand({
        text: blocks[0]?.text || text,
        isPaid,
        sentiment,
        accessType: isPaid ? "pay-per-post" : "free"
      });
    }
  }, [isPaid, sentiment, activeBlock, blocks, text, onExpand]);

  return (
    <div className="flex gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>

      <div className="flex-1 mb-[-1px]">
        <Textarea
          placeholder="Share your trading ideas, signals, or analysis... ($TICKER, #tags, @mentions)"
          value={text}
          onChange={e => {
            const id = activeBlockId ?? blocks[0]?.id;
            if (id && e.target.value.length <= MAX_CHARS) {
              updateBlockText(id, e.target.value);
            }
          }}
          maxLength={MAX_CHARS}
          className="!min-h-[24px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0 !px-3 !py-2"
        />

        {activeBlock?.media && activeBlock.media.length > 0 && (
          <MediaGrid
            media={activeBlock.media}
            onEdit={m => setEditingMedia(m)}
            onRemove={mediaId => {
              const id = activeBlockId ?? blocks[0]?.id;
              if (id) removeMedia(id, mediaId);
            }}
            onReorder={(from, to) => {
              const id = activeBlockId ?? blocks[0]?.id;
              if (id) reorderMedia(id, from, to);
            }}
            readOnly={false}
          />
        )}

        {activeBlock?.codeBlocks && activeBlock.codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {activeBlock.codeBlocks.map((cb: any) => (
              <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all">
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#9F7AEA]" />
                    <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id = activeBlockId ?? blocks[0]?.id;
                      if (id) removeCodeBlock(id, cb.id);
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]"
                    aria-label="Remove code block"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs text-[#D4B5FD] overflow-x-auto max-h-40 font-mono bg-[#05030A]">
                  <code>{cb.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            {text.length > 0 && (
              <button
                ref={replyButtonRef}
                type="button"
                onClick={handleReplyButtonClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10"
              >
                <span className="-ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#1D9BF0]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 2v1.5M12 20.5V22M4.5 12H2M22 12h-2.5M7.05 4.05l1.06 1.06M15.89 17.95l1.06 1.06M5.56 18.44l1.06-1.06M17.38 6.62l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8.75 17.5 8 14l-1-3-2.2-1.27" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m17 14-.5-3-1-3 2.5-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-xs">{replySummary}</span>
              </button>
            )}
          </div>
        </div>

        {/* Post Metadata Selectors */}
        {text.length > 0 && (
          <div className="mt-3 border-t border-[#1B1F27] pt-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {/* Market Selector */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Market <span className="text-[#EF454A]">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                    >
                      <span className="truncate">{postMarket}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-40 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['Crypto', 'Stocks', 'Forex', 'Commodities', 'Indices'].map((market) => (
                        <button
                          key={market}
                          type="button"
                          onClick={() => setPostMarket(market)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postMarket === market
                              ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                              : "text-[#D5D8E1] hover:bg-white/5"
                          )}
                        >
                          {market}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Selector */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Category <span className="text-[#EF454A]">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        {(() => {
                          const config = categoryConfig[postCategory as keyof typeof categoryConfig];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: config.color }} />
                              <span className="truncate">{postCategory}</span>
                            </>
                          );
                        })()}
                      </span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-48 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {Object.keys(categoryConfig).map((category) => {
                        const config = categoryConfig[category as keyof typeof categoryConfig];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setPostCategory(category)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                              postCategory === category
                                ? `${config.bg} font-semibold`
                                : "text-[#D5D8E1] hover:bg-white/5"
                            )}
                          >
                            <span className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded",
                              postCategory === category ? config.bg : "bg-[#2F3336]"
                            )}>
                              <Icon className="h-3 w-3" style={{ color: config.color }} />
                            </span>
                            <span style={{ color: postCategory === category ? config.color : undefined }}>
                              {category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Symbol Input */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Symbol
                </label>
                <input
                  type="text"
                  value={postSymbol}
                  onChange={(e) => setPostSymbol(e.target.value.toUpperCase())}
                  placeholder="BTC, ETH..."
                  className="flex h-8 w-full rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] placeholder:text-[#6B7280] transition-colors hover:border-[#A06AFF]/50 focus:border-[#A06AFF] focus:outline-none"
                  maxLength={10}
                />
              </div>

              {/* Timeframe Selector */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Timeframe
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                    >
                      <span className="truncate">{postTimeframe || 'None'}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['', '15m', '1h', '4h', '1d', '1w'].map((tf) => (
                        <button
                          key={tf || 'none'}
                          type="button"
                          onClick={() => setPostTimeframe(tf)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postTimeframe === tf
                              ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                              : "text-[#D5D8E1] hover:bg-white/5"
                          )}
                        >
                          {tf || 'None'}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Risk Level */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Risk
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                    >
                      <span className="truncate">{postRisk || 'None'}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['', 'Low', 'Medium', 'High'].map((risk) => (
                        <button
                          key={risk || 'none'}
                          type="button"
                          onClick={() => setPostRisk(risk)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postRisk === risk
                              ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                              : "text-[#D5D8E1] hover:bg-white/5"
                          )}
                        >
                          {risk || 'None'}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button type="button" onClick={openMediaPicker} className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" title="Add photos or images">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6.25 7.5C6.94036 7.5 7.5 6.94036 7.5 6.25C7.5 5.55964 6.94036 5 6.25 5C5.55964 5 5 5.55964 5 6.25C5 6.94036 5.55964 7.5 6.25 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.08301 10C2.08301 6.26809 2.08301 4.40212 3.24237 3.24274C4.40175 2.08337 6.26772 2.08337 9.99967 2.08337C13.7316 2.08337 15.5976 2.08337 16.757 3.24274C17.9163 4.40212 17.9163 6.26809 17.9163 10C17.9163 13.732 17.9163 15.598 16.757 16.7574C15.5976 17.9167 13.7316 17.9167 9.99967 17.9167C6.26772 17.9167 4.40175 17.9167 3.24237 16.7574C2.08301 15.598 2.08301 13.732 2.08301 10Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4.16699 17.5C7.81071 13.1458 11.8954 7.40334 17.9149 11.2853" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button type="button" onClick={() => documentInputRef.current?.click()} className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" title="Add documents (PDF, DOCX, PPTX, etc.)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14.5 5H12.5C9.67157 5 8.25736 5 7.37868 5.87868C6.5 6.75736 6.5 8.17157 6.5 11V16C6.5 18.8284 6.5 20.2426 7.37868 21.1213C8.25736 22 9.67157 22 12.5 22H13.8431C14.6606 22 15.0694 22 15.4369 21.8478C15.8045 21.6955 16.0935 21.4065 16.6716 20.8284L19.3284 18.1716C19.9065 17.5935 20.1955 17.3045 20.3478 16.9369C20.5 16.5694 20.5 16.1606 20.5 15.3431V11C20.5 8.17157 20.5 6.75736 19.6213 5.87868C18.7426 5 17.3284 5 14.5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 21.5V20.5C15 18.6144 15 17.6716 15.5858 17.0858C16.1716 16.5 17.1144 16.5 19 16.5H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6.5 19C4.84315 19 3.5 17.6569 3.5 16V8C3.5 5.17157 3.5 3.75736 4.37868 2.87868C5.25736 2 6.67157 2 9.5 2H14.5004C16.1572 2.00001 17.5004 3.34319 17.5004 5.00003" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.0011 13H14.0011M10.0011 9H17.0011" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" onClick={() => videoInputRef.current?.click()} className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]" title="Add videos (MP4, WebM, MOV, etc.)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button type="button" onClick={() => setIsCodeBlockOpen(true)} className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

            <button ref={emojiButtonRef} type="button" onClick={handleEmojiToggle} className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF] relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z" fill="currentColor" />
              </svg>
            </button>

            <button type="button" onClick={handleBoldToggle} className={cn("flex h-8 items-center justify-center gap-1.5 transition-colors", isBoldActive ? "text-[#A06AFF]" : "text-[#6C7280] hover:text-[#A06AFF]")} aria-label="Bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15.636 11.671c2.079-.583 3.093-2.18 3.093-3.929 0-2.307-1.471-4.741-5.983-4.741H5.623V21h7.579c4.411 0 6.008-2.484 6.008-4.994 0-2.383-1.343-3.955-3.574-4.335zm-3.295-6.287c2.535 0 3.27 1.319 3.27 2.662 0 1.242-.583 2.611-3.27 2.611H8.69V5.384h3.651zM8.69 18.617v-5.628h4.208c2.231 0 3.194 1.166 3.194 2.738 0 1.547-.887 2.89-3.397 2.89H8.69z" fill="currentColor" />
              </svg>
            </button>

            <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

            <div className="inline-flex items-center gap-2">
              <button type="button" onClick={() => setSentiment(sentiment === "bullish" ? null : "bullish")} className={cn("flex h-6 items-center gap-1 rounded-full px-2 transition-all", sentiment === "bullish" ? "bg-gradient-to-l from-[#2EBD85] to-[#1A6A4A]" : "bg-transparent")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 8.66665V5.33331H10" stroke={sentiment === "bullish" ? "white" : "#2EBD85"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.3337 5.33331L10.0003 8.66665C9.41193 9.25505 9.11779 9.54918 8.75673 9.58171C8.69699 9.58711 8.63699 9.58711 8.57726 9.58171C8.21619 9.54918 7.92206 9.25505 7.33366 8.66665C6.74526 8.07825 6.45109 7.78411 6.09004 7.75158C6.03035 7.74618 5.9703 7.74618 5.91061 7.75158C5.54956 7.78411 5.25537 8.07825 4.66699 8.66665L2.66699 10.6666" stroke={sentiment === "bullish" ? "white" : "#2EBD85"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className={cn("text-xs font-bold", sentiment === "bullish" ? "text-white" : "text-white")}>Bullish</span>
              </button>

              <div className="h-5 w-px bg-white" />

              <button type="button" onClick={() => setSentiment(sentiment === "bearish" ? null : "bearish")} className={cn("flex h-6 items-center gap-1 rounded-full px-2 transition-all", sentiment === "bearish" ? "bg-gradient-to-l from-[#FF2626] to-[#7F1414]" : "bg-transparent")}>
                <span className={cn("text-xs font-bold", sentiment === "bearish" ? "text-white" : "text-white")}>Bearish</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3333 7.33331V10.6666H10" stroke={sentiment === "bearish" ? "white" : "#EF454A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.3337 10.6666L10.0003 7.33331C9.41193 6.74491 9.11779 6.45075 8.75673 6.41823C8.69699 6.41285 8.63699 6.41285 8.57726 6.41823C8.21619 6.45075 7.92206 6.74491 7.33366 7.33331C6.74526 7.92171 6.45109 8.21585 6.09004 8.24838C6.03035 8.25378 5.9703 8.25378 5.91061 8.24838C5.54956 8.21585 5.25537 7.92171 4.66699 7.33331L2.66699 5.33331" stroke={sentiment === "bearish" ? "white" : "#EF454A"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <button type="button" onClick={() => setIsPaid(!isPaid)} className={cn("ml-2 flex h-6 items-center gap-1 rounded-full px-2 transition-all", isPaid ? "bg-gradient-to-l from-[#A06AFF] to-[#6B46C1]" : "bg-transparent border border-[#A06AFF]/40")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={isPaid ? "white" : "#A06AFF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={cn("text-xs font-bold", isPaid ? "text-white" : "text-[#A06AFF]")}>Paid</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className={cn("group relative inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-xs font-semibold transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/40 focus-visible:ring-offset-0", text.length > 0 ? "bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] text-white shadow-[0_20px_44px_-20px_rgba(160,106,255,0.9)] hover:shadow-[0_24px_50px_-18px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98]" : "cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]")} disabled={text.length === 0}>
              {text.length > 0 && (
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0.05)_40%,_rgba(255,255,255,0)_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("transition-transform duration-200", text.length > 0 && "group-hover:translate-x-0.5 group-hover:scale-110")}>
                  <path d="M5 12L4 5L20 12L4 19L5 12ZM5 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline">Post</span>
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="none" stroke="#2F3336" strokeWidth="4" />
                <circle cx="16" cy="16" r="14" fill="none" stroke={isOverLimit ? "#EF454A" : isNearLimit ? "#FFD400" : "#A06AFF"} strokeWidth="4" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-300" />
              </svg>
              <span className={cn("absolute text-sm font-medium tabular-nums", isOverLimit ? "text-[#EF454A]" : isNearLimit ? "text-[#FFD400]" : "text-[#808283]")}>
                {remainingChars < 20 ? remainingChars : ""}
              </span>
            </div>
          </div>

          {isReplyMenuOpen && replyMenuPosition && createPortal(
            <div className="fixed z-[2300] w-[90vw] sm:w-72 rounded-2xl border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px] p-3" style={{ top: `${replyMenuPosition.top - 200}px`, left: `${replyMenuPosition.left}px` }}>
              <h3 className="mb-2 text-xs font-semibold text-white">Who can reply?</h3>
              <div className="space-y-1.5">
                {replyOptions.map(opt => (
                  <button key={opt.id} onClick={() => { setReplySetting(opt.id); setIsReplyMenuOpen(false); }} className="flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill={replySetting === opt.id ? "#1D9BF0" : "none"} stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      {replySetting === opt.id && <circle cx="12" cy="12" r="4" fill="#1D9BF0" />}
                    </svg>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white">{opt.label}</div>
                      <div className="text-[11px] text-[#808283]">{opt.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </div>

        {isEmojiPickerOpen && emojiPickerPosition && createPortal(
          <div ref={emojiPickerRef} className="fixed z-[2300] h-[45vh] sm:h-64 w-[65vw] sm:w-80 max-w-[320px] rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black p-3 sm:p-4 shadow-2xl backdrop-blur-[100px]" style={{ top: `${emojiPickerPosition.top}px`, left: `${emojiPickerPosition.left}px` }} onClick={e => e.stopPropagation()}>
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>,
          document.body
        )}

        <CodeBlockModal isOpen={isCodeBlockOpen} onClose={() => setIsCodeBlockOpen(false)} onInsert={handleCodeBlockInsert} />
        {editingMedia && <MediaEditor media={editingMedia} onSave={() => setEditingMedia(null)} onClose={() => setEditingMedia(null)} />}

        <input ref={mediaInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { const files = e.target.files; if (!files?.length) return; const id = activeBlockId ?? blocks[0]?.id; if (id) addMedia(id, files); e.currentTarget.value = ""; }} />
        <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => { const files = e.target.files; if (!files?.length) return; const id = activeBlockId ?? blocks[0]?.id; if (id) addMedia(id, files); e.currentTarget.value = ""; }} />
        <input ref={videoInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={e => { const files = e.target.files; if (!files?.length) return; const id = activeBlockId ?? blocks[0]?.id; if (id) addMedia(id, files); e.currentTarget.value = ""; }} />
      </div>
    </div>
  );
}
