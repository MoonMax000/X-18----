import { useEffect, useMemo, useState } from "react";
import { socialPosts, type TabType } from "@/data/socialPosts";
import type { SocialPost } from "@/data/socialPosts";
import {
  Activity,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  BarChart3,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Layers,
  Lightbulb,
  MonitorPlay,
  Newspaper,
  PieChart,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const slugifyCategory = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-а-яё]/giu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const resolveCategoryIcon = (label: string) => {
  const normalized = label.toLowerCase();

  if (normalized.includes("insight") || normalized.includes("idea")) {
    return Lightbulb;
  }
  if (normalized.includes("news") || normalized.includes("update")) {
    return Newspaper;
  }
  if (normalized.includes("macro") || normalized.includes("market") || normalized.includes("pnl")) {
    return BarChart3;
  }
  if (normalized.includes("strategy") || normalized.includes("portfolio")) {
    return Layers;
  }
  if (normalized.includes("video") || normalized.includes("stream")) {
    return MonitorPlay;
  }
  if (normalized.includes("signal") || normalized.includes("alpha") || normalized.includes("momentum")) {
    return Sparkles;
  }
  if (normalized.includes("research") || normalized.includes("analysis")) {
    return PieChart;
  }

  return Tag;
};

const CURRENT_USER_PROFILE: SocialPost["author"] = {
  name: "Devid Capital",
  avatar: "https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87?format=webp&width=200",
  handle: "@devidcapital",
  verified: true,
  bio: "Founder of Devid Capital. Macro strategist distilling market edge into daily desk notes.",
  followers: 405800,
  following: 253,
  isCurrentUser: true,
};

const PERSONAL_POST_BODY = [
  "Мы завершили квартальный аудит нашего портфеля и усилили долю в макро-технологических идеях. Это решение родилось после нескольких недель тестов на деске: показатели риска/доходности по новым позициям на основ�� ликвидности и хеджей остаются в верхних 10%.",
  "На выходных мы провели сес��ию с командой по стресс-тестам, чтобы убедиться, что портфель выдержив����ет волатильность сырьевых рынков. Делюсь ключевыми выводами: мы оставляем смещённую дельту на длинные позиции в AI-инфраструктуре, добавляем тактические опционы на защиту и обнуляем с��арые контртрендовые позиции, что даёт нам возможность манёвра, если ликвидность сузится.",
  "Запускаем небольшой AMA вечером, отвечу на вопросы по risk management и обновлённой модели входов. Пишите то, что хотите разобрать в пер��ую очередь.",
].join("\n\n");

const HOME_PRIMARY_TABS: { key: TabType; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "editors", label: "Editor’s picks" },
  { key: "foryou", label: "For you" },
  { key: "signals", label: "Signals" },
  { key: "following", label: "Following" },
];

import InlineComposer from "@/components/socialComposer/InlineComposer";
import Timeline from "@/components/socialComposer/Timeline";
import SocialRightSidebar from "@/components/SocialFeedWidgets/SocialRightSidebar";
import {
  DEFAULT_SUGGESTED_PROFILES,
  DEFAULT_NEWS_ITEMS,
} from "@/components/SocialFeedWidgets/sidebarData";
import { ComposerBlockState } from "@/components/CreatePostBox/types";

