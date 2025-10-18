"use client";

import { useState, useRef, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Image, Video, BarChart3, Smile, MapPin, Calendar, Plus } from "lucide-react";

import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import type { MediaItem } from "@/components/CreatePostBox/types";
import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import { cn } from "@/lib/utils";

interface TweetFormProps {
  submitText?: string;
  onSubmit: (text: string) => Promise<void>;
  className?: string;
  placeholder?: string;
  collapsedOnMount?: boolean;
  minHeight?: number;
  shouldFocus?: boolean;
  replyingTo?: string | null;
  userAvatar?: string;
  userName?: string;
}

const MAX_CHARS = 280;

type ComposerBlock = {
  id: string;
  text: string;
  media: MediaItem[];
  codeBlocks: Array<{ id: string; code: string; language: string }>;
};

const createBlock = (text = ""): ComposerBlock => ({
  id:
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
  text,
  media: [],
  codeBlocks: [],
});

const actions = [
  { id: "image", Icon: Image, alt: "Image", color: "#A06AFF" },
  { id: "video", Icon: Video, alt: "Video", color: "#A06AFF" },
  { id: "poll", Icon: BarChart3, alt: "Poll", color: "#A06AFF" },
  { id: "emoji", Icon: Smile, alt: "Emoji", color: "#A06AFF" },
  { id: "schedule", Icon: Calendar, alt: "Schedule", color: "#A06AFF" },
  {
    id: "location",
    Icon: MapPin,
    alt: "Location",
    color: "#A06AFF",
    disabled: true,
  },
];

export default function TweetForm({
  submitText = "Post",
  onSubmit,
  className,
  placeholder = "What's happening?",
  collapsedOnMount = false,
  minHeight = 120,
  shouldFocus = false,
  replyingTo = null,
  userAvatar = "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200",
  userName = "Current User",
}: TweetFormProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [expanded, setExpanded] = useState(!collapsedOnMount);
  const [text, setText] = useState("");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [threadBlocks, setThreadBlocks] = useState<ComposerBlock[] | null>(null);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [shouldFocus]);

  const percentage =
    text.length >= MAX_CHARS ? 100 : (text.length / MAX_CHARS) * 100;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (exceededMax) {
      alert("Post cannot exceed " + MAX_CHARS + " characters");
      return;
    }

    await onSubmit(text);
    setText("");
  };

  const onClick = () => {
    setExpanded(true);
  };

  const openComposer = () => {
    setExpanded(true);
    const baseBlock = createBlock(text);
    const blocks: ComposerBlock[] = [baseBlock, createBlock("")];
    setThreadBlocks(blocks);
    setIsComposerOpen(true);
  };

  const handleComposerClose = (blocks?: ComposerBlock[]) => {
    setIsComposerOpen(false);
    if (blocks && blocks.length > 0) {
      setText(blocks[0].text ?? "");
    }
    setThreadBlocks(null);
  };

  const isInputEmpty = !Boolean(text);
  const charsLeft = MAX_CHARS - text.length;
  const maxAlmostReached = charsLeft <= 20;
  const exceededMax = charsLeft < 0;
  const isReplying = Boolean(replyingTo);

  return (
    <div className={cn("w-full", className)}>
      {isReplying && expanded && (
        <span className="ml-14 mb-2.5 flex text-sm text-muted-foreground">
          Replying to <span className="ml-1 text-[#A06AFF]">@{replyingTo}</span>
        </span>
      )}
      <form
        onSubmit={submit}
        className={cn("w-full flex", expanded ? "items-start" : "items-center")}
      >
        <UserAvatar
          src={userAvatar}
          alt={userName}
          size={40}
          containerClassName="mr-4"
        />
        <div
          className={cn(
            "flex-1 flex min-h-0",
            expanded ? "flex-col" : "flex-row items-center",
          )}
        >
          <TextareaAutosize
            ref={inputRef}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            value={text}
            onClick={onClick}
            minRows={expanded ? 3 : 1}
            className="w-full tweet-textarea bg-transparent border-none pt-2.5 text-lg resize-none outline-none text-white placeholder:text-[#4E5A66]"
          />

          <div className={cn("flex items-center", expanded ? "mt-3" : "mt-0")}>
            {expanded &&
              actions.map((action) => (
                <button
                  type="button"
                  disabled={action.disabled}
                  key={action.id}
                  className="disabled:opacity-50 hover:bg-white/10 p-2 rounded-full transition-colors"
                  title={action.alt}
                >
                  <action.Icon size={19} color={action.color} />
                </button>
              ))}

            <div className="flex items-center ml-auto">
              {!isInputEmpty && (
                <div className="relative">
                  <svg
                    className="-rotate-90"
                    width={maxAlmostReached ? "38" : "28"}
                    height={maxAlmostReached ? "38" : "28"}
                  >
                    <circle
                      cx={maxAlmostReached ? "19" : "14"}
                      cy={maxAlmostReached ? "19" : "14"}
                      r={maxAlmostReached ? "17" : "12"}
                      fill="none"
                      stroke="rgba(113, 118, 123, 0.3)"
                      strokeWidth="2.2"
                    />
                    <circle
                      cx={maxAlmostReached ? "19" : "14"}
                      cy={maxAlmostReached ? "19" : "14"}
                      r={maxAlmostReached ? "17" : "12"}
                      fill="none"
                      stroke={
                        exceededMax
                          ? "red"
                          : maxAlmostReached
                            ? "#ffd400"
                            : "#A06AFF"
                      }
                      strokeWidth="2.2"
                      strokeDasharray={`${(percentage * (maxAlmostReached ? 106.8 : 75.4)) / 100} ${
                        maxAlmostReached ? 106.8 : 75.4
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {maxAlmostReached && (
                    <span
                      className={cn(
                        "absolute top-0 bottom-0 left-0 right-0 m-auto h-max w-max text-sm",
                        exceededMax ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      {charsLeft}
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={openComposer}
                className="mr-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#A06AFF] text-[#A06AFF] transition-colors hover:bg-[#A06AFF]/10 disabled:opacity-40"
                title="Add another post"
                aria-label="Add another post"
              >
                <Plus className="h-5 w-5" />
              </button>
              {!isInputEmpty && (
                <hr className="h-7 w-0.5 border-none bg-[#444] mx-4" />
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#482090] to-[#A06AFF] px-5 py-2.5 text-white rounded-full font-bold text-base disabled:opacity-60 hover:from-[#482090] hover:to-[#482090] transition-colors"
                disabled={isInputEmpty}
              >
                {submitText}
              </button>
            </div>
          </div>
        </div>
      </form>
      <CreatePostModal
        isOpen={isComposerOpen}
        onClose={handleComposerClose}
        initialBlocks={threadBlocks ?? undefined}
      />
    </div>
  );
}
