import { useState } from "react";
import ProfileContentClassic from "@/components/socialProfile/ProfileContentClassic";
import { RightSidebar } from "@/features/feed/components";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import { TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";

export default function OtherProfilePage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(
    new Set(["@cryptowhale", "@marketnews"])
  );

  const handleTickerClick = (ticker: string) => {
    setSelectedTicker(ticker === selectedTicker ? null : ticker);
  };

  const toggleFollow = (handle: string) => {
    setFollowingAuthors(prev => {
      const next = new Set(prev);
      next.has(handle) ? next.delete(handle) : next.add(handle);
      return next;
    });
  };

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic isOwnProfile={false} />
      </div>
      
      {/* Optimized Right Sidebar with widgets */}
      <RightSidebar
        isOwnProfile={false}
        fearGreedScore={32}
        communitySentiment={{ bullishPercent: 82, votesText: "1.9M votes" }}
        trendingTickers={TRENDING_TICKERS}
        selectedTicker={selectedTicker}
        onTickerClick={handleTickerClick}
        suggestedProfiles={DEFAULT_SUGGESTED_PROFILES}
        newsItems={DEFAULT_NEWS_ITEMS as NewsItem[]}
        followRecommendations={DEFAULT_FOLLOW_RECOMMENDATIONS}
        topAuthors={TOP_AUTHORS}
        onAuthorFollowToggle={toggleFollow}
        showAuthorActivity={true}
        authorActivity={{
          posts: 156,
          likesReceived: 12340,
          comments: 892,
          newFollowers: 234
        }}
        showTopTickers={true}
        topTickers={[
          { ticker: "$BTC", postsCount: 89 },
          { ticker: "$ETH", postsCount: 67 },
          { ticker: "$SOL", postsCount: 45 },
          { ticker: "$AAPL", postsCount: 34 },
          { ticker: "$TSLA", postsCount: 28 }
        ]}
      />
    </div>
  );
}
