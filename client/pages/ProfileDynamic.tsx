import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProfileContentClassic from "@/components/socialProfile/ProfileContentClassic";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";
import { getUserByUsername as getLocalUserByUsername } from "@/data/users";
import { getUserByUsername as getSupabaseUserByUsername } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import NotFound from "./NotFound";

export default function ProfileDynamic() {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Try Supabase first
      try {
        const supabaseUser = await getSupabaseUserByUsername(username);
        console.log('Fetched Supabase user:', supabaseUser);

        if (supabaseUser) {
          // Transform Supabase user to match expected profile format
          const firstName = supabaseUser.first_name || '';
          const lastName = supabaseUser.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim();

          const transformedUser = {
            id: supabaseUser.id,
            name: fullName || supabaseUser.username,
            username: supabaseUser.username,
            bio: supabaseUser.bio || 'No bio yet',
            location: '',
            website: null,
            joined: supabaseUser.joined_date
              ? new Date(supabaseUser.joined_date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
              : new Date(supabaseUser.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' }),
            avatar: supabaseUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${supabaseUser.username}`,
            cover: '',
            stats: {
              tweets: supabaseUser.posts_count || 0,
              following: supabaseUser.following_count || 0,
              followers: supabaseUser.followers_count || 0,
              likes: 0,
            },
            isVerified: supabaseUser.verified || false,
            isPremium: supabaseUser.premium || false,
            tradingStyle: supabaseUser.trading_style,
            specialization: supabaseUser.specialization,
            accuracyRate: supabaseUser.accuracy_rate,
            winRate: supabaseUser.win_rate,
            totalTrades: supabaseUser.total_trades,
          };

          console.log('Transformed user:', transformedUser);
          setProfileUser(transformedUser);
          setNotFound(false);
        } else {
          // Fallback to local data
          const localUser = getLocalUserByUsername(username);
          if (localUser) {
            setProfileUser(localUser);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error('Error fetching user from Supabase:', error);
        // Fallback to local data
        const localUser = getLocalUserByUsername(username);
        if (localUser) {
          setProfileUser(localUser);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }

      setLoading(false);
    }

    fetchUser();
  }, [username]);

  if (!username || notFound) {
    return <NotFound />;
  }

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Загрузка профиля...</div>
      </div>
    );
  }

  if (!profileUser) {
    return <NotFound />;
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic
          profile={profileUser}
          isOwnProfile={isOwnProfile}
        />
      </div>
      <aside className="hidden w-full max-w-[360px] xl:max-w-[380px] flex-shrink-0 flex-col gap-5 lg:flex">
        <div className="sticky top-28 flex flex-col gap-5 bg-background">
          <SuggestedProfilesWidget profiles={DEFAULT_SUGGESTED_PROFILES} />
        </div>
      </aside>
    </div>
  );
}
