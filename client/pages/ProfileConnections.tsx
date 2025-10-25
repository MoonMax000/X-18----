import { type FC, useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";
import { cn } from "@/lib/utils";
import { useGTSProfile } from "@/hooks/useGTSProfile";
import { getCurrentAccount } from "@/services/api/gotosocial";
import type { GTSAccount } from "@/services/api/gotosocial";

type TabType = "verified" | "followers" | "following";

// Convert GTSAccount to UI user format
interface UIUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
  bio: string;
  followers: number;
  following: number;
}

function convertGTSAccountToUIUser(account: GTSAccount): UIUser {
  return {
    id: account.id,
    name: account.display_name || account.username,
    handle: account.acct,
    avatar: account.avatar,
    verified: account.verified,
    bio: account.note?.replace(/<[^>]*>/g, "") || "", // Remove HTML tags
    followers: account.followers_count,
    following: account.following_count,
  };
}

const ProfileConnections: FC = () => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = (searchParams.get("tab") as TabType) || "followers";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
  const [currentUser, setCurrentUser] = useState<GTSAccount | null>(null);

  // Get current user
  useEffect(() => {
    getCurrentAccount().then(setCurrentUser).catch(console.error);
  }, []);

  // Fetch profile data based on active tab
  const {
    profile,
    followers: gtsFollowers,
    following: gtsFollowing,
    isLoading,
    error,
  } = useGTSProfile({
    username: handle,
    fetchFollowers: activeTab === "followers" || activeTab === "verified",
    fetchFollowing: activeTab === "following",
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Convert GTS accounts to UI format
  const followers = useMemo(
    () => gtsFollowers.map(convertGTSAccountToUIUser),
    [gtsFollowers]
  );

  const following = useMemo(
    () => gtsFollowing.map(convertGTSAccountToUIUser),
    [gtsFollowing]
  );

  const verifiedFollowers = useMemo(
    () => followers.filter((user) => user.verified),
    [followers]
  );

  const currentUsers = useMemo(() => {
    switch (activeTab) {
      case "verified":
        return verifiedFollowers;
      case "followers":
        return followers;
      case "following":
        return following;
      default:
        return followers;
    }
  }, [activeTab, verifiedFollowers, followers, following]);

  const tabs = [
    { id: "verified" as TabType, label: "Verified Followers" },
    { id: "followers" as TabType, label: "Followers" },
    { id: "following" as TabType, label: "Following" },
  ];

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-[#ffffff]/[0.15] active:bg-[#ffffff]/[0.25]"
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6667 5L6.66675 10L11.6667 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{profile?.display_name || handle}</h1>
              <p className="text-sm text-[#8E92A0]">@{handle}</p>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center overflow-x-auto rounded-full border border-[#5E5E5E] bg-[#000000] p-0.5 transition-all duration-300 hover:border-[#B87AFF] hover:shadow-[0_0_20px_rgba(184,122,255,0.3)]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex-1 min-w-[120px] px-3 py-2 text-sm font-semibold transition-all duration-300 relative group",
                      isActive
                        ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1),inset_0_0_12px_rgba(0,0,0,0.3)]"
                        : "rounded-full text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20 hover:shadow-[0_8px_20px_-12px_rgba(160,106,255,0.5)]"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {tab.id === "verified" && (
                        <VerifiedBadge
                          size={16}
                          variant={isActive ? "white" : "gradient"}
                        />
                      )}
                      {tab.label}
                    </span>
                    {!isActive && (
                      <div
                        className="absolute bottom-0 left-1/2 h-0.5 w-0 rounded-full transform -translate-x-1/2 group-hover:w-3/4 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#A06AFF] border-t-transparent" />
              <p className="text-sm text-[#8E92A0]">
                {activeTab === "followers" ? "Загружаем подписчиков..." : 
                 activeTab === "following" ? "Загружаем подписки..." : 
                 "Загружаем verified подписчиков..."}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#5E5E5E] bg-[rgba(12,16,20,0.4)] p-10 text-center mx-4 my-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Ошибка загрузки</h3>
            <p className="max-w-[360px] text-sm text-[#B0B0B0]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(160,106,255,0.4)]"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Users List */}
        {!isLoading && !error && (
          <div className="divide-y divide-[#181B22]">
            {currentUsers.length === 0 ? (
              <EmptyState activeTab={activeTab} profileName={profile?.display_name || handle || ""} />
            ) : (
              currentUsers.map((user) => {
                const isFollowing = followingState[user.id] ?? false;
                const isCurrentUser = currentUser?.id === user.id;
                
                return (
                  <div
                    key={user.id}
                    className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[#0A0A0A]"
                  >
                    <UserHoverCard
                      author={{
                        name: user.name,
                        handle: user.handle,
                        avatar: user.avatar,
                        verified: user.verified,
                        followers: user.followers,
                        following: user.following,
                        bio: user.bio,
                      }}
                      isFollowing={isFollowing}
                      onFollowToggle={(nextState) => setFollowingState(prev => ({ ...prev, [user.id]: nextState }))}
                      showFollowButton={!isCurrentUser}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white hover:underline">
                              {user.name}
                            </span>
                            {user.verified && <VerifiedBadge size={16} />}
                          </div>
                          {user.bio && (
                            <p className="mt-1 text-sm text-white/80 line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                      </div>
                    </UserHoverCard>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-[#8E92A0]">@{user.handle}</span>
                      {!isCurrentUser && (
                        <FollowButton
                          profileId={user.id}
                          size="compact"
                          isFollowing={isFollowing}
                          onToggle={(nextState) => setFollowingState(prev => ({ ...prev, [user.id]: nextState }))}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <aside className="hidden h-fit w-[340px] flex-col gap-4 lg:flex">
        <SuggestedProfilesWidget
          title="Who to follow"
          profiles={DEFAULT_SUGGESTED_PROFILES}
        />
      </aside>
    </div>
  );
};

interface EmptyStateProps {
  activeTab: TabType;
  profileName: string;
}

const EmptyState: FC<EmptyStateProps> = ({ activeTab, profileName }) => {
  const getMessage = () => {
    switch (activeTab) {
      case "verified":
        return `У ${profileName} пока нет verified подписчиков`;
      case "followers":
        return `У ${profileName} пока нет подписчиков`;
      case "following":
        return `${profileName} пока ни на кого не подписан`;
      default:
        return "Нет пользователей";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF] mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{getMessage()}</h3>
      <p className="text-sm text-[#8E92A0] max-w-[300px]">
        Когда появятся {activeTab === "following" ? "подписки" : "подписчики"}, они отобразятся здесь.
      </p>
    </div>
  );
};

export default ProfileConnections;
