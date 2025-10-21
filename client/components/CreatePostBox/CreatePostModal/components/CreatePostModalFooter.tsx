import { FC } from 'react';
import { cn } from '@/lib/utils';

interface CreatePostModalFooterProps {
  onReplyClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onPost: () => void;
  replySummary: string;
  charRatio: number;
  remainingChars: number;
  isNearLimit: boolean;
  isOverLimit: boolean;
  canPost: boolean;
  canAddBlock: boolean;
  onAddBlock?: () => void;
  isPosting: boolean;
  isThread: boolean;
}

/**
 * Footer component for CreatePostModal
 * Contains reply settings, character counter, and post button
 */
export const CreatePostModalFooter: FC<CreatePostModalFooterProps> = ({
  onReplyClick,
  onPost,
  replySummary,
  charRatio,
  remainingChars,
  isNearLimit,
  isOverLimit,
  canPost,
  canAddBlock,
  onAddBlock,
  isPosting,
  isThread,
}) => {
  const circumference = 88;
  const dashOffset = circumference - charRatio * circumference;
  const canSubmit = canPost && !isPosting;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <button
        type="button"
        onClick={onReplyClick}
        className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm font-semibold text-[#1D9BF0] transition-colors hover:bg-white/10"
        disabled={isPosting}
      >
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
        <span>{replySummary}</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
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
                isOverLimit ? '#EF454A' : isNearLimit ? '#FFD400' : '#A06AFF'
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
              'text-sm font-medium tabular-nums',
              isOverLimit
                ? 'text-[#EF454A]'
                : isNearLimit
                  ? 'text-[#FFD400]'
                  : 'text-[#808283]'
            )}
          >
            {remainingChars < 20 && remainingChars}
          </span>
        </div>

        {false && canAddBlock && onAddBlock && (
          <button
            type="button"
            onClick={onAddBlock}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#A06AFF] text-[#A06AFF] transition-all hover:bg-[#A06AFF]/10"
            disabled={isPosting}
            title="Add another post"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        <button
          onClick={onPost}
          disabled={!canSubmit}
          className={cn(
            'inline-flex h-10 min-w-[100px] items-center justify-center rounded-full px-6 text-sm font-semibold transition-all',
            canSubmit
              ? 'bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]'
              : 'cursor-not-allowed bg-[#A06AFF]/20 text-white/40'
          )}
        >
          {isPosting ? 'Posting...' : isThread ? 'Post all' : 'Post'}
        </button>
      </div>
    </div>
  );
};
