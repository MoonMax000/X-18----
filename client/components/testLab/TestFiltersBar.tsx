import { useState, type ComponentType, type FC } from "react";
import { Check, ChevronDown, DollarSign, SlidersHorizontal, Sparkles } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { LAB_CATEGORY_CONFIG, type LabCategory } from "./categoryConfig";
import { LAB_ASSET_OPTIONS } from "./postMetaConfig";

type MonetizationFilter = "all" | "free" | "premium";
type SortOption = "recent" | "likes_desc" | "likes_asc";
type PrimaryTabKey = "popular" | "editors" | "forYou" | "following";

type CategoryOption = {
  value: LabCategory | "all";
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  badgeClassName?: string;
};

const PRIMARY_TAB_ITEMS: { key: PrimaryTabKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "editors", label: "Editor’s picks" },
  { key: "forYou", label: "For you" },
  { key: "following", label: "Following" },
];

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: "all", label: "Все", description: "Вся лента" },
  ...LAB_CATEGORY_CONFIG.map((item) => ({
    value: item.value,
    label: item.label,
    description: item.description,
    icon: item.icon,
    badgeClassName: item.badgeClassName,
  })),
];

const MONETIZATION_OPTIONS: { value: MonetizationFilter; label: string; icon: typeof Sparkles }[] = [
  { value: "all", label: "All", icon: SlidersHorizontal },
  { value: "free", label: "Free", icon: Sparkles },
  { value: "premium", label: "Paid", icon: DollarSign },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Newest first" },
  { value: "likes_desc", label: "Most likes" },
  { value: "likes_asc", label: "Fewest likes" },
];

interface TestFiltersBarProps {
  feedMode: "forYou" | "following";
  onFeedModeChange: (mode: "forYou" | "following") => void;
  activeCategory: LabCategory | "all";
  onCategoryChange: (category: LabCategory | "all") => void;
  selectedAssets: string[];
  onAssetsChange: (assets: string[]) => void;
  monetizationFilter: MonetizationFilter;
  onMonetizationFilterChange: (filter: MonetizationFilter) => void;
  sortOption: SortOption;
  onSortOptionChange: (option: SortOption) => void;
  onResetFilters: () => void;
}

