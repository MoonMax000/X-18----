import React from "react";
import { FearGreedWidget } from "@/components/testLab/FearGreedWidget";
import { CommunitySentimentWidget } from "@/components/testLab/CommunitySentimentWidget";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, { type NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import TrendingTickersWidget, { type TrendingTicker } from "./widgets/TrendingTickersWidget";
import TopAuthorsWidget, { type TopAuthor } from "./widgets/TopAuthorsWidget";
import AuthorActivityWidget from "./widgets/AuthorActivityWidget";
import TopTickersWidget from "./widgets/TopTickersWidget";
import EarningsWidget from "./widgets/EarningsWidget";

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
  showAuthorActivity?: boolean;
  authorActivity?: {
    posts: number;
    likesReceived: number;
    comments: number;
    newFollowers: number;
  };
  showTopTickers?: boolean;
  topTickers?: { ticker: string; postsCount: number }[];
  showEarnings?: boolean;
  earnings?: {
    mrr: number;
    arpu: number;
    activeSubscribers: number;
    topPostsByRevenue: { postId: string; title: string; revenue: number }[];
  };
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
  onAuthorFollowToggle,
  showAuthorActivity = false,
  authorActivity,
  showTopTickers = false,
  topTickers = [],
  showEarnings = false,
  earnings
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

      {showAuthorActivity && authorActivity && (
        <AuthorActivityWidget
          posts={authorActivity.posts}
          likesReceived={authorActivity.likesReceived}
          comments={authorActivity.comments}
          newFollowers={authorActivity.newFollowers}
        />
      )}

      {showTopTickers && topTickers.length > 0 && (
        <TopTickersWidget
          tickers={topTickers}
          onTickerClick={onTickerClick}
          selectedTicker={selectedTicker}
        />
      )}

      {showEarnings && earnings && (
        <EarningsWidget
          mrr={earnings.mrr}
          arpu={earnings.arpu}
          activeSubscribers={earnings.activeSubscribers}
          topPostsByRevenue={earnings.topPostsByRevenue}
        />
      )}
    </div>
  );
}
