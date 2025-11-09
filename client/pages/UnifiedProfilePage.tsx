import { useNavigate, useParams } from "react-router-dom";
import ProfilePageLayout from "@/components/socialProfile/ProfilePageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomUserProfile } from "@/hooks/useCustomUserProfile";
import { useEffect } from "react";

/**
 * Universal Profile Page Component
 * Handles both own profile and other users' profiles
 * Route: /@:username
 */
export default function UnifiedProfilePage() {
  const { username: rawUsername } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Strip @ from username parameter if present (URL is /@username, param is "@username")
  const username = rawUsername?.replace(/^@/, '') || '';
  
  console.log('[UNIFIED_PROFILE] Component mounted with params:', { rawUsername, username });
  console.log('[UNIFIED_PROFILE] Current user:', currentUser?.username);
  console.log('[UNIFIED_PROFILE] Auth state:', { isAuthenticated, authLoading });

  // Determine if this is the current user's profile
  const isOwnProfile = currentUser?.username === username;

  // Use the same hook for both own and other profiles
  const { profile, posts, isFollowing, isLoading: profileLoading, error } = useCustomUserProfile({
    username: username || '',
    fetchPosts: true,
    fetchFollowers: true,
  });

  // Redirect to home if viewing own profile but not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && isOwnProfile) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, isOwnProfile, navigate]);

  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Profile not found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {error || 'The profile you are looking for does not exist'}
            </p>
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

  return (
    <ProfilePageLayout 
      isOwnProfile={isOwnProfile} 
      profile={profile} 
      posts={posts} 
      initialFollowingState={isFollowing} 
    />
  );
}
