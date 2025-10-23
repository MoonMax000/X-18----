import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Flame, Clock, SlidersHorizontal, X, DollarSign, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FILTERS_CONFIG, TABS_CONFIG } from "../constants";
import type { FeedTab } from "../types";
import { LAB_CATEGORY_CONFIG, type LabCategory } from "@/components/testLab/categoryConfig";
import { LAB_ASSET_OPTIONS } from "@/components/testLab/postMetaConfig";
import { Portal } from "@/components/ui/Portal";

interface FeedFiltersProps {
  activeTab: FeedTab;
  filters: Record<string, any>;
  feedMode: "recent" | "hot";
  onFilterChange: (key: string, value: any) => void;
  onFeedModeChange: (mode: "recent" | "hot") => void;
}

type CategoryOption = {
  value: LabCategory | "all";
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badgeClassName?: string;
};

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

export default function FeedFilters({
  activeTab,
  filters,
  feedMode,
  onFilterChange,
  onFeedModeChange
}: FeedFiltersProps) {
  const activeConfig = TABS_CONFIG[activeTab];
  const [isMainFiltersModalOpen, setIsMainFiltersModalOpen] = useState(false);
  const [isAdvancedFiltersModalOpen, setIsAdvancedFiltersModalOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [monetizationFilter, setMonetizationFilter] = useState<"all" | "free" | "premium">("all");
  const [sortOption, setSortOption] = useState<"recent" | "likes_desc" | "likes_asc">("recent");

  const toggleAsset = (asset: string) => {
    if (selectedAssets.includes(asset)) {
      setSelectedAssets(selectedAssets.filter((item) => item !== asset));
    } else {
      setSelectedAssets([...selectedAssets, asset]);
    }
  };

  const handleResetFilters = () => {
    setSelectedAssets([]);
    setMonetizationFilter("all");
    setSortOption("recent");
    onFilterChange("topic", "all");
    onFilterChange("market", "All");
    onFilterChange("price", "All");
    onFilterChange("period", "All time");
  };

  const handleCloseMainFiltersModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMainFiltersModalOpen(false);
  };

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        {/* Filters Button - Now on the left */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMainFiltersModalOpen(true)}
            className="flex h-[26px] items-center gap-1.5 rounded-full border border-[#181B22] bg-[#000000] px-3 text-xs font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Hot/Recent Toggle - Now on the right */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-[#181B22] bg-[#000000] p-0.5">
            <button
              type="button"
              onClick={() => onFeedModeChange("hot")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                feedMode === "hot"
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white shadow-lg"
                  : "text-[#9CA3AF] hover:text-white"
              )}
            >
              <Flame className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hot</span>
            </button>
            <button
              type="button"
              onClick={() => onFeedModeChange("recent")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
                feedMode === "recent"
                  ? "bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] text-white shadow-lg"
                  : "text-[#9CA3AF] hover:text-white"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Recent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Filters Modal - Market, Price, Period, Topic */}
      {isMainFiltersModalOpen && (
        <Portal>
          <div
            data-modal-backdrop="main-filters"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleCloseMainFiltersModal}
          >
            <div
              data-modal-content="main-filters"
              className="relative w-full max-w-2xl rounded-2xl border border-[#2F2F31] bg-[#0B0E13] p-6 shadow-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2F2F31]">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  type="button"
                  onClick={() => setIsMainFiltersModalOpen(false)}
                  className="rounded-full p-2 text-[#8E92A0] transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Market Filter */}
                {activeConfig?.visible?.includes('market') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white">
                      Рынок
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-[38px] items-center justify-between gap-2 rounded-xl border border-[#181B22] bg-[#000000] px-4 text-sm font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                        >
                          <span className="truncate">{filters.market || 'All'}</span>
                          <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={10}
                        className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                      >
                        <div className="grid gap-1.5 text-[12px]">
                          {FILTERS_CONFIG.market.opts.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onFilterChange('market', opt)}
                              className={cn(
                                "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                                filters.market === opt
                                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                  : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
                              )}
                            >
                              <span className="truncate">{opt}</span>
                              {filters.market === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Price Filter */}
                {activeConfig?.visible?.includes('price') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white">
                      Цена
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-[38px] items-center justify-between gap-2 rounded-xl border border-[#181B22] bg-[#000000] px-4 text-sm font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                        >
                          <span className="truncate">{filters.price || 'All'}</span>
                          <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={10}
                        className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                      >
                        <div className="grid gap-1.5 text-[12px]">
                          {FILTERS_CONFIG.price.opts.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onFilterChange('price', opt)}
                              className={cn(
                                "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                                filters.price === opt
                                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white"
                                  : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
                              )}
                            >
                              <span className="truncate">{opt}</span>
                              {filters.price === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Period Filter */}
                {activeConfig?.visible?.includes('period') && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-white">
                      Период
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-[38px] items-center justify-between gap-2 rounded-xl border border-[#181B22] bg-[#000000] px-4 text-sm font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                        >
                          <span className="truncate">{filters.period || 'All time'}</span>
                          <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={10}
                        className="w-[240px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                      >
                        <div className="grid gap-1.5 text-[12px]">
                          {FILTERS_CONFIG.period.opts.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onFilterChange('period', opt)}
                              className={cn(
                                "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                                filters.period === opt
                                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white"
                                  : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
                              )}
                            >
                              <span className="truncate">{opt}</span>
                              {filters.period === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Topic Filter */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-white">
                    Тема
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-[38px] items-center justify-between gap-2 rounded-xl border border-[#181B22] bg-[#000000] px-4 text-sm font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                      >
                        {(() => {
                          const activeCategoryOption = CATEGORY_OPTIONS.find((option) => option.value === (filters.topic || 'all'));
                          const ActiveCategoryIcon = activeCategoryOption?.icon;
                          return (
                            <>
                              {ActiveCategoryIcon ? (
                                <span
                                  className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded",
                                    activeCategoryOption.badgeClassName ?? "bg-[#2F3336] text-white/70"
                                  )}
                                >
                                  <ActiveCategoryIcon className="h-3.5 w-3.5" />
                                </span>
                              ) : (
                                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#2F3336]/60 text-[10px] font-semibold">
                                  Все
                                </span>
                              )}
                              <span className="truncate">{activeCategoryOption?.label || 'Все'}</span>
                              <ChevronDown className="ml-auto h-4 w-4 text-[#C4C7D4]" />
                            </>
                          );
                        })()}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={10}
                      className="w-[300px] rounded-[18px] border border-widget-border/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                    >
                      <div className="grid gap-2">
                        {CATEGORY_OPTIONS.map((category) => {
                          const Icon = category.icon;
                          const isActive = category.value === (filters.topic || 'all');
                          return (
                            <button
                              key={category.value}
                              type="button"
                              onClick={() => onFilterChange('topic', category.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-[14px] border px-3 py-2 text-left transition-colors",
                                isActive
                                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                  : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
                              )}
                            >
                              {Icon ? (
                                <span
                                  className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-lg",
                                    category.badgeClassName ?? "bg-[#2F3336] text-white/70"
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </span>
                              ) : (
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2F3336]/60 text-[10px] font-semibold uppercase">
                                  Все
                                </span>
                              )}
                              <span className="flex flex-col leading-tight">
                                <span className="text-xs font-semibold text-white">{category.label}</span>
                                {category.description ? (
                                  <span className="text-[11px] text-[#8E92A0]">{category.description}</span>
                                ) : null}
                              </span>
                              {isActive ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2F2F31]">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-sm font-semibold text-[#8E92A0] transition-colors hover:text-white"
                >
                  Reset all
                </button>
                <button
                  type="button"
                  onClick={() => setIsMainFiltersModalOpen(false)}
                  className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Advanced Filters Modal */}
      <Dialog open={isAdvancedFiltersModalOpen} onOpenChange={setIsAdvancedFiltersModalOpen}>
        <DialogContent className="max-w-[680px] border-widget-border bg-[#0C1014] text-white p-0 gap-0">
          <DialogHeader className="border-b border-widget-border px-6 py-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-white">Advanced Filters</DialogTitle>
              <button
                type="button"
                onClick={() => setIsAdvancedFiltersModalOpen(false)}
                className="rounded-full p-2 text-[#8E92A0] transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* Assets Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Assets</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAssets([])}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition",
                      selectedAssets.length === 0
                        ? "border-[#6CA8FF]/50 bg-[#14243A] text-[#6CA8FF] shadow-[0_8px_24px_-18px_rgba(76,130,255,0.7)]"
                        : "border-transparent bg-white/5 text-[#8E92A0] hover:border-[#6CA8FF]/30 hover:bg-[#14243A]/70"
                    )}
                  >
                    All assets
                    {selectedAssets.length === 0 ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                  {LAB_ASSET_OPTIONS.map((asset) => {
                    const isActive = selectedAssets.includes(asset.value);
                    const Icon = asset.icon;
                    return (
                      <button
                        key={asset.value}
                        type="button"
                        onClick={() => toggleAsset(asset.value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition whitespace-nowrap",
                          isActive
                            ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#A06AFF]/10"
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", asset.accentClassName)} />
                        {asset.value}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monetization Filter */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Monetization</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "all" as const, label: "All", icon: SlidersHorizontal },
                    { value: "free" as const, label: "Free", icon: Sparkles },
                    { value: "premium" as const, label: "Paid", icon: DollarSign },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isActive = option.value === monetizationFilter;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMonetizationFilter(option.value)}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition",
                          isActive
                            ? "border-[#A06AFF] bg-[#A06AFF]/20 text-white shadow-[0_8px_24px_-18px_rgba(160,106,255,0.7)]"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#A06AFF]/30 hover:bg-[#A06AFF]/10"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Sort By</label>
                <div className="grid gap-2">
                  {[
                    { value: "recent" as const, label: "Newest first" },
                    { value: "likes_desc" as const, label: "Most likes" },
                    { value: "likes_asc" as const, label: "Fewest likes" },
                  ].map((option) => {
                    const isActive = option.value === sortOption;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSortOption(option.value)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.1em] transition",
                          isActive
                            ? "border-[#6CA8FF]/50 bg-[#14243A] text-[#6CA8FF] shadow-[0_8px_24px_-18px_rgba(76,130,255,0.7)]"
                            : "border-transparent bg-white/5 text-[#C5C9D3] hover:border-[#6CA8FF]/30 hover:bg-[#14243A]/70"
                        )}
                      >
                        {option.label}
                        {isActive ? <Check className="h-4 w-4" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-widget-border px-6 py-4">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-sm font-semibold text-[#8E92A0] transition-colors hover:text-white"
            >
              Reset all
            </button>
            <button
              type="button"
              onClick={() => setIsAdvancedFiltersModalOpen(false)}
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Apply Filters
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
