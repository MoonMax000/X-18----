// features/feed/types.ts
export type FeedTab = "all" | "ideas" | "opinions" | "analytics" | "soft" | "liked";
export type PostType = "signal" | "news" | "analysis" | "code" | "general" | "education" | "macro" | "onchain" | "video";
export type SentimentType = "bullish" | "bearish" | "neutral";
export type PriceType = "free" | "pay-per-post" | "subscribers-only";
export type AccessLevel = "public" | "paid" | "subscribers" | "premium";
export type MarketType = "crypto" | "stocks" | "forex" | "commodities" | "indices";
export type DirectionType = "long" | "short";
export type TimeframeType = "15m" | "1h" | "4h" | "1d" | "1w";
export type RiskType = "low" | "medium" | "high";

export interface ComposerData {
  text: string;
  teaser: string;
  sentiment: "bullish" | "bearish" | null;
  isPaid: boolean;
  isCode: boolean;
  
  ticker: string;
  direction: DirectionType | "";
  timeframe: TimeframeType | "";
  risk: RiskType | "";
  entry: string;
  stopLoss: string;
  takeProfit: string;
  
  language: string;
  codeDescription: string;
  codeSnippet: string;
  compatibility: string;
  
  accessType: PriceType;
  price: string;
  verifiedOnly: boolean;
  
  visibility: "all" | "subscribers" | "buyers" | "followers";
  scheduledDate: string;
  scheduledTime: string;
  expiryDays: string;
  commentsEnabled: boolean;
}

export interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    isPremium?: boolean;
    isFollowing?: boolean;
  };
  timestamp: string;
  type: PostType;
  text: string;
  sentiment?: SentimentType;
  market?: MarketType;
  price?: PriceType;
  ticker?: string;
  direction?: DirectionType;
  timeframe?: TimeframeType;
  risk?: RiskType;
  accuracy?: number;
  sampleSize?: number;
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  language?: string;
  codeSnippet?: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  isEditorPick?: boolean;
  tags?: string[];
}
