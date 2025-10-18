import { type FC } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";

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

const ProfileFollowing: FC = () => {
  const navigate = useNavigate();
  const { handle } = useParams<{ handle: string }>();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mx-auto w-full max-w-[600px]">
      <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#181B22] bg-black/95 px-4 py-3 backdrop-blur-md">
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
          <p className="text-sm text-[#8E92A0]">Following</p>
        </div>
      </div>

      <div className="divide-y divide-[#181B22]">
        {MOCK_FOLLOWING.map((user) => (
          <div
            key={user.id}
            className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[#0A0A0A]"
          >
            <Avatar
              className="h-12 w-12 cursor-pointer"
              onClick={() => navigate(`/social/profile/${user.handle.replace('@', '')}`)}
            >
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/social/profile/${user.handle.replace('@', '')}`)}
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
        ))}
      </div>
    </div>
  );
};

export default ProfileFollowing;
