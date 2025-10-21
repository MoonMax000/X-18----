/**
 * API Contracts for Tyrian Trade Feed System
 * 
 * All endpoints return JSON with standard structure:
 * Success: { success: true, data: T }
 * Error: { success: false, error: { code: string, message: string } }
 */

import type { Post, FeedTab, MarketType, AccessLevel } from "@/features/feed/types";

// ============ REQUEST TYPES ============

export interface GetFeedRequest {
  tab?: FeedTab;
  topic?: string; // All | News | Education | Analysis | etc
  market?: MarketType | "All";
  price?: "All" | "Free" | "Paid" | "Subscription";
  period?: "All time" | "Today" | "7d" | "30d" | "YTD";
  ticker?: string; // Filter by ticker symbol
  sort?: "hot" | "recent";
  page?: number;
  limit?: number; // Default: 20
}

export interface CreatePostRequest {
  text: string;
  type: "signal" | "news" | "analysis" | "code" | "general" | "education" | "macro" | "onchain" | "video";
  sentiment?: "bullish" | "bearish" | "neutral";
  accessLevel: AccessLevel;
  postPrice?: number; // For paid posts
  ticker?: string;
  direction?: "long" | "short";
  timeframe?: string;
  risk?: "low" | "medium" | "high";
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  tags?: string[];
  mediaUrls?: string[];
  codeSnippet?: string;
  language?: string;
  scheduledAt?: string; // ISO timestamp
}

export interface UnlockPostRequest {
  postId: string;
  paymentMethodId: string; // Stripe/payment provider ID
}

export interface SubscribeToAuthorRequest {
  authorId: string;
  plan: "monthly" | "yearly";
  paymentMethodId: string;
}

export interface SendTipRequest {
  authorId: string;
  amount: number;
  message?: string;
  paymentMethodId: string;
}

export interface FollowUserRequest {
  userId: string;
}

export interface CheckAccessRequest {
  postId: string;
}

// ============ RESPONSE TYPES ============

export interface GetFeedResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    filters: GetFeedRequest;
    appliedAt: string; // ISO timestamp
  };
}

export interface CreatePostResponse {
  post: Post;
  draft?: {
    id: string;
    savedAt: string;
  };
}

export interface UnlockPostResponse {
  success: true;
  post: Post; // Updated post with isPurchased=true
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: "succeeded" | "pending" | "failed";
  };
}

export interface SubscribeResponse {
  success: true;
  subscription: {
    id: string;
    authorId: string;
    plan: "monthly" | "yearly";
    status: "active" | "pending" | "canceled";
    currentPeriodEnd: string; // ISO timestamp
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: "succeeded" | "pending" | "failed";
  };
}

export interface TipResponse {
  success: true;
  tip: {
    id: string;
    authorId: string;
    amount: number;
    message?: string;
    createdAt: string;
  };
  payment: {
    id: string;
    status: "succeeded" | "pending" | "failed";
  };
}

export interface CheckAccessResponse {
  hasAccess: boolean;
  reason?: "public" | "purchased" | "subscribed" | "is_author" | "is_follower";
  requiredAction?: "unlock" | "subscribe" | "follow";
  price?: number;
}

export interface ProfileResponse {
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    verified: boolean;
    tier: "free" | "pro" | "premium";
    location?: string;
    website?: string;
    joinedAt: string;
  };
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  relationship?: {
    isFollowing: boolean;
    isSubscribed: boolean;
    isMutual: boolean;
  };
  monetization?: {
    // Only visible to profile owner
    mrr: number;
    arpu: number;
    activeSubscribers: number;
    totalRevenue: number;
  };
}

export interface WidgetDataResponse {
  fearGreed: {
    score: number; // 0-100
    label: string; // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
    updatedAt: string;
  };
  communitySentiment: {
    bullishPercent: number;
    bearishPercent: number;
    totalVotes: number;
    votesText: string;
  };
  trendingTickers: Array<{
    ticker: string;
    change: string;
    sentiment: "bullish" | "bearish" | "neutral";
    mentions: string;
  }>;
  topAuthors: Array<{
    name: string;
    handle: string;
    avatar: string;
    followers: string;
    isFollowing: boolean;
  }>;
}

// ============ ERROR CODES ============

export const API_ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: "unauthorized",
  INVALID_TOKEN: "invalid_token",
  TOKEN_EXPIRED: "token_expired",
  
  // Authorization
  FORBIDDEN: "forbidden",
  INSUFFICIENT_PERMISSIONS: "insufficient_permissions",
  
  // Posts
  POST_NOT_FOUND: "post_not_found",
  POST_DELETED: "post_deleted",
  ALREADY_PURCHASED: "already_purchased",
  
  // Payments
  PAYMENT_FAILED: "payment_failed",
  INSUFFICIENT_FUNDS: "insufficient_funds",
  CARD_DECLINED: "card_declined",
  
  // Subscriptions
  ALREADY_SUBSCRIBED: "already_subscribed",
  SUBSCRIPTION_INACTIVE: "subscription_inactive",
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
  TOO_MANY_REQUESTS: "too_many_requests",
  
  // Validation
  INVALID_INPUT: "invalid_input",
  MISSING_REQUIRED_FIELD: "missing_required_field",
  
  // Server
  INTERNAL_ERROR: "internal_error",
  SERVICE_UNAVAILABLE: "service_unavailable",
} as const;

// ============ EXAMPLE REQUESTS ============

/**
 * Example 1: Get hot feed for crypto analysis
 * 
 * GET /api/feed?tab=analytics&market=crypto&sort=hot&page=1&limit=20
 */
export const EXAMPLE_GET_FEED: GetFeedRequest = {
  tab: "analytics",
  market: "crypto",
  sort: "hot",
  page: 1,
  limit: 20,
};

/**
 * Example 2: Create a paid signal post
 * 
 * POST /api/posts
 */
export const EXAMPLE_CREATE_SIGNAL: CreatePostRequest = {
  text: "Strong bullish pattern on $BTC. Breaking resistance at $45k.",
  type: "signal",
  sentiment: "bullish",
  accessLevel: "paid",
  postPrice: 9.99,
  ticker: "$BTC",
  direction: "long",
  timeframe: "4h",
  risk: "medium",
  entry: "$45,000",
  stopLoss: "$43,500",
  takeProfit: "$48,000",
  tags: ["#Bitcoin", "#TechnicalAnalysis"],
};

/**
 * Example 3: Unlock a paid post
 * 
 * POST /api/posts/:postId/unlock
 */
export const EXAMPLE_UNLOCK_POST: UnlockPostRequest = {
  postId: "post_abc123",
  paymentMethodId: "pm_1234567890",
};

/**
 * Example 4: Subscribe to an author
 * 
 * POST /api/subscriptions
 */
export const EXAMPLE_SUBSCRIBE: SubscribeToAuthorRequest = {
  authorId: "user_xyz789",
  plan: "monthly",
  paymentMethodId: "pm_1234567890",
};

/**
 * Example 5: Send a tip
 * 
 * POST /api/tips
 */
export const EXAMPLE_TIP: SendTipRequest = {
  authorId: "user_xyz789",
  amount: 5.00,
  message: "Great analysis! 🚀",
  paymentMethodId: "pm_1234567890",
};
