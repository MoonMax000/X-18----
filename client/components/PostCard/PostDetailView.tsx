import { type FC, useMemo } from "react";

import VideoPost from "./VideoPost";
import CommentCard from "./CommentCard";
import VerifiedBadge from "./VerifiedBadge";
import { formatTimeAgo } from "@/lib/time-utils";

import type { SocialPost } from "@/data/socialPosts";
import { getCommentsByPostId } from "@/data/socialComments";

interface PostDetailViewProps {
  post: SocialPost;
}

const PostDetailView: FC<PostDetailViewProps> = ({ post }) => {
  const comments = useMemo(() => getCommentsByPostId(post.id), [post.id]);
  if (post.type === "video") {
    return (
      <VideoPost
        author={post.author}
        timestamp={post.timestamp}
        title={post.title}
        content={post.body ?? post.preview}
        videoUrl={post.videoUrl ?? ""}
        sentiment={post.sentiment}
        likes={post.likes}
        comments={post.comments}
        isFollowing={post.isFollowing}
        hashtags={post.hashtags ?? []}
      />
    );
  }

  const hashtags = post.hashtags ?? [];

  return (
    <article className="mx-auto flex w-full sm:max-w-[680px] flex-col gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border border-[#181B22] bg-black p-4 sm:p-6 text-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-[#0F1319]">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-lg font-semibold">
              {post.author.name}
              {post.author.verified && (
                <VerifiedBadge size={18} />
              )}
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
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 10C17.5 5.85787 14.1421 2.5 10 2.5C5.85787 2.5 2.5 5.85787 2.5 10C2.5 12.8729 4.17751 15.3166 6.5 16.5678"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M12.5 10C12.5 11.3807 11.3807 12.5 10 12.5C8.61929 12.5 7.5 11.3807 7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition hover:bg-white/5"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.16699 10H15.8337"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 4.1665L15.8333 9.99984L10 15.8332"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        {post.body ? (
          <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere text-[15px] leading-relaxed text-[#E7E9EA] max-w-full">
            {post.body}
          </p>
        ) : null}
        {hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-[#A06AFF]">
            {hashtags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {post.mediaUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[#181B22]">
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#8B98A5]">
        <div>{formatTimeAgo(post.timestamp)}</div>
        {typeof post.views === "number" ? <div>{post.views} Views</div> : null}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-[#8B98A5]">
        <button
          type="button"
          className="flex items-center gap-2 transition hover:text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 13.5V10.3388C3 9.75902 3 9.46912 3.08796 9.20875C3.16683 8.97324 3.29337 8.75923 3.45819 8.58266C3.6415 8.38657 3.89808 8.24724 4.41124 7.96857L8.41124 5.79008C8.85064 5.55413 9.07033 5.43615 9.29341 5.39337C9.49032 5.35536 9.69219 5.35536 9.88909 5.39337C10.1122 5.43615 10.3319 5.55413 10.7713 5.79008L14.7713 7.96857C15.2844 8.24724 15.541 8.38657 15.7243 8.58266C15.8891 8.75923 16.0156 8.97324 16.0945 9.20875C16.1825 9.46912 16.1825 9.75902 16.1825 10.3388V13.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>View engagements</span>
        </button>
      </div>

      <footer className="rounded-2xl border border-[#181B22] bg-black p-4">
        <div className="text-sm font-semibold text-[#8B98A5]">
          Post your reply
        </div>
        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Reply
        </button>
      </footer>

      {comments.length > 0 ? (
        <section className="mt-4 flex flex-col">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Comments ({comments.length})
          </h3>
          <div className="flex flex-col">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
};

export default PostDetailView;
