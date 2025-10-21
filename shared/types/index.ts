// ============ USER & PROFILE ============

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string; // ISO 8601
  role: "user" | "admin" | "moderator";
}

export interface Profile {
  userId: string;
  name: string;
  bio: string;
  avatar: string; // URL
  cover?: string; // URL
  location?: string;
  website?: string;
  tier: 1 | 2 | 3 | 4;
  verified: boolean;
  joinedAt: string; // ISO 8601
  stats: ProfileStats;
  subscriptionPlan?: SubscriptionPlan;
  pinnedPostId?: string;
}

export interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
  likes: number; // всего получено лайков
}

// ============ POST ============

export type PostType = "idea" | "opinion" | "analysis" | "signal" | "code" | "media" | "general";
export type PostTopic = "all" | "news" | "education" | "macro" | "onchain" | "code" | "video" | "signal";
export type AccessLevel = "public" | "followers" | "subscribers" | "paid";
export type SentimentType = "bullish" | "bearish" | "neutral";
export type MarketType = "all" | "crypto" | "stocks" | "forex" | "futures" | "commodities";
export type DirectionType = "long" | "short";

export interface Post {
  id: string;
  authorId: string;
  author: Profile; // денормализованный для удобства
  timestamp: string; // ISO 8601
  type: PostType;
  topic?: PostTopic;
  text: string;
  sentiment?: SentimentType;
  market?: MarketType;
  accessLevel: AccessLevel;
  price?: number; // для paid
  ticker?: string; // $BTC
  direction?: DirectionType; // для signal
  timeframe?: string; // 1h, 4h, 1d
  risk?: "low" | "medium" | "high";
  accuracy?: number; // % для signal
  sampleSize?: number; // число сигналов
  samplePeriod?: string; // 90d
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  mediaUrl?: string;
  codeSnippet?: string;
  language?: string; // для code
  tags?: string[]; // хештеги без #
  isPinned: boolean;
  stats: PostStats;
  isReply?: boolean;
  replyTo?: {
    postId: string;
    authorHandle: string;
    authorName: string;
  };
}

export interface PostStats {
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  purchases?: number; // для paid
}

// ============ SUBSCRIPTION ============

export interface SubscriptionPlan {
  id: string;
  authorId: string;
  priceMonthly: number;
  priceYearly?: number;
  features: string[]; // "All paid posts", "Exclusive signals"...
}

export interface Subscription {
  id: string;
  userId: string;
  authorId: string;
  planId: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  accessUntil?: string;
}

// ============ PURCHASE ============

export interface Purchase {
  id: string;
  userId: string;
  postId: string;
  amount: number;
  method: "card" | "paypal";
  status: "pending" | "success" | "failed";
  purchasedAt: string;
  idempotencyKey: string;
}

// ============ FOLLOW ============

export interface Follow {
  id: string;
  followerId: string; // кто подписался
  followeeId: string; // на кого
  createdAt: string;
}

// ============ REACTION ============

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Repost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  author: Profile;
  postId: string;
  parentId?: string; // для threaded comments
  text: string;
  createdAt: string;
  stats: {
    likes: number;
    replies: number;
  };
}

export interface View {
  id: string;
  userId?: string; // null для анонимов
  postId: string;
  viewedAt: string;
}

// ============ TICKER & SENTIMENT ============

export interface Ticker {
  symbol: string; // BTC, ETH
  name: string; // Bitcoin, Ethereum
  price: number;
  change24h: number; // %
  sentiment: "bullish" | "bearish" | "neutral";
}

export interface SentimentVote {
  id: string;
  userId: string;
  ticker: string;
  sentiment: "bullish" | "bearish";
  createdAt: string;
}

// ============ TIP ============

export interface Tip {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  message?: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
}

// ============ WIDGETS ============

export interface FearGreedData {
  score: number; // 0-100
  label: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  updatedAt: string;
}

export interface CommunitySentimentData {
  bullishPercent: number;
  votesCount: number;
  votesText: string; // "1.9M votes"
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: PostTopic;
  url?: string;
  publishedAt: string;
}

export interface SuggestedProfile {
  profile: Profile;
  reason?: string; // "Similar interests", "Popular in Crypto"
}

export interface AuthorActivityData {
  period: string; // "7d", "30d"
  posts: number;
  likesReceived: number;
  comments: number;
  newFollowers: number;
}

export interface TopTickerData {
  ticker: string;
  postsCount: number;
}

export interface EarningsData {
  period: string; // "30d", "90d", "all"
  mrr: number; // Monthly Recurring Revenue
  arpu: number; // Average Revenue Per User
  activeSubscribers: number;
  topPostsByRevenue: {
    postId: string;
    title: string;
    revenue: number;
  }[];
}

// ============ FILTERS ============

export interface FeedFilters {
  tab: "all" | "ideas" | "opinions" | "analytics" | "soft" | "liked" | "following";
  type: PostType | "all";
  topic: PostTopic;
  market: MarketType;
  price: "all" | "free" | "paid" | "subscription";
  period: "all" | "today" | "7d" | "30d" | "ytd" | "custom";
  ticker?: string;
  sort: "hot" | "recent";
  page: number;
  limit: number;
}

export interface ProfileFilters {
  tab: "tweets" | "replies" | "media" | "likes";
  ticker?: string;
  page: number;
  limit: number;
}

// ============ API RESPONSES ============

export interface FeedResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    hotScoreCalculated: boolean;
    filtersApplied: string[];
  };
}

export interface AccessCheckResponse {
  canAccess: boolean;
  reason: "author" | "public" | "follower" | "subscribed" | "purchased" | "denied";
}

export interface FollowCheckResponse {
  isFollowing: boolean;
}

export interface SubscriptionCheckResponse {
  isSubscribed: boolean;
  subscription?: Subscription;
}

export interface PurchaseCheckResponse {
  hasPurchased: boolean;
  purchase?: Purchase;
}

// ============ ANALYTICS ============

export type AnalyticsEvent =
  | "page_view"
  | "post_create"
  | "post_view"
  | "post_unlock"
  | "subscribe_start"
  | "subscribe_success"
  | "subscribe_failed"
  | "donate_click"
  | "donate_success"
  | "filter_apply"
  | "sort_toggle"
  | "ticker_filter"
  | "new_posts_click"
  | "follow_toggle"
  | "like_toggle"
  | "comment_submit"
  | "share_click";

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  payload: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// ============ WEBSOCKET ============

export interface WebSocketMessage {
  type: "subscribe" | "unsubscribe" | "new_post" | "new_posts" | "fetch_new_posts";
  data?: any;
}

export interface NewPostEvent {
  type: "new_post";
  postId: string;
  timestamp: string;
}
