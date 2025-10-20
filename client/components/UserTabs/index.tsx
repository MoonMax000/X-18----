import { FC, useMemo, useState } from "react";
import { DollarSign, LockKeyhole, Sparkles } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import type { ViewMode } from "@/screens/home/Home";
import type { LabCategory } from "@/components/testLab/categoryConfig";
import { LAB_CATEGORY_MAP } from "@/components/testLab/categoryConfig";

import FeedPost, { type FeedPostProps } from "../PostCard/VideoPost";
import CompactPostCard from "../PostCard/CompactPostCard";
import { cn } from "@/lib/utils";

interface Tab {
  id: TabId;
  label: string;
  icon: JSX.Element;
}

type TabId =
  | "ideas"
  | "opinions"
  | "analytics"
  | "softwares"
  | "videos"
  | "liked";

type MonetizationFilter = "all" | "free" | "premium";

interface Props {
  isOwn?: boolean;
  viewMode?: ViewMode;
  effectiveCategories?: LabCategory[];
  monetizationFilter?: MonetizationFilter;
}

const UserTabs: FC<Props> = ({ isOwn = true, viewMode = "normal", effectiveCategories = [], monetizationFilter = "all" }) => {
  const [activeTab, setActiveTab] = useState<TabId>("ideas");
  const { toast } = useToast();

  const shouldShowMonetizationBadges = (isPremium: boolean) => {
    if (monetizationFilter === "all") return true;
    if (monetizationFilter === "free") return !isPremium;
    if (monetizationFilter === "premium") return isPremium;
    return true;
  };

  const shouldShowCategoryBadges = (categoryLabel: string) => {
    if (effectiveCategories.length === 0) return true;
    return effectiveCategories.some(
      (cat) => LAB_CATEGORY_MAP[cat]?.label === categoryLabel
    );
  };

  const postsByTab = useMemo<Record<TabId, FeedPostProps[]>>(
    () => ({
      ideas: [
        {
          author: { name: "John Smith", avatar: "/placeholder.svg" },
          category: "Idea",
          timestamp: "January 31, 5:10 PM",
          title:
            "AI Constructs Threaten Emerging Economies: A New Wave of Unemployment and Inequality",
          content:
            "Artificial intelligence is reshaping the global economy. Emerging markets must invest in reskilling programs to soften the blow of automation and create pathways into future-proof careers.",
          mediaUrl:
            "https://api.builder.io/api/v1/image/assets/TEMP/23fc35ab171b1cddbf955c164017b8e4c372f935?width=1198",
          sentiment: "bullish",
          likes: 1500,
          comments: 563,
          type: "article",
        },
        {
          author: { name: "Jane Doe", avatar: "/placeholder.svg" },
          category: "Idea",
          timestamp: "January 30, 11:24 AM",
          title: "Layer-2 Rollups Will Reprice NFT Liquidity in 2024",
          content:
            "Lower gas fees and compressed transactions will unlock entirely new NFT inventory classes. Expect marketplace fragmentation before consolidation around multi-chain aggregators.",
          mediaUrl:
            "https://api.builder.io/api/v1/image/assets/TEMP/7da696181764ec7a3a8683ab01b16c0daac1ab16?width=1198",
          sentiment: "bullish",
          likes: 980,
          comments: 201,
          type: "article",
        },
      ],
      opinions: [
        {
          author: { name: "Jane Doe", avatar: "/placeholder.svg" },
          category: "Opinion",
          timestamp: "January 29, 6:02 PM",
          title: "Why Bitcoin Needs Stronger Treasury Narratives",
          content:
            "Institutional treasuries need clearer playbooks and hedging frameworks before they commit to Bitcoin. Building these narratives is our job as market educators.",
          mediaUrl:
            "https://api.builder.io/api/v1/image/assets/TEMP/eacd3fbf97330649a97100e9a7099651e9a0fdb4?width=1198",
          sentiment: "bullish",
          likes: 640,
          comments: 142,
          type: "article",
        },
      ],
      analytics: [
        {
          author: { name: "Analytics Desk", avatar: "/placeholder.svg" },
          category: "Analytics",
          timestamp: "January 28, 9:00 AM",
          title: "Solana Liquidity Heatmap — Week 04 Insights",
          content:
            "DEX volume rotated from meme tokens back into Layer-1 infrastructure plays. Watch the funding spreads on SOL perpetuals while staking inflows continue.",
          mediaUrl:
            "https://api.builder.io/api/v1/image/assets/TEMP/4c8ef9d846ef46a09cccefd4aaa3cdd3c3a0de47?width=1198",
          sentiment: "bullish",
          likes: 312,
          comments: 88,
          type: "article",
        },
      ],
      softwares: [],
      videos: [],
      liked: [],
    }),
    [],
  );

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "ideas",
        label: "Ideas",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.833 8.0172C15.833 10.1665 14.7748 11.821 13.1649 12.9097C12.7899 13.1633 12.6024 13.2901 12.5098 13.4343C12.4173 13.5785 12.3858 13.7678 12.3227 14.1464L12.2736 14.4406C12.1628 15.1058 12.1073 15.4383 11.8742 15.6358C11.6411 15.8333 11.3039 15.8333 10.6296 15.8333H8.45334C7.77907 15.8333 7.44192 15.8333 7.2088 15.6358C6.97567 15.4383 6.92025 15.1058 6.80939 14.4406L6.76035 14.1464C6.69746 13.769 6.66602 13.5804 6.57441 13.4369C6.48281 13.2934 6.29491 13.165 5.91911 12.908C4.32626 11.8193 3.33301 10.1655 3.33301 8.0172C3.33301 4.50988 6.13122 1.66663 9.58301 1.66663C10.0111 1.66663 10.4291 1.71036 10.833 1.79366"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.7497 1.66663L13.9646 2.24748C14.2464 3.00914 14.3873 3.38998 14.6652 3.66778C14.943 3.9456 15.3238 4.08652 16.0855 4.36836L16.6663 4.58329L16.0855 4.79823C15.3238 5.08007 14.943 5.22099 14.6652 5.4988C14.3873 5.77661 14.2464 6.15744 13.9646 6.9191L13.7497 7.49996L13.5348 6.9191C13.2529 6.15744 13.112 5.77661 12.8342 5.4988C12.5563 5.22099 12.1755 5.08007 11.4138 4.79823L10.833 4.58329L11.4138 4.36836C12.1755 4.08652 12.5563 3.9456 12.8342 3.66778C13.112 3.38998 13.2529 3.00914 13.5348 2.24748L13.7497 1.66663Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M11.2503 15.8334V16.6667C11.2503 17.4524 11.2503 17.8452 11.0062 18.0893C10.7622 18.3334 10.3693 18.3334 9.58366 18.3334C8.79799 18.3334 8.40516 18.3334 8.16107 18.0893C7.91699 17.8452 7.91699 17.4524 7.91699 16.6667V15.8334"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: "opinions",
        label: "Opinions",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.08301 12.0833H12.9163M7.08301 7.91663H9.99967"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.8092 17.4088C15.295 17.1771 18.0717 14.361 18.3002 10.8258C18.3448 10.134 18.3448 9.41746 18.3002 8.72562C18.0717 5.19036 15.295 2.37432 11.8092 2.1426C10.6199 2.06355 9.37832 2.06372 8.19149 2.1426C4.70565 2.37432 1.929 5.19036 1.70052 8.72562C1.65582 9.41746 1.65582 10.134 1.70052 10.8258C1.78374 12.1134 2.35318 13.3055 3.02358 14.3122C3.41283 15.017 3.15594 15.8965 2.7505 16.6649C2.45817 17.2189 2.312 17.4959 2.42936 17.696C2.54672 17.896 2.80887 17.9025 3.33318 17.9152C4.37005 17.9405 5.06922 17.6465 5.62422 17.2372C5.93899 17.0051 6.09638 16.889 6.20486 16.8757C6.31332 16.8624 6.5268 16.9503 6.95367 17.1261C7.33732 17.2841 7.78279 17.3816 8.19149 17.4088C9.37832 17.4877 10.6199 17.4879 11.8092 17.4088Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: "analytics",
        label: "Analytics",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.91699 7.91663V15.4166C2.91699 15.8049 2.91699 15.999 2.98043 16.1522C3.065 16.3564 3.22723 16.5186 3.43143 16.6032C3.58457 16.6666 3.77871 16.6666 4.16699 16.6666C4.55528 16.6666 4.74942 16.6666 4.90256 16.6032C5.10675 16.5186 5.26898 16.3564 5.35356 16.1522C5.41699 15.999 5.41699 15.8049 5.41699 15.4166V7.91663C5.41699 7.52834 5.41699 7.3342 5.35356 7.18106C5.26898 6.97687 5.10675 6.81463 4.90256 6.73006C4.74942 6.66663 4.55528 6.66663 4.16699 6.66663C3.77871 6.66663 3.58457 6.66663 3.43143 6.73006C3.22723 6.81463 3.065 6.97687 2.98043 7.18106C2.91699 7.3342 2.91699 7.52834 2.91699 7.91663Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M8.75 4.58337V15.4163C8.75 15.8045 8.75 15.9987 8.81342 16.1519C8.898 16.356 9.06025 16.5183 9.26442 16.6029C9.41758 16.6663 9.61175 16.6663 10 16.6663C10.3882 16.6663 10.5824 16.6663 10.7356 16.6029C10.9397 16.5183 11.102 16.356 11.1866 16.1519C11.25 15.9987 11.25 15.8045 11.25 15.4163V4.58337C11.25 4.19509 11.25 4.00095 11.1866 3.84781C11.102 3.64362 10.9397 3.48138 10.7356 3.39681C10.5824 3.33337 10.3882 3.33337 10 3.33337C9.61175 3.33337 9.41758 3.33337 9.26442 3.39681C9.06025 3.48138 8.898 3.64362 8.81342 3.84781C8.75 4.00095 8.75 4.19509 8.75 4.58337Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
            <path
              d="M14.583 10.4166V15.4166C14.583 15.8049 14.583 15.999 14.6464 16.1522C14.731 16.3564 14.8933 16.5186 15.0974 16.6032C15.2506 16.6666 15.4448 16.6666 15.833 16.6666C16.2213 16.6666 16.4154 16.6666 16.5686 16.6032C16.7728 16.5186 16.935 16.3564 17.0196 16.1522C17.083 15.999 17.083 15.8049 17.083 15.4166V10.4166C17.083 10.0284 17.083 9.83421 17.0196 9.68104C16.935 9.47688 16.7728 9.31463 16.5686 9.23004C16.4154 9.16663 16.2213 9.16663 15.833 9.16663C15.4448 9.16663 15.2506 9.16663 15.0974 9.23004C14.8933 9.31463 14.731 9.47688 14.6464 9.68104C14.583 9.83421 14.583 10.0284 14.583 10.4166Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: "softwares",
        label: "Softwares",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.08301 10C2.08301 6.26809 2.08301 4.40212 3.24237 3.24274C4.40175 2.08337 6.26772 2.08337 9.99967 2.08337C13.7316 2.08337 15.5976 2.08337 16.757 3.24274C17.9163 4.40212 17.9163 6.26809 17.9163 10C17.9163 13.732 17.9163 15.598 16.757 16.7574C15.5976 17.9167 13.7316 17.9167 9.99967 17.9167C6.26772 17.9167 4.40175 17.9167 3.24237 16.7574C2.08301 15.598 2.08301 13.732 2.08301 10Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
            />
            <path
              d="M2.08301 7.5H17.9163"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M5.83301 5H5.84049"
              stroke="#B0B0B0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9.16602 5H9.17352"
              stroke="#B0B0B0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.66699 10.8334L7.68911 11.7144C8.11881 12.0847 8.33366 12.27 8.33366 12.5C8.33366 12.7301 8.11881 12.9154 7.68911 13.2857L6.66699 14.1667"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14.1666H13.3333"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        id: "videos",
        label: "Videos",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.66699 9.16671C1.66699 6.41685 1.66699 5.04192 2.52127 4.18765C3.37553 3.33337 4.75047 3.33337 7.50033 3.33337H8.33366C11.0835 3.33337 12.4584 3.33337 13.3127 4.18765C14.167 5.04192 14.167 6.41685 14.167 9.16671V10.8334C14.167 13.5832 14.167 14.9581 13.3127 15.8125C12.4584 16.6667 11.0835 16.6667 8.33366 16.6667H7.50033C4.75047 16.6667 3.37553 16.6667 2.52127 15.8125C1.66699 14.9581 1.66699 13.5832 1.66699 10.8334V9.16671Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
            />
            <path
              d="M14.167 7.4215L14.2719 7.33493C16.0351 5.88015 16.9167 5.15276 17.6252 5.50398C18.3337 5.85519 18.3337 7.01959 18.3337 9.34838V10.6515C18.3337 12.9804 18.3337 14.1447 17.6252 14.496C16.9167 14.8471 16.0351 14.1198 14.2719 12.665L14.167 12.5784"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M9.58301 9.16663C10.2734 9.16663 10.833 8.60698 10.833 7.91663C10.833 7.22627 10.2734 6.66663 9.58301 6.66663C8.89265 6.66663 8.33301 7.22627 8.33301 7.91663C8.33301 8.60698 8.89265 9.16663 9.58301 9.16663Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
            />
          </svg>
        ),
      },
      {
        id: "liked",
        label: "Liked",
        icon: (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.2192 3.32846C13.9844 1.95769 12.034 2.51009 10.8623 3.39001C10.3818 3.7508 10.1417 3.93119 10.0003 3.93119C9.85899 3.93119 9.61882 3.7508 9.13832 3.39001C7.96667 2.51009 6.01623 1.95769 3.78152 3.32846C0.848716 5.12745 0.185092 11.0624 6.94993 16.0695C8.23842 17.0232 8.88266 17.5 10.0003 17.5C11.118 17.5 11.7622 17.0232 13.0507 16.0695C19.8156 11.0624 19.1519 5.12745 16.2192 3.32846Z"
              stroke="#B0B0B0"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ),
      },
    ],
    [],
  );

  const renderEmptyState = (tabId: TabId) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[rgba(24,27,34,0.85)] bg-[rgba(12,16,20,0.40)] p-6 text-center backdrop-blur-[50px]">
      <h4 className="text-lg font-bold text-white">
        No {tabs.find((tab) => tab.id === tabId)?.label.toLowerCase()} yet
      </h4>
      <p className="text-sm text-[#B0B0B0]">
        {isOwn
          ? "Share your thoughts to keep your followers inspired."
          : "Check back soon to see what Jane shares here."}
      </p>
      {isOwn && (
        <button
          type="button"
          onClick={() =>
            toast({
              title: "Post composer coming soon",
              description: "We will open the editor in the next milestone.",
            })
          }
          className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          Create {tabs.find((tab) => tab.id === tabId)?.label.toLowerCase()}
        </button>
      )}
    </div>
  );

  const renderPostWithBadges = (post: FeedPostProps, index: number) => {
    const isPremium = false;
    const categoryConfig = Object.values(LAB_CATEGORY_MAP).find(
      (config) => config.label === post.category
    );
    const CategoryIcon = categoryConfig?.icon;

    return (
      <article
        key={`${activeTab}-${index}-${post.title}`}
        className="mx-auto flex w-full max-w-full flex-col gap-3 rounded-3xl border border-[rgba(24,27,34,0.85)] bg-background p-5 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.65)] backdrop-blur-[32px] transition-colors duration-200 hover:border-[#A06AFF]/60"
      >
        <header className="flex w-full items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-base font-semibold leading-tight text-white">
                <span>{post.author.name}</span>
                <span className="text-xs font-normal text-[#7C7C7C]">· {post.timestamp}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B0B0B0]">
                {CategoryIcon ? (
                  <span className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                    categoryConfig?.badgeClassName ?? "bg-[#2F3336] text-white/70"
                  )}>
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {post.category}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#2F3336] text-white/70">
                    {post.category}
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                  isPremium
                    ? "bg-[#1F1630] text-[#CDBAFF] border border-[#6F4BD3]/40"
                    : "bg-[#14243A] text-[#6CA8FF] border border-[#3B82F6]/40"
                )}>
                  {isPremium ? <DollarSign className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {isPremium ? "Premium · открыт" : "Free доступ"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {post.mediaUrl && (
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold text-white">{post.title}</h3>
          {post.content && (
            <p className="text-sm text-[#C5C9D3]">{post.content}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[rgba(24,27,34,0.85)] pt-3 text-xs text-[#8E92A0]">
          <div className="flex gap-4">
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      </article>
    );
  };

  const activePosts = postsByTab[activeTab];

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-1 sm:gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`group flex items-center justify-center gap-2 rounded-[32px] px-2.5 py-3 text-[15px] font-bold transition backdrop-blur-[58px] ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]"
                : "border border-[rgba(24,27,34,0.85)] bg-[rgba(12,16,20,0.50)] text-[#B0B0B0] hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)] hover:text-white"
            }`}
          >
            <span
              className={`${activeTab === tab.id ? "[&_path]:stroke-white [&_path]:fill-white/20" : "[&_path]:stroke-[#B0B0B0]"}`}
            >
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === "compact" ? (
        <div className="relative -mx-4 px-4">
          {activePosts.length > 0 ? (
            <div
              className="compact-posts-scroll flex gap-3 overflow-x-auto pb-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#2F3240 transparent",
              }}
            >
              {activePosts.filter((post) => shouldShowCategoryBadges(post.category) && shouldShowMonetizationBadges(false)).map((post, index) => (
                <CompactPostCard
                  key={`${activeTab}-compact-${index}-${post.title}`}
                  author={post.author}
                  category={post.category}
                  timestamp={post.timestamp}
                  title={post.title}
                  image={post.mediaUrl ?? undefined}
                  sentiment={post.sentiment}
                  likes={post.likes}
                  comments={post.comments}
                />
              ))}
            </div>
          ) : (
            renderEmptyState(activeTab)
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {activePosts.filter((post) => shouldShowCategoryBadges(post.category) && shouldShowMonetizationBadges(false)).length > 0
            ? activePosts
                .filter((post) => shouldShowCategoryBadges(post.category) && shouldShowMonetizationBadges(false))
                .map((post, index) => renderPostWithBadges(post, index))
            : renderEmptyState(activeTab)}
        </div>
      )}
    </div>
  );
};

export default UserTabs;
