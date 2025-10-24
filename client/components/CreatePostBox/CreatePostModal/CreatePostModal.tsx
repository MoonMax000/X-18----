import { FC, useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MediaEditor } from '../MediaEditor';
import { CodeBlockModal } from '../CodeBlockModal';
import { MediaGrid } from '../MediaGrid';
import { EmojiPicker } from '../EmojiPicker';
import { useSimpleComposer } from '../useSimpleComposer';
import { MediaItem } from '../types';
import { ComposerMetadata, ComposerToolbar, ComposerFooter } from '@/features/feed/components/composers/shared';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  initialSentiment?: "bullish" | "bearish" | null;
}

const CreatePostModal: FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  initialText,
  initialSentiment,
}) => {
  const {
    text,
    media,
    codeBlocks,
    sentiment,
    replySetting,
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
    insertEmoji,
    insertCodeBlock,
    removeCodeBlock,
    initialize,
  } = useSimpleComposer();

  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Post metadata
  const [postMarket, setPostMarket] = useState<string>('Crypto');
  const [postCategory, setPostCategory] = useState<string>('General');
  const [postSymbol, setPostSymbol] = useState<string>('');
  const [postTimeframe, setPostTimeframe] = useState<string>('');
  const [postRisk, setPostRisk] = useState<string>('');

  const replyMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);
  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const replyOptions = [
    { id: "everyone" as const, label: "Everyone", description: "Anyone can reply." },
    { id: "following" as const, label: "Accounts you follow", description: "Only people you follow can reply." },
    { id: "verified" as const, label: "Verified accounts", description: "Only verified users can reply." },
    { id: "mentioned" as const, label: "Only accounts you mention", description: "Only people you mention can reply." }
  ];

  const replySummary = replyOptions.find(opt => opt.id === replySetting)?.label || "Everyone";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      initialize(initialText, [], [], undefined, initialSentiment || undefined);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialize, initialText, initialSentiment]);

  const handleClose = useCallback(() => {
    // Warning if there's unsaved content
    if (text.trim().length > 0 || media.length > 0 || codeBlocks.length > 0) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close? Your post will not be saved.'
      );
      if (!confirmed) return;
    }
    onClose();
  }, [text, media, codeBlocks, onClose]);

  const handlePost = useCallback(async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);

    try {
      const payload = {
        text,
        media: media.map((m) => ({
          id: m.id,
          transform: m.transform,
          alt: m.alt,
          sensitiveTags: m.sensitiveTags,
        })),
        codeBlocks,
        replySetting,
        sentiment,
        metadata: {
          market: postMarket,
          category: postCategory,
          symbol: postSymbol,
          timeframe: postTimeframe,
          risk: postRisk,
        },
        isPaid,
      };

      console.log('Posting:', payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      onClose();
    } catch (error) {
      console.error('Post failed:', error);
    } finally {
      setIsPosting(false);
    }
  }, [text, media, codeBlocks, replySetting, sentiment, postMarket, postCategory, postSymbol, postTimeframe, postRisk, isPaid, canPost, isPosting, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (canPost) {
          handlePost();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, canPost, handleClose, handlePost]);

  const handleReplyButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsReplyMenuOpen(prev => !prev);
  };

  const handleBoldToggle = () => {
    const boldText = `**${text}**`;
    updateText(boldText);
    setIsBoldActive(!isBoldActive);
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[720px] max-h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181B22] px-5 py-4">
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#808283] transition-colors hover:bg-white/10 hover:text-white"
            disabled={isPosting}
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-white">Create Post</h2>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar">
          <div className="flex gap-3">
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarImage src="https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="What's happening in the markets?"
                value={text}
                onChange={e => updateText(e.target.value)}
                className="!min-h-[120px] !resize-none !border-none !bg-transparent !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0 !p-0"
                autoFocus
              />

              {media.length > 0 && (
                <div className="mt-3">
                  <MediaGrid
                    media={media}
                    onEdit={m => setEditingMedia(m)}
                    onRemove={mediaId => removeMedia(mediaId)}
                    onReorder={(from, to) => reorderMedia(from, to)}
                    readOnly={false}
                  />
                </div>
              )}

              {codeBlocks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {codeBlocks.map((cb) => (
                    <div key={cb.id} className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg">
                      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                        <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                        <button
                          type="button"
                          onClick={() => removeCodeBlock(cb.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA]"
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
            </div>
          </div>

          {/* Metadata */}
          {text.length > 0 && (
            <div className="mt-4">
              <ComposerMetadata
                visible={true}
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
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="border-t border-[#181B22] px-5 py-3">
          <ComposerToolbar
            onMediaClick={() => mediaInputRef.current?.click()}
            onDocumentClick={() => documentInputRef.current?.click()}
            onVideoClick={() => videoInputRef.current?.click()}
            onCodeBlockClick={() => setIsCodeBlockOpen(true)}
            onEmojiClick={() => setIsEmojiPickerOpen(prev => !prev)}
            onBoldClick={handleBoldToggle}
            isBoldActive={isBoldActive}
            sentiment={sentiment}
            onSentimentChange={setSentiment}
            isPaid={isPaid}
            onPaidChange={setIsPaid}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-[#181B22] px-5 py-4">
          <ComposerFooter
            charRatio={charRatio}
            remainingChars={remainingChars}
            isNearLimit={isNearLimit}
            isOverLimit={isOverLimit}
            canPost={canPost}
            onPost={handlePost}
            showReplySettings={true}
            replySummary={replySummary}
            onReplyClick={handleReplyButtonClick}
            isPosting={isPosting}
          />
        </div>

        {/* Reply Settings Menu */}
        {isReplyMenuOpen && (
          <div ref={replyMenuRef} className="absolute bottom-20 left-5 z-[2100] w-[90vw] sm:w-72 rounded-2xl border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px] p-3">
            <h3 className="mb-2 text-xs font-semibold text-white">Who can reply?</h3>
            <div className="space-y-1.5">
              {replyOptions.map(opt => (
                <button 
                  key={opt.id} 
                  onClick={() => { setReplySetting(opt.id); setIsReplyMenuOpen(false); }} 
                  className="flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs"
                >
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
          </div>
        )}

        {/* Emoji Picker */}
        {isEmojiPickerOpen && (
          <div ref={emojiMenuRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 h-[45vh] sm:h-64 w-[65vw] sm:w-80 max-w-[320px] rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black p-3 sm:p-4 shadow-2xl backdrop-blur-[100px]">
            <EmojiPicker onSelect={(emoji) => { insertEmoji(emoji); setIsEmojiPickerOpen(false); }} />
          </div>
        )}
      </div>

      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onSave={(updated) => { replaceMedia(updated); setEditingMedia(null); }}
          onClose={() => setEditingMedia(null)}
        />
      )}

      <CodeBlockModal
        isOpen={isCodeBlockOpen}
        onClose={() => setIsCodeBlockOpen(false)}
        onInsert={(code, language) => { insertCodeBlock(code, language); setIsCodeBlockOpen(false); }}
      />

      <input ref={mediaInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} />
      <input ref={documentInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.xls,.xlsx" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} />
      <input ref={videoInputRef} type="file" accept=".mp4,.webm,.mov,.avi,video/*" className="hidden" onChange={e => { addMedia(e.target.files); e.currentTarget.value = ""; }} />
    </div>,
    document.body
  );
};

export default CreatePostModal;
