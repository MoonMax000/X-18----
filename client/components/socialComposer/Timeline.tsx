"use client";

import { useNavigate } from "react-router-dom";

import FeedPost from "@/components/PostCard/VideoPost";
import type { SocialPost } from "@/data/socialPosts";
import { cn } from "@/lib/utils";

interface TimelineProps {
  posts: SocialPost[];
  className?: string;
}

export default function Timeline({ posts, className }: TimelineProps) {
  const navigate = useNavigate();
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm mt-2">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full flex-col items-center gap-4 sm:gap-6 md:gap-8 pt-3 sm:pt-4 md:pt-6", className)}
    >
      {posts.map((post) => {
        const content = post.body ?? post.preview ?? "";
        const shouldTruncate = content.length > 260;

        return (
          <FeedPost
            key={post.id}
            author={post.author}
            timestamp={post.timestamp}
            title={post.title}
            content={content}
            mediaUrl={post.videoUrl ?? post.mediaUrl ?? null}
            sentiment={post.sentiment}
            likes={post.likes}
            comments={post.comments}
            views={post.views}
            isFollowing={post.isFollowing}
            hashtags={post.hashtags}
            category={post.category}
            type={post.type}
            truncate={shouldTruncate}
            onOpen={() => navigate(`/social/post/${post.id}`, { state: post })}
          />
        );
      })}
    </div>
  );
}