export default function HomePage() {
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const personalPost: SocialPost = {
      id: "personal-highlight",
      type: "article",
      author: { ...CURRENT_USER_PROFILE },
      timestamp: new Date().toLocaleString(),
      title: "Почему мы усилили макро-технологии в портфеле",
      preview: PERSONAL_POST_BODY,
      body: PERSONAL_POST_BODY,
      sentiment: "bullish",
      likes: 256,
      comments: 74,
      hashtags: ["MacroStrategy", "DeskNotes", "RiskManagement"],
      views: 4058,
      category: "Insight",
    };

    return [personalPost, ...socialPosts];
  });

  const [activeTab, setActiveTab] = useState<TabType>("foryou");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<"recent" | "likes_desc" | "likes_asc">("recent");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | SocialPost["sentiment"]>("all");

  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [sentimentPopoverOpen, setSentimentPopoverOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    let hasGeneral = false;

    posts.forEach((post) => {
      const raw = post.category?.trim();
      if (raw) {
        const value = slugifyCategory(raw);
        if (!map.has(value)) {
          map.set(value, raw);
        }
      } else {
        hasGeneral = true;
      }
    });

    const options: { value: string; label: string }[] = [{ value: "all", label: "All categories" }];

    if (hasGeneral) {
      options.push({ value: "general", label: "General" });
    }

    map.forEach((label, value) => {
      options.push({ value, label });
    });

    return options;
  }, [posts]);

  useEffect(() => {
    const availableValues = categoryOptions.map((option) => option.value);
    if (!availableValues.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, categoryOptions]);

  const activeCategoryOption = useMemo(() => {
    return categoryOptions.find((option) => option.value === categoryFilter) ?? categoryOptions[0];
  }, [categoryFilter, categoryOptions]);

  const contentTypeOptions = useMemo(
    () =>
      Array.from(new Set(posts.map((post) => post.type))).map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        Icon: type === "video" ? MonitorPlay : FileText,
      })),
    [posts],
  );

  useEffect(() => {
    setSelectedTypes((prev) => prev.filter((type) => contentTypeOptions.some((option) => option.value === type)));
  }, [contentTypeOptions]);

  const sentimentOptions = useMemo(
    () => [
      { value: "all" as const, label: "All sentiments" },
      { value: "bullish" as const, label: "Bullish", Icon: TrendingUp },
      { value: "bearish" as const, label: "Bearish", Icon: TrendingDown },
    ],
    [],
  );

  const sortOptions = useMemo(
    () => [
      { value: "recent" as const, label: "Newest first" },
      { value: "likes_desc" as const, label: "Most likes" },
      { value: "likes_asc" as const, label: "Fewest likes" },
    ],
    [],
  );

  const basePosts = useMemo(() => {
    if (activeTab === "popular") {
      return [...posts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }
    if (activeTab === "editors") {
      const editorsPicks = posts.filter((post) => post.author?.verified || post.category === "Insight");
      return editorsPicks.length > 0 ? editorsPicks : posts;
    }
    if (activeTab === "signals") {
      const signalsPosts = posts.filter((post) => {
        const engagementScore = (post.likes ?? 0) + (post.comments ?? 0) * 2 + (post.views ?? 0) / 100;
        const hasTacticalTags = (post.hashtags ?? []).some((tag) => /signal|setup|alert|alpha|trade/i.test(tag));
        const sentimentShift = post.sentiment === "bearish";

        return engagementScore >= 400 || hasTacticalTags || sentimentShift;
      });

      if (signalsPosts.length > 0) {
        return [...signalsPosts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      }
    }
    if (activeTab === "following") {
      const followingPosts = posts.filter(
        (post) => post.author?.isCurrentUser || post.author?.isFollowing,
      );
      return followingPosts.length > 0 ? followingPosts : posts;
    }
    return posts;
  }, [activeTab, posts]);

  const filteredPosts = useMemo(() => {
    let working: SocialPost[] = basePosts;

    if (categoryFilter !== "all") {
      working = working.filter((post) => {
        const categoryValue = post.category ? slugifyCategory(post.category) : "general";
        return categoryValue === categoryFilter;
      });
    }

    if (selectedTypes.length > 0) {
      working = working.filter((post) => selectedTypes.includes(post.type));
    }

    if (sentimentFilter !== "all") {
      working = working.filter((post) => post.sentiment === sentimentFilter);
    }

    if (sortOption === "likes_desc") {
      return [...working].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }

    if (sortOption === "likes_asc") {
      return [...working].sort((a, b) => (a.likes ?? 0) - (b.likes ?? 0));
    }

    return working;
  }, [basePosts, categoryFilter, selectedTypes, sentimentFilter, sortOption]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]));
  };

  const selectedTypeLabel = selectedTypes.length
    ? selectedTypes
        .map((type) => contentTypeOptions.find((option) => option.value === type)?.label ?? type)
        .join(", ")
    : "All content";

  const sortLabel = sortOptions.find((option) => option.value === sortOption)?.label ?? "Newest first";

  const sentimentLabel = sentimentOptions.find((option) => option.value === sentimentFilter)?.label ?? "All sentiments";

  const handleCreatePost = async (blocks: ComposerBlockState[]) => {
    blocks.forEach((block, index) => {
      const trimmed = block.text.trim();
      if (!trimmed && block.media.length === 0) return;

      const newPost: SocialPost = {
        id: `post-${Date.now()}-${index}`,
        type: block.media.length > 0 ? "video" : "article",
        author: { ...CURRENT_USER_PROFILE },
        timestamp: new Date().toLocaleString(),
        title: trimmed.substring(0, 70) + (trimmed.length > 70 ? "..." : ""),
        preview: trimmed,
        body: trimmed,
        sentiment: "bullish",
        likes: 0,
        comments: 0,
        hashtags: [],
        views: 0,
      };

      setPosts((prev) => [newPost, ...prev]);
    });
  };

  return (
    <>
      <div className="flex w-full gap-2 sm:gap-4 md:gap-6 xl:gap-8">
        <div className="flex-1 w-full sm:max-w-[720px]">
          <div className="mx-auto w-full sm:max-w-[680px] py-1 sm:py-2">
            <InlineComposer
              userAvatar={CURRENT_USER_PROFILE.avatar}
              userName={CURRENT_USER_PROFILE.name}
              onSubmit={handleCreatePost}
            />
          </div>

          <div className="mx-auto w-full sm:max-w-[680px]">
            <div
              className="sticky top-0 z-30 -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <div className="flex items-center overflow-x-auto rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-0.5 shadow-[0_8px_24px_-18px_rgba(160,106,255,0.4)]">
                {HOME_PRIMARY_TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 min-w-[120px] px-3 py-0.75 text-xs font-semibold leading-tight transition-colors sm:min-w-[140px] sm:px-4 sm:py-1 sm:text-sm ${
                        isActive
                          ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                          : "rounded-full text-muted-foreground hover:bg-[#482090]/10 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        {tab.key === "popular" && (
                          <img
                            src="https://api.builder.io/api/v1/image/assets/TEMP/0b2b396107adfbc5a7db70735aa333a4f2a09280?width=88"
                            alt="Popular"
                            className="h-5 w-5 shrink-0"
                          />
                        )}
                        {tab.key === "editors" && (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                          >
                            <path
                              d="M18.6161 20H19.1063C20.2561 20 21.1707 19.4761 21.9919 18.7436C24.078 16.8826 19.1741 15 17.5 15M15.5 5.06877C15.7271 5.02373 15.9629 5 16.2048 5C18.0247 5 19.5 6.34315 19.5 8C19.5 9.65685 18.0247 11 16.2048 11C15.9629 11 15.7271 10.9763 15.5 10.9312"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M4.48131 16.1112C3.30234 16.743 0.211139 18.0331 2.09388 19.6474C3.01359 20.436 4.03791 21 5.32572 21H12.6743C13.9621 21 14.9864 20.436 15.9061 19.6474C17.7889 18.0331 14.6977 16.743 13.5187 16.1112C10.754 14.6296 7.24599 14.6296 4.48131 16.1112Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M13 7.5C13 9.70914 11.2091 11.5 9 11.5C6.79086 11.5 5 9.70914 5 7.5C5 5.29086 6.79086 3.5 9 3.5C11.2091 3.5 13 5.29086 13 7.5Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                          </svg>
                        )}
                        {tab.key === "foryou" && (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                          >
                            <path
                              d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M14 2.20004C13.3538 2.06886 12.6849 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 11.3151 21.9311 10.6462 21.8 10"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <path
                              d="M12.0303 11.9624L16.5832 7.40949M19.7404 4.34451L19.1872 2.35737C19.0853 2.03 18.6914 1.89954 18.4259 2.11651C16.9898 3.29007 15.4254 4.8708 16.703 7.36408C19.2771 8.56443 20.7466 6.94573 21.8733 5.58519C22.0975 5.31449 21.9623 4.90756 21.6247 4.80994L19.7404 4.34451Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        {tab.key === "following" && (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="shrink-0"
                          >
                            <defs>
                              <linearGradient id="following-flame-gradient" x1="5" y1="3" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                                <stop offset="0" stopColor="#FF9F45" />
                                <stop offset="0.55" stopColor="#FF7A2F" />
                                <stop offset="1" stopColor="#FF4F1F" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.22172 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z"
                              fill="url(#following-flame-gradient)"
                            />
                            <path
                              d="M11.1514 9.17192C11.0813 9.43626 10.9434 9.66934 10.7422 9.84977C10.3219 10.2294 9.77715 10.5711 9.47942 11.0984C8.86148 12.1896 9.19391 13.5665 9.78321 14.5823C10.2029 15.3113 11.0095 16.0326 12 16.0326C12.9905 16.0326 13.7971 15.3113 14.2168 14.5823C14.8073 13.5658 15.1389 12.1866 14.5182 11.0942C14.1733 10.4805 13.5288 10.1061 13.0006 9.62054C12.6266 9.27732 12.3065 8.88831 12.0679 8.43471C12.013 8.33151 11.987 8.19463 11.8843 8.13394C11.6839 8.01537 11.2456 8.27125 11.1514 8.48377C11.0404 8.73185 11.2002 8.63747 11.1514 9.17192Z"
                              fill="#FFE1A6"
                            />
                          </svg>
                        )}
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#0C1014]/55 px-3 text-[12px] font-semibold text-[#D5D8E1] backdrop-blur-[36px] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#120F1D]/60"
                      aria-haspopup="listbox"
                      aria-expanded={categoryPopoverOpen}
                    >
                      <span className="truncate">{activeCategoryOption.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#C4C7D4] transition-transform duration-200",
                          categoryPopoverOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={10}
                    className="w-[240px] rounded-[18px] border border-[#1B1F27]/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                  >
                    <div className="grid gap-1.5 text-[12px]">
                      {categoryOptions.map((option) => {
                        const isActive = option.value === categoryFilter;
                        const CategoryIcon = resolveCategoryIcon(option.label);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setCategoryFilter(option.value);
                              setCategoryPopoverOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                              isActive
                                ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                            )}
                          >
                            <CategoryIcon className="h-4 w-4 text-[#D6D9E3]" />
                            <span className="truncate">{option.label}</span>
                            {isActive ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-[22px] items-center gap-1.5 rounded-[20px] border border-[#181B22] bg-[#0C1014]/50 px-3 text-[11px] font-semibold text-[#B0B0B0] backdrop-blur-[40px] transition hover:border-[#6CA8FF]/40 hover:bg-[#0C1014]/70"
                      aria-haspopup="listbox"
                      aria-expanded={typePopoverOpen}
                    >
                      <span className="truncate">{selectedTypeLabel}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#B0B0B0] transition-transform duration-200",
                          typePopoverOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={12}
                        className="w-[320px] space-y-3 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTypes([]);
                            setTypePopoverOpen(false);
                          }}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                            selectedTypes.length === 0
                              ? "border-[#6CA8FF]/50 bg-[#14243A] text-[#6CA8FF] shadow-[0_8px_24px_-18px_rgba(76,130,255,0.7)]"
                              : "border-transparent bg-white/5 text-[#8E92A0] hover:border-[#6CA8FF]/30 hover:bg-[#14243A]/70",
                          )}
                        >
                          All content
                          {selectedTypes.length === 0 ? <Check className="h-4 w-4" /> : null}
                        </button>
                        <div className="flex flex-wrap gap-1.5">
                          {contentTypeOptions.map((option) => {
                            const isActive = selectedTypes.includes(option.value);
                            const Icon = option.Icon;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => toggleType(option.value)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                                  isActive
                                    ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                                    : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#A06AFF]/10",
                                )}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {option.label}
                                {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>

                <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-[22px] items-center gap-1.5 rounded-[20px] border border-[#181B22] bg-[#0C1014]/50 px-3 text-[11px] font-semibold text-[#B0B0B0] backdrop-blur-[40px] transition hover:border-[#6CA8FF]/40 hover:bg-[#0C1014]/70"
                      aria-haspopup="listbox"
                      aria-expanded={sortPopoverOpen}
                    >
                      <span className="truncate">{sortLabel}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#B0B0B0] transition-transform duration-200",
                          sortPopoverOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={12}
                        className="w-[260px] space-y-2 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
                      >
                        <div className="grid gap-2">
                          {sortOptions.map((option) => {
                            const isActive = option.value === sortOption;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSortOption(option.value);
                                  setSortPopoverOpen(false);
                                }}
                                className={cn(
                                  "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                                  isActive
                                    ? "border-[#6CA8FF]/50 bg-[#14243A] text-[#6CA8FF] shadow-[0_8px_24px_-18px_rgba(76,130,255,0.7)]"
                                    : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#6CA8FF]/30 hover:bg-[#14243A]/70",
                                )}
                              >
                                {option.label}
                                {isActive ? <Check className="h-4 w-4" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>

                <Popover open={sentimentPopoverOpen} onOpenChange={setSentimentPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-[22px] items-center gap-1.5 rounded-[20px] border border-[#181B22] bg-[#0C1014]/50 px-3 text-[11px] font-semibold text-[#B0B0B0] backdrop-blur-[40px] transition hover:border-[#A06AFF]/40 hover:bg-[#0C1014]/70"
                      aria-haspopup="listbox"
                      aria-expanded={sentimentPopoverOpen}
                    >
                      <span className="truncate">{sentimentLabel}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-[#B0B0B0] transition-transform duration-200",
                          sentimentPopoverOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={12}
                        className="w-[260px] space-y-2 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
                      >
                        <div className="grid gap-2">
                          {sentimentOptions.map((option) => {
                            const isActive = option.value === sentimentFilter;
                            const Icon = option.Icon;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setSentimentFilter(option.value);
                                  setSentimentPopoverOpen(false);
                                }}
                                className={cn(
                                  "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                                  isActive
                                    ? "border-[#A06AFF]/50 bg-[#1B1230] text-[#CDB8FF] shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                                    : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#1B1230]/70",
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  {Icon ? <Icon className="h-4 w-4" /> : null}
                                  {option.label}
                                </span>
                                {isActive ? <Check className="h-4 w-4" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <Timeline posts={filteredPosts} className="mt-6 sm:mt-8" />
        </div>

        <SocialRightSidebar
          profiles={DEFAULT_SUGGESTED_PROFILES}
          newsItems={DEFAULT_NEWS_ITEMS}
          showSearch={false}
        />
      </div>
    </>
  );
}
