import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { MediaGrid } from "@/components/CreatePostBox/MediaGrid";
import AutoGrowTextarea from "@/components/composer/AutoGrowTextarea";
import { useSimpleComposer } from "@/components/CreatePostBox/useSimpleComposer";
import { useIMEAwareHotkeys } from "@/hooks/useIMEAwareHotkeys";
import { usePostValidation } from "@/components/CreatePostBox/usePostValidation";
import { toggleBoldSelection, insertAtCaret } from "@/utils/composerText";
import type { ComposerData } from "../../types";
import type { MediaItem } from "@/components/CreatePostBox/types";
import { ComposerMetadata, ComposerToolbar, ComposerFooter, AccessTypeModal } from "./shared";
import { useToast } from "@/hooks/use-toast";
import { ValidationMessages } from "@/components/composer/ValidationMessage";
import { useAuth } from "@/contexts/AuthContext";
import { customBackendAPI } from "@/services/api/custom-backend";
import { buildPostPayload } from "@/utils/postPayloadBuilder";

type Props = { 
  onExpand: (data: Partial<ComposerData>) => void;
  onPostCreated?: () => void;
};

export default function QuickComposer({ onExpand, onPostCreated }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
    text,
    media,
    codeBlocks,
    sentiment,
    replySetting,
    accessType,
    postPrice,
    postMarket,
    postCategory,
    postSymbol,
    postTimeframe,
    postRisk,
    charRatio,
    remainingChars,
    isNearLimit,
    isOverLimit,
    canPost,
    updateText,
    addMedia,
    removeMedia,
    replaceMedia,
    reorderMedia,
    setSentiment,
    setReplySetting,
    setAccessType,
    setPostPrice,
    setPostMarket,
    setPostCategory,
    setPostSymbol,
    setPostTimeframe,
    setPostRisk,
    insertEmoji,
    insertCodeBlock,
    removeCodeBlock,
    reset,
  } = useSimpleComposer();

  // Используем validation hook
  const validation = usePostValidation({
    text,
    mediaCount: media.length,
    accessType,
    price: postPrice,
    meta: {
      market: postMarket,
      category: postCategory,
      symbol: postSymbol,
      timeframe: postTimeframe,
      risk: postRisk,
    },
  });

  const handleEmojiToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isEmojiPickerOpen) {
      const rect = event.currentTarget.getBoundingClientRect();
      setEmojiPickerPosition({ top: rect.bottom + 10, left: rect.left });
    }
    setIsEmojiPickerOpen(prev => !prev);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const result = insertAtCaret(textareaRef.current, emoji);
      updateText(result.next);
      // Восстанавливаем фокус и позицию курсора
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(result.caret, result.caret);
        }
      }, 0);
    } else {
      insertEmoji(emoji);
    }
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
    insertCodeBlock(code, language);
    setIsCodeBlockOpen(false);
  };

  const handleBoldToggle = () => {
    if (textareaRef.current) {
      const result = toggleBoldSelection(textareaRef.current);
      updateText(result.next);
      setIsBoldActive(!isBoldActive);
      // Восстанавливаем фокус и выделение
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(result.range[0], result.range[1]);
        }
      }, 0);
    }
  };

  // IME-aware keyboard shortcuts
  useIMEAwareHotkeys(
    {
      onModEnter: () => {
        if (validation.canPost && !isPosting) {
          handlePost();
        }
      },
      onModB: handleBoldToggle,
      onEsc: () => {
        if (isEmojiPickerOpen) {
          handleCloseEmojiPicker();
        }
      },
    },
    {
      enabled: !isPosting,
      target: textareaRef.current,
    }
  );

  // Auto-detect sentiment from text patterns
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
    if (!validation.canPost || isPosting) return;

    // Показываем ошибки валидации если есть
    if (validation.violations.length > 0) {
      toast({
        title: "Validation Error",
        description: validation.violations[0],
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);

    try {
      // 1. Загружаем медиа файлы если есть
      const mediaIds: string[] = [];
      for (const mediaItem of media) {
        if (mediaItem.file) {
          const uploadedMedia = await customBackendAPI.uploadMedia(mediaItem.file);
          mediaIds.push(uploadedMedia.id);
        } else if (mediaItem.id) {
          // Уже загружено
          mediaIds.push(mediaItem.id);
        }
      }

      // 2. Строим payload
      const payload = buildPostPayload({
        text,
        mediaIds,
        codeBlocks: codeBlocks.map(cb => ({
          code: cb.code,
          language: cb.language,
        })),
        replySetting,
        sentiment: sentiment || undefined,
        accessType,
        postPrice,
        metadata: {
          market: postMarket,
          category: postCategory,
          symbol: postSymbol,
          timeframe: postTimeframe,
          risk: postRisk,
        },
      });

      // 3. Создаем пост
      const createdPost = await customBackendAPI.createPost(payload);
      
      console.log('Post created successfully:', createdPost);

      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });

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
    <div className="flex gap-3 w-full max-w-full min-w-0">
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={user?.avatar_url || "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87"} />
        <AvatarFallback>{user?.display_name?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
      </Avatar>

      <div className="flex-1 mb-[-1px] min-w-0 max-w-full overflow-hidden">
        <AutoGrowTextarea
          textareaRef={textareaRef}
          placeholder="Share your trading ideas, signals, or analysis... ($TICKER, #tags, @mentions)"
          value={text}
          onChange={e => updateText(e.target.value)}
          className="!min-h-[24px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0 !px-3 !py-2 w-full max-w-full"
          disabled={isPosting}
          minRows={1}
          maxRows={10}
        />

        {media.length > 0 && (
          <div className="mt-3 w-full max-w-full min-w-0">
            <MediaGrid
              media={media}
              onEdit={m => setEditingMedia(m)}
              onRemove={mediaId => removeMedia(mediaId)}
              onReorder={(from, to) => reorderMedia(from, to)}
              readOnly={isPosting}
            />
          </div>
        )}

        {codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2 w-full max-w-full min-w-0">
            {codeBlocks.map((cb) => (
              <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all w-full max-w-full min-w-0">
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCodeBlock(cb.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]"
                    aria-label="Remove code block"
                    disabled={isPosting}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs text-[#D4B5FD] overflow-x-auto max-h-40 font-mono bg-[#05030A] max-w-full">
                  <code className="break-all whitespace-pre-wrap">{cb.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Validation Messages */}
        {validation.violations.length > 0 && (
          <div className="mt-3">
            <ValidationMessages violations={validation.violations} />
          </div>
        )}

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
            onEmojiClick={() => {
              if (emojiButtonRef.current) {
                handleEmojiToggle({ currentTarget: emojiButtonRef.current } as React.MouseEvent<HTMLButtonElement>);
              }
            }}
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
            charRatio={validation.charRatio}
            remainingChars={validation.remaining}
            isNearLimit={validation.isNearLimit}
            isOverLimit={validation.isOverLimit}
            canPost={validation.canPost && !isPosting}
            onPost={handlePost}
            isPosting={isPosting}
          />
        </div>

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
          currentReplyPolicy={replySetting}
          onSave={(newAccessType, newPrice, newReplyPolicy) => {
            setAccessType(newAccessType);
            setPostPrice(newPrice);
            setReplySetting(newReplyPolicy);
          }}
        />

        <input ref={mediaInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
        <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
        <input ref={videoInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} disabled={isPosting} />
      </div>
    </div>
  );
}
