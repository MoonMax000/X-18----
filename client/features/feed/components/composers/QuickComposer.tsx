import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Code, X } from "lucide-react";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { MediaGrid } from "@/components/CreatePostBox/MediaGrid";
import { useAdvancedComposer } from "@/components/CreatePostBox/useAdvancedComposer";
import type { ComposerData, DirectionType, TimeframeType } from "../../types";
import type { MediaItem } from "@/components/CreatePostBox/types";

type Props = { onExpand: (data: Partial<ComposerData>) => void };

export default function QuickComposer({ onExpand }: Props) {
  const [sentiment, setSentiment] = useState<"bullish" | "bearish" | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

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
    removeMedia,
    reorderMedia
  } = useAdvancedComposer();

  const activeBlock = useMemo(() => blocks.find(b => b.id === activeBlockId) ?? blocks[0], [blocks, activeBlockId]);
  const text = activeBlock?.text ?? "";
  const MAX_CHARS = 300;
  const remaining = MAX_CHARS - text.length;

  const openMediaPicker = () => mediaInputRef.current?.click();

  const handleEmojiSelect = (emoji: string) => {
    const id = activeBlockId ?? blocks[0]?.id;
    if (!id) return;
    const b = blocks.find(x => x.id === id);
    if (!b || b.text.length + emoji.length > MAX_CHARS) return;
    updateBlockText(id, b.text + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleCodeBlockInsert = (code: string, language: string) => {
    const id = activeBlockId ?? blocks[0]?.id;
    if (!id) return;
    insertCodeBlock(id, code, language);
    setIsCodeBlockOpen(false);
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

      <div className="flex-1">
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
          className="!min-h-[80px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0"
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
              <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
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
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]"
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
          <div className="flex items-center gap-2">
            <button type="button" onClick={openMediaPicker} className="h-8 text-[#6C7280] hover:text-[#A06AFF]">📷</button>
            <button type="button" onClick={() => documentInputRef.current?.click()} className="h-8 text-[#6C7280] hover:text-[#A06AFF]">📄</button>
            <button type="button" onClick={() => videoInputRef.current?.click()} className="h-8 text-[#6C7280] hover:text-[#A06AFF]">🎬</button>
            <button type="button" onClick={() => setIsCodeBlockOpen(true)} className="h-8 text-[#6C7280] hover:text-[#A06AFF]">{"</>"}</button>
            <button ref={emojiButtonRef} type="button" onClick={() => setIsEmojiPickerOpen(v => !v)} className="h-8 text-[#6C7280] hover:text-[#A06AFF]">😊</button>
            <button
              type="button"
              onClick={() => setIsPaid(v => !v)}
              className={cn("h-6 px-2 rounded-full text-xs font-bold", isPaid ? "bg-gradient-to-l from-[#A06AFF] to-[#6B46C1] text-white" : "border border-[#A06AFF]/40 text-[#A06AFF]")}
            >
              Paid
            </button>
            <button
              type="button"
              onClick={() => setSentiment(s => (s === "bullish" ? null : "bullish"))}
              className={cn("h-6 px-2 rounded-full text-xs font-bold", sentiment === "bullish" ? "bg-emerald-700 text-white" : "text-emerald-400 border border-emerald-600/40")}
            >
              Bullish
            </button>
            <button
              type="button"
              onClick={() => setSentiment(s => (s === "bearish" ? null : "bearish"))}
              className={cn("h-6 px-2 rounded-full text-xs font-bold", sentiment === "bearish" ? "bg-rose-700 text-white" : "text-rose-400 border border-rose-600/40")}
            >
              Bearish
            </button>
          </div>

          <Button
            disabled={text.length === 0}
            className={cn("h-8 rounded-full text-xs font-semibold", text.length ? "bg-gradient-to-r from-[#A06AFF] to-[#482090]" : "bg-[#6C7280]/20 text-[#6C7280] cursor-not-allowed")}
          >
            Post
          </Button>
        </div>

        {isEmojiPickerOpen && (
          <div ref={emojiPickerRef} className="mt-2 w-72 rounded-2xl border border-[#181B22] bg-black p-3 shadow-2xl">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        )}

        <CodeBlockModal isOpen={isCodeBlockOpen} onClose={() => setIsCodeBlockOpen(false)} onInsert={handleCodeBlockInsert} />
        {editingMedia && <MediaEditor media={editingMedia} onSave={() => setEditingMedia(null)} onClose={() => setEditingMedia(null)} />}

        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            const files = e.target.files;
            if (!files?.length) return;
            const id = activeBlockId ?? blocks[0]?.id;
            if (id) addMedia(id, files);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={e => {
            const files = e.target.files;
            if (!files?.length) return;
            const id = activeBlockId ?? blocks[0]?.id;
            if (id) addMedia(id, files);
            e.currentTarget.value = "";
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept=".mp4,.webm,.mov,.avi,video/mp4,video/webm,video/quicktime,video/x-msvideo"
          className="hidden"
          onChange={e => {
            const files = e.target.files;
            if (!files?.length) return;
            const id = activeBlockId ?? blocks[0]?.id;
            if (id) addMedia(id, files);
            e.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
