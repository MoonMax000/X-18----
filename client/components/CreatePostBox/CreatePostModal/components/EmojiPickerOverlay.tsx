import { FC, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { EmojiPicker } from '../../EmojiPicker';

interface EmojiPickerOverlayProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
}

/**
 * Emoji picker overlay component
 * Wraps the EmojiPicker with positioning and portal logic
 */
export const EmojiPickerOverlay = forwardRef<HTMLDivElement, EmojiPickerOverlayProps>(
  ({ isOpen, onSelect }, ref) => {
    if (!isOpen) return null;

    return createPortal(
      <div
        ref={ref}
        className="fixed bottom-24 left-6 z-[2300] h-96 w-96 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.95)] p-4 shadow-2xl backdrop-blur-[100px]"
      >
        <EmojiPicker onSelect={onSelect} />
      </div>,
      document.body
    );
  }
);

EmojiPickerOverlay.displayName = 'EmojiPickerOverlay';
