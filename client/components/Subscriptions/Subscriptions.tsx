import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { Users, UserPlus } from "lucide-react";

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

const mockFollowers: User[] = [
  {
    id: "1",
    name: "Sarah Anderson",
    username: "@sarah_trader",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/avatar1",
    tier: "premium",
    followers: 12450,
    isFollowing: true,
    isPremium: true,
  },
  {
    id: "2",
    name: "Mike Johnson",
    username: "@mike_crypto",
    tier: "pro",
    followers: 8732,
    isFollowing: false,
    isPremium: true,
  },
  {
    id: "3",
    name: "Emily Chen",
    username: "@emily_analyst",
    tier: "free",
    followers: 3421,
    isFollowing: true,
    isPremium: false,
  },
];

const mockFollowing: User[] = [
  {
    id: "4",
    name: "John Doe",
    username: "@johndoe",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/avatar2",
    tier: "premium",
    followers: 25300,
    isFollowing: true,
    isPremium: true,
  },
  {
    id: "5",
    name: "Lisa Wang",
    username: "@lisa_defi",
    tier: "pro",
    followers: 18900,
    isFollowing: true,
    isPremium: true,
  },
  {
    id: "6",
    name: "Alex Smith",
    username: "@alexsmith",
    tier: "free",
    followers: 5670,
    isFollowing: true,
    isPremium: false,
  },
];

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
  const [followers, setFollowers] = useState(mockFollowers);
  const [following, setFollowing] = useState(mockFollowing);

  const handleFollowToggle = (id: string) => {
    if (activeSection === "followers") {
      setFollowers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
        )
      );
    } else {
      setFollowing((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isFollowing: !user.isFollowing } : user
        )
      );
    }
  };

  const currentUsers = activeSection === "followers" ? followers : following;

  return (
    <div className="mx-auto flex w-full max-w-[1059px] flex-col gap-6">
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

      <div className="flex flex-col gap-3">
        {currentUsers.map((user) => (
          <UserCard key={user.id} user={user} onFollowToggle={handleFollowToggle} />
        ))}
      </div>

      {currentUsers.length === 0 && (
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
