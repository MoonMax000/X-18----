import React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Flame, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FILTERS_CONFIG, TABS_CONFIG } from "../constants";
import type { FeedTab } from "../types";
import { LAB_CATEGORY_CONFIG, type LabCategory } from "@/components/testLab/categoryConfig";

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

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="flex items-end gap-3 flex-wrap flex-1">
        {/* Market Filter */}
        {activeConfig?.visible?.includes('market') && (
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Рынок
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
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
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Цена
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
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
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
              Период
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
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
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Тема
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#181B22] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
              >
                {(() => {
                  const activeCategoryOption = CATEGORY_OPTIONS.find((option) => option.value === (filters.topic || 'all'));
                  const ActiveCategoryIcon = activeCategoryOption?.icon;
                  return (
                    <>
                      {ActiveCategoryIcon ? (
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded",
                            activeCategoryOption.badgeClassName ?? "bg-[#2F3336] text-white/70"
                          )}
                        >
                          <ActiveCategoryIcon className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-[#2F3336]/60 text-[9px] font-semibold">
                          Все
                        </span>
                      )}
                      <span className="truncate">{activeCategoryOption?.label || 'Все'}</span>
                      <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
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

      {/* Hot/Recent Toggle */}
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
  );
}
