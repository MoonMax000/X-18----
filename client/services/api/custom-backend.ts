// Custom Backend API Service Layer
// This service handles all communication with the custom Go backend API

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class CustomBackendAPI {
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const token = localStorage.getItem('custom_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Merge with provided headers
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token once
    if (response.status === 401 && retryCount === 0) {
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('custom_refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting to refresh token...');
          
          // Send refresh_token in request body (not in header!)
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              refresh_token: refreshToken,
            }),
          });

          if (refreshResponse.ok) {
            const { access_token, refresh_token } = await refreshResponse.json();
            localStorage.setItem('custom_token', access_token);
            if (refresh_token) {
              localStorage.setItem('custom_refresh_token', refresh_token);
            }
            
            console.log('✅ Token refreshed successfully');
            
            // Retry the original request with new token
            return this.request<T>(endpoint, options, retryCount + 1);
          } else {
            console.error('❌ Token refresh failed:', refreshResponse.status);
          }
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
      }
      
      // If refresh failed, clear tokens and reload page to reset state
      console.warn('⚠️ Clearing invalid tokens and reloading...');
      localStorage.removeItem('custom_token');
      localStorage.removeItem('custom_refresh_token');
      localStorage.removeItem('custom_user');
      
      // Reload page after a short delay to ensure state is reset
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
      throw new Error('Invalid or expired token');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // USERS API
  // ============================================================================

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.request<User>(`/users/username/${username}`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserPosts(userId: string, params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    const queryString = query.toString();
    return this.request<Post[]>(`/users/${userId}/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getFollowers(userId: string, params?: PaginationParams): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    return this.request<User[]>(`/users/${userId}/followers${queryString ? `?${queryString}` : ''}`);
  }

  async getFollowing(userId: string, params?: PaginationParams): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    return this.request<User[]>(`/users/${userId}/following${queryString ? `?${queryString}` : ''}`);
  }

  async followUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // POSTS API
  // ============================================================================

  async createPost(data: CreatePostData): Promise<Post> {
    return this.request<Post>('/posts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPost(id: string): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async deletePost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/like`, {
      method: 'DELETE',
    });
  }

  async retweetPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/retweet`, {
      method: 'POST',
    });
  }

  async unretweetPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/retweet`, {
      method: 'DELETE',
    });
  }

  async bookmarkPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/bookmark`, {
      method: 'POST',
    });
  }

  async unbookmarkPost(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${id}/bookmark`, {
      method: 'DELETE',
    });
  }

  async getBookmarks(params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    const queryString = query.toString();
    return this.request<Post[]>(`/bookmarks${queryString ? `?${queryString}` : ''}`);
  }

  async getPostReplies(postId: string): Promise<ReplyPost[]> {
    return this.request<ReplyPost[]>(`/posts/${postId}/replies`);
  }

  // ============================================================================
  // TIMELINE API
  // ============================================================================

  async getHomeTimeline(params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    const queryString = query.toString();
    const response = await this.request<TimelineResponse>(`/timeline/home${queryString ? `?${queryString}` : ''}`);
    return response.posts || [];
  }

  async getExploreTimeline(params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    const queryString = query.toString();
    // Backend теперь возвращает массив постов напрямую (cursor-based пагинация)
    return this.request<Post[]>(`/timeline/explore${queryString ? `?${queryString}` : ''}`);
  }

  async getTrendingPosts(params?: { limit?: number }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const queryString = query.toString();
    const response = await this.request<TimelineResponse>(`/timeline/trending${queryString ? `?${queryString}` : ''}`);
    return response.posts || [];
  }

  async getUserTimeline(userId: string, params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    const queryString = query.toString();
    return this.request<Post[]>(`/timeline/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async searchPostsByMetadata(metadata: Record<string, string>, params?: TimelineParams): Promise<Post[]> {
    const query = new URLSearchParams();
    Object.entries(metadata).forEach(([key, value]) => {
      query.append(key, value);
    });
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.before) query.append('before', params.before);
    if (params?.after) query.append('after', params.after);
    
    return this.request<Post[]>(`/timeline/search?${query.toString()}`);
  }

  // ============================================================================
  // NOTIFICATIONS API
  // ============================================================================

  async getNotifications(params?: PaginationParams): Promise<Notification[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    const response = await this.request<{ notifications: Notification[] }>(`/notifications${queryString ? `?${queryString}` : ''}`);
    return response.notifications || [];
  }

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await this.request<{ unread_count: number }>('/notifications/unread-count');
    return { count: response.unread_count };
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // MEDIA API
  // ============================================================================

  async uploadMedia(file: File): Promise<MediaAttachment> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('custom_token');
    const response = await fetch(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Media upload failed');
    }

    return response.json();
  }

  async getMedia(id: string): Promise<MediaAttachment> {
    return this.request<MediaAttachment>(`/media/${id}`);
  }

  async deleteMedia(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserMedia(userId: string, params?: PaginationParams): Promise<MediaAttachment[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    return this.request<MediaAttachment[]>(`/media/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  // ============================================================================
  // SEARCH API
  // ============================================================================

  async search(query: string, type?: 'all' | 'users' | 'posts'): Promise<SearchResults> {
    const params = new URLSearchParams({ q: query });
    if (type && type !== 'all') params.append('type', type);
    
    return this.request<SearchResults>(`/search/?${params.toString()}`);
  }

  async searchUsers(query: string, params?: PaginationParams): Promise<User[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    return this.request<User[]>(`/search/users?${searchParams.toString()}`);
  }

  async searchPosts(query: string, params?: PaginationParams): Promise<Post[]> {
    const searchParams = new URLSearchParams({ q: query });
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    return this.request<Post[]>(`/search/posts?${searchParams.toString()}`);
  }

  async searchHashtag(tag: string, params?: PaginationParams): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    return this.request<Post[]>(`/search/hashtag/${tag}${queryString ? `?${queryString}` : ''}`);
  }

  async getTrendingHashtags(limit?: number): Promise<TrendingHashtag[]> {
    const query = new URLSearchParams();
    if (limit) query.append('limit', limit.toString());
    
    const queryString = query.toString();
    return this.request<TrendingHashtag[]>(`/search/trending-hashtags${queryString ? `?${queryString}` : ''}`);
  }

  // ============================================================================
  // WIDGETS API
  // ============================================================================

  async getNews(params?: { limit?: number; category?: string }): Promise<NewsItem[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.category) query.append('category', params.category);
    
    const queryString = query.toString();
    return this.request<NewsItem[]>(`/widgets/news${queryString ? `?${queryString}` : ''}`);
  }

  async getTrendingTickers(params?: { limit?: number; timeframe?: string }): Promise<TrendingTicker[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.timeframe) query.append('timeframe', params.timeframe);
    
    const queryString = query.toString();
    return this.request<TrendingTicker[]>(`/widgets/trending-tickers${queryString ? `?${queryString}` : ''}`);
  }

  async getTopAuthors(params?: { limit?: number; timeframe?: string }): Promise<TopAuthor[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.timeframe) query.append('timeframe', params.timeframe);
    
    const queryString = query.toString();
    return this.request<TopAuthor[]>(`/widgets/top-authors${queryString ? `?${queryString}` : ''}`);
  }

  async getMyEarnings(params?: { period?: string }): Promise<MyEarningsData> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    
    const queryString = query.toString();
    return this.request<MyEarningsData>(`/widgets/my-earnings${queryString ? `?${queryString}` : ''}`);
  }

  async getMySubscriptions(): Promise<SubscriptionData[]> {
    return this.request<SubscriptionData[]>('/widgets/my-subscriptions');
  }

  async getMyActivity(params?: { period?: string }): Promise<MyActivityData> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    
    const queryString = query.toString();
    return this.request<MyActivityData>(`/widgets/my-activity${queryString ? `?${queryString}` : ''}`);
  }

  // ============================================================================
  // POST MENU API
  // ============================================================================

  async pinPost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}/pin`, {
      method: 'POST',
    });
  }

  async unpinPost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}/pin`, {
      method: 'DELETE',
    });
  }

  async reportPost(postId: string, reason: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async blockUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/block`, {
      method: 'POST',
    });
  }

  async unblockUser(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/users/${userId}/block`, {
      method: 'DELETE',
    });
  }

  async getBlockedUsers(params?: PaginationParams): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    const queryString = query.toString();
    return this.request<User[]>(`/users/blocked${queryString ? `?${queryString}` : ''}`);
  }

  // ============================================================================
  // ADMIN API
  // ============================================================================

  async getAdminStats(): Promise<AdminStats> {
    return this.request<AdminStats>('/admin/stats');
  }

  async getAdminNews(params?: { limit?: number; offset?: number; is_active?: string }): Promise<NewsItem[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.is_active) query.append('is_active', params.is_active);
    
    const queryString = query.toString();
    return this.request<NewsItem[]>(`/admin/news${queryString ? `?${queryString}` : ''}`);
  }

  async createNews(data: CreateNewsData): Promise<NewsItem> {
    return this.request<NewsItem>('/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNews(id: string, data: Partial<CreateNewsData>): Promise<NewsItem> {
    return this.request<NewsItem>(`/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNews(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/news/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(params?: { limit?: number; offset?: number; search?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.search) query.append('search', params.search);
    
    const queryString = query.toString();
    return this.request<User[]>(`/admin/users${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminUserDetails(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}`);
  }

  async updateUserRole(userId: string, role: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminReports(params?: { limit?: number; offset?: number; status?: string }): Promise<PostReport[]> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    if (params?.status) query.append('status', params.status);
    
    const queryString = query.toString();
    return this.request<PostReport[]>(`/admin/reports${queryString ? `?${queryString}` : ''}`);
  }

  async reviewReport(reportId: string, data: ReviewReportData): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/admin/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  header_url: string;
  verified: boolean;
  subscription_price: number;
  followers_count: number;
  following_count: number;
  posts_count: number;
  private_account: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Media {
  id: string;
  user_id: string;
  post_id?: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user?: User;
  content: string;
  media?: Media[];
  media_urls?: string[]; // Deprecated: for backwards compatibility
  metadata?: Record<string, any>; // Changed from Record<string, string> to support complex data like code_blocks
  likes_count: number;
  retweets_count: number;
  replies_count: number;
  is_liked?: boolean;
  is_retweeted?: boolean;
  is_bookmarked?: boolean;
  visibility: 'public' | 'followers' | 'private';
  created_at: string;
  updated_at?: string;
}

export interface MediaCropTransform {
  x: number;
  y: number;
  w: number;
  h: number;
  src_w: number;
  src_h: number;
}

export interface CreatePostData {
  content: string;
  media_ids?: string[];
  media_transforms?: Record<string, MediaCropTransform>; // mediaID -> crop rect
  metadata?: Record<string, any>; // Changed from Record<string, string> to support complex data like code_blocks
  visibility?: 'public' | 'followers' | 'private';
  reply_to_id?: string;
}

export interface ReplyPost extends Post {
  reply_to_id?: string; // ID of the post this is replying to
}

export interface Notification {
  id: string;
  user_id: string;
  from_user_id?: string;
  type: 'like' | 'retweet' | 'mention' | 'reply' | 'follow' | 'unfollow';
  post_id?: string;
  is_read: boolean;
  read?: boolean; // Backend may return 'read' instead of 'is_read'
  created_at: string;
  from_user?: User; // Backend actually returns user info in "from_user" field
  actor?: User; // Keeping for backwards compatibility
  post?: Post;
}

export interface MediaAttachment {
  id: string;
  user_id: string;
  url: string;
  thumbnail_url?: string;
  type: 'image' | 'video' | 'audio';
  width?: number;
  height?: number;
  size: number;
  created_at: string;
}

export interface SearchResults {
  users: User[];
  posts: Post[];
}

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export interface TimelineParams {
  limit?: number;
  before?: string; // Cursor for pagination (post ID)
  after?: string;  // Cursor for pagination (post ID)
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface TimelineResponse {
  posts: Post[];
  limit: number;
  offset: number;
  total?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url?: string;
  category: string;
  source: string;
  published_at: string;
}

export interface TrendingTicker {
  ticker: string;
  count: number;
}

export interface TopAuthor {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  posts_count: number;
  likes_count: number;
  total_engagement: number;
}

export interface MyEarningsData {
  mrr: number;
  total_revenue: number;
  subscribers_count: number;
  posts_sold: number;
  avg_post_price: number;
  top_posts_by_revenue: any[];
}

export interface MyActivityData {
  posts: number;
  likes: number;
  comments: number;
  period: string;
}

export interface SubscriptionData {
  id: string;
  user_id: string;
  creator_id: string;
  creator?: User;
  status: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_posts: number;
  total_reports: number;
  pending_reports: number;
  active_news: number;
  users_today: number;
  posts_today: number;
}

export interface CreateNewsData {
  title: string;
  description: string;
  url: string;
  image_url?: string;
  category: string;
  source: string;
  is_active?: boolean;
}

export interface PostReport {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  review_note?: string;
  created_at: string;
  updated_at?: string;
  post?: Post;
  reporter?: User;
}

export interface ReviewReportData {
  status: 'reviewed' | 'resolved' | 'dismissed';
  review_note?: string;
  action?: 'none' | 'delete_post';
}

// Export singleton instance
export const customBackendAPI = new CustomBackendAPI();
