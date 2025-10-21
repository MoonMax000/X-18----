import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Flame, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { FearGreedWidget } from "@/components/testLab/FearGreedWidget";
import { CommunitySentimentWidget } from "@/components/testLab/CommunitySentimentWidget";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, { type NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { FEED_TABS, FILTERS_CONFIG } from "@/features/feed/constants";
import { useFeedFilters } from "@/features/feed/hooks/useFeedFilters";
import { useFeedTimeline } from "@/features/feed/hooks/useFeedTimeline";
import type { ComposerData } from "@/features/feed/types";
import { MOCK_POSTS, TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import QuickComposer from "@/features/feed/components/composers/QuickComposer";

export default function FeedTest() {
  const {
    activeTab,
    setActiveTab,
    feedMode,
    setFeedMode,
    filters,
    updateFilter,
    selectedCategories,
    toggleCategory,
    selectedTicker,
    setSelectedTicker,
    activeConfig,
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

  const filteredPosts = useMemo(() => applyToPosts(displayed), [applyToPosts, displayed]);

  return (
    <div className="flex min-h-screen w-full gap-6">
      <div className="flex-1 max-w-[720px]">
        <div className="mb-4 rounded-2xl border border-widget-border bg-[#000000] p-4">
          <QuickComposer onExpand={handleExpandComposer} />
        </div>

        <div className="sticky top-0 z-30 -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6 bg-black py-2">
          <div className="mb-3 flex items-center overflow-x-auto rounded-full border border-[#181B22] bg-[#000000] p-0.5">
            {FEED_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const isAll = tab.key === "all";
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                  className={`${isAll ? "flex-none min-w-[60px]" : "flex-1 min-w-[120px]"} px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                      : "text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Icon className="h-4 w-4" />
                    <span className={isAll ? "inline" : "hidden sm:inline"}>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex items-end gap-3 flex-wrap flex-1">
              {activeConfig?.visible?.includes('market') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">Рынок</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]">
                        <span className="truncate">{filters.market || 'All'}</span>
                        <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={10} className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl">
                      <div className="grid gap-1.5 text-[12px]">
                        {FILTERS_CONFIG.market.opts.map(opt => (
                          <button key={opt} type="button" onClick={() => updateFilter('market', opt)} className={cn("flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors", filters.market === opt ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]" : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70")}>
                            <span className="truncate">{opt}</span>
                            {filters.market === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {activeConfig?.visible?.includes('price') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">Цена</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]">
                        <span className="truncate">{filters.price || 'All'}</span>
                        <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={10} className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl">
                      <div className="grid gap-1.5 text-[12px]">
                        {FILTERS_CONFIG.price.opts.map(opt => (
                          <button key={opt} type="button" onClick={() => updateFilter('price', opt)} className={cn("flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors", filters.price === opt ? "border-[#A06AFF]/70 bg-[#1C1430] text-white" : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70")}>
                            <span className="truncate">{opt}</span>
                            {filters.price === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {activeConfig?.visible?.includes('period') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">Период</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]">
                        <span className="truncate">{filters.period || 'All time'}</span>
                        <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={10} className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl">
                      <div className="grid gap-1.5 text-[12px]">
                        {FILTERS_CONFIG.period.opts.map(opt => (
                          <button key={opt} type="button" onClick={() => updateFilter('period', opt)} className={cn("flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors", filters.period === opt ? "border-[#A06AFF]/70 bg-[#1C1430] text-white" : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70")}>
                            <span className="truncate">{opt}</span>
                            {filters.period === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#181B22] bg-[#000000] p-0.5">
              <button type="button" onClick={() => setFeedMode("hot")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all", feedMode === "hot" ? "bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg" : "text-[#9CA3AF] hover:text-white")}>
                <Flame className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hot</span>
              </button>
              <button type="button" onClick={() => setFeedMode("recent")} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all", feedMode === "recent" ? "bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] text-white shadow-lg" : "text-[#9CA3AF] hover:text-white")}>
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Recent</span>
              </button>
            </div>
          </div>
        </div>

        {newCount > 0 && (
          <div className="mt-2 mb-4 flex justify-center">
            <button onClick={loadNew} className="flex items-center justify-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white text-xs font-semibold">
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
              <button key={idx} onClick={() => setSelectedTicker(item.ticker)} className={cn("flex w-full items-center justify-between rounded-lg p-2 transition", selectedTicker === item.ticker ? "bg-blue-500/20" : "hover:bg-[#1B1F27]")}>
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
                <button className={cn("rounded-full px-3 py-1 text-xs font-semibold", author.isFollowing ? "bg-white/10 text-white" : "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white")}>
                  {author.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreatePostModal isOpen={isAdvancedComposerOpen} onClose={() => setIsAdvancedComposerOpen(false)} initialData={advancedComposerData} />
    </div>
  );
}
