import { type FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import VerifiedBadge from "./VerifiedBadge";
import CommentCard from "./CommentCard";
import { getCommentsByPostId } from "@/data/socialComments";
import type { SocialPost } from "@/data/socialPosts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Heart, Repeat2 } from "lucide-react";

interface UnifiedPostDetailProps {
  post: SocialPost;
}

const UnifiedPostDetail: FC<UnifiedPostDetailProps> = ({ post }) => {
  const navigate = useNavigate();
  const comments = useMemo(() => getCommentsByPostId(post.id), [post.id]);
  const hashtags = post.hashtags ?? [];
  
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    const newComment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      author: {
        name: "You",
        handle: "@you",
        avatar: "https://i.pravatar.cc/120?img=1",
        verified: false,
      },
      timestamp: "Just now",
      text: commentText,
      likes: 0,
      replies: 0,
    };
    
    setLocalComments([newComment, ...localComments]);
    setCommentText("");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleProfileClick = () => {
    const username = post.author.handle?.replace('@', '') || post.author.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/profile/${username}`);
  };

  return (
    <article className="mx-auto flex w-full sm:max-w-[680px] flex-col gap-4 sm:gap-6 bg-black p-4 sm:p-6 text-white">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div 
          className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleProfileClick}
        >
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback className="text-sm font-semibold text-white">
              {post.author.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="hover:underline hover:underline-offset-2">{post.author.name}</span>
              {post.author.verified && <VerifiedBadge size={18} />}
            </div>
            {post.author.handle ? (
              <div className="text-sm text-[#8B98A5]">{post.author.handle}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[#8B98A5]">
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-white/5"
            aria-label="More options"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 10C10.8333 9.53977 10.4602 9.16667 10 9.16667C9.53976 9.16667 9.16667 9.53977 9.16667 10C9.16667 10.4602 9.53976 10.8333 10 10.8333Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.8333 10.8333C16.2936 10.8333 16.6667 10.4602 16.6667 10C16.6667 9.53977 16.2936 9.16667 15.8333 9.16667C15.3731 9.16667 15 9.53977 15 10C15 10.4602 15.3731 10.8333 15.8333 10.8333Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4.16667 10.8333C4.6269 10.8333 5 10.4602 5 10C5 9.53977 4.6269 9.16667 4.16667 9.16667C3.70643 9.16667 3.33333 9.53977 3.33333 10C3.33333 10.4602 3.70643 10.8333 4.16667 10.8333Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
        {post.body ? (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#E7E9EA]">
            {post.body}
          </p>
        ) : null}
        {hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {hashtags.map((tag) => (
              <span key={tag} className="text-[#4D7CFF] hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Media */}
      {post.mediaUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[#181B22]">
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      ) : null}
      
      {post.videoUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[#181B22]">
          <video
            src={post.videoUrl}
            controls
            className="w-full"
          />
        </div>
      ) : null}

      {/* Timestamp */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#8B98A5] border-b border-[#181B22] pb-4">
        <div>{post.timestamp}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around border-b border-[#181B22] pb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#4D7CFF]"
          aria-label="Comment"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{localComments.length}</span>
        </button>
        
        <button
          type="button"
          className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#00BA7C]"
          aria-label="Repost"
        >
          <Repeat2 className="h-5 w-5" />
          <span className="text-sm">0</span>
        </button>
        
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? "text-[#F91880]" : "text-[#8B98A5] hover:text-[#F91880]"
          }`}
          aria-label="Like"
        >
          <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm">{likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}</span>
        </button>

        <div className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#4D7CFF]" aria-label="Views">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
              fill="currentColor"
            />
          </svg>
          {typeof post.views === "number" ? (
            <span className="text-sm">{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views}</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setIsBookmarked(!isBookmarked)}
          className={`flex items-center gap-2 transition-colors ${
            isBookmarked ? "text-[#A06AFF]" : "text-[#8B98A5] hover:text-[#A06AFF]"
          }`}
          aria-label="Bookmark"
        >
          <svg
            className="h-[18px] w-[18px]"
            viewBox="0 0 20 20"
            fill={isBookmarked ? "currentColor" : "none"}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.33301 14.9838V8.08945C3.33301 5.06164 3.33301 3.54774 4.30932 2.60712C5.28563 1.6665 6.85697 1.6665 9.99967 1.6665C13.1423 1.6665 14.7138 1.6665 15.69 2.60712C16.6663 3.54774 16.6663 5.06164 16.6663 8.08945V14.9838C16.6663 16.9054 16.6663 17.8662 16.0223 18.2101C14.7751 18.876 12.4357 16.6542 11.3247 15.9852C10.6803 15.5972 10.3582 15.4032 9.99967 15.4032C9.64117 15.4032 9.31901 15.5972 8.67467 15.9852C7.56367 16.6542 5.22423 18.876 3.97705 18.2101C3.33301 17.8662 3.33301 16.9054 3.33301 14.9838Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Comment Form */}
      <div className="rounded-2xl border border-[#181B22] bg-[#0A0A0A] p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src="https://i.pravatar.cc/120?img=1" alt="You" />
            <AvatarFallback className="text-sm font-semibold text-white">Y</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Post your reply..."
              className="w-full resize-none bg-transparent text-sm text-white placeholder:text-[#8B98A5] focus:outline-none min-h-[40px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmitComment();
                }
              }}
            />
            <div className="mt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {localComments.length > 0 ? (
        <section className="flex flex-col border-t border-[#181B22] pt-4">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Comments ({localComments.length})
          </h3>
          <div className="flex flex-col">
            {localComments.map((comment, index) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                isFirst={index === 0}
                onReply={(commentId, text) => {
                  if (!text.trim()) return;

                  const newReply = {
                    id: `reply-${Date.now()}`,
                    postId: post.id,
                    author: {
                      name: "You",
                      handle: "@you",
                      avatar: "https://i.pravatar.cc/120?img=1",
                      verified: false,
                    },
                    timestamp: "now",
                    text: text.trim(),
                    likes: 0,
                  };

                  // Recursive function to add reply at any level
                  const addReplyToComment = (comments: typeof localComments): typeof localComments => {
                    return comments.map((c) => {
                      if (c.id === commentId) {
                        return {
                          ...c,
                          replies: [...(c.replies || []), newReply],
                          replyCount: (c.replyCount || 0) + 1,
                        };
                      }

                      // Recursively search in nested replies
                      if (c.replies && c.replies.length > 0) {
                        const updatedReplies = addReplyToComment(c.replies);
                        if (updatedReplies !== c.replies) {
                          return { ...c, replies: updatedReplies };
                        }
                      }

                      return c;
                    });
                  };

                  setLocalComments((prevComments) => addReplyToComment(prevComments));
                }}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center border-t border-[#181B22] py-12 text-center text-[#8B98A5]">
          <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No comments yet</p>
          <p className="mt-2 text-xs">Be the first to comment on this post</p>
        </div>
      )}
    </article>
  );
};

export default UnifiedPostDetail;
