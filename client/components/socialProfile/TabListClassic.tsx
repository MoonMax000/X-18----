import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { TAB_VARIANTS } from "@/features/feed/styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const coreTabs = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "premium", label: "Premium" },
] as const;

const likesTab = { id: "likes", label: "Likes" } as const;

const allTabs = [...coreTabs, likesTab] as const;

const postSubFilters = [
  { id: "all", label: "All" },
  { id: "ideas", label: "Ideas" },
  { id: "opinions", label: "Opinions" },
  { id: "analytics", label: "Analytics" },
  { id: "soft", label: "Soft" },
] as const;

const sortOptions = [
  { id: "newest", label: "Newest first" },
  { id: "likes", label: "Most likes" },
] as const;

export type ProfileSection = (typeof allTabs)[number]["id"];
export type ProfilePostsFilter = (typeof postSubFilters)[number]["id"];
export type ProfileSortOption = (typeof sortOptions)[number]["id"];

interface TabListClassicProps {
  isOwnProfile?: boolean;
  activeSection?: ProfileSection;
  onSectionChange?: (section: ProfileSection) => void;
  activePostsFilter?: ProfilePostsFilter;
  onPostsFilterChange?: (filter: ProfilePostsFilter) => void;
  postFilterCounts?: Partial<Record<ProfilePostsFilter, number>>;
  sortOption?: ProfileSortOption;
  onSortChange?: (option: ProfileSortOption) => void;
  showLikesTab?: boolean;
}

export default function TabListClassic({
  isOwnProfile = true,
  activeSection = "posts",
  onSectionChange,
  activePostsFilter = "all",
  onPostsFilterChange,
  postFilterCounts,
  sortOption = "newest",
  onSortChange,
  showLikesTab = isOwnProfile,
}: TabListClassicProps) {
  const totalPosts = postFilterCounts?.all ?? 0;

  const tabsToRender = useMemo(() => {
    const tabs: Array<{ id: ProfileSection; label: string }> = [...coreTabs];
    if (showLikesTab) {
      tabs.push(likesTab);
    }
    return tabs;
  }, [showLikesTab]);

  const tabsGridClass = cn(
    "grid w-full gap-1.5 rounded-[20px] border border-widget-border bg-[#000000] p-1.5",
    tabsToRender.length === 5 ? "grid-cols-2 sm:grid-cols-5" : 
    tabsToRender.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3",
  );

  const availableChips = useMemo(() => {
    return postSubFilters.filter((chip) => {
      if (chip.id === "all") {
        return true;
      }
      const count = postFilterCounts?.[chip.id] ?? 0;
      return count > 0;
    });
  }, [postFilterCounts]);

  const handleSortSelect = (value: string) => {
    const nextOption = sortOptions.find((option) => option.id === value);
    if (nextOption) {
      onSortChange?.(nextOption.id);
    }
  };

  return (
    <div className="space-y-3">
      <div className={tabsGridClass}>
        {tabsToRender.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSectionChange?.(tab.id)}
              className={TAB_VARIANTS.item(isActive, tab.id === "posts")}
              aria-pressed={isActive}
            >
              <span className="text-xs font-semibold sm:text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSection === "posts" ? (
        <div className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {availableChips.map((chip) => {
                const isActive = activePostsFilter === chip.id;
                const count = postFilterCounts?.[chip.id] ?? 0;
                const displayLabel =
                  chip.id === "all" ? `${chip.label} (${totalPosts})` : `${chip.label} (${count})`;

                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => onPostsFilterChange?.(chip.id)}
                    className={cn(
                      "inline-flex h-8 items-center gap-2 rounded-full border border-[#181B22] bg-[#000000] px-3 text-xs font-semibold text-[#D5D8E1] transition-colors duration-200 hover:border-[#A06AFF]/50 hover:bg-[#1C1430]",
                      isActive &&
                        "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                    )}
                    aria-pressed={isActive}
                  >
                    {displayLabel}
                  </button>
                );
              })}
            </div>

            {totalPosts > 0 ? (
              <div className="flex w-full items-center justify-end gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B7280] sm:w-auto">
                <span className="hidden sm:inline">Sort</span>
                <Select aria-label="Sort posts" value={sortOption} onValueChange={handleSortSelect}>
                  <SelectTrigger className="h-8 min-w-[150px] rounded-full border border-[#181B22] bg-[#050215] px-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D5D8E1] transition-colors duration-200 hover:border-[#A06AFF]/50 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    className="min-w-[160px] rounded-xl border border-[#181B22] bg-[#050215] p-1 text-[11px] text-[#A5ACBA] shadow-[0_18px_40px_-22px_rgba(160,106,255,0.55)]"
                    position="popper"
                    sideOffset={6}
                  >
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A5ACBA] focus:bg-[#1C1430] focus:text-white"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
