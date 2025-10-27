import React, { useState, useCallback, useMemo } from "react";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import type { ComposerData } from "@/features/feed/types";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import { TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import { QuickComposer, FeedTabs, FeedFilters, RightSidebar, NewPostsBanner } from "@/features/feed/components";
import { useCustomTimeline } from "@/hooks/useCustomTimeline";
import type { Post as CustomPost } from "@/services/api/custom-backend";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { formatTimeAgo } from "@/lib/time-utils";
import { useAuth } from "@/contexts/AuthContext";

// Convert Custom Backend post to feed post format
function customPostToFeedPost(post: CustomPost, currentUsername?: string): any {
  // Use centralized avatar utility for consistency
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
    },
    timestamp: formatTimeAgo(post.created_at),
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
    ticker: post.metadata?.ticker,
    sentiment: post.metadata?.sentiment,
    direction: post.metadata?.direction,
    timeframe: post.metadata?.timeframe,
    risk: post.metadata?.risk,
    entry: post.metadata?.entry,
    stopLoss: post.metadata?.stop_loss,
    takeProfit: post.metadata?.take_profit,
    market: post.metadata?.market,
    category: post.metadata?.post_type,
  };
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
  } = useCustomTimeline({
    type: 'explore',
    limit: 20,
    autoRefresh: true,
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
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading feed...</p>
        </div>
      </div>
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
              Make sure GoToSocial is running at {import.meta.env.VITE_API_URL || '/api'}
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
      <div className="flex-1 max-w-[720px]">
        <div className="mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
          <QuickComposer 
            onExpand={handleExpandComposer}
            onPostCreated={refresh}
          />
        </div>

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
        />
      </div>

      <RightSidebar
        fearGreedScore={32}
        communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
        trendingTickers={TRENDING_TICKERS}
        selectedTicker={selectedTicker}
        onTickerClick={setSelectedTicker}
        suggestedProfiles={[]}
        newsItems={DEFAULT_NEWS_ITEMS as NewsItem[]}
        followRecommendations={DEFAULT_FOLLOW_RECOMMENDATIONS}
        topAuthors={TOP_AUTHORS}
        onAuthorFollowToggle={toggleFollow}
      />

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
