import React, { useState, useCallback, useMemo } from "react";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import type { ComposerData } from "@/features/feed/types";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import { TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import { QuickComposer, FeedTabs, FeedFilters, RightSidebar, NewPostsBanner } from "@/features/feed/components";
import { useGTSTimeline } from "@/hooks/useGTSTimeline";
import type { GTSStatus } from "@/services/api/gotosocial";

// Convert GoToSocial status to our Post format
function gtsStatusToPost(status: GTSStatus): any {
  return {
    id: status.id,
    type: status.custom_metadata?.post_type || 'general',
    text: status.content,
    author: {
      name: status.account.display_name,
      handle: `@${status.account.username}`,
      avatar: status.account.avatar,
      verified: status.account.verified || false,
      tier: 'free',
      isFollowing: false,
    },
    timestamp: status.created_at,
    engagement: {
      likes: status.favourites_count,
      comments: status.replies_count,
      reposts: status.reblogs_count,
      bookmarks: 0,
    },
    media: status.media_attachments.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type,
      alt: m.description,
    })),
    ticker: status.custom_metadata?.ticker,
    sentiment: status.custom_metadata?.sentiment,
    direction: status.custom_metadata?.direction,
    timeframe: status.custom_metadata?.timeframe,
    risk: status.custom_metadata?.risk,
    entry: status.custom_metadata?.entry,
    stopLoss: status.custom_metadata?.stop_loss,
    takeProfit: status.custom_metadata?.take_profit,
    market: status.custom_metadata?.market,
    category: status.custom_metadata?.post_type,
  };
}

export default function FeedTest() {
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

  // Use real GoToSocial timeline
  const {
    statuses,
    isLoading,
    loadMore,
    newCount,
    loadNew,
    refresh,
  } = useGTSTimeline({
    type: feedMode === 'all' ? 'public' : feedMode === 'following' ? 'home' : 'public',
    limit: 20,
    autoRefresh: true,
    refreshInterval: 60000,
  });

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
    () => statuses.map(gtsStatusToPost),
    [statuses]
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
        onClose={() => setIsAdvancedComposerOpen(false)}
        initialBlocks={advancedComposerData.text ? [{
          id: '1',
          text: advancedComposerData.text,
          media: [],
          codeBlocks: advancedComposerData.codeSnippet ? [{
            id: 'code-1',
            code: advancedComposerData.codeSnippet,
            language: advancedComposerData.language || 'javascript',
          }] : [],
        }] : undefined}
        initialSentiment={advancedComposerData.sentiment || 'neutral'}
        onPostCreated={refresh}
      />
    </div>
  );
}
