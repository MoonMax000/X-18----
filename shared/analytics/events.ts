/**
 * Analytics Events Catalog
 * Complete list of all trackable events in Tyrian Trade
 */

// ============ EVENT TYPES ============

export type AnalyticsEvent =
  // Page Navigation
  | "page_view"
  | "page_exit"
  | "navigation_click"
  
  // Post Lifecycle
  | "post_create_start"
  | "post_create_complete"
  | "post_create_cancel"
  | "post_draft_save"
  | "post_view"
  | "post_expand"
  | "post_collapse"
  
  // Engagement
  | "like_toggle"
  | "comment_open"
  | "comment_submit"
  | "comment_cancel"
  | "repost_click"
  | "share_click"
  | "bookmark_toggle"
  
  // Monetization
  | "post_unlock_click"
  | "post_unlock_success"
  | "post_unlock_failed"
  | "subscribe_click"
  | "subscribe_start"
  | "subscribe_success"
  | "subscribe_failed"
  | "subscribe_cancel"
  | "tip_click"
  | "tip_send_success"
  | "tip_send_failed"
  
  // Filters & Search
  | "filter_apply"
  | "filter_reset"
  | "filter_category_select"
  | "sort_toggle"
  | "search_query"
  | "ticker_filter"
  | "topic_filter"
  | "market_filter"
  
  // Feed Interactions
  | "tab_change"
  | "new_posts_banner_show"
  | "new_posts_load"
  | "feed_scroll"
  | "feed_refresh"
  | "load_more"
  
  // Social
  | "follow_toggle"
  | "profile_view"
  | "profile_tab_change"
  
  // Composer
  | "composer_open"
  | "composer_close"
  | "composer_expand"
  | "sentiment_select"
  | "access_level_change"
  | "media_upload"
  | "code_block_add"
  | "ticker_add"
  
  // Widgets
  | "widget_ticker_click"
  | "widget_author_click"
  | "widget_news_click"
  | "widget_follow_toggle"
  
  // Performance
  | "performance_metric"
  | "error_occurred"
  | "api_error";

// ============ EVENT PAYLOAD TYPES ============

export interface BaseEventPayload {
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  page?: string;
}

export interface PageViewPayload extends BaseEventPayload {
  path: string;
  title: string;
  referrer?: string;
}

export interface PostCreatePayload extends BaseEventPayload {
  postId?: string;
  type: string;
  topic?: string;
  accessLevel: string;
  hasMedia: boolean;
  hasCode: boolean;
  hasTicker: boolean;
  sentiment?: string;
  wordCount?: number;
}

export interface PostUnlockPayload extends BaseEventPayload {
  postId: string;
  amount: number;
  currency: string;
  authorId: string;
  method: string;
  success: boolean;
  errorCode?: string;
}

export interface SubscribePayload extends BaseEventPayload {
  authorId: string;
  subscriptionId?: string;
  plan: "monthly" | "yearly";
  amount: number;
  currency: string;
  success: boolean;
  errorCode?: string;
}

export interface TipPayload extends BaseEventPayload {
  tipId?: string;
  authorId: string;
  amount: number;
  currency: string;
  hasMessage: boolean;
  success: boolean;
  errorCode?: string;
}

export interface FilterApplyPayload extends BaseEventPayload {
  tab: string;
  type?: string;
  topic?: string;
  market?: string;
  price?: string;
  period?: string;
  ticker?: string;
  sort: "hot" | "recent";
  resultsCount?: number;
}

export interface EngagementPayload extends BaseEventPayload {
  postId: string;
  authorId: string;
  action: "like" | "comment" | "repost" | "share" | "bookmark";
  value?: any; // e.g., comment text length
}

export interface PerformancePayload extends BaseEventPayload {
  metric: "ttfb" | "fcp" | "lcp" | "cls" | "fid";
  value: number;
  route: string;
}

export interface ErrorPayload extends BaseEventPayload {
  errorCode: string;
  errorMessage: string;
  stack?: string;
  context?: Record<string, any>;
}

// ============ METRICS & KPIs ============

/**
 * Product Metrics to Track
 */
export interface ProductMetrics {
  // User Engagement
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  wau: number; // Weekly Active Users
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  
  // Content
  postsCreated: number;
  postsViewed: number;
  engagementRate: number; // (likes + comments + reposts) / views
  avgTimeOnPost: number; // seconds
  
  // Monetization
  conversionToUnlock: number; // % users who clicked unlock CTA
  conversionToSubscribe: number; // % users who subscribed
  mrr: number; // Monthly Recurring Revenue
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  churnRate: number;
  
  // Funnel
  gatedContentViews: number;
  unlockCtaClicks: number;
  unlockSuccess: number;
  unlockFailed: number;
  
  // Feed Performance
  avgHotScore: number;
  newPostsClickRate: number; // % who click "X new posts"
  filterUsageRate: number; // % sessions using filters
}

/**
 * Conversion Funnels
 */
export const CONVERSION_FUNNELS = {
  unlock: [
    "post_view", // Step 1: View locked post
    "post_unlock_click", // Step 2: Click unlock button
    "post_unlock_success", // Step 3: Complete purchase
  ],
  
  subscribe: [
    "profile_view", // Step 1: View author profile
    "subscribe_click", // Step 2: Click subscribe
    "subscribe_start", // Step 3: Enter payment
    "subscribe_success", // Step 4: Complete subscription
  ],
  
  tip: [
    "profile_view", // or post_view
    "tip_click",
    "tip_send_success",
  ],
  
  engagement: [
    "post_view",
    "post_expand", // Optional: read more
    "like_toggle", // or comment/repost
  ],
} as const;

/**
 * Event Validation Rules
 */
export const EVENT_VALIDATION: Record<string, { requiredFields: string[] }> = {
  post_unlock_success: {
    requiredFields: ["postId", "amount", "authorId"],
  },
  subscribe_success: {
    requiredFields: ["authorId", "subscriptionId", "amount", "plan"],
  },
  filter_apply: {
    requiredFields: ["tab", "sort"],
  },
  post_create_complete: {
    requiredFields: ["postId", "type", "accessLevel"],
  },
};

/**
 * Anti-Fraud Signals
 */
export interface FraudSignals {
  rapidClicks: boolean; // > 10 clicks/second
  impossibleTravel: boolean; // IP changes across geographies too fast
  failedPaymentsCount: number;
  unusualBehavior: string[]; // e.g., ["created 100 posts in 1 min"]
  suspiciousPatterns: string[];
}

/**
 * Analytics Dashboard Queries
 */
export const ANALYTICS_QUERIES = {
  // Engagement
  topPosts: "SELECT * FROM events WHERE event = 'post_view' GROUP BY postId ORDER BY count DESC LIMIT 10",
  engagementByHour: "SELECT hour, count(*) FROM events WHERE event IN ('like_toggle', 'comment_submit') GROUP BY hour",
  
  // Monetization
  revenueByDay: "SELECT date, SUM(amount) FROM events WHERE event IN ('post_unlock_success', 'tip_send_success') GROUP BY date",
  conversionFunnel: "SELECT step, count(*) FROM funnel_events WHERE funnel = 'unlock' GROUP BY step",
  
  // Content
  postsByType: "SELECT type, count(*) FROM events WHERE event = 'post_create_complete' GROUP BY type",
  topTopics: "SELECT topic, count(*) FROM events WHERE event = 'post_view' GROUP BY topic ORDER BY count DESC",
};
