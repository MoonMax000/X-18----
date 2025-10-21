import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { FearGreedWidget } from "@/components/testLab/FearGreedWidget";
import { CommunitySentimentWidget } from "@/components/testLab/CommunitySentimentWidget";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, { type NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import TestFiltersBar from "@/components/testLab/TestFiltersBar";
import type { LabCategory } from "@/components/testLab/categoryConfig";
import type { ComposerData } from "@/features/feed/types";
import { MOCK_POSTS, TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import QuickComposer from "@/features/feed/components/composers/QuickComposer";

type MonetizationFilter = "all" | "free" | "premium";
type SortOption = "recent" | "likes_desc" | "likes_asc";

export default function FeedTest() {
  const [feedMode, setFeedMode] = useState<"forYou" | "following">("forYou");
  const [activeCategory, setActiveCategory] = useState<LabCategory | "all">("all");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [monetizationFilter, setMonetizationFilter] = useState<MonetizationFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [selectedTicker, setSelectedTicker] = useState("");

  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(
    new Set(["@cryptowhale", "@marketnews"])
  );

  const [isAdvancedComposerOpen, setIsAdvancedComposerOpen] = useState(false);
  const [advancedComposerData, setAdvancedComposerData] = useState<Partial<ComposerData>>({});

  const [displayedPosts, setDisplayedPosts] = useState(MOCK_POSTS);
  const [newCount, setNewCount] = useState(0);

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

  const handleResetFilters = useCallback(() => {
    setActiveCategory("all");
    setSelectedAssets([]);
    setMonetizationFilter("all");
    setSortOption("recent");
    setFeedMode("forYou");
  }, []);

  const loadNew = useCallback(() => {
    setNewCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredPosts = useMemo(() => {
    let res = [...displayedPosts];

    if (feedMode === "following") {
      res = res.filter(p => followingAuthors.has(p.author.handle));
    }

    if (activeCategory !== "all") {
      const categoryMap: Record<LabCategory, string[]> = {
        signal: ["signal"],
        news: ["news"],
        analysis: ["analysis"],
        code: ["code"],
        education: ["education"],
        macro: ["macro"],
        onchain: ["onchain"],
        video: ["video"],
        general: ["general"],
        analytics: ["analysis", "macro", "onchain"]
      };
      const allowedTypes = categoryMap[activeCategory] || [];
      res = res.filter(p => allowedTypes.includes(p.type));
    }

    if (selectedAssets.length > 0) {
      res = res.filter(p => {
        if (!p.ticker) return false;
        const tickerSymbol = p.ticker.replace("$", "");
        return selectedAssets.some(asset => tickerSymbol.toUpperCase().includes(asset.toUpperCase()));
      });
    }

    if (monetizationFilter === "free") {
      res = res.filter(p => p.price === "free");
    } else if (monetizationFilter === "premium") {
      res = res.filter(p => p.price !== "free");
    }

    if (sortOption === "likes_desc") {
      res.sort((a, b) => b.likes - a.likes);
    } else if (sortOption === "likes_asc") {
      res.sort((a, b) => a.likes - b.likes);
    } else {
      res = res.slice().reverse();
    }

    return res;
  }, [displayedPosts, feedMode, followingAuthors, activeCategory, selectedAssets, monetizationFilter, sortOption]);

  React.useEffect(() => {
    const id = setInterval(() => setNewCount(prev => prev + Math.floor(Math.random() * 3) + 1), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-screen w-full gap-6">
      <div className="flex-1 max-w-[720px]">
        <div className="mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
          <QuickComposer onExpand={handleExpandComposer} />
        </div>

        <TestFiltersBar
          feedMode={feedMode}
          onFeedModeChange={setFeedMode}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          selectedAssets={selectedAssets}
          onAssetsChange={setSelectedAssets}
          monetizationFilter={monetizationFilter}
          onMonetizationFilterChange={setMonetizationFilter}
          sortOption={sortOption}
          onSortOptionChange={setSortOption}
          onResetFilters={handleResetFilters}
        />

        {newCount > 0 && (
          <div className="mt-2 mb-4 flex justify-center">
            <button
              onClick={loadNew}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white text-xs"
            >
              {newCount} new {newCount === 1 ? "post" : "posts"} available
            </button>
          </div>
        )}

        <ContinuousFeedTimeline posts={filteredPosts} onFollowToggle={toggleFollow} />
      </div>

      <div className="hidden lg:block w-[340px] space-y-4">
        <FearGreedWidget score={32} />
        <CommunitySentimentWidget bullishPercent={82} votesText="1.9M votes" />

        <div className="rounded-2xl border border-widget-border bg-[#000000] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">Trending Tickers</h3>
          <div className="space-y-3">
            {TRENDING_TICKERS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTicker(item.ticker)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg p-2 transition",
                  selectedTicker === item.ticker ? "bg-blue-500/20" : "hover:bg-[#1B1F27]"
                )}
              >
                <div className="font-semibold text-white">{item.ticker}</div>
                <div className="text-xs text-[#6C7280]">{item.mentions}</div>
              </button>
            ))}
          </div>
        </div>

        <SuggestedProfilesWidget profiles={DEFAULT_SUGGESTED_PROFILES} />
        <NewsWidget items={DEFAULT_NEWS_ITEMS as NewsItem[]} />
        <FollowRecommendationsWidget profiles={DEFAULT_FOLLOW_RECOMMENDATIONS} />

        <div className="rounded-2xl border border-widget-border bg-[#000000] p-4">
          <h3 className="mb-4 text-lg font-bold text-white">Top Authors</h3>
          <div className="space-y-3">
            {TOP_AUTHORS.map((author, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={author.avatar} alt={author.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-white">{author.name}</div>
                    <div className="text-xs text-[#6C7280]">{author.handle}</div>
                  </div>
                </div>
                <button
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    author.isFollowing
                      ? "bg-white/10 text-white"
                      : "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                  )}
                >
                  {author.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreatePostModal
        isOpen={isAdvancedComposerOpen}
        onClose={() => setIsAdvancedComposerOpen(false)}
        initialData={advancedComposerData}
      />
    </div>
  );
}
