// features/feed/types.ts
export type FeedTab = "all" | "signal" | "news" | "education" | "analysis" | "macro" | "code" | "video" | "liked";
export type PostType = "signal" | "news" | "analysis" | "code" | "general" | "education" | "macro" | "onchain" | "video";
export type SentimentType = "bullish" | "bearish" | "neutral";
export type PriceType = "free" | "pay-per-post" | "subscribers-only";
export type AccessLevel = "public" | "paid" | "subscribers" | "premium" | "followers";
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

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video' | 'gif' | 'document';
  thumbnail_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  // Document-specific fields
  file_name?: string;
  file_extension?: string;
}

export interface CodeBlock {
  language: string;
  code: string;
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
    subscriptionPrice?: number;
    bio?: string;
    followers?: number;
    following?: number;
  };
  created_at: string; // Changed from timestamp to match API
  type: PostType;
  text: string;
  sentiment?: SentimentType;
  market?: MarketType;
  category?: string; // Category from metadata (e.g., "crypto", "analysis", etc.)
  price?: PriceType;
  accessLevel?: AccessLevel;
  priceCents?: number; // Price in cents from backend
  postPrice?: number; // Price in dollars (computed from priceCents)
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isFollower?: boolean;
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
  mediaUrl?: string; // Legacy field
  media?: MediaItem[]; // New field from backend
  codeBlocks?: CodeBlock[]; // New field for code blocks
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  isEditorPick?: boolean;
  tags?: string[];
}
