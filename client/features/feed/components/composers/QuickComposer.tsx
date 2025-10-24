import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { MediaGrid } from "@/components/CreatePostBox/MediaGrid";
import { useSimpleComposer } from "@/components/CreatePostBox/useSimpleComposer";
import type { ComposerData } from "../../types";
import type { MediaItem } from "@/components/CreatePostBox/types";
import { ComposerMetadata, ComposerToolbar, ComposerFooter, AccessTypeModal } from "./shared";
import { createStatus, uploadMedia } from "@/services/api/gotosocial";
import { useToast } from "@/hooks/use-toast";

type Props = { 
  onExpand: (data: Partial<ComposerData>) => void;
  onPostCreated?: () => void;
};

export default function QuickComposer({ onExpand, onPostCreated }: Props) {
  const { toast } = useToast();
  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [replyMenuPosition, setReplyMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
    text, media, codeBlocks, sentiment, replySetting, accessType, postPrice,
    postMarket, postCategory, postSymbol, postTimeframe, postRisk,
    charRatio, remainingChars, isNearLimit, isOverLimit, canPost,
    updateText, addMedia, removeMedia, replaceMedia, reorderMedia,
    setSentiment, setReplySetting, setAccessType, setPostPrice,
    setPostMarket, setPostCategory, setPostSymbol, setPostTimeframe, setPostRisk,
    insertEmoji, insertCodeBlock, removeCodeBlock, reset,
  } = useSimpleComposer();

  const MAX_CHARS = 300;

  const replyOptions = [
    { id: "everyone" as const, label: "Everyone", description: "Anyone can reply." },
    { id: "following" as const, label: "Accounts you follow", description: "Only people you follow can reply." },
    { id: "verified" as const, label: "Verified accounts", description: "Only verified users can reply." },
    { id: "mentioned" as const, label: "Only accounts you mention", description: "Only people you mention can reply." }
  ];

  const replySummary = replyOptions.find(opt => opt.id === replySetting)?.label || "Everyone";

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
    insertEmoji(emoji);
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  const handleCloseEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEmojiPickerOpen && emojiPickerRef.current && emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)) {
        handleCloseEmojiPicker();
      }
    };
    if (isEmojiPickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
      return () => window.removeEventListener("scroll", handleScroll, true);
    }
  }, [isEmojiPickerOpen]);

  const handleCodeBlockInsert = (code: string, language: string) => {
    insertCodeBlock(code, language);
    setIsCodeBlockOpen(false);
  };

  const handleBoldToggle = () => {
    const boldText = `**${text}**`;
    updateText(boldText);
    setIsBoldActive(!isBoldActive);
  };

  useEffect(() => {
    const mTicker = text.match(/\$[A-Z]{2,5}/);
    const mTf = text.match(/\b(15m|1h|4h|1d|1w)\b/i);
    const mDir = text.match(/\b(long|short)\b/i);
    if (mTicker && mTf && mDir && !sentiment) {
      const s = mDir[0].toLowerCase() === "long" ? "bullish" : "bearish";
      setSentiment(s);
    }
  }, [text, sentiment, setSentiment]);

  const handlePost = async () => {
    if (!canPost || isPosting) return;
    setIsPosting(true);

    try {
      const mediaIds: string[] = [];
      for (const mediaItem of media) {
        if (mediaItem.file) {
          const uploaded = await uploadMedia(mediaItem.file, { description: mediaItem.alt });
          mediaIds.push(uploaded.id);
        }
      }

      const visibilityMap: Record<typeof replySetting, 'public' | 'unlisted' | 'private' | 'direct'> = {
        everyone: 'public',
        following: 'unlisted',
        verified: 'public',
        mentioned: 'direct',
      };

      // Note: custom_metadata requires GoToSocial customization
      // See GOTOSOCIAL_SIMPLE_METADATA_GUIDE.md for implementation
      const statusData: any = {
        status: text,
        media_ids: mediaIds,
        visibility: visibilityMap[replySetting],
        sensitive: false,
      };

      // Only add custom_metadata if at least one field is set
      if (postCategory || postMarket || postSymbol || sentiment) {
        statusData.custom_metadata = {
          post_type: postCategory.toLowerCase(),
          market: postMarket.toLowerCase(),
          category: postCategory.toLowerCase(),
          ticker: postSymbol,
          sentiment: sentiment || 'neutral',
          timeframe: postTimeframe,
          risk: postRisk.toLowerCase(),
          access_level: accessType,
          ...(accessType === 'pay-per-post' && { price: postPrice }),
        };
      }

      await createStatus(statusData);

      toast({ title: "Post created!", description: "Your post has been published successfully." });
      reset();
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Post failed",
        description: error instanceof Error ? error.message : "Failed to publish post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

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
          onChange={e => updateText(e.target.value)}
          maxLength={MAX_CHARS}
          className="!min-h-[24px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0 !px-3 !py-2"
          disabled={isPosting}
        />

        {media.length > 0 && (
          <MediaGrid
            media={media}
            onEdit={m => setEditingMedia(m)}
            onRemove={mediaId => removeMedia(mediaId)}
            onReorder={(from, to) => reorderMedia(from, to)}
            readOnly={isPosting}
          />
        )}

        {codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {codeBlocks.map((cb) => (
              <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all">
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                  </div>
                  <button type="button" onClick={() => removeCodeBlock(cb.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]" aria-label="Remove code block" disabled={isPosting}>
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
              <button ref={replyButtonRef} type="button" onClick={handleReplyButtonClick} className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10" disabled={isPosting}>
                <span className="-ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#1D9BF0]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-xs">{replySummary}</span>
              </button>
            )}
          </div>
        </div>

        <ComposerMetadata
          visible={text.length > 0}
          market={postMarket}
          category={postCategory}
          symbol={postSymbol}
          timeframe={postTimeframe}
          risk={postRisk}
          onMarketChange={setPostMarket}
          onCategoryChange={setPostCategory}
          onSymbolChange={setPostSymbol}
          onTimeframeChange={setPostTimeframe}
          onRiskChange={setPostRisk}
        />

        <div className="mt-3 flex items-center justify-between">
          <ComposerToolbar
            onMediaClick={() => mediaInputRef.current?.click()}
            onDocumentClick={() => documentInputRef.current?.click()}
            onVideoClick={() => videoInputRef.current?.click()}
            onCodeBlockClick={() => setIsCodeBlockOpen(true)}
            onEmojiClick={handleEmojiToggle}
            onBoldClick={handleBoldToggle}
            isBoldActive={isBoldActive}
            sentiment={sentiment}
            onSentimentChange={setSentiment}
            accessType={accessType}
            onAccessTypeClick={() => setIsAccessModalOpen(true)}
            postPrice={postPrice}
            disabled={isPosting}
          />

          <ComposerFooter
            charRatio={charRatio}
            remainingChars={remainingChars}
            isNearLimit={isNearLimit}
            isOverLimit={isOverLimit}
            canPost={canPost && !isPosting}
            onPost={handlePost}
            isPosting={isPosting}
          />
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

        {isEmojiPickerOpen && emojiPickerPosition && createPortal(
          <div ref={emojiPickerRef} className="fixed z-[2300] h-[45vh] sm:h-64 w-[65vw] sm:w-80 max-w-[320px] rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black p-3 sm:p-4 shadow-2xl backdrop-blur-[100px]" style={{ top: `${emojiPickerPosition.top}px`, left: `${emojiPickerPosition.left}px` }} onClick={e => e.stopPropagation()}>
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>,
          document.body
        )}

        <CodeBlockModal isOpen={isCodeBlockOpen} onClose={() => setIsCodeBlockOpen(false)} onInsert={handleCodeBlockInsert} />
        {editingMedia && <MediaEditor media={editingMedia} onSave={(updated) => { replaceMedia(updated); setEditingMedia(null); }} onClose={() => setEditingMedia(null)} />}

        <AccessTypeModal
          isOpen={isAccessModalOpen}
          onClose={() => setIsAccessModalOpen(false)}
          currentAccessType={accessType}
          currentPrice={postPrice}
          onSave={(newAccessType, newPrice) => {
            setAccessType(newAccessType);
            setPostPrice(newPrice);
          }}
        />

        <input ref={mediaInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
        <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
        <input ref={videoInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
      </div>
    </div>
  );
}
