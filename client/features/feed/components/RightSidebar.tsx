import React from "react";
import { FearGreedWidget } from "@/components/testLab/FearGreedWidget";
import { CommunitySentimentWidget } from "@/components/testLab/CommunitySentimentWidget";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, { type NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import TrendingTickersWidget, { type TrendingTicker } from "./widgets/TrendingTickersWidget";
import TopAuthorsWidget, { type TopAuthor } from "./widgets/TopAuthorsWidget";

interface RightSidebarProps {
  fearGreedScore?: number;
  communitySentiment?: {
    bullishPercent: number;
    votesText: string;
  };
  trendingTickers?: TrendingTicker[];
  selectedTicker?: string;
  onTickerClick?: (ticker: string) => void;
  suggestedProfiles?: any[];
  newsItems?: NewsItem[];
  followRecommendations?: any[];
  topAuthors?: TopAuthor[];
  onAuthorFollowToggle?: (handle: string) => void;
}

export default function RightSidebar({
  fearGreedScore = 32,
  communitySentiment = { bullishPercent: 82, votesText: "1.9M votes" },
  trendingTickers = [],
  selectedTicker,
  onTickerClick,
  suggestedProfiles = [],
  newsItems = [],
  followRecommendations = [],
  topAuthors = [],
  onAuthorFollowToggle
}: RightSidebarProps) {
  return (
    <div className="hidden lg:block w-[340px] space-y-4">
      <FearGreedWidget score={fearGreedScore} />
      
      <CommunitySentimentWidget
        bullishPercent={communitySentiment.bullishPercent}
        votesText={communitySentiment.votesText}
      />

      {trendingTickers.length > 0 && (
        <TrendingTickersWidget
          tickers={trendingTickers}
          selectedTicker={selectedTicker}
          onTickerClick={onTickerClick}
        />
      )}

      {suggestedProfiles.length > 0 && (
        <SuggestedProfilesWidget profiles={suggestedProfiles} />
      )}

      {newsItems.length > 0 && (
        <NewsWidget items={newsItems as NewsItem[]} />
      )}

      {followRecommendations.length > 0 && (
        <FollowRecommendationsWidget profiles={followRecommendations} />
      )}

      {topAuthors.length > 0 && (
        <TopAuthorsWidget
          authors={topAuthors}
          onFollowToggle={onAuthorFollowToggle}
        />
      )}
    </div>
  );
}
