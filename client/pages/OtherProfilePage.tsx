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

  return (
    <>
      {/* ТЕСТОВЫЙ БЛОК ДЛЯ ПРОВЕРКИ СИНХРОНИЗАЦИИ */}
      <div className="mb-6 rounded-xl border-2 border-primary bg-[rgba(160,106,255,0.1)] p-6">
        <h2 className="mb-4 text-xl font-bold text-primary">🔍 ТЕСТ: Данные профиля из API</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* Баннер/Обложка */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Обложка (Header):</h3>
            <div className="rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-3">
              <p className="mb-2 text-xs text-webGray break-all">
                <span className="font-bold">URL:</span> {profile.header_url || 'undefined'}
              </p>
              {profile.header_url ? (
                <img 
                  src={profile.header_url} 
                  alt="Test Header" 
                  className="h-32 w-full rounded object-cover"
                  onError={(e) => {
                    console.error('Header image failed to load:', profile.header_url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="flex h-32 w-full items-center justify-center rounded bg-[rgba(255,0,0,0.2)] text-xs text-red-500">
                  ❌ Обложка отсутствует
                </div>
              )}
            </div>
          </div>

          {/* Аватар */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Аватар:</h3>
            <div className="rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-3">
              <p className="mb-2 text-xs text-webGray break-all">
                <span className="font-bold">URL:</span> {profile.avatar_url || 'undefined'}
              </p>
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Test Avatar" 
                  className="h-32 w-32 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Avatar image failed to load:', profile.avatar_url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23333" width="100" height="100"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[rgba(255,0,0,0.2)] text-xs text-red-500">
                  ❌ Аватар отсутствует
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-4 space-y-2 rounded-lg border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-3 text-xs">
          <p className="text-webGray">
            <span className="font-bold text-white">Username:</span> {profile.username}
          </p>
          <p className="text-webGray">
            <span className="font-bold text-white">Display Name:</span> {profile.display_name || profile.username}
          </p>
          <p className="text-webGray">
            <span className="font-bold text-white">User ID:</span> {profile.id}
          </p>
        </div>
      </div>

      {/* Основной контент страницы */}
      <ProfilePageLayout isOwnProfile={isOwnProfile} profile={profile} posts={posts} initialFollowingState={isFollowing} />
    </>
  );
}
