import { useEffect, useState } from "react";
import ProfilePageLayout from "@/components/socialProfile/ProfilePageLayout";
import { useGTSProfile } from "@/hooks/useGTSProfile";
import { getCurrentAccount } from "@/services/api/gotosocial";
import type { GTSAccount } from "@/services/api/gotosocial";

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<GTSAccount | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Get current user first
  useEffect(() => {
    getCurrentAccount()
      .then(setCurrentUser)
      .catch(err => console.error('Failed to get current user:', err))
      .finally(() => setIsLoadingUser(false));
  }, []);

  // Load own profile data
  const { profile, statuses, isLoading, error } = useGTSProfile({
    userId: currentUser?.id,
    fetchStatuses: true,
  });

  if (isLoadingUser || isLoading) {
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
            <h3 className="text-lg font-semibold">Failed to load profile</h3>
            <p className="text-sm text-muted-foreground mt-2">{error || 'Profile not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return <ProfilePageLayout isOwnProfile={true} profile={profile} posts={statuses} />;
}
