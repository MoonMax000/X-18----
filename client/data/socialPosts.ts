export type TabType = "popular" | "editors" | "foryou" | "following" | "signals";
export type FilterType = "all" | "video";
export type SentimentType = "bullish" | "bearish";
export type SocialPostType = "video" | "article";

export interface SocialAuthor {
  name: string;
  avatar: string;
  handle?: string;
  verified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  isCurrentUser?: boolean;
}

export interface SocialPost {
  id: string;
  type: SocialPostType;
  author: SocialAuthor;
  timestamp: string;
  title: string;
  category?: string;
  preview?: string;
  body?: string;
  videoUrl?: string;
  mediaUrl?: string;
  sentiment: SentimentType;
  likes: number;
  comments: number;
  isFollowing?: boolean;
  hashtags?: string[];
  views?: number;
}

export const socialPosts: SocialPost[] = [
  {
    id: "crypto-video",
    type: "video",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=18",
      handle: "@johncrypto",
      verified: true,
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "January 31, 5:10 PM",
    title: "New Tools for Crypto Analytics",
    preview: "Short teaser about our upcoming analytics dashboard launch.",
    videoUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/e4b8b038e464896411fd0b568f4594d8cfdf3453?width=2086",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    isFollowing: false,
    hashtags: ["MacroInvesting", "SmartTrading", "HedgeFundTactics"],
  },
  {
    id: "crypto-video-long",
    type: "video",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=27",
      handle: "@johncrypto",
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "January 31, 5:10 PM",
    title: "New Tools for Crypto Analytics",
    preview:
      "On the other hand, the continued development of various activities significantly drives the creation of new strategic directions.",
    body: "On the other hand, the continued development of various activities significantly drives the creation of new strategic directions. In this context, introducing a new organizational model serves as a valuable experiment in testing growth frameworks. High-level strategic thinking, along with the strengthening and evolution of internal structures, plays a key role in shaping effective training systems that address current workforce needs.\n\nOur broad and diverse experience — supported by ongoing communication and outreach — helps lay the groundwork for inclusive, large-scale participation. At the same time, it’s important to recognize that effective training enables a wider range of professionals to actively shape their roles and responsibilities in meeting organizational goals.",
    videoUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/e4b8b038e464896411fd0b568f4594d8cfdf3453?width=2086",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    isFollowing: true,
    hashtags: ["MacroInvesting", "SmartTrading", "HedgeFundTactics"],
  },
  {
    id: "ai-article",
    type: "article",
    author: {
      name: "Tyrian Trade",
      avatar: "https://i.pravatar.cc/120?img=45",
      handle: "@TyrianTrade",
      verified: true,
      bio: "Macro-focused trading desk delivering distilled hedge fund tactics.",
      followers: 128400,
      following: 412,
    },
    category: "Idea",
    timestamp: "5:01 AM · Oct 8, 2025",
    title: "Do This To Win Like Hedge Funds",
    preview:
      "Hedge funds don’t just beat the market by luck, they use proven strategies. Here’s how you can apply their tactics.",
    body: "Hedge funds don’t just beat the market by luck, they use proven strategies. Here’s how you can apply their tactics:\n\n• Focus on asymmetric risk/reward — Only take trades where potential upside >> downside. Hedge funds target 3:1 or better.\n• Be contrarian — The biggest profits come when you go against the crowd. Buy fear, sell greed.\n• Use leverage wisely — Hedge funds amplify gains with controlled risk. Never over-leverage.\n• Stay disciplined — Stick to your strategy. Emotional trading kills returns.\n• Diversify beyond stocks — Explore options, futures, arbitrage, and macro trends.\n\nMost traders fail because they chase hype. Winners think like institutions. Write in the comments what investment strategy you follow.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2F2d47b79163b7401296001f606a7f0aef",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    hashtags: ["MacroInvesting", "SmartTrading", "HedgeFundTactics"],
    views: 5,
  },
];

export const getSocialPostById = (id: string): SocialPost | undefined =>
  socialPosts.find((post) => post.id === id);
