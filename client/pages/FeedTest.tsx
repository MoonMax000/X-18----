import React, { useState, useCallback, useMemo, useEffect } from "react";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import type { ComposerData } from "@/features/feed/types";
import { QuickComposer, FeedTabs, FeedFilters, NewPostsBanner } from "@/features/feed/components";
import { useCustomTimeline } from "@/hooks/useCustomTimeline";
import type { Post as CustomPost } from "@/services/api/custom-backend";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { formatTimeAgo } from "@/lib/time-utils";
import { useAuth } from "@/contexts/AuthContext";
import { BrandedLoader } from "@/components/common/BrandedLoader";
import NewsWidget from "@/components/SocialFeedWidgets/NewsWidget";
import TrendingNewsWidget from "@/components/SocialFeedWidgets/TrendingNewsWidget";
import TrendingTickersWidget from "@/components/SocialFeedWidgets/TrendingTickersWidget";
import TopAuthorsWidget from "@/components/SocialFeedWidgets/TopAuthorsWidget";
import MyEarningsWidget from "@/components/SocialFeedWidgets/MyEarningsWidget";
import MyActivityWidget from "@/components/SocialFeedWidgets/MyActivityWidget";

// Convert Custom Backend post to feed post format
function customPostToFeedPost(post: CustomPost, currentUsername?: string): any {
  // Use centralized avatar utility for consistency
  const avatarUrl = getAvatarUrl(post.user);
  const postAuthorHandle = `@${post.user?.username || 'unknown'}`;
  const currentUserHandle = currentUsername ? `@${currentUsername}` : null;
  const isCurrentUser = currentUserHandle && postAuthorHandle 
    ? postAuthorHandle.toLowerCase() === currentUserHandle.toLowerCase()
    : false;
  
  // Debug logging for code blocks
  if (post.metadata?.code_blocks) {
    console.log('[FeedTest] Converting post with code blocks:', {
      postId: post.id,
      metadata: post.metadata,
      codeBlocks: post.metadata.code_blocks,
    });
  }
  
  const convertedPost = {
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
    },
    created_at: post.created_at,  // Pass raw timestamp, formatting happens in FeedPost
    // Use flat properties instead of nested engagement object
    likes: post.likes_count || 0,
    comments: post.replies_count || 0,
    reposts: post.retweets_count || 0,
    views: 0,
    // Include interaction states from API
    isLiked: post.is_liked || false,
    isRetweeted: post.is_retweeted || false,
    isBookmarked: post.is_bookmarked || false,
    media: post.media?.map((mediaItem) => ({
      id: mediaItem.id,
      url: mediaItem.url,
      type: mediaItem.type as 'image' | 'video' | 'gif',
      alt: mediaItem.alt_text || '',
      thumbnail_url: mediaItem.thumbnail_url,
      width: mediaItem.width,
      height: mediaItem.height,
    })) || [],
    codeBlocks: post.metadata?.code_blocks || [],
    ticker: post.metadata?.ticker,
    sentiment: post.metadata?.sentiment,
    direction: post.metadata?.direction,
    timeframe: post.metadata?.timeframe,
    risk: post.metadata?.risk,
    entry: post.metadata?.entry,
    stopLoss: post.metadata?.stop_loss,
    takeProfit: post.metadata?.take_profit,
    market: post.metadata?.market,
    category: post.metadata?.category,
  };
  
  // Debug log final converted post
  if (convertedPost.codeBlocks && convertedPost.codeBlocks.length > 0) {
    console.log('[FeedTest] Converted post with codeBlocks:', {
      postId: convertedPost.id,
      codeBlocksCount: convertedPost.codeBlocks.length,
      codeBlocks: convertedPost.codeBlocks,
    });
  }
  
  return convertedPost;
}

export default function FeedTest() {
  const { user } = useAuth();
  const {
    activeTab,
    setActiveTab,
    feedMode,
    setFeedMode,
    filters,
    updateFilter,
    selectedTicker,
    setSelectedTicker,
    applyToPosts
  } = useFeedFilters("all");

  // Use Custom Backend timeline
  // Always use explore for now (public timeline)
  const {
    posts: customPosts,
    isLoading,
    loadMore,
    newCount,
    loadNew,
    refresh,
    error,
    hasMore,
  } = useCustomTimeline({
    type: 'explore',
    limit: 20,
    autoRefresh: false, // Временно отключаем auto-refresh для отладки
    refreshInterval: 60000,
  });

  // Auto-refresh when returning to page
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refresh]);

  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(new Set());
  const [isAdvancedComposerOpen, setIsAdvancedComposerOpen] = useState(false);
  const [advancedComposerData, setAdvancedComposerData] = useState<Partial<ComposerData>>({});

  const handleExpandComposer = useCallback((data: Partial<ComposerData>) => {
    setAdvancedComposerData(data);
    setIsAdvancedComposerOpen(true);
  }, []);

  const toggleFollow = useCallback((handle: string) => {
    setFollowingAuthors(prev => {
      const next = new Set(prev);
      next.has(handle) ? next.delete(handle) : next.add(handle);
      return next;
    });
  }, []);

  const posts = useMemo(
    () => Array.isArray(customPosts) ? customPosts.map(post => customPostToFeedPost(post, user?.username)) : [],
    [customPosts, user?.username]
  );

  const filteredPosts = useMemo(
    () => applyToPosts(posts, followingAuthors),
    [applyToPosts, posts, followingAuthors]
  );

  if (isLoading && posts.length === 0) {
    return (
      <BrandedLoader delay={200} />
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Failed to load feed</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <p className="text-xs text-muted-foreground mt-4">
              Make sure custom-backend is running at {import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full gap-6">
      <div className="flex-1 max-w-[720px] min-w-0">
        {user && (
          <>
            {/* Desktop: Full QuickComposer */}
            <div className="hidden md:block mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
              <QuickComposer 
                onExpand={handleExpandComposer}
                onPostCreated={refresh}
              />
            </div>

            {/* Mobile: Compact Create Post Button */}
            <button
              onClick={() => setIsAdvancedComposerOpen(true)}
              className="md:hidden mb-4 w-full flex items-center gap-3 rounded-2xl border border-widget-border bg-[#000000] p-4 hover:bg-[#0A0A0A] transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6B46C1] to-[#482090] flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white">Создать пост</p>
                <p className="text-xs text-gray-400">Поделитесь идеями, сигналами или анализом</p>
              </div>
              <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="sticky top-0 z-30 -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6 bg-black py-2">
          <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          <FeedFilters
            activeTab={activeTab}
            filters={filters}
            feedMode={feedMode}
            onFilterChange={updateFilter}
            onFeedModeChange={setFeedMode}
          />
        </div>

        <NewPostsBanner count={newCount} onClick={loadNew} />

        <ContinuousFeedTimeline 
          posts={filteredPosts} 
          onFollowToggle={toggleFollow}
          onLoadMore={loadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />
      </div>

      {/* Right Sidebar with Widgets */}
      <div className="hidden lg:block w-[340px]">
        <div className="sticky top-20 space-y-4">
          <NewsWidget limit={5} />
          <TrendingNewsWidget title="Актуальное" limit={5} showAvatars={true} />
          <TrendingTickersWidget limit={10} timeframe="24h" />
          <TopAuthorsWidget limit={5} timeframe="7d" />
          {user && (
            <>
              <MyEarningsWidget period="30d" />
              <MyActivityWidget period="7d" />
            </>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isAdvancedComposerOpen}
        onClose={() => {
          setIsAdvancedComposerOpen(false);
          refresh();
        }}
      />
    </div>
  );
}
