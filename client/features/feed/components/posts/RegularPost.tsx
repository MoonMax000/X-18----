import React from "react";
import { PostHeader } from "./PostHeader";
import { PostFooter } from "./PostFooter";
import type { Post } from "../../types";

interface RegularPostProps {
  post: Post;
  isFollowing: boolean;
  onFollowToggle: (handle: string, isFollowing: boolean) => void;
}

export default function RegularPost({ post, isFollowing, onFollowToggle }: RegularPostProps) {
  const getCategoryBadge = () => {
    const badges = {
      code: { bg: "#6B6BFF", label: "Soft", icon: "</>" },
      video: { bg: "#FF6BD4", label: "Video", icon: "▶" },
      education: { bg: "#4FC3F7", label: "Idea", icon: "💡" },
      analysis: { bg: "#4FC3F7", label: "Idea", icon: "💡" },
      general: { bg: "#FF6B6B", label: "Opinion", icon: "💬" },
      macro: { bg: "#FF6B6B", label: "Opinion", icon: "💬" },
      onchain: { bg: "#F7A350", label: "Analytics", icon: "📊" },
      news: { bg: "#F7A350", label: "Analytics", icon: "📊" },
    };

    const badge = badges[post.type as keyof typeof badges];
    if (!badge) return null;

    return (
      <span
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
        style={{ backgroundColor: badge.bg }}
      >
        {badge.label}
      </span>
    );
  };

  return (
    <article className="flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6">
      <PostHeader post={post} isFollowing={isFollowing} onFollowToggle={onFollowToggle}>
        {getCategoryBadge()}
      </PostHeader>

      {/* Content */}
      <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px]">
        <p className="whitespace-pre-line text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white">
          {post.text}
          {post.tags?.map((tag) => (
            <span key={tag} className="text-[#4D7CFF] font-normal">
              {" "}
              {tag}
            </span>
          ))}
        </p>
      </section>

      <PostFooter post={post} />
    </article>
  );
}
