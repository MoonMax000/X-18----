import { useParams } from "react-router-dom";
import ProfilePageLayout from "@/components/socialProfile/ProfilePageLayout";
import { useCustomUserProfile } from "@/hooks/useCustomUserProfile";
import { useAuth } from "@/contexts/AuthContext";

export default function OtherProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  const { user: currentUser } = useAuth();
  
  // Load profile data by username
  const username = handle || '';
  
  const { profile, posts, isFollowing, isLoading, error } = useCustomUserProfile({
    username,
    fetchPosts: true,
    fetchFollowers: true, // Needed to determine if current user is following this profile
  });

  // Determine if this is user's own profile
  const isOwnProfile = currentUser && profile 
    ? currentUser.id === profile.id || currentUser.username === profile.username
    : false;

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
              {error || `User @${username} does not exist`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <ProfilePageLayout isOwnProfile={isOwnProfile} profile={profile} posts={posts} initialFollowingState={isFollowing} />;
}
