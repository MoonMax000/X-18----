import React, { useState, useCallback, useMemo } from "react";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import { useFeedTimeline } from "@/features/feed/hooks/useFeedTimeline";
import type { ComposerData } from "@/features/feed/types";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import { MOCK_POSTS, TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import { QuickComposer, FeedTabs, FeedFilters, RightSidebar } from "@/features/feed/components";
import { ChevronUp } from "lucide-react";

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

  const { displayed, newCount, loadNew } = useFeedTimeline(MOCK_POSTS, ["1", "3", "5"]);

  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(
    new Set(["@cryptowhale", "@marketnews"])
  );

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

  const filteredPosts = useMemo(() => applyToPosts(displayed, followingAuthors), [applyToPosts, displayed, followingAuthors]);

  return (
    <div className="flex min-h-screen w-full gap-6">
      {/* Main Feed */}
      <div className="flex-1 max-w-[720px]">
        {/* Composer */}
        <div className="mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
          <QuickComposer onExpand={handleExpandComposer} />
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
        {newCount > 0 && (
          <div className="mt-2 mb-4 flex justify-center">
            <button
              type="button"
              onClick={loadNew}
              className="group flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold text-white transition-all duration-200 bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:from-[#B47FFF] hover:to-[#5A2FA5] shadow-[0_6px_12px_rgba(128,90,213,0.3)] hover:shadow-[0_10px_20px_rgba(128,90,213,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B47FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-white opacity-75 animate-ping" />
                <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-white opacity-90 animate-pulse" />
                <ChevronUp className="relative z-10 h-2.5 w-2.5 text-white" />
              </span>
              <span>
                {newCount} new {newCount === 1 ? "post" : "posts"} available
              </span>
            </button>
          </div>
        )}

        {/* Feed Timeline */}
        <ContinuousFeedTimeline posts={filteredPosts} onFollowToggle={toggleFollow} />
      </div>

      {/* Right Sidebar - Refactored */}
      <RightSidebar
        fearGreedScore={32}
        communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
        trendingTickers={TRENDING_TICKERS}
        selectedTicker={selectedTicker}
        onTickerClick={setSelectedTicker}
        suggestedProfiles={DEFAULT_SUGGESTED_PROFILES}
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
      />
    </div>
  );
}
