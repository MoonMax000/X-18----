import React, { useState, FC } from "react";
import FeedPost from "@/features/feed/components/posts/FeedPost";
import type { Post } from "@/features/feed/types";

interface ContinuousFeedTimelineProps {
  posts: Post[];
  onFollowToggle?: (handle: string, isFollowing: boolean) => void;
}

const ContinuousFeedTimeline: FC<ContinuousFeedTimelineProps> = ({ posts, onFollowToggle }) => {
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(new Map());

  const handleFollowToggle = (handle: string, isFollowing: boolean) => {
    const newState = new Map(followingState);
    newState.set(handle, !isFollowing);
    setFollowingState(newState);
    onFollowToggle?.(handle, !isFollowing);
  };

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
    </div>
  );
};

export default ContinuousFeedTimeline;
