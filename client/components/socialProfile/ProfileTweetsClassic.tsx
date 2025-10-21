import { useState } from "react";
import type { SocialPost } from "@/data/socialPosts";
import FeedPost from "@/features/feed/components/posts/FeedPost";
import type { Post } from "@/features/feed/types";

interface ProfileTweetsClassicProps {
  posts: SocialPost[];
}

// Transform SocialPost to optimized Post format
function transformToPost(socialPost: SocialPost): Post {
  return {
    id: socialPost.id,
    author: {
      name: socialPost.author.name,
      handle: socialPost.author.handle,
      avatar: socialPost.author.avatar,
      verified: socialPost.author.verified,
      isFollowing: socialPost.isFollowing,
    },
    timestamp: socialPost.timestamp,
    type: socialPost.type === "video" ? "video" : "general",
    text: socialPost.preview || socialPost.body || "",
    sentiment: socialPost.sentiment,
    likes: socialPost.likes ?? 0,
    comments: socialPost.comments ?? 0,
    reposts: 0,
    views: socialPost.views ?? 0,
    tags: socialPost.hashtags,
    mediaUrl: socialPost.videoUrl || socialPost.mediaUrl,
  };
}

export default function ProfileTweetsClassic({ posts }: ProfileTweetsClassicProps) {
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(new Map());

  const handleFollowToggle = (handle: string, isFollowing: boolean) => {
    const newState = new Map(followingState);
    newState.set(handle, !isFollowing);
    setFollowingState(newState);
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#888]">
        <p className="text-lg">No posts yet</p>
      </div>
    );
  }

  const transformedPosts = posts.map(transformToPost);

  return (
    <div className="flex w-full flex-col items-center pt-3 sm:pt-4 md:pt-6">
      {transformedPosts.map((post, index) => {
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
}
