import { FC, useState } from "react";

import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
}

interface ProductsCardProps {
  title?: string;
  users?: User[];
}

const VerifiedBadge = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.59493 1.74447C9.85509 1.64084 10.1443 1.64084 10.4044 1.74447C11.2431 2.07846 11.4069 3.36461 12.3965 3.43621C13.0933 3.48663 13.7772 2.90572 14.4764 3.07986C14.7584 3.15011 15.002 3.32991 15.1547 3.58056C15.6223 4.34861 15.0188 5.47751 15.7816 6.11481C16.3116 6.55739 17.1873 6.50011 17.648 7.04267C17.842 7.2712 17.9373 7.56927 17.9124 7.86983C17.8387 8.76391 16.6988 9.32308 16.9493 10.2867C17.1226 10.9537 17.8541 11.4226 17.9124 12.1303C17.9373 12.4309 17.842 12.729 17.648 12.9575C17.069 13.6392 15.817 13.4147 15.456 14.3386C15.2025 14.9871 15.528 15.8065 15.1547 16.4196C15.002 16.6702 14.7584 16.8501 14.4764 16.9203C13.6082 17.1365 12.7269 16.2038 11.8914 16.7299C11.2949 17.1054 11.0812 17.9863 10.4044 18.2557C10.1443 18.3593 9.85509 18.3593 9.59493 18.2557C8.91818 17.9863 8.70443 17.1054 8.10792 16.7299C7.28277 16.2104 6.37645 17.1328 5.52293 16.9203C5.2409 16.8501 4.99734 16.6702 4.84472 16.4196C4.37706 15.6516 4.98054 14.5226 4.21776 13.8853C3.68786 13.4427 2.81213 13.5001 2.35138 12.9575C2.15735 12.729 2.06204 12.4309 2.08688 12.1303C2.14538 11.4226 2.87668 10.9537 3.05009 10.2867C3.29808 9.33316 2.15971 8.75083 2.08688 7.86983C2.06204 7.56927 2.15735 7.2712 2.35138 7.04267C2.93031 6.36078 4.18217 6.58552 4.54333 5.66161C4.79686 5.01308 4.47141 4.19364 4.84472 3.58056C4.99734 3.32991 5.2409 3.15011 5.52293 3.07986C6.22222 2.90572 6.90598 3.48664 7.60283 3.43621C8.59243 3.36463 8.75626 2.07846 9.59493 1.74447Z"
      fill="url(#paint0_linear_verified)"
    />
    <path
      d="M7.5 11.111C7.5 11.111 8.22917 11.111 8.95833 12.4999C8.95833 12.4999 11.2745 9.02767 13.3333 8.33325"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_verified"
        x1="17.9163"
        y1="10.0001"
        x2="2.08301"
        y2="10.0001"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#A06AFF" />
        <stop offset="1" stopColor="#482090" />
      </linearGradient>
    </defs>
  </svg>
);

const ProductsCard: FC<ProductsCardProps> = ({
  title = "You might like",
  users = [
    {
      id: "1",
      name: "CoinMarketCap",
      username: "@CoinMarketCap",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/8e3b0efd989b9330e9b1406ea6bafe5a6b9b839c?width=88",
      isVerified: true,
    },
    {
      id: "2",
      name: "WhaleAlert",
      username: "@whale_alert",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/81d1c234a83ddeb322db8633598e8c5a4c78503c?width=88",
      isVerified: true,
    },
    {
      id: "3",
      name: "John Smith",
      username: "@jhonny_rico",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/f2a55308ba04a202232a08ce7a7a3770e9d4401a?width=88",
      isVerified: true,
    },
    {
      id: "4",
      name: "Vasya Terkina",
      username: "@vasilisa_terkina",
      avatar:
        "https://api.builder.io/api/v1/image/assets/TEMP/9b3ef2151f785f297c849bb8857e447398bb4dec?width=88",
      isVerified: true,
    },
  ],
}) => {
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>(
    {},
  );
  const { toast } = useToast();

  const handleShowMore = () => {
    toast({
      title: "Discover more creators",
      description: "We will load additional recommendations soon.",
    });
  };

  const handleProfileOpen = (user: User) => {
    toast({
      title: `Opening ${user.name}`,
      description: `${user.username} profile coming soon.`,
    });
  };

  const toggleFollow = (user: User) => {
    setFollowedUsers((prev) => {
      const next = !prev[user.id];
      const updated = { ...prev, [user.id]: next };

      toast({
        title: next ? "Followed" : "Unfollowed",
        description: `${user.name} ${next ? "added to" : "removed from"} your watchlist.`,
      });

      return updated;
    });
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 self-stretch rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]">
      <div className="flex items-baseline self-stretch pb-2">
        <div className="flex-1 text-2xl font-bold leading-normal text-white">
          {title}
        </div>
        <button
          type="button"
          onClick={handleShowMore}
          className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-[#A06AFF]/10 px-3 py-1.5 text-[15px] font-semibold leading-normal text-[#E3D8FF] transition-all duration-200 hover:border-[#A06AFF] hover:bg-[#A06AFF]/20 hover:text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/50 focus-visible:ring-offset-0"
        >
          Show more
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF]/60 to-[#482090]/60 text-white transition-all duration-200 group-hover:from-[#A06AFF] group-hover:to-[#482090]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M10.7402 15.53L14.2602 12L10.7402 8.46997"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      {users.map((user) => {
        const isFollowing = followedUsers[user.id];
        return (
          <div key={user.id} className="flex items-center gap-2 self-stretch">
            <button
              type="button"
              onClick={() => handleProfileOpen(user)}
              className="group h-11 w-11 overflow-hidden rounded-full"
              style={{ aspectRatio: "1/1" }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.08]"
              />
            </button>
            <div className="flex flex-1 flex-col items-start gap-0.5">
              <button
                type="button"
                onClick={() => handleProfileOpen(user)}
                className="flex items-center gap-1 text-left text-[15px] font-bold leading-normal text-white transition hover:text-[#A06AFF]"
              >
                <span>{user.name}</span>
                {user.isVerified && <VerifiedBadge />}
              </button>
              <span className="text-xs font-bold leading-normal text-[#B0B0B0]">
                {user.username}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleFollow(user)}
              className={`flex h-[26px] w-20 items-center justify-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs font-bold leading-normal transition ${
                isFollowing
                  ? "border border-[#A06AFF] text-white hover:bg-[#A06AFF]/10"
                  : "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white hover:opacity-90"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsCard;
