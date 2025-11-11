import { useState, useMemo } from "react";
import FeedPost from "@/features/feed/components/posts/FeedPost";
import type { Post as ApiPost } from "@/services/api/custom-backend";
import { useUserPosts } from "@/hooks/useUserPosts";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { Loader2 } from "lucide-react";

interface ProfileTweetsClassicProps {
  userId: string;
}

// Convert API Post to FeedPost format (same as in FeedTest.tsx)
function apiPostToFeedPost(post: ApiPost, currentUsername?: string): any {
  const avatarUrl = getAvatarUrl(post.user);
  const postAuthorHandle = `@${post.user?.username || 'unknown'}`;
  const currentUserHandle = currentUsername ? `@${currentUsername}` : null;
  const isCurrentUser = currentUserHandle && postAuthorHandle 
    ? postAuthorHandle.toLowerCase() === currentUserHandle.toLowerCase()
    : false;
  
  return {
    id: post.id,
    type: post.metadata?.post_type || 'general',
    text: post.content,
    author: {
      name: post.user?.display_name || 'Unknown',
      handle: postAuthorHandle,
      avatar: avatarUrl,
      verified: post.user?.verified || false,
      tier: 'free',
      isFollowing: false,
      isCurrentUser: isCurrentUser,
      followers: post.user?.followers_count ?? 0,
      following: post.user?.following_count ?? 0,
      bio: post.user?.bio || '',
      subscriptionPrice: post.user?.subscription_price ?? 0,
    },
    created_at: post.created_at,
    likes: post.likes_count || 0,
    comments: post.replies_count || 0,
    reposts: post.retweets_count || 0,
    views: 0, // Views count not currently tracked by API
    isLiked: post.is_liked || false,
    isRetweeted: post.is_retweeted || false,
    isBookmarked: post.is_bookmarked || false,
    media: post.media?.map((mediaItem) => ({
      id: mediaItem.id,
      url: mediaItem.url,
      type: mediaItem.type as 'image' | 'video' | 'gif' | 'document',
      alt_text: mediaItem.alt_text || '',
      thumbnail_url: mediaItem.thumbnail_url,
      width: mediaItem.width,
      height: mediaItem.height,
      file_name: mediaItem.file_name,
      file_extension: mediaItem.file_extension,
      size_bytes: mediaItem.size_bytes,
    })) || [],
    codeBlocks: post.metadata?.code_blocks || [],
    ticker: post.metadata?.ticker,
    sentiment: post.metadata?.sentiment,
    timeframe: post.metadata?.timeframe,
    risk: post.metadata?.risk,
    market: post.metadata?.market,
    category: post.metadata?.category,
    accessLevel: post.accessLevel || post.access_level,
    priceCents: post.priceCents ?? post.price_cents,
    postPrice: post.postPrice ?? post.post_price,
    isPurchased: post.isPurchased ?? post.is_purchased ?? false,
    isSubscriber: post.isSubscriber ?? post.is_subscriber ?? false,
    isFollower: post.isFollower ?? post.is_follower ?? false,
    previewText: post.previewText || post.preview_text,
  };
}

export default function ProfileTweetsClassic({ userId }: ProfileTweetsClassicProps) {
  const { user } = useAuth();
  const { posts: apiPosts, isLoading, error } = useUserPosts(userId);
  const [followingState, setFollowingState] = useState<Map<string, boolean>>(new Map());

  // Convert API posts to FeedPost format
  const posts = useMemo(
    () => apiPosts.map(post => apiPostToFeedPost(post, user?.username)),
    [apiPosts, user?.username]
  );

  const handleFollowToggle = (handle: string, isFollowing: boolean) => {
    const newState = new Map(followingState);
    newState.set(handle, !isFollowing);
    setFollowingState(newState);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#A06AFF]" />
        <p className="mt-4 text-sm text-[#6C7280]">Загрузка постов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#888]">
        <p className="text-lg text-red-400">Ошибка загрузки постов</p>
        <p className="text-sm text-[#6C7280]">{error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#888]">
        <p className="text-lg">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center pt-3 sm:pt-4 md:pt-6">
      {posts.map((post, index) => {
        const isFollowing = followingState.get(post.author.handle) ?? false;

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
