// GoToSocial API Service Layer
// This service handles all communication with the GoToSocial backend API
// Extends the base apiClient with GoToSocial-specific endpoints

import { apiClient } from './client';

// ============================================================================
// TYPES - GoToSocial API Response Types
// ============================================================================

export interface GTSAccount {
  id: string;
  username: string;
  acct: string; // username@domain or just username
  display_name: string;
  locked: boolean;
  bot: boolean;
  discoverable: boolean;
  group: boolean;
  created_at: string; // ISO 8601
  note: string; // HTML bio
  url: string; // Profile URL
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string | null;
  emojis: GTSEmoji[];
  fields: GTSField[];
  // Custom extensions (not in standard GoToSocial)
  verified?: boolean;
  subscription_price?: number;
}

export interface GTSStatus {
  id: string;
  created_at: string;
  in_reply_to_id: string | null;
  in_reply_to_account_id: string | null;
  sensitive: boolean;
  spoiler_text: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  language: string | null;
  uri: string;
  url: string | null;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  edited_at: string | null;
  favourited?: boolean; // Whether current user has favourited this status
  reblogged?: boolean; // Whether current user has reblogged this status
  bookmarked?: boolean; // Whether current user has bookmarked this status
  content: string; // HTML content
  reblog: GTSStatus | null;
  account: GTSAccount;
  media_attachments: GTSMediaAttachment[];
  mentions: GTSMention[];
  tags: GTSTag[];
  emojis: GTSEmoji[];
  card: GTSCard | null;
  poll: GTSPoll | null;
  // Custom metadata for trading posts (supported by custom GoToSocial implementation)
  custom_metadata?: Record<string, string>;
}

export interface GTSMediaAttachment {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
  url: string;
  preview_url: string;
  remote_url: string | null;
  meta: {
    original?: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
    small?: {
      width: number;
      height: number;
      size: string;
      aspect: number;
    };
  };
  description: string | null; // Alt text
  blurhash: string | null;
}

export interface GTSMention {
  id: string;
  username: string;
  url: string;
  acct: string;
}

export interface GTSTag {
  name: string;
  url: string;
}

export interface GTSEmoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
}

export interface GTSField {
  name: string;
  value: string;
  verified_at: string | null;
}

export interface GTSCard {
  url: string;
  title: string;
  description: string;
  type: 'link' | 'photo' | 'video' | 'rich';
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  html: string;
  width: number;
  height: number;
  image: string | null;
  embed_url: string;
  blurhash: string | null;
}

export interface GTSPoll {
  id: string;
  expires_at: string | null;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count: number | null;
  options: GTSPollOption[];
  voted: boolean;
  own_votes: number[];
  emojis: GTSEmoji[];
}

export interface GTSPollOption {
  title: string;
  votes_count: number | null;
}

export interface GTSNotification {
  id: string;
  type: 'mention' | 'status' | 'reblog' | 'follow' | 'follow_request' | 'favourite' | 'poll' | 'update' | 'admin.sign_up' | 'admin.report';
  created_at: string;
  account: GTSAccount;
  status?: GTSStatus;
}

export interface GTSRelationship {
  id: string;
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  blocked_by: boolean;
  muting: boolean;
  muting_notifications: boolean;
  requested: boolean;
  domain_blocking: boolean;
  showing_reblogs: boolean;
  endorsed: boolean;
  note: string;
}

