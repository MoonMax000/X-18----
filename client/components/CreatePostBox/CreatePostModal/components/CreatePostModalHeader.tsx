import { FC } from 'react';

interface CreatePostModalHeaderProps {
  onClose: () => void;
  onDraftsClick: () => void;
  isPosting: boolean;
}

/**
 * Header component for CreatePostModal
 * Contains close button and drafts button
 */
export const CreatePostModalHeader: FC<CreatePostModalHeaderProps> = ({
  onClose,
  onDraftsClick,
  isPosting,
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <button
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-full text-[#E7E9EA] transition-colors hover:bg-white/10"
        disabled={isPosting}
        aria-label="Close modal"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        onClick={onDraftsClick}
        className="text-sm font-semibold text-[#A06AFF] transition-colors hover:text-[#E3D8FF]"
        disabled={isPosting}
      >
        Drafts
      </button>
    </div>
  );
};
