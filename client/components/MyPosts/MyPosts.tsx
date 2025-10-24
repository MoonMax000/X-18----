import { FC, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Edit2, BarChart3, Trash2, Eye, Heart, MessageCircle, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BUTTON_VARIANTS } from "@/features/feed/styles";

type PostStatus = "published" | "draft";
type PostCategory = "analysis" | "tutorial" | "review" | "opinion" | "news";

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
    text: "An in-depth analysis of Bitcoin's price movements during Q2 2025, including key resistance levels, support zones, and potential breakout scenarios. The current market structure suggests a consolidation phase before the next major move.",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/dbe2cb77af13e1f5ccc8611b585b1172d4491793",
    date: "2h ago",
    status: "published",
    category: "analysis",
    views: 12450,
    likes: 320,
    comments: 85,
    tags: ["#Bitcoin", "#Analysis", "#Crypto"],
  },
  {
    id: "2",
    title: "Ethereum 2.0: The Complete Guide",
    text: "Everything you need to know about Ethereum 2.0, including staking requirements, technical improvements, and the roadmap ahead. This comprehensive guide covers all aspects of the upgrade.",
    thumbnail: "https://api.builder.io/api/v1/image/assets/TEMP/6c1636b94ab2935c85143c790d37c26781b4f015",
    date: "5h ago",
    status: "published",
    category: "tutorial",
    views: 9872,
    likes: 124,
    comments: 287,
    tags: ["#Ethereum", "#ETH2.0", "#Staking"],
  },
  {
    id: "3",
    title: "Top 5 DeFi Projects to Watch in 2025",
    text: "A comprehensive review of the most promising DeFi projects in 2025, with analysis of their technology, team, tokenomics, and growth potential.",
    date: "1d ago",
    status: "published",
    category: "review",
    views: 7345,
    likes: 63,
    comments: 195,
    tags: ["#DeFi", "#Review"],
  },
  {
    id: "4",
    title: "NFT Market Recovery: What's Next?",
    text: "An opinion piece on the current state of the NFT market, recent trends, and predictions for the future of digital collectibles and utility NFTs.",
    date: "2d ago",
    status: "draft",
    category: "opinion",
    views: 0,
    likes: 0,
    comments: 0,
    tags: ["#NFT", "#Market"],
  },
];

const MyPosts: FC = () => {
  const [activeTab, setActiveTab] = useState<"public" | "private">("public");
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
    <div className="mx-auto flex w-full max-w-[680px] flex-col">
      <div className="mb-4 flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-black p-6 backdrop-blur-[50px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">My Posts</h2>
            <p className="text-sm text-[#6C7280]">Manage your content</p>
          </div>
          <button className={cn(BUTTON_VARIANTS.primary, "gap-2 px-4 py-2.5 text-sm")}>
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
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("public")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-all",
                activeTab === "public" ? BUTTON_VARIANTS.primary : "border border-[#181B22] bg-black text-white hover:border-[#A06AFF]/50"
              )}
            >
              Public Posts
            </button>
            <button
              onClick={() => setActiveTab("private")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-all",
                activeTab === "private" ? BUTTON_VARIANTS.primary : "border border-[#181B22] bg-black text-white hover:border-[#A06AFF]/50"
              )}
            >
              Private Posts
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {mockPosts.map((post, index) => {
          const badge = getCategoryBadge(post.category);
          return (
            <article
              key={post.id}
              className={cn(
                "flex w-full flex-col gap-4 bg-black p-6 backdrop-blur-[50px] transition-colors duration-200 hover:bg-white/[0.02]",
                index !== 0 &&
                  "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#181B22] before:to-transparent"
              )}
              style={{
                borderBottom: "1px solid transparent",
                backgroundImage: `linear-gradient(to right, transparent 0%, #181B22 20%, #181B22 80%, transparent 100%)`,
                backgroundPosition: "0 100%",
                backgroundSize: "100% 1px",
                backgroundRepeat: "no-repeat",
              }}
            >
              <header className="flex w-full items-start justify-between gap-3">
                <div className="flex flex-1 items-start gap-3">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src="https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">You</span>
                      <svg className="h-1 w-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                        <circle cx="2" cy="2" r="1.5" />
                      </svg>
                      <span className="text-sm text-[#7C7C7C]">{post.date}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: badge.bg }}
                      >
                        {badge.label}
                      </span>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-xs font-bold",
                          post.status === "published" ? "bg-[#1C3430] text-[#2EBD85]" : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                        )}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => console.log("Edit", post.id)}
                    className="rounded-xl p-2 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white"
                    title="Edit post"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log("Analytics", post.id)}
                    className="rounded-xl p-2 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white"
                    title="View analytics"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log("Delete", post.id)}
                    className="rounded-xl p-2 text-[#6C7280] transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Delete post"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <section className="ml-[60px] flex flex-col gap-3">
                <div>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-white">{post.text}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-sm font-normal text-[#4D7CFF]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {post.thumbnail && (
                  <div className="overflow-hidden rounded-2xl border border-[#181B22]">
                    <img src={post.thumbnail} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </section>

              <footer className="ml-[60px] flex items-center gap-6 text-sm font-normal text-[#6C7280]">
                <div className="flex items-center gap-2 transition-colors hover:text-[#4D7CFF]">
                  <Eye className="h-4 w-4" />
                  <span>{post.status === "published" ? formatNumber(post.views) : "—"}</span>
                </div>
                <div className="flex items-center gap-2 transition-colors hover:text-[#F91880]">
                  <Heart className="h-4 w-4" />
                  <span>{post.status === "published" ? formatNumber(post.likes) : "—"}</span>
                </div>
                <div className="flex items-center gap-2 transition-colors hover:text-[#4D7CFF]">
                  <MessageCircle className="h-4 w-4" />
                  <span>{post.status === "published" ? formatNumber(post.comments) : "—"}</span>
                </div>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default MyPosts;