export interface GTSContext {
  ancestors: GTSStatus[];
  descendants: GTSStatus[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get current user's account information
 */
export async function getCurrentAccount(): Promise<GTSAccount> {
  return apiClient.get<GTSAccount>('/api/v1/accounts/verify_credentials');
}

/**
 * Get account by ID
 */
export async function getAccount(id: string): Promise<GTSAccount> {
  return apiClient.get<GTSAccount>(`/api/v1/accounts/${id}`);
}

/**
 * Get account by username
 */
export async function getAccountByUsername(username: string): Promise<GTSAccount> {
  // GoToSocial doesn't have a direct username lookup, need to use search
  const results = await searchAccounts(username, { limit: 1, resolve: true });
  const account = results.find(a => a.username === username || a.acct === username);
  if (!account) {
    throw new Error(`Account not found: ${username}`);
  }
  return account;
}

/**
 * Search for accounts
 */
export async function searchAccounts(
  q: string,
  options?: { limit?: number; offset?: number; resolve?: boolean; following?: boolean }
): Promise<GTSAccount[]> {
  const params = new URLSearchParams({
    q,
    type: 'accounts',
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.offset && { offset: options.offset.toString() }),
    ...(options?.resolve && { resolve: 'true' }),
    ...(options?.following && { following: 'true' }),
  });
  const response = await apiClient.get<{ accounts: GTSAccount[] }>(`/api/v2/search?${params}`);
  return response.accounts;
}

/**
 * Follow an account
 */
export async function followAccount(id: string, options?: { reblogs?: boolean; notify?: boolean }): Promise<GTSRelationship> {
  return apiClient.post<GTSRelationship>(`/api/v1/accounts/${id}/follow`, options);
}

/**
 * Unfollow an account
 */
export async function unfollowAccount(id: string): Promise<GTSRelationship> {
  return apiClient.post<GTSRelationship>(`/api/v1/accounts/${id}/unfollow`);
}

/**
 * Get account's followers
 */
export async function getAccountFollowers(id: string, options?: { max_id?: string; limit?: number }): Promise<GTSAccount[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  return apiClient.get<GTSAccount[]>(`/api/v1/accounts/${id}/followers?${params}`);
}

/**
 * Get account's following
 */
export async function getAccountFollowing(id: string, options?: { max_id?: string; limit?: number }): Promise<GTSAccount[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  return apiClient.get<GTSAccount[]>(`/api/v1/accounts/${id}/following?${params}`);
}

/**
 * Get account's statuses
 */
export async function getAccountStatuses(
  id: string,
  options?: {
    max_id?: string;
    min_id?: string;
    limit?: number;
    only_media?: boolean;
    exclude_replies?: boolean;
    exclude_reblogs?: boolean;
    pinned?: boolean;
  }
): Promise<GTSStatus[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
    ...(options?.only_media && { only_media: 'true' }),
    ...(options?.exclude_replies && { exclude_replies: 'true' }),
    ...(options?.exclude_reblogs && { exclude_reblogs: 'true' }),
    ...(options?.pinned && { pinned: 'true' }),
  });
  return apiClient.get<GTSStatus[]>(`/api/v1/accounts/${id}/statuses?${params}`);
}

/**
 * Get home timeline with optional custom_metadata filtering
 */
export async function getHomeTimeline(options?: { 
  max_id?: string; 
  min_id?: string; 
  limit?: number;
  // Custom metadata filters
  category?: string;
  market?: string;
  symbol?: string;
  timeframe?: string;
  risk?: string;
}): Promise<GTSStatus[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
    // Add custom metadata filters
    ...(options?.category && { category: options.category }),
    ...(options?.market && { market: options.market }),
    ...(options?.symbol && { symbol: options.symbol }),
    ...(options?.timeframe && { timeframe: options.timeframe }),
    ...(options?.risk && { risk: options.risk }),
  });
  return apiClient.get<GTSStatus[]>(`/api/v1/timelines/home?${params}`);
}

/**
 * Get public timeline (local or federated)
 */
export async function getPublicTimeline(
  options?: { local?: boolean; max_id?: string; min_id?: string; limit?: number }
): Promise<GTSStatus[]> {
  const params = new URLSearchParams({
    ...(options?.local && { local: 'true' }),
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  return apiClient.get<GTSStatus[]>(`/api/v1/timelines/public?${params}`);
}

/**
 * Get a single status
 */
export async function getStatus(id: string): Promise<GTSStatus> {
  return apiClient.get<GTSStatus>(`/api/v1/statuses/${id}`);
}

/**
 * Get status context (ancestors and descendants)
 */
export async function getStatusContext(id: string): Promise<GTSContext> {
  return apiClient.get<GTSContext>(`/api/v1/statuses/${id}/context`);
}

/**
 * Create a new status with optional custom_metadata
 */
export async function createStatus(params: {
  status?: string;
  media_ids?: string[];
  poll?: {
    options: string[];
    expires_in: number;
    multiple?: boolean;
    hide_totals?: boolean;
  };
  in_reply_to_id?: string;
  sensitive?: boolean;
  spoiler_text?: string;
  visibility?: 'public' | 'unlisted' | 'private' | 'direct';
  language?: string;
  scheduled_at?: string;
  // Custom metadata for trading posts
  custom_metadata?: Record<string, string>;
}): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>('/api/v1/statuses', params);
}

/**
 * Edit an existing status
 */
export async function editStatus(
  id: string,
  params: {
    status?: string;
    media_ids?: string[];
    sensitive?: boolean;
    spoiler_text?: string;
  }
): Promise<GTSStatus> {
  return apiClient.put<GTSStatus>(`/api/v1/statuses/${id}`, params);
}

/**
 * Delete a status
 */
export async function deleteStatus(id: string): Promise<GTSStatus> {
  return apiClient.delete<GTSStatus>(`/api/v1/statuses/${id}`);
}

/**
 * Favourite (like) a status
 */
export async function favouriteStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/favourite`);
}

/**
 * Unfavourite a status
 */
export async function unfavouriteStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/unfavourite`);
}

