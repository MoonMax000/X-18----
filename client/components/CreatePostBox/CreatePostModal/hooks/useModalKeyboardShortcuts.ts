import { useEffect } from 'react';

interface UseModalKeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

/**
 * Hook to handle keyboard shortcuts for modal
 * - Escape: Close modal
 * - Cmd/Ctrl + Enter: Submit post
 */
export const useModalKeyboardShortcuts = ({
  isOpen,
  onClose,
  onSubmit,
  canSubmit,
}: UseModalKeyboardShortcutsProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close modal on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Submit post on Cmd/Ctrl + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSubmit, canSubmit]);
};
