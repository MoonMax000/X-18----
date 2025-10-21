import { useCallback, useEffect, useRef } from 'react';
import { ComposerDraft, ComposerBlockState, ReplyPolicy, MAX_DRAFTS } from '../../types';

interface UseDraftManagementProps {
  isOpen: boolean;
  blocks: ComposerBlockState[];
  replySetting: ReplyPolicy;
  autoSaveInterval?: number;
}

const STORAGE_KEY = 'composer-drafts';

/**
 * Hook to manage draft saving, loading, and auto-saving
 * Handles localStorage persistence and draft restoration
 */
export const useDraftManagement = ({
  isOpen,
  blocks,
  replySetting,
  autoSaveInterval = 10000,
}: UseDraftManagementProps) => {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Save current state as a draft to localStorage
   */
  const saveDraft = useCallback(() => {
    const draft: ComposerDraft = {
      id: `draft-${Date.now()}`,
      blocks: blocks.map((b) => ({
        id: b.id,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    const drafts: ComposerDraft[] = saved ? JSON.parse(saved) : [];
    drafts.unshift(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts.slice(0, MAX_DRAFTS)));
  }, [blocks, replySetting]);

  /**
   * Check if current state has any content worth saving
   */
  const hasContent = useCallback(() => {
    return blocks.some(
      (b) => b.text.trim() || b.media.length > 0 || b.codeBlocks.length > 0
    );
  }, [blocks]);

  /**
   * Save draft with user confirmation
   */
  const saveDraftWithConfirmation = useCallback(() => {
    if (!hasContent()) return false;

    const shouldSave = window.confirm(
      'You have unsaved changes. Would you like to save this as a draft?\n\nNote: Media files will not be saved in drafts.'
    );

    if (shouldSave) {
      saveDraft();
      return true;
    }

    return false;
  }, [hasContent, saveDraft]);

  /**
   * Load a draft and restore its state
   */
  const loadDraft = useCallback((draft: ComposerDraft): ComposerBlockState[] => {
    const hasMedia = draft.blocks.some(
      (b) => b.mediaIds && b.mediaIds.length > 0
    );

    if (hasMedia) {
      const confirmed = window.confirm(
        'This draft contains media that cannot be restored. The text and code blocks will be restored, but you\'ll need to re-add any media. Continue?'
      );
      if (!confirmed) return [];
    }

    return draft.blocks.map((b) => ({
      id: b.id,
      text: b.text,
      media: [],
      codeBlocks: b.codeBlocks ?? [],
    }));
  }, []);

  /**
   * Get all saved drafts from localStorage
   */
  const getDrafts = useCallback((): ComposerDraft[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  /**
   * Delete a specific draft
   */
  const deleteDraft = useCallback((draftId: string) => {
    const drafts = getDrafts();
    const filtered = drafts.filter((d) => d.id !== draftId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }, [getDrafts]);

  /**
   * Auto-save effect - saves draft every N seconds if there's content
   */
  useEffect(() => {
    if (!isOpen) {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
      return;
    }

    autoSaveTimerRef.current = setInterval(() => {
      if (hasContent()) {
        saveDraft();
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [isOpen, hasContent, saveDraft, autoSaveInterval]);

  return {
    saveDraft,
    saveDraftWithConfirmation,
    loadDraft,
    getDrafts,
    deleteDraft,
    hasContent,
  };
};
