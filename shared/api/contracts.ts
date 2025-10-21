import type {
  Post,
  Profile,
  FeedFilters,
  FeedResponse,
  AccessCheckResponse,
  FollowCheckResponse,
  SubscriptionCheckResponse,
  PurchaseCheckResponse,
  Subscription,
  Purchase,
  Tip,
  FearGreedData,
  Ticker,
  CommunitySentimentData,
  EarningsData,
} from "../types";

// ============ BASE URL ============

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// ============ FEED ============

export interface GetFeedRequest extends Partial<FeedFilters> {}

export interface GetFeedResponse extends FeedResponse {}

export async function getFeed(params: GetFeedRequest): Promise<GetFeedResponse> {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE_URL}/feed?${query}`);
  if (!res.ok) throw new Error("Failed to fetch feed");
  return res.json();
}

// ============ PROFILE ============

export interface GetProfileRequest {
  userId?: string;
  username?: string;
}

export interface GetProfileResponse extends Profile {}

export async function getProfile(params: GetProfileRequest): Promise<GetProfileResponse> {
  const identifier = params.userId || params.username;
  const res = await fetch(`${API_BASE_URL}/profiles/${identifier}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export interface GetProfilePostsRequest {
  userId: string;
  tab: "tweets" | "replies" | "media" | "likes";
  ticker?: string;
  page?: number;
  limit?: number;
}

export interface GetProfilePostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function getProfilePosts(params: GetProfilePostsRequest): Promise<GetProfilePostsResponse> {
  const { userId, ...query } = params;
  const queryString = new URLSearchParams(query as any).toString();
  const res = await fetch(`${API_BASE_URL}/profiles/${userId}/posts?${queryString}`);
  if (!res.ok) throw new Error("Failed to fetch profile posts");
  return res.json();
}

// ============ POSTS ============

export interface CreatePostRequest {
  type: Post["type"];
  topic?: Post["topic"];
  text: string;
  sentiment?: Post["sentiment"];
  market?: Post["market"];
  accessLevel: Post["accessLevel"];
  price?: number;
  ticker?: string;
  direction?: Post["direction"];
  timeframe?: string;
  risk?: Post["risk"];
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  mediaUrl?: string;
  codeSnippet?: string;
  language?: string;
  tags?: string[];
}

export interface CreatePostResponse extends Post {}

export async function createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
  const res = await fetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create post");
  }
  return res.json();
}

// ============ ACCESS CHECK ============

export interface CheckAccessRequest {
  postId: string;
}

export interface CheckAccessResponse extends AccessCheckResponse {}

export async function checkAccess(params: CheckAccessRequest): Promise<CheckAccessResponse> {
  const res = await fetch(`${API_BASE_URL}/access/check?postId=${params.postId}`);
  if (!res.ok) throw new Error("Failed to check access");
  return res.json();
}

// ============ SUBSCRIPTIONS ============

export interface CreateSubscriptionRequest {
  authorId: string;
  planId: string;
  period: "monthly" | "yearly";
  method: "card" | "paypal";
  paymentMethodId: string;
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  status: "active" | "cancelled" | "expired";
  startDate: string;
  nextBillingDate: string;
  amount: number;
}

export async function createSubscription(data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
  const res = await fetch(`${API_BASE_URL}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create subscription");
  }
  return res.json();
}

export interface CheckSubscriptionRequest {
  userId: string;
  authorId: string;
}

export interface CheckSubscriptionResponse extends SubscriptionCheckResponse {}

export async function checkSubscription(params: CheckSubscriptionRequest): Promise<CheckSubscriptionResponse> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/subscriptions/check?${query}`);
  if (!res.ok) throw new Error("Failed to check subscription");
  return res.json();
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
}

export interface CancelSubscriptionResponse {
  status: "cancelled";
  accessUntil: string;
}

export async function cancelSubscription(params: CancelSubscriptionRequest): Promise<CancelSubscriptionResponse> {
  const res = await fetch(`${API_BASE_URL}/subscriptions/${params.subscriptionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to cancel subscription");
  return res.json();
}

// ============ PURCHASES ============

export interface CreatePurchaseRequest {
  postId: string;
  amount: number;
  method: "card" | "paypal";
  paymentMethodId: string;
  idempotencyKey: string;
}

export interface CreatePurchaseResponse {
  purchaseId: string;
  status: "success" | "pending" | "failed";
  postId: string;
  amount: number;
  purchasedAt: string;
}

export async function createPurchase(data: CreatePurchaseRequest): Promise<CreatePurchaseResponse> {
  const res = await fetch(`${API_BASE_URL}/purchases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create purchase");
  }
  return res.json();
}

