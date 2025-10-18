import { type FC, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";
import { cn } from "@/lib/utils";

const MOCK_FOLLOWERS = [
  {
    id: "1",
    name: "Crypto Whale",
    handle: "@cryptowhale",
    avatar: "https://i.pravatar.cc/150?img=10",
    verified: true,
    bio: "Bitcoin maximalist. HODL since 2013.",
    followers: 125000,
    following: 420,
  },
  {
    id: "2",
    name: "Market News",
    handle: "@marketnews",
    avatar: "https://i.pravatar.cc/150?img=20",
    verified: true,
    bio: "Real-time crypto market updates and analysis.",
    followers: 89000,
    following: 156,
  },
  {
    id: "3",
    name: "DeFi Hunter",
    handle: "@defihunter",
    avatar: "https://i.pravatar.cc/150?img=30",
    verified: false,
    bio: "Finding the best DeFi yields. NFA.",
    followers: 45000,
    following: 890,
  },
  {
    id: "4",
    name: "NFT Collector",
    handle: "@nftcollector",
    avatar: "https://i.pravatar.cc/150?img=40",
    verified: true,
    bio: "Collecting digital art since 2020.",
    followers: 67000,
    following: 2300,
  },
  {
    id: "5",
    name: "Blockchain Dev",
    handle: "@blockchaindev",
    avatar: "https://i.pravatar.cc/150?img=50",
    verified: false,
    bio: "Building the future of Web3.",
    followers: 34000,
    following: 567,
  },
];

const MOCK_FOLLOWING = [
  {
    id: "1",
    name: "Vitalik Buterin",
    handle: "@vitalikbuterin",
    avatar: "https://i.pravatar.cc/150?img=11",
    verified: true,
    bio: "Ethereum co-founder.",
    followers: 5200000,
    following: 890,
  },
  {
    id: "2",
    name: "CZ Binance",
    handle: "@cz_binance",
    avatar: "https://i.pravatar.cc/150?img=21",
    verified: true,
    bio: "Founder & CEO of Binance.",
    followers: 8900000,
    following: 234,
  },
  {
    id: "3",
    name: "Satoshi Nakamoto",
    handle: "@satoshi",
    avatar: "https://i.pravatar.cc/150?img=31",
    verified: false,
    bio: "The real Satoshi... or am I?",
    followers: 1200000,
    following: 0,
  },
  {
    id: "4",
    name: "Crypto Analytics",
    handle: "@cryptoanalytics",
    avatar: "https://i.pravatar.cc/150?img=41",
    verified: true,
    bio: "On-chain analytics and market insights.",
    followers: 456000,
    following: 1200,
  },
  {
    id: "5",
    name: "Web3 Builder",
    handle: "@web3builder",
    avatar: "https://i.pravatar.cc/150?img=51",
    verified: false,
    bio: "Building decentralized applications.",
    followers: 89000,
    following: 678,
  },
];

type TabType = "verified" | "followers" | "following";

const ProfileConnections: FC = () => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = (searchParams.get("tab") as TabType) || "followers";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const verifiedFollowers = useMemo(
    () => MOCK_FOLLOWERS.filter((user) => user.verified),
    []
  );

  const currentUsers = useMemo(() => {
    switch (activeTab) {
      case "verified":
        return verifiedFollowers;
      case "followers":
        return MOCK_FOLLOWERS;
      case "following":
        return MOCK_FOLLOWING;
      default:
        return MOCK_FOLLOWERS;
    }
  }, [activeTab, verifiedFollowers]);

  const tabs = [
    { id: "verified" as TabType, label: "Verified Followers" },
    { id: "followers" as TabType, label: "Followers" },
    { id: "following" as TabType, label: "Following" },
  ];

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <div className="sticky top-0 z-10 border-b border-[#181B22] bg-black/95 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-[#A06AFF]/20"
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
            <h1 className="text-xl font-bold text-white">{handle}</h1>
            <p className="text-sm text-[#8E92A0]">@{handle}</p>
          </div>
        </div>

        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex-1 px-4 py-4 text-[15px] font-medium transition-colors",
                activeTab === tab.id
                  ? "text-white"
                  : "text-[#8E92A0] hover:bg-[#0A0A0A] hover:text-white"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#A06AFF]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[#181B22]">
        {currentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-[#8E92A0]">No users to show</p>
          </div>
        ) : (
          currentUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[#0A0A0A]"
            >
              <Avatar
                className="h-12 w-12 cursor-pointer"
                onClick={() =>
                  navigate(`/social/profile/${user.handle.replace("@", "")}`)
                }
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    navigate(`/social/profile/${user.handle.replace("@", "")}`)
                  }
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white hover:underline">
                      {user.name}
                    </span>
                    {user.verified && <VerifiedBadge size={16} />}
                  </div>
                  <span className="text-sm text-[#8E92A0]">{user.handle}</span>
                </div>
                {user.bio && (
                  <p className="mt-1 text-sm text-white/80">{user.bio}</p>
                )}
                <div className="mt-2 flex gap-4 text-sm text-[#8E92A0]">
                  <span>
                    <span className="font-semibold text-white">
                      {user.following.toLocaleString()}
                    </span>{" "}
                    Following
                  </span>
                  <span>
                    <span className="font-semibold text-white">
                      {user.followers.toLocaleString()}
                    </span>{" "}
                    Followers
                  </span>
                </div>
              </div>
              <FollowButton profileId={user.id} size="compact" />
            </div>
          ))
        )}
      </div>
      </div>

      <aside className="hidden h-fit w-[340px] flex-col gap-4 lg:flex">
        <SuggestedProfilesWidget
          title="Who to follow"
          profiles={DEFAULT_FOLLOW_RECOMMENDATIONS}
        />
      </aside>
    </div>
  );
};

export default ProfileConnections;
