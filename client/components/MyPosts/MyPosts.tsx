import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, BarChart3, Trash2, Eye, Heart, MessageCircle, Plus, LayoutList, LayoutGrid } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BUTTON_VARIANTS } from "@/features/feed/styles";

type PostStatus = "published" | "draft";
type PostCategory = "analysis" | "tutorial" | "review" | "opinion" | "news";
type ViewMode = "list" | "cards";

interface Post {
  id: string;
  title: string;
  text: string;
  thumbnail?: string;
  date: string;
  status: PostStatus;
  category: PostCategory;
  views: number;
  likes: number;
  comments: number;
  tags?: string[];
}

const mockPosts: Post[] = [
  {
    id: "1",
    title: "Bitcoin Price Analysis Q2 2025",
    text: "An in-depth analysis of Bitcoin's price movements during Q2 2025, including key resistance levels, support zones...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/dbe2cb77af13e1f5ccc8611b585b1172d4491793",
    date: "2h ago",
    status: "published",
    category: "analysis",
    views: 12450,
    likes: 320,
    comments: 85,
    tags: ["#Bitcoin", "#Analysis"],
  },
  {
    id: "2",
    title: "Ethereum 2.0: The Complete Guide",
    text: "Everything you need to know about Ethereum 2.0, including staking requirements, technical improvements...",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/6c1636b94ab2935c85143c790d37c26781b4f015",
    date: "5h ago",
    status: "published",
    category: "tutorial",
    views: 9872,
    likes: 124,
    comments: 287,
    tags: ["#Ethereum", "#ETH2.0"],
  },
  {
    id: "3",
    title: "Top 5 DeFi Projects to Watch in 2025",
    text: "A comprehensive review of the most promising DeFi projects in 2025, with analysis of their technology...",
    date: "1d ago",
    status: "published",
    category: "review",
    views: 7345,
    likes: 63,
    comments: 195,
    tags: ["#DeFi"],
  },
  {
    id: "4",
    title: "NFT Market Recovery: What's Next?",
    text: "An opinion piece on the current state of the NFT market, recent trends, and predictions for the future...",
    date: "2d ago",
    status: "draft",
    category: "opinion",
    views: 0,
    likes: 0,
    comments: 0,
  },
];

const MyPosts: FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PostCategory>("all");

  const getCategoryBadge = (category: PostCategory) => {
    const badges = {
      analysis: { bg: "#4FC3F7", label: "Idea" },
      tutorial: { bg: "#6B6BFF", label: "Tutorial" },
      review: { bg: "#F7A350", label: "Review" },
      opinion: { bg: "#FF6B6B", label: "Opinion" },
      news: { bg: "#F7A350", label: "News" },
    };
    return badges[category];
  };

  const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  const statusOptions = [
    { value: "all" as const, label: "All" },
    { value: "published" as const, label: "Published" },
    { value: "draft" as const, label: "Draft" },
  ];

  const categoryOptions = [
    { value: "all" as const, label: "All" },
    { value: "analysis" as const, label: "Analysis" },
    { value: "tutorial" as const, label: "Tutorial" },
    { value: "review" as const, label: "Review" },
    { value: "opinion" as const, label: "Opinion" },
    { value: "news" as const, label: "News" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1059px] flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-black p-6 backdrop-blur-[50px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">My Posts</h2>
            <p className="text-sm text-[#6C7280]">Manage your content</p>
          </div>
          <button className={cn(BUTTON_VARIANTS.primary, "flex items-center gap-2 px-4 py-2.5 text-sm")}>
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex flex-1 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 py-2.5 transition-colors focus-within:border-[#A06AFF]/50">
              <Search className="h-4 w-4 text-[#6C7280]" />
              <input
                type="text"
                placeholder="Search posts..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#6C7280] focus:outline-none"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Status:</span>
                  {statusOptions.find((o) => o.value === statusFilter)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[180px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        statusFilter === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {statusFilter === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Category:</span>
                  {categoryOptions.find((o) => o.value === categoryFilter)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[180px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCategoryFilter(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        categoryFilter === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {categoryFilter === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 rounded-full border border-[#181B22] bg-black p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "list" ? "bg-[#A06AFF] text-white" : "text-[#6C7280] hover:text-white"
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "cards" ? "bg-[#A06AFF] text-white" : "text-[#6C7280] hover:text-white"
                )}
                title="Cards view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="flex flex-col divide-y divide-[#181B22]">
          {mockPosts.map((post) => {
            const badge = getCategoryBadge(post.category);
            return (
              <article
                key={post.id}
                className="group flex items-center gap-4 bg-black px-6 py-4 transition-colors hover:bg-white/[0.02]"
              >
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="h-14 w-20 flex-shrink-0 rounded-xl border border-[#181B22] object-cover" />
                )}
                {!post.thumbnail && <div className="h-14 w-20 flex-shrink-0 rounded-xl border border-[#181B22] bg-[#0A0D12]" />}

                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-white">{post.title}</h3>
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: badge.bg }}>
                        {badge.label}
                      </span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-bold",
                          post.status === "published" ? "bg-[#1C3430] text-[#2EBD85]" : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                        )}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6C7280]">
                      <span>{post.date}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.views) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.likes) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.comments) : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white" title="Analytics">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button className="rounded-lg p-2 text-[#6C7280] transition-colors hover:bg-red-500/10 hover:text-red-400" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockPosts.map((post) => {
            const badge = getCategoryBadge(post.category);
            return (
              <article
                key={post.id}
                className="group flex flex-col gap-3 rounded-2xl border border-[#181B22] bg-black p-4 transition-colors hover:border-[#A06AFF]/30 hover:bg-white/[0.02]"
              >
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="h-32 w-full rounded-2xl border border-[#181B22] object-cover" />
                )}
                {!post.thumbnail && <div className="h-32 w-full rounded-2xl border border-[#181B22] bg-[#0A0D12]" />}

                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 flex-1 text-sm font-bold text-white">{post.title}</h3>
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white" title="Analytics">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-lg p-1.5 text-[#6C7280] transition-colors hover:bg-red-500/10 hover:text-red-400" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: badge.bg }}>
                      {badge.label}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-bold",
                        post.status === "published" ? "bg-[#1C3430] text-[#2EBD85]" : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                      )}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-[#6C7280]">{post.text}</p>

                  <div className="flex items-center justify-between border-t border-[#181B22] pt-3 text-xs text-[#6C7280]">
                    <span>{post.date}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.views) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.likes) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.comments) : "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