export interface CheckPurchaseRequest {
  userId: string;
  postId: string;
}

export interface CheckPurchaseResponse extends PurchaseCheckResponse {}

export async function checkPurchase(params: CheckPurchaseRequest): Promise<CheckPurchaseResponse> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/purchases/check?${query}`);
  if (!res.ok) throw new Error("Failed to check purchase");
  return res.json();
}

// ============ FOLLOWS ============

export interface CreateFollowRequest {
  targetUserId: string;
}

export interface CreateFollowResponse {
  followId: string;
  following: true;
}

export async function createFollow(data: CreateFollowRequest): Promise<CreateFollowResponse> {
  const res = await fetch(`${API_BASE_URL}/follow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to follow");
  }
  return res.json();
}

export interface DeleteFollowRequest {
  targetUserId: string;
}

export interface DeleteFollowResponse {
  following: false;
}

export async function deleteFollow(params: DeleteFollowRequest): Promise<DeleteFollowResponse> {
  const res = await fetch(`${API_BASE_URL}/follow/${params.targetUserId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to unfollow");
  return res.json();
}

export interface CheckFollowRequest {
  userId: string;
  targetId: string;
}

export interface CheckFollowResponse extends FollowCheckResponse {}

export async function checkFollow(params: CheckFollowRequest): Promise<CheckFollowResponse> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/follows/check?${query}`);
  if (!res.ok) throw new Error("Failed to check follow");
  return res.json();
}

// ============ TIPS ============

export interface CreateTipRequest {
  authorId: string;
  amount: number;
  message?: string;
}

export interface CreateTipResponse {
  tipId: string;
  status: "success" | "pending" | "failed";
}

export async function createTip(data: CreateTipRequest): Promise<CreateTipResponse> {
  const res = await fetch(`${API_BASE_URL}/tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to send tip");
  }
  return res.json();
}

// ============ WIDGETS ============

export interface GetFearGreedResponse extends FearGreedData {}

export async function getFearGreed(): Promise<GetFearGreedResponse> {
  const res = await fetch(`${API_BASE_URL}/widgets/fear-greed`);
  if (!res.ok) throw new Error("Failed to fetch fear & greed");
  return res.json();
}

export interface GetTrendingResponse {
  tickers: Ticker[];
}

export async function getTrending(): Promise<GetTrendingResponse> {
  const res = await fetch(`${API_BASE_URL}/widgets/trending`);
  if (!res.ok) throw new Error("Failed to fetch trending tickers");
  return res.json();
}

export interface GetCommunitySentimentResponse extends CommunitySentimentData {}

export async function getCommunitySentiment(): Promise<GetCommunitySentimentResponse> {
  const res = await fetch(`${API_BASE_URL}/widgets/sentiment`);
  if (!res.ok) throw new Error("Failed to fetch community sentiment");
  return res.json();
}

export interface GetEarningsRequest {
  period?: "30d" | "90d" | "all";
}

export interface GetEarningsResponse extends EarningsData {}

export async function getEarnings(params: GetEarningsRequest = {}): Promise<GetEarningsResponse> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE_URL}/earnings?${query}`);
  if (!res.ok) {
    const error = await res.json();
    if (res.status === 403) throw new Error("Forbidden: You can only view your own earnings");
    throw new Error(error.message || "Failed to fetch earnings");
  }
  return res.json();
}

// ============ ERROR CODES ============

export const API_ERROR_CODES = {
  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,

  // 5xx Server Errors
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export const ERROR_MESSAGES: Record<string, string> = {
  // Payment
  card_declined: "Ваша карта была отклонена",
  insufficient_funds: "Недостаточно средств на карте",
  payment_failed: "Ошибка оплаты. Попробуйте ещё раз",
  already_purchased: "Вы уже приобрели этот пост",
  already_subscribed: "У вас уже есть активная подписка",

  // Follow
  already_following: "Вы уже подписаны",
  cannot_follow_self: "Нельзя подписаться на себя",

  // Post
  invalid_access_level: "Неверный уровень доступа",
  price_required: "Укажите цену для платного поста",
  
  // Generic
  network_error: "Ошибка сети. Проверьте подключение",
  server_error: "Ошибка сервера. Попробуйте позже",
  unauthorized: "Требуется авторизация",
  forbidden: "Доступ запрещён",
};
