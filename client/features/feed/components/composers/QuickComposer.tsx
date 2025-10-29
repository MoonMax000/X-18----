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
import { customBackendAPI } from "@/services/api/custom-backend";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl } from "@/lib/avatar-utils";

type Props = { 
  onExpand: (data: Partial<ComposerData>) => void;
  onPostCreated?: () => void;
};

export default function QuickComposer({ onExpand, onPostCreated }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPosting, setIsPosting] = useState(false);

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

  const handleEmojiToggle = () => {
    if (!isEmojiPickerOpen && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
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

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleBoldToggle = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);
    
    if (selectedText) {
      // Если есть выделенный текст, оборачиваем его
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = `${before}**${selectedText}**${after}`;
      updateText(newText);
      
      // Восстанавливаем позицию курсора после изменения
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, end + 2);
      }, 0);
    } else {
      // Если текста нет, просто вставляем маркеры и помещаем курсор между ними
      const before = text.substring(0, start);
      const after = text.substring(start);
      const newText = `${before}****${after}`;
      updateText(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
    
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
      const mediaIdMap: Map<string, string> = new Map(); // local id -> server id
      
      // Upload media files first
      for (const mediaItem of media) {
        if (mediaItem.file) {
          const uploaded = await customBackendAPI.uploadMedia(mediaItem.file);
          mediaIds.push(uploaded.id);
          mediaIdMap.set(mediaItem.id, uploaded.id);
        }
      }

      // Collect media transforms (crop data)
      const mediaTransforms: Record<string, { x: number; y: number; w: number; h: number; src_w: number; src_h: number }> = {};
      
      for (const mediaItem of media) {
        if (mediaItem.transform?.cropRect) {
          const serverId = mediaIdMap.get(mediaItem.id);
          if (serverId) {
            // Need to get original image dimensions
            // Create a temporary image to get natural dimensions
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Failed to load image'));
              img.src = mediaItem.url;
            });

            const cropRect = mediaItem.transform.cropRect;
            mediaTransforms[serverId] = {
              x: cropRect.x,
              y: cropRect.y,
              w: cropRect.w,
              h: cropRect.h,
              src_w: img.naturalWidth,
              src_h: img.naturalHeight,
            };
          }
        }
      }

      const visibilityMap: Record<typeof replySetting, 'public' | 'followers' | 'private'> = {
        everyone: 'public',
        following: 'followers',
        verified: 'public',
        mentioned: 'private',
      };

      // Build metadata object for custom backend
      const metadata: Record<string, any> = {};
      if (postCategory) metadata.category = postCategory;
      if (postMarket) metadata.market = postMarket;
      if (postSymbol) metadata.ticker = postSymbol;
      if (sentiment) metadata.sentiment = sentiment;
      if (postTimeframe) metadata.timeframe = postTimeframe;
      if (postRisk) metadata.risk = postRisk;
      if (accessType) metadata.access_level = accessType;
      if (accessType === 'pay-per-post' && postPrice) metadata.price = postPrice.toString();
      
      // Add code blocks to metadata
      if (codeBlocks.length > 0) {
        metadata.code_blocks = codeBlocks.map(cb => ({
          language: cb.language,
          code: cb.code
        }));
      }

      // Create post using custom backend API
      await customBackendAPI.createPost({
        content: text,
        media_ids: mediaIds.length > 0 ? mediaIds : undefined,
        media_transforms: Object.keys(mediaTransforms).length > 0 ? mediaTransforms : undefined,
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        visibility: visibilityMap[replySetting],
      });

      toast({ 
        title: "Пост создан!", 
        description: "Ваш пост успешно опубликован." 
      });
      
      // Reset all composer state
      reset();
      onPostCreated?.();
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Ошибка публикации",
        description: error instanceof Error ? error.message : "Не удалось опубликовать пост. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const avatarUrl = getAvatarUrl(user);
  const avatarFallback = user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>

      <div className="flex-1 mb-[-1px]">
        <Textarea
          ref={textareaRef}
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
          <div className="mt-3 space-y-2 max-w-full overflow-hidden">
            {codeBlocks.map((cb) => (
              <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all w-full min-w-0">
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                  </div>
                  <button type="button" onClick={() => removeCodeBlock(cb.id)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]" aria-label="Remove code block" disabled={isPosting}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs text-[#D4B5FD] max-h-40 font-mono bg-[#05030A] w-full max-w-full whitespace-pre-wrap break-words overflow-x-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>
                  <code className="block whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>{cb.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}


        <ComposerMetadata
          visible={text.length > 0 || media.length > 0}
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
