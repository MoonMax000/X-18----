import { type FC, useState } from "react";

import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import type { SocialComment } from "@/data/socialComments";

import VerifiedBadge from "./VerifiedBadge";

interface CommentCardProps {
  comment: SocialComment;
}

const CommentCard: FC<CommentCardProps> = ({ comment }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked((prev) => !prev);
  };

  return (
    <article className="flex gap-3 border-b border-[#181B22] py-4">
      <UserAvatar
        src={comment.author.avatar}
        alt={comment.author.name}
        size={40}
        accent={false}
      />
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
          <button
            type="button"
            onClick={handleLike}
            className={`group flex items-center gap-1.5 transition-colors ${
              liked ? "text-[#F91880]" : "hover:text-[#F91880]"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors"
            >
              <path
                d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                fill={liked ? "currentColor" : "currentColor"}
              />
            </svg>
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {typeof comment.replies === "number" && comment.replies > 0 ? (
            <button
              type="button"
              className="group flex items-center gap-1.5 transition-colors hover:text-[#A06AFF]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 9.16667C17.5 13.0326 14.1421 16.25 10 16.25C8.80208 16.25 7.67708 16 6.66667 15.5417L2.5 16.25L3.75 12.9167C3.125 11.8646 2.5 10.5729 2.5 9.16667C2.5 5.30076 5.85786 2.08333 10 2.08333C14.1421 2.08333 17.5 5.30076 17.5 9.16667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm font-medium">{comment.replies}</span>
            </button>
          ) : null}

          <button
            type="button"
            className="group flex items-center gap-1.5 transition-colors hover:text-[#A06AFF]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.8333 10L10 15.8333M10 15.8333L4.16667 10M10 15.8333V4.16667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default CommentCard;
