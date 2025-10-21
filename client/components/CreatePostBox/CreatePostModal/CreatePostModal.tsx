import { FC, useEffect, useRef, useState, useCallback, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import { TweetBlock } from '../TweetBlock';
import { MediaEditor } from '../MediaEditor';
import { DraftsList } from '../DraftsList';
import { CodeBlockModal } from '../CodeBlockModal';
import { useAdvancedComposer } from '../useAdvancedComposer';
import {
  MediaItem,
  ReplyPolicy,
  ComposerDraft,
  ComposerBlockState,
  ComposerSentiment,
  REPLY_SUMMARY_TEXT,
} from '../types';
import {
  useModalKeyboardShortcuts,
  useClickOutside,
  useMenuPositioning,
  useDraftManagement,
} from './hooks';
import {
  CreatePostModalHeader,
  CreatePostModalToolbar,
  CreatePostModalFooter,
  ReplySettingsMenu,
  EmojiPickerOverlay,
} from './components';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: (blocks?: ComposerBlockState[]) => void;
  initialBlocks?: ComposerBlockState[];
  initialReplySetting?: ReplyPolicy;
  initialSentiment?: ComposerSentiment;
  onBlocksChange?: (blocks: ComposerBlockState[]) => void;
}

const CreatePostModal: FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  initialBlocks,
  initialReplySetting,
  initialSentiment,
  onBlocksChange,
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
  } = useAdvancedComposer();

  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const replyMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);

  const {
    position: replyMenuPosition,
    setPositionFromElement: setReplyMenuPosition,
    clearPosition: clearReplyMenuPosition,
  } = useMenuPositioning();

  const { saveDraftWithConfirmation, loadDraft } = useDraftManagement({
    isOpen,
    blocks,
    replySetting,
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const timeout = window.setTimeout(() => {
        initialize(initialBlocks, initialReplySetting, initialSentiment);
        setIsEmojiPickerOpen(false);
        setIsReplyMenuOpen(false);
        setIsCodeBlockOpen(false);
      }, 200);

      return () => window.clearTimeout(timeout);
    }

    initialize(initialBlocks, initialReplySetting, initialSentiment);
  }, [isOpen, initialize, initialBlocks, initialReplySetting, initialSentiment]);

  useClickOutside({
    ref: replyMenuRef,
    isOpen: isReplyMenuOpen,
    onClose: () => {
      setIsReplyMenuOpen(false);
      clearReplyMenuPosition();
    },
  });

  useClickOutside({
    ref: emojiMenuRef,
    isOpen: isEmojiPickerOpen,
    onClose: () => setIsEmojiPickerOpen(false),
  });

  const onBlocksChangeRef = useRef<typeof onBlocksChange | null>(null);

  useEffect(() => {
    onBlocksChangeRef.current = onBlocksChange ?? null;
  }, [onBlocksChange]);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    const handle = setTimeout(() => {
      if (!mounted) return;
      if (onBlocksChangeRef.current) {
        try {
          onBlocksChangeRef.current(blocks);
        } catch (e) {
          console.error('onBlocksChange handler failed:', e);
        }
      }
    }, 120);

    return () => {
      mounted = false;
      clearTimeout(handle);
    };
  }, [blocks, isOpen]);

  const handleClose = useCallback(() => {
    saveDraftWithConfirmation();
    onClose(blocks);
  }, [blocks, onClose, saveDraftWithConfirmation]);

  const handlePost = useCallback(async () => {
    if (!canPost || isPosting) return;

    setIsPosting(true);

    try {
      const payload = {
        blocks: blocks.map((b) => ({
          text: b.text,
          mediaIds: b.media.map((m) => m.id),
          media: b.media.map((m) => ({
            id: m.id,
            transform: m.transform,
            alt: m.alt,
            sensitiveTags: m.sensitiveTags,
          })),
          codeBlocks: b.codeBlocks,
        })),
        replyPolicy: replySetting,
        sentiment,
      };

      console.log('Posting:', payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      handleClose();
    } catch (error) {
      console.error('Post failed:', error);
    } finally {
      setIsPosting(false);
    }
  }, [blocks, replySetting, sentiment, canPost, isPosting, handleClose]);

  useModalKeyboardShortcuts({
    isOpen,
    onClose: handleClose,
    onSubmit: handlePost,
    canSubmit: canPost,
  });

  const handleBlockTextChange = useCallback(
    (blockId: string, text: string) => {
      updateBlockText(blockId, text);
    },
    [updateBlockText]
  );

  const handleMediaAdd = useCallback(
    (blockId: string, files: FileList) => {
      addMedia(blockId, files);
    },
    [addMedia]
  );

  const handleMediaRemove = useCallback(
    (blockId: string, mediaId: string) => {
      removeMedia(blockId, mediaId);
    },
    [removeMedia]
  );

  const handleMediaEdit = useCallback(
    (blockId: string, media: MediaItem) => {
      setActiveBlockId(blockId);
      setEditingMedia(media);
    },
    [setActiveBlockId]
  );

  const handleMediaSave = useCallback(
    (updatedMedia: MediaItem) => {
      if (!activeBlockId) return;

      replaceMedia(activeBlockId, updatedMedia);
      setEditingMedia(null);
      setActiveBlockId(null);
    },
    [activeBlockId, replaceMedia, setActiveBlockId]
  );

  const handleMediaReorder = useCallback(
    (blockId: string, fromIndex: number, toIndex: number) => {
      reorderMedia(blockId, fromIndex, toIndex);
    },
    [reorderMedia]
  );

  const handleToolbarMediaPick = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const targetId = ensureActiveBlock();
      if (!targetId) {
        event.target.value = '';
        return;
      }

      addMedia(targetId, files);
      event.target.value = '';
    },
    [ensureActiveBlock, addMedia]
  );

  const handleToolbarEmojiToggle = useCallback(() => {
    const targetId = ensureActiveBlock();
    if (!targetId) return;
    setIsEmojiPickerOpen((prev) => !prev);
  }, [ensureActiveBlock]);

  const handleCodeBlockInsert = useCallback(
    (code: string, language: string) => {
      if (!activeBlockId) return;

      const inserted = insertCodeBlock(activeBlockId, code, language);
      if (inserted) {
        setIsCodeBlockOpen(false);
      }
    },
    [activeBlockId, insertCodeBlock]
  );

  const handleCodeBlockRemove = useCallback(
    (blockId: string, codeBlockId: string) => {
      removeCodeBlock(blockId, codeBlockId);
    },
    [removeCodeBlock]
  );

  const handleBlockDelete = useCallback(
    (blockId: string) => {
      deleteBlock(blockId);
    },
    [deleteBlock]
  );

  const handleAddBlock = useCallback(() => {
    addBlock();
  }, [addBlock]);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      const targetId = activeBlockId ?? ensureActiveBlock();
      if (!targetId) return;

      const inserted = insertEmoji(targetId, emoji);
      if (inserted) {
        setIsEmojiPickerOpen(false);
        setActiveBlockId(targetId);
      }
    },
    [activeBlockId, ensureActiveBlock, insertEmoji, setActiveBlockId]
  );

  const handleEmojiClick = useCallback(
    (blockId: string) => {
      setActiveBlockId(blockId);
      setIsEmojiPickerOpen((prev) => !prev);
    },
    [setActiveBlockId]
  );

  const handleCodeBlockClick = useCallback(
    (blockId: string) => {
      setActiveBlockId(blockId);
      setIsCodeBlockOpen(true);
    },
    [setActiveBlockId]
  );

  const handleReplyButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setReplyMenuPosition(event.currentTarget, { offsetY: -10 });
      setIsReplyMenuOpen((prev) => !prev);
    },
    [setReplyMenuPosition]
  );

  const handleReplySelect = useCallback(
    (policy: ReplyPolicy) => {
      setReplySetting(policy);
      setIsReplyMenuOpen(false);
      clearReplyMenuPosition();
    },
    [setReplySetting, clearReplyMenuPosition]
  );

  const handleOpenDraft = useCallback(
    (draft: ComposerDraft) => {
      const restoredBlocks = loadDraft(draft);
      if (restoredBlocks.length > 0) {
        initialize(restoredBlocks, draft.replyPolicy, sentiment);
        setIsDraftsOpen(false);
      }
    },
    [loadDraft, initialize, sentiment]
  );

  if (!mounted || !isOpen) return null;

  const isThread = blocks.length > 1;
  const replySummary = REPLY_SUMMARY_TEXT[replySetting];

  return createPortal(
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[720px] max-h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-[#181B22] bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        <CreatePostModalHeader
          onClose={handleClose}
          onDraftsClick={() => setIsDraftsOpen(true)}
          isPosting={isPosting}
        />

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar">
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
              onClick={() => setActiveBlockId(block.id)}
              onChange={(text) => handleBlockTextChange(block.id, text)}
              onMediaAdd={(files) => handleMediaAdd(block.id, files)}
              onMediaRemove={(mediaId) => handleMediaRemove(block.id, mediaId)}
              onMediaEdit={(media) => handleMediaEdit(block.id, media)}
              onMediaReorder={(from, to) =>
                handleMediaReorder(block.id, from, to)
              }
              onDelete={() => handleBlockDelete(block.id)}
              onEmojiClick={() => handleEmojiClick(block.id)}
              onCodeBlockClick={() => handleCodeBlockClick(block.id)}
              onCodeBlockRemove={(codeBlockId) =>
                handleCodeBlockRemove(block.id, codeBlockId)
              }
            />
          ))}
        </div>

        <CreatePostModalToolbar
          onMediaClick={() => {}}
          onEmojiClick={handleToolbarEmojiToggle}
          onCodeBlockClick={() =>
            handleCodeBlockClick(activeBlockId || blocks[0]?.id)
          }
          onMediaChange={handleToolbarMediaPick}
          sentiment={sentiment}
          onSentimentChange={setSentiment}
          disabled={blocks.length === 0}
          isPosting={isPosting}
        />

        <CreatePostModalFooter
          onReplyClick={handleReplyButtonClick}
          onPost={handlePost}
          replySummary={replySummary}
          charRatio={charRatio}
          remainingChars={remainingChars}
          isNearLimit={isNearLimit}
          isOverLimit={isOverLimit}
          canPost={canPost}
          canAddBlock={canAddBlock}
          onAddBlock={handleAddBlock}
          isPosting={isPosting}
          isThread={isThread}
        />

        <div ref={replyMenuRef}>
          <ReplySettingsMenu
            isOpen={isReplyMenuOpen}
            position={replyMenuPosition}
            currentSetting={replySetting}
            onSelect={handleReplySelect}
          />
        </div>

        <EmojiPickerOverlay
          ref={emojiMenuRef}
          isOpen={isEmojiPickerOpen}
          onSelect={handleEmojiSelect}
        />
      </div>

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
    </div>,
    document.body
  );
};

export default CreatePostModal;
