import React, { useState, useRef, useEffect, FC } from "react";
import FeedPost from "@/features/feed/components/posts/FeedPost";
import { PostSkeleton } from "@/components/skeletons/PostSkeleton";
import type { Post } from "@/features/feed/types";

interface ContinuousFeedTimelineProps {
  posts: Post[];
  onFollowToggle?: (handle: string, isFollowing: boolean) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

const ContinuousFeedTimeline: FC<ContinuousFeedTimelineProps> = ({
  posts,
  onFollowToggle,
  onLoadMore,
  isLoading = false,
  hasMore,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(new Map());

  const handleFollowToggle = (handle: string, isFollowing: boolean) => {
    const newState = new Map(followingState);
    newState.set(handle, !isFollowing);
    setFollowingState(newState);
    onFollowToggle?.(handle, !isFollowing);
  };

  // Infinite scroll: trigger onLoadMore when scrolling near bottom
  useEffect(() => {
    if (!onLoadMore || !loadMoreRef.current || isLoading || hasMore === false) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [onLoadMore, isLoading, hasMore]);

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">No posts yet</p>
        <p className="text-sm mt-2">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center pt-3 sm:pt-4 md:pt-6">
      {posts.map((post, index) => {
        const isFollowing = followingState.get(post.author.handle) ?? post.author.isFollowing ?? false;

        return (
          <FeedPost
            key={post.id}
            post={post}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
            showTopBorder={index === 0}
          />
        );
      })}

      {/* Infinite scroll trigger */}
      {onLoadMore && hasMore && (
        <div ref={loadMoreRef} className="w-full">
          {isLoading && <PostSkeleton count={2} />}
          {!isLoading && <div className="h-4" />}
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="flex w-full justify-center py-8 text-sm text-muted-foreground">
          No more posts
        </div>
      )}
    </div>
  );
};

export default ContinuousFeedTimeline;
