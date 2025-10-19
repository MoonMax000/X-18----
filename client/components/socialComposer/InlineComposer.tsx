import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  ComposerBlockState,
  ComposerDraft,
  MediaItem,
  ReplyPolicy,
  REPLY_SUMMARY_TEXT,
  MAX_DRAFTS,
} from "@/components/CreatePostBox/types";
import { useAdvancedComposer } from "@/components/CreatePostBox/useAdvancedComposer";
import { DraftsList } from "@/components/CreatePostBox/DraftsList";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { TweetBlock } from "@/components/CreatePostBox/TweetBlock";
import { cn } from "@/lib/utils";

interface InlineComposerProps {
  userAvatar?: string;
  userName?: string;
  onSubmit?: (blocks: ComposerBlockState[]) => Promise<void> | void;
}

const replyOptions: { id: ReplyPolicy; label: string; description: string }[] = [
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

const InlineComposer: FC<InlineComposerProps> = ({
  userAvatar = "https://api.builder.io/api/v1/image/assets/TEMP/928e0a03eef447eade18cba6b182af59d4bd42b9?width=88",
  userName = "Current User",
  onSubmit,
}) => {
  const {
    blocks,
    activeBlockId,
    setActiveBlockId,
    replySetting,
    setReplySetting,
    sentiment,
    setSentiment,
    charRatio,
    remainingChars,
    isNearLimit,
    isOverLimit,
    canPost,
    canAddBlock,
    initialize,
    ensureActiveBlock,
    updateBlockText,
    addMedia,
    removeMedia,
    replaceMedia,
    reorderMedia,
    deleteBlock,
    addBlock,
    insertEmoji,
    insertCodeBlock,
    removeCodeBlock,
    reset,
  } = useAdvancedComposer();

  const [isPosting, setIsPosting] = useState(false);
  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [replyMenuPosition, setReplyMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isComposerActive, setIsComposerActive] = useState(false);

  const composerRef = useRef<HTMLDivElement>(null);
  const toolbarFileInputRef = useRef<HTMLInputElement>(null);
  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const replyMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        isReplyMenuOpen &&
        replyMenuRef.current &&
        !replyMenuRef.current.contains(event.target as Node) &&
        !replyButtonRef.current?.contains(event.target as Node)
      ) {
        setIsReplyMenuOpen(false);
      }
      if (
        isEmojiPickerOpen &&
        emojiMenuRef.current &&
        !emojiMenuRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false);
      }

      const target = event.target as Node;
      const clickedInsideComposer = composerRef.current?.contains(target);
      const insideReplyMenu = replyMenuRef.current?.contains(target);
      const insideEmojiMenu = emojiMenuRef.current?.contains(target);

      if (!clickedInsideComposer && !insideReplyMenu && !insideEmojiMenu) {
        setIsComposerActive(false);
        setActiveBlockId(null);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isReplyMenuOpen, isEmojiPickerOpen, setActiveBlockId]);

  const handleBlockActivate = useCallback(
    (blockId: string) => {
      setIsComposerActive(true);
      setActiveBlockId(blockId);
    },
    [setActiveBlockId],
  );

  const replySummary = useMemo(() => REPLY_SUMMARY_TEXT[replySetting], [replySetting]);

  const handleBlockTextChange = useCallback(
    (blockId: string, text: string) => {
      handleBlockActivate(blockId);
      updateBlockText(blockId, text);
    },
    [handleBlockActivate, updateBlockText],
  );

  const handleMediaAdd = useCallback(
    (blockId: string, files: FileList) => {
      handleBlockActivate(blockId);
      addMedia(blockId, files);
    },
    [addMedia, handleBlockActivate],
  );

  const handleMediaRemove = useCallback(
    (blockId: string, mediaId: string) => {
      handleBlockActivate(blockId);
      removeMedia(blockId, mediaId);
    },
    [handleBlockActivate, removeMedia],
  );

  const handleMediaEdit = useCallback(
    (blockId: string, media: MediaItem) => {
      handleBlockActivate(blockId);
      setEditingMedia(media);
    },
    [handleBlockActivate],
  );

  const handleMediaSave = useCallback(
    (updated: MediaItem) => {
      if (!activeBlockId) return;
      replaceMedia(activeBlockId, updated);
      setEditingMedia(null);
      setActiveBlockId(null);
    },
    [activeBlockId, replaceMedia, setActiveBlockId],
  );

  const handleMediaReorder = useCallback(
    (blockId: string, fromIndex: number, toIndex: number) => {
      reorderMedia(blockId, fromIndex, toIndex);
    },
    [reorderMedia],
  );

  const openToolbarFilePicker = useCallback(() => {
    const targetId = ensureActiveBlock();
    if (!targetId) return;
    handleBlockActivate(targetId);
    toolbarFileInputRef.current?.click();
  }, [ensureActiveBlock, handleBlockActivate]);

  const handleToolbarMediaPick = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const targetId = ensureActiveBlock();
      if (!targetId) {
        event.target.value = "";
        return;
      }

      handleBlockActivate(targetId);
      addMedia(targetId, files);
      event.target.value = "";
    },
    [addMedia, ensureActiveBlock, handleBlockActivate],
  );

  const handleToolbarEmojiToggle = useCallback(() => {
    const targetId = ensureActiveBlock();
    if (!targetId) return;
    handleBlockActivate(targetId);
    setIsEmojiPickerOpen((prev) => !prev);
  }, [ensureActiveBlock, handleBlockActivate]);

  const handleCodeBlockInsert = useCallback(
    (code: string, language: string) => {
      const targetId = activeBlockId ?? ensureActiveBlock();
      if (!targetId) return;

      handleBlockActivate(targetId);
      if (insertCodeBlock(targetId, code, language)) {
        setIsCodeBlockOpen(false);
      }
    },
    [activeBlockId, ensureActiveBlock, handleBlockActivate, insertCodeBlock],
  );

  const handleCodeBlockRemove = useCallback(
    (blockId: string, codeBlockId: string) => {
      removeCodeBlock(blockId, codeBlockId);
    },
    [removeCodeBlock],
  );

  const handleBlockDelete = useCallback(
    (blockId: string) => {
      deleteBlock(blockId);
    },
    [deleteBlock],
  );

  const handleAddBlock = useCallback(() => {
    addBlock();
  }, [addBlock]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const targetId = activeBlockId ?? ensureActiveBlock();
      if (!targetId) return;

      handleBlockActivate(targetId);
      if (insertEmoji(targetId, emoji)) {
        setIsEmojiPickerOpen(false);
      }
    },
    [activeBlockId, ensureActiveBlock, handleBlockActivate, insertEmoji],
  );

  const handleEmojiClick = useCallback(
    (blockId: string) => {
      handleBlockActivate(blockId);
      setIsEmojiPickerOpen((prev) => !prev);
    },
    [handleBlockActivate],
  );

  const handleCodeBlockClick = useCallback(
    (blockId: string) => {
      handleBlockActivate(blockId);
      setIsCodeBlockOpen(true);
    },
    [handleBlockActivate],
  );

  const saveDraft = useCallback(() => {
    const draft: ComposerDraft = {
      id: `draft-${Date.now()}`,
      blocks: blocks.map((block) => ({
        id: block.id,
        text: block.text,
        mediaIds: block.media.map((item) => item.id),
        media: block.media.map((item) => ({
          id: item.id,
          transform: item.transform,
          alt: item.alt,
          sensitiveTags: item.sensitiveTags,
        })),
        codeBlocks: block.codeBlocks,
      })),
      replyPolicy: replySetting,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem("composer-drafts");
    const drafts: ComposerDraft[] = saved ? JSON.parse(saved) : [];
    drafts.unshift(draft);
    localStorage.setItem(
      "composer-drafts",
      JSON.stringify(drafts.slice(0, MAX_DRAFTS)),
    );
  }, [blocks, replySetting]);

  useEffect(() => {
    const autoSave = window.setInterval(() => {
      const hasContent = blocks.some(
        (block) =>
          block.text.trim() || block.media.length > 0 || block.codeBlocks.length > 0,
      );
      if (hasContent) {
        saveDraft();
      }
    }, 10000);

    return () => window.clearInterval(autoSave);
  }, [blocks, replySetting, saveDraft]);

  const handleOpenDraft = useCallback(
    (draft: ComposerDraft) => {
      const hasMedia = draft.blocks.some(
        (block) => block.mediaIds && block.mediaIds.length > 0,
      );

      if (hasMedia) {
        const confirmed = window.confirm(
          "This draft contains media that cannot be restored. The text and code blocks will be restored, but you'll need to re-add any media. Continue?",
        );
        if (!confirmed) return;
      }

      const restored: ComposerBlockState[] = draft.blocks.map((block) => ({
        id: block.id,
        text: block.text,
        media: [],
        codeBlocks: block.codeBlocks ?? [],
      }));

      initialize(restored, draft.replyPolicy, sentiment);
      setIsDraftsOpen(false);
    },
    [initialize, sentiment],
  );

  const handleReplyButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      setReplyMenuPosition({ top: rect.top - 10, left: rect.left });
      setIsComposerActive(true);
      setIsReplyMenuOpen((prev) => !prev);
    },
    [],
  );

  const handlePost = useCallback(async () => {
    if (!canPost || isPosting) return;
    setIsPosting(true);

    try {
      await onSubmit?.(blocks.map((block) => ({ ...block })));
      reset();
      setIsComposerActive(false);
      setIsEmojiPickerOpen(false);
      setIsReplyMenuOpen(false);
      setActiveBlockId(null);
    } catch (error) {
      console.error("Post failed:", error);
    } finally {
      setIsPosting(false);
    }
  }, [
    blocks,
    canPost,
    isPosting,
    onSubmit,
    reset,
    setActiveBlockId,
    setIsComposerActive,
    setIsEmojiPickerOpen,
    setIsReplyMenuOpen,
  ]);

  const circumference = 88;
  const dashOffset = circumference - charRatio * circumference;
  const canSubmit = canPost && !isPosting;

  return (
    <div
      ref={composerRef}
      className="rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-[50px] text-white"
    >
      <div className="max-h-[360px] sm:max-h-[460px] overflow-y-auto px-3 sm:px-4 py-1.5 sm:py-2 space-y-2.5 sm:space-y-3 scrollbar">
        {blocks.map((block, index) => (
          <TweetBlock
            key={block.id}
            id={block.id}
            text={block.text}
            media={block.media}
            codeBlocks={block.codeBlocks}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            canDelete={blocks.length > 1}
            isActive={
              activeBlockId === block.id ||
              (activeBlockId === null && index === 0)
            }
            avatarUrl={userAvatar}
            avatarAlt={userName}
            onClick={() => handleBlockActivate(block.id)}
            onChange={(text) => handleBlockTextChange(block.id, text)}
            onMediaAdd={(files) => handleMediaAdd(block.id, files)}
            onMediaRemove={(mediaId) => handleMediaRemove(block.id, mediaId)}
            onMediaEdit={(media) => handleMediaEdit(block.id, media)}
            onMediaReorder={(from, to) => handleMediaReorder(block.id, from, to)}
            onDelete={() => handleBlockDelete(block.id)}
            onEmojiClick={() => handleEmojiClick(block.id)}
            onCodeBlockClick={() => handleCodeBlockClick(block.id)}
            onCodeBlockRemove={(codeBlockId) => handleCodeBlockRemove(block.id, codeBlockId)}
          />
        ))}
      </div>

      <div className="px-3.5 py-1.75">
        <div
          className="grid items-center gap-1.5 sm:gap-2.5 grid-cols-[repeat(3,auto)_1fr_auto] sm:grid-cols-[repeat(5,auto)_1fr_auto]"
        >
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Video or GIF"
            onClick={openToolbarFilePicker}
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
          <button
            type="button"
            onClick={openToolbarFilePicker}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
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
          <input
            ref={toolbarFileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleToolbarMediaPick}
          />
          <button
            type="button"
            onClick={handleToolbarEmojiToggle}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
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
          <button
            type="button"
            onClick={() => {
              const targetId = activeBlockId ?? ensureActiveBlock();
              if (!targetId) return;
              handleBlockActivate(targetId);
              setIsCodeBlockOpen(true);
            }}
            className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
            title="Code block"
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

          <div
            className={cn(
              "flex items-center gap-2 justify-end",
              !isComposerActive && "opacity-0 pointer-events-none",
            )}
          >
            <button
              onClick={() => setSentiment("bullish")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.75 text-[10px] font-semibold tracking-[0.08em] uppercase transition-all duration-200",
                sentiment === "bullish"
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200 shadow-[0_10px_24px_-16px_rgba(46,189,133,0.8)]"
                  : "border-white/5 bg-white/5 text-white/45 hover:border-emerald-300/40 hover:bg-emerald-400/10 hover:text-emerald-200",
              )}
              disabled={isPosting}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M13.3333 8.66659V5.33325H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3334 5.33325L10 8.66659C9.41162 9.25499 9.11749 9.54912 8.75642 9.58165C8.69669 9.58705 8.63669 9.58705 8.57695 9.58165C8.21589 9.54912 7.92175 9.25499 7.33335 8.66659C6.74495 8.07819 6.45079 7.78405 6.08973 7.75152C6.03005 7.74612 5.96999 7.74612 5.91031 7.75152C5.54925 7.78405 5.25506 8.07819 4.66669 8.66659L2.66669 10.6666"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Bullish</span>
            </button>
            <button
              onClick={() => setSentiment("bearish")}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.75 text-[10px] font-semibold tracking-[0.08em] uppercase transition-all duration-200",
                sentiment === "bearish"
                  ? "border-rose-400/60 bg-rose-400/15 text-rose-200 shadow-[0_10px_24px_-16px_rgba(239,69,74,0.8)]"
                  : "border-white/5 bg-white/5 text-white/45 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200",
              )}
              disabled={isPosting}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
              >
                <path
                  d="M13.3333 7.3335V10.6668H10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M13.3334 10.6668L10 7.3335C9.41162 6.7451 9.11749 6.45093 8.75642 6.41841C8.69669 6.41303 8.63669 6.41303 8.57695 6.41841C8.21589 6.45093 7.92175 6.7451 7.33335 7.3335C6.74495 7.9219 6.45079 8.21603 6.08973 8.24856C6.03005 8.25396 5.96999 8.25396 5.91031 8.24856C5.54925 8.21603 5.25506 7.9219 4.66669 7.3335L2.66669 5.3335"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Bearish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5">
        <button
          ref={replyButtonRef}
          type="button"
          onClick={handleReplyButtonClick}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10",
            !isComposerActive && "opacity-0 pointer-events-none",
          )}
        >
          <span className="-ml-1 flex h-7 w-7 shrink-0 items-center justify-center text-[#1D9BF0]">
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
          </span>
          <span>{replySummary}</span>
        </button>

        {isReplyMenuOpen && replyMenuPosition &&
          createPortal(
            <div
              ref={replyMenuRef}
              className="fixed z-[2300] w-[90vw] sm:w-80 rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px] p-3 sm:p-4"
              style={{
                top: `${replyMenuPosition.top - 280}px`,
                left: `${replyMenuPosition.left}px`,
              }}
            >
              <h3 className="mb-3 text-sm font-semibold text-white">
                Who can reply?
              </h3>
              <div className="space-y-2">
                {replyOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setReplySetting(opt.id);
                      setIsReplyMenuOpen(false);
                    }}
                    className="flex w-full items-start gap-3 rounded-2xl bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0"
                      viewBox="0 0 24 24"
                      fill={replySetting === opt.id ? "#A06AFF" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      {replySetting === opt.id && (
                        <circle cx="12" cy="12" r="4" fill="#A06AFF" />
                      )}
                    </svg>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">
                        {opt.label}
                      </div>
                      <div className="text-xs text-[#808283]">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>,
            document.body,
          )}

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "items-center gap-2 transition-all duration-200",
              isComposerActive ? "flex" : "hidden",
            )}
          >
            <div className="flex items-center gap-1.5">
              <svg className="h-6 w-6 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#2F3336"
                  strokeWidth="4"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke={
                    isOverLimit ? "#EF454A" : isNearLimit ? "#FFD400" : "#A06AFF"
                  }
                  strokeWidth="4"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span
                className={cn(
                  "text-sm font-medium tabular-nums",
                  isOverLimit
                    ? "text-[#EF454A]"
                    : isNearLimit
                      ? "text-[#FFD400]"
                      : "text-[#808283]",
                )}
              >
                {remainingChars < 20 ? remainingChars : ""}
              </span>
            </div>

            {canAddBlock && (
              <button
                type="button"
                onClick={handleAddBlock}
                className="flex h-6 w-6 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                disabled={isPosting}
                title="Add another post"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="none">
                  <path
                    d="M12 8V16M16 12H8"
                    stroke="#A06AFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                    stroke="#A06AFF"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={handlePost}
            disabled={!canSubmit}
            className={cn(
              "group relative inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-xs font-semibold transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/40 focus-visible:ring-offset-0",
              canSubmit || isPosting
                ? "bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] text-white shadow-[0_20px_44px_-20px_rgba(160,106,255,0.9)] hover:shadow-[0_24px_50px_-18px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98]"
                : "cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]",
            )}
          >
            {(canSubmit || isPosting) && (
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0.05)_40%,_rgba(255,255,255,0)_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-transform duration-200",
                  canSubmit && !isPosting && "group-hover:translate-x-0.5 group-hover:scale-110"
                )}
              >
                <path
                  d="M5 12L4 5L20 12L4 19L5 12ZM5 12H12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">{isPosting ? "Sending..." : blocks.length > 1 ? "Post all" : "Post"}</span>
            </span>
          </button>
        </div>
      </div>

      {isEmojiPickerOpen &&
        createPortal(
          <div
            ref={emojiMenuRef}
            className="fixed bottom-20 sm:bottom-24 left-2 sm:left-6 z-[2300] h-[70vh] sm:h-96 w-[90vw] sm:w-96 max-w-[400px] rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black p-3 sm:p-4 shadow-2xl backdrop-blur-[100px]"
          >
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>,
          document.body,
        )}

      <CodeBlockModal
        isOpen={isCodeBlockOpen}
        onClose={() => setIsCodeBlockOpen(false)}
        onInsert={handleCodeBlockInsert}
      />

      <DraftsList
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        onOpen={handleOpenDraft}
        onDelete={() => {}}
      />

      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onSave={handleMediaSave}
          onClose={() => {
            setEditingMedia(null);
            setActiveBlockId(null);
          }}
        />
      )}
    </div>
  );
};

export default InlineComposer;