const TestFiltersBar: FC<TestFiltersBarProps> = ({
  feedMode,
  onFeedModeChange,
  activeCategory,
  onCategoryChange,
  selectedAssets,
  onAssetsChange,
  monetizationFilter,
  onMonetizationFilterChange,
  sortOption,
  onSortOptionChange,
  onResetFilters,
}) => {
  const toggleAsset = (asset: string) => {
    if (selectedAssets.includes(asset)) {
      onAssetsChange(selectedAssets.filter((item) => item !== asset));
    } else {
      onAssetsChange([...selectedAssets, asset]);
    }
  };

  const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
  const [assetPopoverOpen, setAssetPopoverOpen] = useState(false);
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false);
  const [monetizationPopoverOpen, setMonetizationPopoverOpen] = useState(false);
  const fallbackCategory: CategoryOption = CATEGORY_OPTIONS[0] ?? {
    value: "all",
    label: "Все",
    description: "Вся лента",
  };
  const activeCategoryOption =
    CATEGORY_OPTIONS.find((option) => option.value === activeCategory) ?? fallbackCategory;
  const ActiveCategoryIcon = activeCategoryOption.icon;

  let activePrimaryTab: PrimaryTabKey = "forYou";
  if (feedMode === "following") {
    activePrimaryTab = "following";
  } else if (feedMode === "forYou") {
    if (sortOption === "likes_desc" && activeCategory === "all") {
      activePrimaryTab = "popular";
    } else if (activeCategory === "analytics") {
      activePrimaryTab = "editors";
    }
  }

  const handlePrimaryTabClick = (tab: PrimaryTabKey) => {
    switch (tab) {
      case "popular": {
        if (feedMode !== "forYou") {
          onFeedModeChange("forYou");
        }
        if (activeCategory !== "all") {
          onCategoryChange("all");
        }
        if (sortOption !== "likes_desc") {
          onSortOptionChange("likes_desc");
        }
        break;
      }
      case "editors": {
        if (feedMode !== "forYou") {
          onFeedModeChange("forYou");
        }
        if (activeCategory !== "analytics") {
          onCategoryChange("analytics");
        }
        if (sortOption !== "likes_desc") {
          onSortOptionChange("likes_desc");
        }
        break;
      }
      case "forYou": {
        if (feedMode !== "forYou") {
          onFeedModeChange("forYou");
        }
        if (activeCategory !== "all") {
          onCategoryChange("all");
        }
        if (sortOption !== "recent") {
          onSortOptionChange("recent");
        }
        break;
      }
      case "following": {
        if (feedMode !== "following") {
          onFeedModeChange("following");
        }
        break;
      }
      default:
        break;
    }
  };

  return (
    <div className="sticky top-0 z-30 -mx-2 mb-4 rounded-3xl border border-[#181B22] bg-background/95 px-2 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3">
        <div className="flex w-full max-w-[460px] self-center items-center justify-center gap-3 overflow-x-auto rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-1 backdrop-blur-[50px]">
          {PRIMARY_TAB_ITEMS.map((tab) => {
            const isActive = activePrimaryTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handlePrimaryTabClick(tab.key)}
                className={cn(
                  "flex h-[34px] items-center justify-center whitespace-nowrap rounded-[32px] px-4 text-[15px] font-bold transition sm:px-5",
                  isActive
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_10px_24px_-14px_rgba(160,106,255,0.8)]"
                    : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-[#B0B0B0] hover:text-white",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#181B22] bg-[#0C1014]/70 p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center justify-between gap-2 rounded-xl border border-[#1B1F27] bg-[#0C101480] px-3 py-1.5 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10 lg:min-w-[200px]"
                  aria-haspopup="listbox"
                  aria-expanded={categoryPopoverOpen}
                >
                  <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                    {ActiveCategoryIcon ? (
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-lg",
                          activeCategoryOption.badgeClassName ?? "bg-[#2F3336] text-white/70",
                        )}
                      >
                        <ActiveCategoryIcon className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2F3336]/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                        Все
                      </span>
                    )}
                    {activeCategoryOption.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#6C7280] transition-transform duration-200",
                      categoryPopoverOpen ? "rotate-180" : "",
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={12}
                className="w-[320px] rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
              >
                <div className="grid gap-2">
                  {CATEGORY_OPTIONS.map((category) => {
                    const Icon = category.icon;
                    const isActive = category.value === activeCategory;
                    return (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          onCategoryChange(category.value);
                          setCategoryPopoverOpen(false);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                          isActive
                            ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10",
                        )}
                      >
                        {Icon ? (
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl",
                              category.badgeClassName ?? "bg-[#2F3336] text-white/70",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F3336]/60 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                            Все
                          </span>
                        )}
                        <span className="flex flex-col leading-tight">
                          <span className="text-sm font-semibold text-white">{category.label}</span>
                          {category.description ? (
                            <span className="text-xs text-[#8E92A0]">{category.description}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-shrink-0 sm:w-[160px]">
                <Popover open={assetPopoverOpen} onOpenChange={setAssetPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-[#1B1F27] bg-[#0C101480] px-3 py-1.5 text-left transition hover:border-[#6CA8FF]/40 hover:bg-[#14243A]/70"
                      aria-haspopup="listbox"
                      aria-expanded={assetPopoverOpen}
                    >
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                        {selectedAssets.length === 0 ? "All assets" : selectedAssets.join(", ")}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-[#6C7280] transition-transform duration-200",
                          assetPopoverOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    sideOffset={12}
                    className="w-[360px] space-y-3 rounded-2xl border border-[#1B1F27] bg-[#0F131A] p-4 text-white shadow-[0_24px_50px_-32px_rgba(0,0,0,0.75)] backdrop-blur-xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onAssetsChange([]);
                        setAssetPopoverOpen(false);
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                        selectedAssets.length === 0
                          ? "border-[#6CA8FF]/50 bg-[#14243A] text-[#6CA8FF] shadow-[0_8px_24px_-18px_rgba(76,130,255,0.7)]"
                          : "border-transparent bg-white/5 text-[#8E92A0] hover:border-[#6CA8FF]/30 hover:bg-[#14243A]/70",
                      )}
                    >
                      All assets
                      {selectedAssets.length === 0 ? <Check className="h-4 w-4" /> : null}
                    </button>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {LAB_ASSET_OPTIONS.map((asset) => {
                        const isActive = selectedAssets.includes(asset.value);
                        const Icon = asset.icon;
                        return (
                          <button
                            key={asset.value}
                            type="button"
                            onClick={() => toggleAsset(asset.value)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition whitespace-nowrap",
                              isActive
                                ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#A06AFF]/10",
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", asset.accentClassName)} />
                            {asset.value}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex-shrink-0 sm:w-[150px]">
                <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-[#1B1F27] bg-[#0C101480] px-3 py-1.5 text-left transition hover:border-[#6CA8FF]/40 hover:bg-[#14243A]/70"
                      aria-haspopup="listbox"
                      aria-expanded={sortPopoverOpen}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                        {SORT_OPTIONS.find((option) => option.value === sortOption)?.label ?? "Newest first"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-[#6C7280] transition-transform duration-200",
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
                      {SORT_OPTIONS.map((option) => {
                        const isActive = option.value === sortOption;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onSortOptionChange(option.value);
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
              </div>

              <div className="flex-shrink-0 sm:w-[120px]">
                <Popover open={monetizationPopoverOpen} onOpenChange={setMonetizationPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-xl border border-[#1B1F27] bg-[#0C101480] px-3 py-1.5 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#1B1230]/80"
                      aria-haspopup="listbox"
                      aria-expanded={monetizationPopoverOpen}
                    >
                      <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                        {MONETIZATION_OPTIONS.find((option) => option.value === monetizationFilter)?.label ?? "All"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-[#6C7280] transition-transform duration-200",
                          monetizationPopoverOpen ? "rotate-180" : "",
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
                      {MONETIZATION_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isActive = option.value === monetizationFilter;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              onMonetizationFilterChange(option.value);
                              setMonetizationPopoverOpen(false);
                            }}
                            className={cn(
                              "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.1em] transition",
                              isActive
                                ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#A06AFF]/10",
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
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
        </div>
      </div>
    </div>
  );
};

export default TestFiltersBar;
