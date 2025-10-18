import { FC, useRef, useEffect, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { MediaItem, CHAR_LIMIT } from "./types";
import { MediaGrid } from "./MediaGrid";

interface CodeBlock {
  id: string;
  code: string;
  language: string;
}

interface TweetBlockProps {
  id: string;
  text: string;
  media: MediaItem[];
  codeBlocks?: CodeBlock[];
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  isActive?: boolean;
  onClick?: () => void;
  onChange: (text: string) => void;
  onMediaAdd: (files: FileList) => void;
  onMediaRemove: (mediaId: string) => void;
  onMediaEdit: (media: MediaItem) => void;
  onMediaReorder: (fromIndex: number, toIndex: number) => void;
  onDelete: () => void;
  onEmojiClick: () => void;
  onCodeBlockClick: () => void;
  onCodeBlockRemove?: (codeBlockId: string) => void;
  readOnly?: boolean;
  avatarUrl?: string;
  avatarAlt?: string;
}

export const TweetBlock: FC<TweetBlockProps> = ({
  id,
  text,
  media,
  codeBlocks = [],
  isFirst,
  isLast,
  canDelete,
  isActive = true,
  onClick,
  onChange,
  onMediaAdd,
  onMediaRemove,
  onMediaEdit,
  onMediaReorder,
  onDelete,
  onEmojiClick,
  onCodeBlockClick,
  onCodeBlockRemove,
  readOnly = false,
  avatarUrl = "https://api.builder.io/api/v1/image/assets/TEMP/928e0a03eef447eade18cba6b182af59d4bd42b9?width=88",
  avatarAlt = "User avatar",
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const value = event.target.value;
    if (value.length <= CHAR_LIMIT) {
      onChange(value);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (event.target.files) {
      onMediaAdd(event.target.files);
    }
  };

  const handleEmojiClick = () => {
    if (readOnly) return;
    onEmojiClick();
  };

  const handleCodeBlockClick = () => {
    if (readOnly) return;
    onCodeBlockClick();
  };

  const handleDelete = () => {
    if (readOnly) return;
    onDelete();
  };

  const handleMediaEdit = (item: MediaItem) => {
    if (readOnly) return;
    onMediaEdit(item);
  };

  const handleMediaRemove = (mediaId: string) => {
    if (readOnly) return;
    onMediaRemove(mediaId);
  };

  const handleMediaReorder = (fromIndex: number, toIndex: number) => {
    if (readOnly) return;
    onMediaReorder(fromIndex, toIndex);
  };

  const handleCodeBlockRemove = (codeBlockId: string) => {
    if (readOnly) return;
    onCodeBlockRemove?.(codeBlockId);
  };

  return (
    <div
      className={cn(
        "relative flex gap-3 transition-opacity cursor-pointer",
        !isActive && "opacity-40 hover:opacity-60",
      )}
      onClick={onClick}
    >
      {!isFirst && (
        <div
          className={cn(
            "absolute left-[22px] -top-4 h-4 w-0.5 bg-[#2F3336]",
            !isActive && "opacity-40",
          )}
        />
      )}

      <img
        src={avatarUrl}
        alt={avatarAlt}
        className="h-12 w-12 rounded-full object-cover flex-shrink-0"
      />

      <div className="flex-1">
        <div className="flex items-start gap-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder={isFirst ? "Share your trading ideas, signals, or analysis... ($TICKER, #tags, @mentions)" : "Add another post"}
            className={`flex-1 w-full !min-h-[80px] !resize-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !outline-none !focus-visible:ring-0 ${
              readOnly ? "cursor-default" : ""
            }`}
            rows={1}
            readOnly={readOnly}
          />
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={readOnly}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#EF454A] transition-colors ${
                readOnly ? "cursor-default opacity-50" : "hover:bg-[#EF454A]/10"
              }`}
              title="Remove post"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {media.length > 0 && (
          <MediaGrid
            media={media}
            onRemove={handleMediaRemove}
            onEdit={handleMediaEdit}
            onReorder={handleMediaReorder}
            readOnly={readOnly}
          />
        )}

        {codeBlocks.length > 0 && (
          <div className="mt-3 space-y-3">
            {codeBlocks.map((block) => (
              <div
                key={block.id}
                className="group relative overflow-hidden rounded-2xl border border-[#2F3336] bg-[#0A0E14] shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#2F3336] bg-[#0D1117] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#6AA5FF]"
                    >
                      <path
                        d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6AA5FF]">
                      {block.language}
                    </span>
                  </div>
                  {!readOnly && onCodeBlockRemove && (
                    <button
                      onClick={() => handleCodeBlockRemove(block.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[#808283] opacity-0 transition-all hover:bg-[#EF454A]/10 hover:text-[#EF454A] group-hover:opacity-100"
                      title="Remove code block"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                <pre className="overflow-x-auto bg-[#0A0E14] p-5 text-sm leading-relaxed scrollbar">
                  <code
                    className="font-mono text-[#C5D4DD]"
                    style={{
                      fontFamily:
                        "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
                    }}
                  >
                    {block.code}
                  </code>
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={readOnly}
          />

          {media.length > 0 && (
            <div className="flex items-center gap-3 text-[#71767B]">
              <a
                href="/compose/post/tags"
                dir="ltr"
                aria-label="Tag people"
                role="link"
                data-testid="tagPeopleLabel"
                className="inline-flex items-center gap-2 text-sm hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  width="20"
                  height="20"
                  fill="none"
                >
                  <g>
                    <path
                      d="M5.651 19h12.698c-.337-1.8-1.023-3.21-1.945-4.19C15.318 13.65 13.838 13 12 13s-3.317.65-4.404 1.81c-.922.98-1.608 2.39-1.945 4.19zm.486-5.56C7.627 11.85 9.648 11 12 11s4.373.85 5.863 2.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46zM12 4c-1.105 0-2 .9-2 2s.895 2 2 2 2-.9 2-2-.895-2-2-2zM8 6c0-2.21 1.791-4 4-4s4 1.79 4 4-1.791 4-4 4-4-1.79-4-4z"
                      fill="currentColor"
                    />
                  </g>
                </svg>
                <span className="text-sm">Tag people</span>
              </a>

              <a
                href="/compose/post/media"
                dir="ltr"
                aria-label="Add description"
                role="link"
                data-testid="altTextWrapper"
                className="inline-flex items-center gap-2 text-sm hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  width="20"
                  height="20"
                  fill="none"
                >
                  <g>
                    <path
                      d="M3 4.5C3 3.12 4.12 2 5.5 2h13C19.88 2 21 3.12 21 4.5v15c0 1.38-1.12 2.5-2.5 2.5h-13C4.12 22 3 20.88 3 19.5v-15zM5.5 4c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-13zM16 10H8V8h8v2zm-8 2h8v2H8v-2z"
                      fill="currentColor"
                    />
                  </g>
                </svg>
                <span className="text-sm" data-testid="altTextLabel">
                  Add description
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
