import { type FC, useState } from "react";

import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import type { SocialComment } from "@/data/socialComments";

import VerifiedBadge from "./VerifiedBadge";

interface CommentCardProps {
  comment: SocialComment;
  depth?: number;
  onReply?: (commentId: string, text: string) => void;
}

const CommentCard: FC<CommentCardProps> = ({ comment, depth = 0, onReply }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked((prev) => !prev);
  };

  return (
    <>
      <article className="flex gap-3 border-b border-[#181B22] py-4 relative">
        <div className="relative flex flex-col items-center">
          <UserAvatar
            src={comment.author.avatar}
            alt={comment.author.name}
            size={40}
            accent={false}
          />
          {comment.replies && comment.replies.length > 0 && showReplies && (
            <div className="absolute top-[48px] bottom-0 w-[2px] bg-[#2F3336]" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight text-white">
              <span>{comment.author.name}</span>
              {comment.author.verified ? <VerifiedBadge size={14} /> : null}
            </div>
            <span className="text-sm text-[#8E92A0]">
              {comment.author.handle}
            </span>
            <span className="text-sm text-[#6C7080]">·</span>
            <span className="text-sm text-[#6C7080]">{comment.timestamp}</span>
          </div>

          <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/90">
            {comment.text}
          </p>

          <div className="mt-1 flex items-center gap-6 text-[#6C7080]">
            {depth < 3 && (
              <button
                type="button"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="group flex items-center gap-1.5 transition-colors hover:text-[#1D9BF0]"
                aria-label="Reply"
              >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
                  fill="currentColor"
                />
              </svg>
              {comment.replyCount ? (
                <span className="text-sm font-medium">{comment.replyCount}</span>
              ) : null}
            </button>
            )}

            <button
              type="button"
              className="group flex items-center gap-1.5 transition-colors hover:text-[#00BA7C]"
              aria-label="Repost"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleLike}
              className={`group flex items-center gap-1.5 transition-colors ${
                liked ? "text-[#F91880]" : "hover:text-[#F91880]"
              }`}
              aria-label="Like"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                  fill={liked ? "currentColor" : "currentColor"}
                />
              </svg>
              {likeCount > 0 ? (
                <span className="text-sm font-medium">{likeCount}</span>
              ) : null}
            </button>

            <button
              type="button"
              className="group flex items-center gap-1.5 transition-colors hover:text-[#4D7CFF]"
              aria-label="Views"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-3 flex gap-2">
              <UserAvatar
                src="https://i.pravatar.cc/120?img=45"
                alt="You"
                size={32}
                accent={false}
              />
              <div className="flex-1">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author.name}...`}
                  className="w-full resize-none rounded-lg border border-[#2F3336] bg-transparent px-3 py-2 text-sm text-white placeholder-[#6C7080] focus:border-[#1D9BF0] focus:outline-none"
                  rows={2}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyText("");
                    }}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (replyText.trim() && onReply) {
                        onReply(comment.id, replyText);
                        setReplyText("");
                        setShowReplyForm(false);
                        setShowReplies(true);
                      }
                    }}
                    disabled={!replyText.trim()}
                    className="rounded-full bg-[#1D9BF0] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1A8CD8] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && !showReplies && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="mt-2 flex items-center gap-2 text-sm text-[#1D9BF0] hover:underline"
            >
              <div className="h-px w-8 bg-[#2F3336]" />
              <span>Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
            </button>
          )}
        </div>
      </article>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-12">
          {comment.replies.map((reply, index) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CommentCard;
