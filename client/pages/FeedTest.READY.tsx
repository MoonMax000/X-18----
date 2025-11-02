import React, { useState, useCallback, useMemo } from "react";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import type { ComposerData } from "@/features/feed/types";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import { TRENDING_TICKERS, TOP_AUTHORS, MOCK_POSTS } from "@/features/feed/mocks";
import { QuickComposer, FeedTabs, FeedFilters, RightSidebar, NewPostsBanner } from "@/features/feed/components";

// TODO: Implement real feed fetching from custom-backend API

export default function FeedTestReady() {
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

  // TODO: Replace with real API calls to custom-backend
  const [posts] = useState(MOCK_POSTS);
  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(new Set());
  const [isAdvancedComposerOpen, setIsAdvancedComposerOpen] = useState(false);
  const [advancedComposerData, setAdvancedComposerData] = useState<Partial<ComposerData>>({});
  const [newCount] = useState(0);

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

  const filteredPosts = useMemo(
    () => applyToPosts(posts, followingAuthors),
    [applyToPosts, posts, followingAuthors]
  );

  const handleRefresh = useCallback(() => {
    // TODO: Implement refresh logic with custom-backend API
    console.log('Refresh feed');
  }, []);

  const handleLoadMore = useCallback(() => {
    // TODO: Implement load more with custom-backend API
    console.log('Load more posts');
  }, []);

  const handleLoadNew = useCallback(() => {
    // TODO: Implement load new posts with custom-backend API
    console.log('Load new posts');
  }, []);

  return (
    <div className="flex min-h-screen w-full gap-6">
      {/* Main Feed */}
      <div className="flex-1 max-w-[720px]">
        {/* Composer */}
        <div className="mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
          <QuickComposer 
            onExpand={handleExpandComposer}
            onPostCreated={handleRefresh}
          />
        </div>

        {/* Tabs & Filters - Sticky */}
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

        {/* New Posts Notice */}
        <NewPostsBanner count={newCount} onClick={handleLoadNew} />

        {/* Feed Timeline */}
        <ContinuousFeedTimeline 
          posts={filteredPosts} 
          onFollowToggle={toggleFollow}
          onLoadMore={handleLoadMore}
          isLoading={false}
        />
      </div>

      {/* Right Sidebar */}
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

      {/* Advanced Composer Modal */}
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
        onPostCreated={handleRefresh}
      />
    </div>
  );
}
