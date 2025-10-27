import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfilePageLayout from "@/components/socialProfile/ProfilePageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { customBackendAPI } from "@/services/api/custom-backend";
import type { Post as CustomPost, User as CustomUser } from "@/services/api/custom-backend";
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";
import { formatTimeAgo } from "@/lib/time-utils";

// Convert Custom Backend user to GTS-compatible format
// Using centralized avatar utilities for consistency
function customUserToGTS(user: CustomUser): any {
  return {
    id: user.id,
    username: user.username,
    acct: user.username,
    display_name: user.display_name || user.username,
    note: user.bio || '',
    avatar: getAvatarUrl(user),
    avatar_static: getAvatarUrl(user),
    header: getCoverUrl(user.header_url),
    header_static: getCoverUrl(user.header_url),
    locked: user.private_account,
    bot: false,
    discoverable: true,
    followers_count: user.followers_count,
    following_count: user.following_count,
    statuses_count: user.posts_count,
    created_at: user.created_at,
    fields: [], // Empty array for custom profile fields
    emojis: [], // Empty array for custom emojis
    url: `/${user.username}`,
  };
}

// Convert Custom Backend post to GTS-compatible format
function customPostToGTS(post: CustomPost, currentUserId?: string): any {
  const isCurrentUser = currentUserId && post.user?.id 
    ? String(post.user.id) === String(currentUserId)
    : false;
    
  return {
    id: post.id,
    created_at: formatTimeAgo(post.created_at),
    content: post.content,
    visibility: post.visibility,
    sensitive: false,
    spoiler_text: '',
    media_attachments: (post.media_urls || []).map((url, i) => ({
      id: `media-${i}`,
      type: 'image',
      url: url,
      preview_url: url,
    })),
    account: post.user ? {
      ...customUserToGTS(post.user),
      isCurrentUser: isCurrentUser,
    } : undefined,
    reblogs_count: post.retweets_count,
    favourites_count: post.likes_count,
    replies_count: post.replies_count,
    favourited: post.is_liked || false,
    reblogged: post.is_retweeted || false,
    bookmarked: post.is_bookmarked || false,
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load user posts
  useEffect(() => {
    if (user) {
      setIsLoadingPosts(true);
      customBackendAPI.getUserPosts(user.id, { limit: 20 })
        .then(customPosts => {
          const gtsPosts = customPosts.map(post => customPostToGTS(post, String(user.id)));
          setPosts(gtsPosts);
        })
        .catch(err => {
          console.error('Failed to load posts:', err);
          setError('Failed to load posts');
        })
        .finally(() => setIsLoadingPosts(false));
    }
  }, [user]);

  if (authLoading || isLoadingPosts) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Failed to load profile</h3>
            <p className="text-sm text-muted-foreground mt-2">{error || 'Please sign in to view your profile'}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const gtsProfile = customUserToGTS(user);
  
  return <ProfilePageLayout isOwnProfile={true} profile={gtsProfile} posts={posts} />;
}
