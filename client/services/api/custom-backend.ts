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
    // PURE COOKIE-BASED AUTH: No Authorization header, cookies only
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge with provided headers
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Send httpOnly cookies (access_token, refresh_token)
    });

    // Handle 401 - try to refresh token once
    if (response.status === 401 && retryCount === 0) {
      try {
        console.log('🔄 Attempting to refresh token via cookies...');
        
        // refresh_token is in httpOnly cookie
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Send httpOnly cookies (refresh_token)
        });

        if (refreshResponse.ok) {
          console.log('✅ Token refreshed successfully');
          
          // Retry the original request - new access_token is now in cookie
          return this.request<T>(endpoint, options, retryCount + 1);
        } else {
          console.error('❌ Token refresh failed:', refreshResponse.status);
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
      }
      
      // If refresh failed, clear user data (tokens are in httpOnly cookies, can't access them)
      console.warn('⚠️ Session expired, clearing user data...');
      localStorage.removeItem('custom_user');
      
      // Let the error propagate to be handled by the UI components
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

  // Alias for getCurrentUser (used for username change tracking)
  async getMe(): Promise<User> {
    return this.getCurrentUser();
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

    // PURE COOKIE-BASED AUTH: No Authorization header
    const response = await fetch(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      credentials: 'include', // Send httpOnly cookies (access_token)
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

  async getTrendingSearches(params?: { limit?: number; hours?: number }): Promise<TrendingSearchesResponse> {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.hours) query.append('hours', params.hours.toString());
    
    const queryString = query.toString();
    return this.request<TrendingSearchesResponse>(`/search/trending${queryString ? `?${queryString}` : ''}`);
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

  async getNewsById(id: string): Promise<NewsItem> {
    return this.request<NewsItem>(`/widgets/news/${id}`);
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

  async getUsersByCountry(): Promise<CountryStats[]> {
    const response = await this.request<{ countries: CountryStats[]; total: number }>('/admin/users/by-country');
    return response.countries || [];
  }

  async deleteAllUsersExceptAdmin(): Promise<{ message: string; deleted_count: number; admins_kept: number; admin_usernames: string[] }> {
    return this.request<{ message: string; deleted_count: number; admins_kept: number; admin_usernames: string[] }>('/admin/users/cleanup?confirm=yes', {
      method: 'DELETE',
    });
  }

  async deleteUser(userId: string): Promise<{ message: string; username: string }> {
    return this.request<{ message: string; username: string }>(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // NEWSLETTER API
  // ============================================================================

  async subscribeToNewsletter(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async unsubscribeFromNewsletter(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getNewsletterSubscriptions(params?: { page?: number; limit?: number; is_active?: string }): Promise<NewsletterSubscriptionsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.is_active) query.append('is_active', params.is_active);
    
    const queryString = query.toString();
    return this.request<NewsletterSubscriptionsResponse>(`/admin/subscriptions${queryString ? `?${queryString}` : ''}`);
  }

  async getNewsletterStats(): Promise<NewsletterStats> {
    return this.request<NewsletterStats>('/admin/subscriptions/stats');
  }

  async deleteNewsletterSubscription(subscriptionId: string): Promise<{ message: string; email: string }> {
    return this.request<{ message: string; email: string }>(`/admin/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  async exportNewsletterSubscriptions(): Promise<{ emails: string[]; total: number }> {
    return this.request<{ emails: string[]; total: number }>('/admin/subscriptions/export');
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
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
  is_profile_private?: boolean; // If true, profile requires subscription to view posts
  subscription_discount_price?: number; // Discounted subscription price (e.g. $3)
  subscription_discount_percentage?: number; // Discount % (e.g. 90)
  subscription_discount_days?: number; // Duration of discount (e.g. 30 days)
  photos_count?: number; // Count of photo posts
  videos_count?: number; // Count of video posts
  premium_posts_count?: number; // Count of premium/paid posts
  role?: string;
  first_name?: string;
  last_name?: string;
  location?: string;
  website?: string;
  sectors?: string; // JSON string containing array of sector IDs
  created_at: string;
  updated_at?: string;
}

export interface Media {
  id: string;
  user_id: string;
  post_id?: string;
  type: 'image' | 'video' | 'gif' | 'document';
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  file_name?: string;
  file_extension?: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  user?: User;
  content: string;
  content_html?: string;
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
  
  // Access Control (Phase 3) - ДОБАВЛЕНЫ НОВЫЕ ПОЛЯ
  access_level?: 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium';
  accessLevel?: 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium'; // camelCase от бэкенда
  reply_policy?: 'everyone' | 'following' | 'verified' | 'mentioned';
  replyPolicy?: 'everyone' | 'following' | 'verified' | 'mentioned'; // camelCase от бэкенда
  price_cents?: number;
  priceCents?: number; // camelCase от бэкенда
  
  // Computed fields
  is_purchased?: boolean;
  isPurchased?: boolean; // camelCase от бэкенда
  is_subscriber?: boolean;
  isSubscriber?: boolean; // camelCase от бэкенда
  is_follower?: boolean;
  isFollower?: boolean; // camelCase от бэкенда
  post_price?: number;
  postPrice?: number; // camelCase от бэкенда
  
  // Preview text for paid posts (visible to all)
  preview_text?: string;
  previewText?: string; // camelCase от бэкенда
  
  // Metadata extracted fields (from backend DTO)
  ticker?: string; // Symbol/ticker badge (extracted from metadata)
  symbol?: string; // Alternative name for ticker
  market?: string; // Market type (Stocks, Crypto, etc.)
  category?: string; // Post category (Signal, News, Education, etc.)
  timeframe?: string; // Timeframe (15m, 1h, 4h, 1d, 1w)
  risk?: string; // Risk level (low, medium, high)
  
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
  previewText?: string; // Preview for paid posts (visible to all)
  media_ids?: string[];
  media_transforms?: Record<string, MediaCropTransform>; // mediaID -> crop rect
  metadata?: Record<string, any>; // Changed from Record<string, string> to support complex data like code_blocks
  visibility?: 'public' | 'followers' | 'private';
  reply_to_id?: string;
  
  // Access Control (Phase 3)
  access_level?: 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium';
  accessLevel?: 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium'; // Alternative
  reply_policy?: 'everyone' | 'following' | 'verified' | 'mentioned';
  replyPolicy?: 'everyone' | 'following' | 'verified' | 'mentioned'; // Alternative
  price_cents?: number; // For pay-per-post
  priceCents?: number; // Alternative
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
  type: 'image' | 'video' | 'audio' | 'gif' | 'document';
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

export interface TrendingSearch {
  query: string;
  count: number;
  trend: number;
}

export interface TrendingSearchesResponse {
  searches: TrendingSearch[];
  period: string;
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
  content?: string; // Полный текст новости
  url?: string; // Внешняя ссылка на источник (опционально)
  image_url?: string;
  category: string;
  source: string;
  status: 'published' | 'draft'; // Статус публикации
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
  content?: string; // Полный текст новости
  url?: string; // Внешняя ссылка на источник (опционально)
  image_url?: string;
  category: string;
  source: string;
  status?: 'published' | 'draft'; // Статус публикации
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

export interface CountryStats {
  country: string;
  user_count: number;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at?: string;
  is_active: boolean;
  source: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriptionsResponse {
  subscriptions: NewsletterSubscription[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface NewsletterStats {
  total_active: number;
  total_inactive: number;
  total_all: number;
  recent_subscriptions: number;
}

// Export singleton instance
export const customBackendAPI = new CustomBackendAPI();
