import { useState } from "react";
import ProfileContentClassic from "./ProfileContentClassic";
import { RightSidebar } from "@/features/feed/components";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS, DEFAULT_FOLLOW_RECOMMENDATIONS } from "@/components/SocialFeedWidgets/sidebarData";
import { TRENDING_TICKERS, TOP_AUTHORS } from "@/features/feed/mocks";
import type { NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";

interface ProfilePageLayoutProps {
  isOwnProfile: boolean;
}

export default function ProfilePageLayout({ isOwnProfile }: ProfilePageLayoutProps) {
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

  // Different stats for own vs other profile
  const activityStats = isOwnProfile
    ? {
        posts: 24,
        likesReceived: 1847,
        comments: 156,
        newFollowers: 89,
      }
    : {
        posts: 156,
        likesReceived: 12340,
        comments: 892,
        newFollowers: 234,
      };

  const topTickers = isOwnProfile
    ? [
        { ticker: "$AAPL", postsCount: 342 },
        { ticker: "$TSLA", postsCount: 287 },
        { ticker: "$NVDA", postsCount: 219 },
        { ticker: "$MSFT", postsCount: 198 },
        { ticker: "$GOOGL", postsCount: 156 },
      ]
    : [
        { ticker: "$BTC", postsCount: 89 },
        { ticker: "$ETH", postsCount: 67 },
        { ticker: "$SOL", postsCount: 45 },
        { ticker: "$AAPL", postsCount: 34 },
        { ticker: "$TSLA", postsCount: 28 },
      ];

  const earnings = isOwnProfile
    ? {
        mrr: 2450,
        arpu: 12,
        activeSubscribers: 204,
        topPostsByRevenue: [
          { postId: "1", title: "Premium Market Analysis", revenue: 450 },
          { postId: "2", title: "Trading Signals Pack", revenue: 380 },
          { postId: "3", title: "Exclusive Research Report", revenue: 290 },
        ],
      }
    : undefined;

  // Mock data for subscriptions
  const subscriptions = isOwnProfile
    ? [
        {
          authorId: "1",
          authorName: "CryptoWhale",
          authorHandle: "@cryptowhale",
          authorAvatar: "https://i.pravatar.cc/120?img=12",
          subscribedAt: "2024-01-15",
          price: 29,
          totalPosts: 156,
          newPostsThisWeek: 3,
        },
        {
          authorId: "2",
          authorName: "Market Maven",
          authorHandle: "@marketmaven",
          authorAvatar: "https://i.pravatar.cc/120?img=23",
          subscribedAt: "2024-02-01",
          price: 49,
          totalPosts: 234,
          newPostsThisWeek: 5,
        },
        {
          authorId: "3",
          authorName: "Tech Trader",
          authorHandle: "@techtrader",
          authorAvatar: "https://i.pravatar.cc/120?img=34",
          subscribedAt: "2024-01-20",
          price: 19,
          totalPosts: 89,
          newPostsThisWeek: 2,
        },
      ]
    : [];

  // Mock data for purchased posts
  const purchasedPosts = isOwnProfile
    ? [
        {
          postId: "p1",
          title: "Bitcoin 2024 Outlook: Why $100K is Conservative",
          authorName: "CryptoWhale",
          authorHandle: "@cryptowhale",
          authorAvatar: "https://i.pravatar.cc/120?img=12",
          purchasedAt: "2024-03-10",
          price: 9,
          views: 5,
          thumbnail: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=200&h=200&fit=crop",
        },
        {
          postId: "p2",
          title: "Advanced Options Trading: Iron Condor Strategy Deep Dive",
          authorName: "Market Maven",
          authorHandle: "@marketmaven",
          authorAvatar: "https://i.pravatar.cc/120?img=23",
          purchasedAt: "2024-03-08",
          price: 15,
          views: 12,
          thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop",
        },
        {
          postId: "p3",
          title: "AI Stocks: The Next Wave of Tech Dominance",
          authorName: "Tech Trader",
          authorHandle: "@techtrader",
          authorAvatar: "https://i.pravatar.cc/120?img=34",
          purchasedAt: "2024-03-05",
          price: 12,
          views: 8,
        },
      ]
    : [];

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic isOwnProfile={isOwnProfile} />
      </div>

      {/* Optimized Right Sidebar with widgets */}
      <RightSidebar
        isOwnProfile={isOwnProfile}
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
        authorActivity={activityStats}
        showTopTickers={true}
        topTickers={topTickers}
        showEarnings={isOwnProfile}
        earnings={earnings}
        // Subscriptions and Purchased Posts moved to Social Network → Overview
        showSubscriptions={false}
        subscriptions={[]}
        showPurchasedPosts={false}
        purchasedPosts={[]}
      />
    </div>
  );
}
