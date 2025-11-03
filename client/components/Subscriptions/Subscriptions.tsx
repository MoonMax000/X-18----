import { FC, useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Users, UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { User as ApiUser } from "@/services/api/custom-backend";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  tier: "free" | "premium" | "pro";
  followers: number;
  isFollowing: boolean;
  isPremium: boolean;
}

// Convert API User to UI User format
const convertApiUserToUiUser = (apiUser: ApiUser, isFollowingUser: boolean): User => {
  // Determine tier based on subscription_price
  let tier: "free" | "premium" | "pro" = "free";
  if (apiUser.subscription_price > 0) {
    tier = apiUser.subscription_price >= 10 ? "pro" : "premium";
  }

  return {
    id: apiUser.id,
    name: apiUser.display_name || `${apiUser.first_name || ''} ${apiUser.last_name || ''}`.trim() || apiUser.username,
    username: apiUser.username.startsWith('@') ? apiUser.username : `@${apiUser.username}`,
    avatar: apiUser.avatar_url,
    tier,
    followers: apiUser.followers_count,
    isFollowing: isFollowingUser,
    isPremium: apiUser.subscription_price > 0,
  };
};

const getTierBadge = (tier: "free" | "premium" | "pro") => {
  const badges = {
    free: { bg: "#6C7280", label: "Free" },
    premium: { bg: "#A06AFF", label: "Premium" },
    pro: { bg: "#FFD700", label: "Pro" },
  };
  return badges[tier];
};

const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

const UserCard: FC<{ user: User; onFollowToggle: (id: string) => void }> = ({ user, onFollowToggle }) => {
  const badge = getTierBadge(user.tier);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] p-4 backdrop-blur-[50px] transition-colors hover:border-[#A06AFF]/30">
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full border border-[#181B22] object-cover" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#181B22] bg-gradient-to-br from-primary to-[#482090]">
          <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-white">{user.name}</h3>
          <span className="rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: badge.bg }}>
            {badge.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6C7280]">
          <span>{user.username}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{formatNumber(user.followers)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onFollowToggle(user.id)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors",
          user.isFollowing
            ? "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-[#6C7280] hover:border-red-500/30 hover:text-red-400"
            : "bg-gradient-to-r from-primary to-[#482090] text-white hover:opacity-90"
        )}
      >
        {user.isFollowing ? (
          <>
            <Users className="h-3.5 w-3.5" />
            Подписка
          </>
        ) : (
          <>
            <UserPlus className="h-3.5 w-3.5" />
            Подписаться
          </>
        )}
      </button>
    </div>
  );
};

const Subscriptions: FC = () => {
  const [activeSection, setActiveSection] = useState<"followers" | "following">("following");
  const { user: currentUser } = useAuth();
  
  const {
    followers: apiFollowers,
    following: apiFollowing,
    isLoadingFollowers,
    isLoadingFollowing,
    error,
    followUser,
    unfollowUser,
  } = useSubscriptions(currentUser?.id);

  console.log('[Subscriptions] Current user:', currentUser?.id);
  console.log('[Subscriptions] API Followers:', apiFollowers.length);
  console.log('[Subscriptions] API Following:', apiFollowing.length);

  // Convert API users to UI format
  const followers = apiFollowers.map(user => convertApiUserToUiUser(user, true));
  const following = apiFollowing.map(user => convertApiUserToUiUser(user, true));

  const handleFollowToggle = async (id: string) => {
    const user = activeSection === "followers" 
      ? followers.find(u => u.id === id)
      : following.find(u => u.id === id);

    if (!user) return;

    try {
      if (user.isFollowing) {
        await unfollowUser(id);
      } else {
        await followUser(id);
      }
    } catch (err) {
      console.error('[Subscriptions] Error toggling follow:', err);
    }
  };

  const currentUsers = activeSection === "followers" ? followers : following;
  const isLoading = activeSection === "followers" ? isLoadingFollowers : isLoadingFollowing;

  return (
    <div className="mx-auto flex w-full max-w-[1059px] flex-col gap-6">
      {error && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-400">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-black p-6 backdrop-blur-[50px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">Мои подписки</h2>
            <p className="text-sm text-[#6C7280]">Управляйте подписками и подписчиками</p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-1 backdrop-blur-[50px]">
          <button
            onClick={() => setActiveSection("following")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeSection === "following"
                ? "bg-gradient-to-r from-primary to-[#482090] text-white"
                : "text-[#6C7280] hover:text-white"
            )}
          >
            Я подписан ({following.length})
          </button>
          <button
            onClick={() => setActiveSection("followers")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-bold transition-all",
              activeSection === "followers"
                ? "bg-gradient-to-r from-primary to-[#482090] text-white"
                : "text-[#6C7280] hover:text-white"
            )}
          >
            Мои подписчики ({followers.length})
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-[#181B22] bg-black p-12 backdrop-blur-[50px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#A06AFF]" />
        </div>
      ) : currentUsers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {currentUsers.map((user) => (
            <UserCard key={user.id} user={user} onFollowToggle={handleFollowToggle} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#181B22] bg-black p-12 text-center backdrop-blur-[50px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#A06AFF]/10">
            <Users className="h-8 w-8 text-[#A06AFF]" />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-white">
              {activeSection === "followers" ? "Нет подписчиков" : "Нет подписок"}
            </h3>
            <p className="text-sm text-[#6C7280]">
              {activeSection === "followers"
                ? "Пока никто не подписался на вас"
                : "Вы еще ни на кого не подписались"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(Subscriptions);
