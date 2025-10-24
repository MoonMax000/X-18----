import React, { useState, useRef, useEffect, FC } from "react";
import FeedPost from "@/features/feed/components/posts/FeedPost";
import type { Post } from "@/features/feed/types";

interface ContinuousFeedTimelineProps {
  posts: Post[];
  onFollowToggle?: (handle: string, isFollowing: boolean) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

const ContinuousFeedTimeline: FC<ContinuousFeedTimelineProps> = ({
  posts,
  onFollowToggle,
  onLoadMore,
  isLoading = false,
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
    if (!onLoadMore || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [onLoadMore, isLoading]);

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
      {onLoadMore && (
        <div ref={loadMoreRef} className="flex w-full justify-center py-8">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContinuousFeedTimeline;