/**
 * Reblog (repost) a status
 */
export async function reblogStatus(id: string, options?: { visibility?: 'public' | 'unlisted' | 'private' }): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/reblog`, options);
}

/**
 * Unreblog a status
 */
export async function unreblogStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/unreblog`);
}

/**
 * Bookmark a status
 */
export async function bookmarkStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/bookmark`);
}

/**
 * Unbookmark a status
 */
export async function unbookmarkStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/unbookmark`);
}

/**
 * Pin a status
 */
export async function pinStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/pin`);
}

/**
 * Unpin a status
 */
export async function unpinStatus(id: string): Promise<GTSStatus> {
  return apiClient.post<GTSStatus>(`/api/v1/statuses/${id}/unpin`);
}

/**
 * Upload media
 */
export async function uploadMedia(
  file: File,
  options?: { description?: string; focus?: string }
): Promise<GTSMediaAttachment> {
  const formData = new FormData();
  formData.append('file', file);
  if (options?.description) {
    formData.append('description', options.description);
  }
  if (options?.focus) {
    formData.append('focus', options.focus);
  }

  return apiClient.post<GTSMediaAttachment>('/api/v1/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

/**
 * Get notifications
 */
export async function getNotifications(
  options?: {
    max_id?: string;
    min_id?: string;
    limit?: number;
    types?: GTSNotification['type'][];
    exclude_types?: GTSNotification['type'][];
  }
): Promise<GTSNotification[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  
  options?.types?.forEach(type => params.append('types[]', type));
  options?.exclude_types?.forEach(type => params.append('exclude_types[]', type));

  return apiClient.get<GTSNotification[]>(`/api/v1/notifications?${params}`);
}

/**
 * Get relationships with accounts
 */
export async function getRelationships(ids: string[]): Promise<GTSRelationship[]> {
  const params = new URLSearchParams();
  ids.forEach(id => params.append('id[]', id));
  return apiClient.get<GTSRelationship[]>(`/api/v1/accounts/relationships?${params}`);
}

/**
 * Get bookmarked statuses
 */
export async function getBookmarks(options?: { max_id?: string; min_id?: string; limit?: number }): Promise<GTSStatus[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  return apiClient.get<GTSStatus[]>(`/api/v1/bookmarks?${params}`);
}

/**
 * Get favourited statuses
 */
export async function getFavourites(options?: { max_id?: string; min_id?: string; limit?: number }): Promise<GTSStatus[]> {
  const params = new URLSearchParams({
    ...(options?.max_id && { max_id: options.max_id }),
    ...(options?.min_id && { min_id: options.min_id }),
    ...(options?.limit && { limit: options.limit.toString() }),
  });
  return apiClient.get<GTSStatus[]>(`/api/v1/favourites?${params}`);
}

// ============================================================================
// CUSTOM ENDPOINTS (Not in standard GoToSocial - Requires backend extension)
// ============================================================================

/**
 * Purchase a post (custom endpoint)
 */
export async function purchasePost(postId: string, paymentToken: string): Promise<{ success: boolean; post: GTSStatus }> {
  return apiClient.post<{ success: boolean; post: GTSStatus }>('/api/v1/custom/posts/purchase', {
    post_id: postId,
    payment_token: paymentToken,
  });
}

/**
 * Subscribe to an author (custom endpoint)
 */
export async function subscribeToAuthor(
  authorId: string,
  paymentToken: string
): Promise<{ success: boolean; subscription: any }> {
  return apiClient.post<{ success: boolean; subscription: any }>('/api/v1/custom/subscriptions', {
    author_id: authorId,
    payment_token: paymentToken,
  });
}

/**
 * Get user's subscriptions (custom endpoint)
 */
export async function getMySubscriptions(): Promise<any[]> {
  return apiClient.get<any[]>('/api/v1/custom/subscriptions');
}

/**
 * Get user's purchased posts (custom endpoint)
 */
export async function getMyPurchases(): Promise<GTSStatus[]> {
  return apiClient.get<GTSStatus[]>('/api/v1/custom/purchases');
}

/**
 * Get trending topics (custom endpoint)
 */
export async function getTrending(type: 'tags' | 'statuses' | 'accounts', limit?: number): Promise<any> {
  const params = new URLSearchParams({
    ...(limit && { limit: limit.toString() }),
  });
  return apiClient.get<any>(`/api/v1/custom/trending/${type}?${params}`);
}

/**
 * Get suggested profiles (custom endpoint)
 */
export async function getSuggestedProfiles(limit?: number): Promise<GTSAccount[]> {
  const params = new URLSearchParams({
    ...(limit && { limit: limit.toString() }),
  });
  return apiClient.get<GTSAccount[]>(`/api/v1/custom/suggestions?${params}`);
}
