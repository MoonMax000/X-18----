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
          {comment.content}
        </p>

        <div className="mt-1 flex items-center gap-6 text-[#6C7080]">
          <button
            type="button"
            onClick={handleLike}
            className="group flex items-center gap-1.5 transition-colors hover:text-[#A06AFF]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill={liked ? "currentColor" : "none"}
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors"
            >
              <path
                d="M10.5167 16.0417L10.5083 16.0334L10.5 16.025C8.84167 14.5917 7.525 13.4417 6.575 12.4C5.625 11.3584 5.16667 10.5917 5.16667 9.66671C5.16667 8.74171 5.85833 8.01671 6.66667 8.01671C7.25833 8.01671 7.83333 8.31671 8.14167 8.76671L9.16667 10.225L10.1917 8.76671C10.5 8.31671 11.075 8.01671 11.6667 8.01671C12.475 8.01671 13.1667 8.74171 13.1667 9.66671C13.1667 10.5917 12.7083 11.3584 11.7583 12.4C10.8083 13.4417 9.49167 14.5917 7.83333 16.025L7.825 16.0334L7.81667 16.0417C7.725 16.1251 7.60833 16.1667 7.5 16.1667C7.39167 16.1667 7.275 16.1251 7.18333 16.0417L10.5167 16.0417Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
