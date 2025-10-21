import { FC, ChangeEvent, useRef } from 'react';
import { ComposerSentiment } from '../../types';

interface CreatePostModalToolbarProps {
  onMediaClick: () => void;
  onEmojiClick: () => void;
  onCodeBlockClick: () => void;
  onMediaChange: (event: ChangeEvent<HTMLInputElement>) => void;
  sentiment: ComposerSentiment;
  onSentimentChange: (sentiment: ComposerSentiment) => void;
  disabled: boolean;
  isPosting: boolean;
}

/**
 * Toolbar component for CreatePostModal
 * Contains media, poll, emoji, code block buttons and sentiment toggles
 */
export const CreatePostModalToolbar: FC<CreatePostModalToolbarProps> = ({
  onMediaClick,
  onEmojiClick,
  onCodeBlockClick,
  onMediaChange,
  sentiment,
  onSentimentChange,
  disabled,
  isPosting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="px-5 py-3">
      <div
        className="grid"
        style={{
          gridTemplateColumns: 'repeat(5, auto) 1fr auto',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
          title="Видео или GIF"
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10"
          title="Опрос"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12h4v7H3zM10 7h4v12h-4zM17 3h4v16h-4z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleMediaClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10 disabled:text-white/30 disabled:hover:bg-transparent"
          title="Добавить медиа"
          disabled={disabled}
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
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onMediaChange}
        />

        <button
          type="button"
          onClick={onEmojiClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10 disabled:text-white/30 disabled:hover:bg-transparent"
          title="Добавить эмодзи"
          disabled={disabled}
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
          onClick={onCodeBlockClick}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#A06AFF] transition-colors hover:bg-[#482090]/10 disabled:text-white/30 disabled:hover:bg-transparent"
          title="Блок кода"
          disabled={disabled}
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

        <div></div>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => onSentimentChange('bullish')}
            className={`rounded inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors ${sentiment === 'bullish' ? 'bg-[#1C3430] text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
            disabled={isPosting}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M13.3333 8.66659V5.33325H10"
                stroke="#2EBD85"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.3334 5.33325L10.0001 8.66659C9.41168 9.25499 9.11755 9.54912 8.75648 9.58165C8.69675 9.58705 8.63675 9.58705 8.57702 9.58165C8.21595 9.54912 7.92181 9.25499 7.33341 8.66659C6.74501 8.07819 6.45085 7.78405 6.08979 7.75152C6.03011 7.74612 5.97005 7.74612 5.91037 7.75152C5.54931 7.78405 5.25512 8.07819 4.66675 8.66659L2.66675 10.6666"
                stroke="#2EBD85"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bullish
          </button>
          <button
            onClick={() => onSentimentChange('bearish')}
            className={`rounded inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold transition-colors ${sentiment === 'bearish' ? 'bg-[#3A2127] text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
            disabled={isPosting}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M13.3333 7.3335V10.6668H10"
                stroke="#EF454A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.3334 10.6668L10.0001 7.3335C9.41168 6.7451 9.11755 6.45093 8.75648 6.41841C8.69675 6.41303 8.63675 6.41303 8.57702 6.41841C8.21595 6.45093 7.92181 6.7451 7.33341 7.3335C6.74501 7.9219 6.45085 8.21603 6.08979 8.24856C6.03011 8.25396 5.97005 8.25396 5.91037 8.24856C5.54931 8.21603 5.25512 7.9219 4.66675 7.3335L2.66675 5.3335"
                stroke="#EF454A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Bearish
          </button>
        </div>
      </div>
    </div>
  );
};
