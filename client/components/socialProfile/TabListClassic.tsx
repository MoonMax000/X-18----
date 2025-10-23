import { useState } from "react";
import { cn } from "@/lib/utils";
import { TAB_VARIANTS } from "@/features/feed/styles";

const legacyTabs = [
  { id: "tweets", label: "Tweets" },
  { id: "tweet-replies", label: "Tweets & replies" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

const primaryTabs = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "premium", label: "Premium" },
] as const;

const postSubFilters = [
  { id: "all", label: "All" },
  { id: "ideas", label: "Ideas" },
  { id: "opinions", label: "Opinions" },
  { id: "analytics", label: "Analytics" },
  { id: "soft", label: "Soft" },
] as const;

export type ProfileSection = (typeof primaryTabs)[number]["id"];
export type ProfilePostsFilter = (typeof postSubFilters)[number]["id"];

interface TabListClassicProps {
  onTabChange?: (tabId: string) => void;
  isOwnProfile?: boolean;
  activeSection?: ProfileSection;
  onSectionChange?: (section: ProfileSection) => void;
  activePostsFilter?: ProfilePostsFilter;
  onPostsFilterChange?: (filter: ProfilePostsFilter) => void;
}

export default function TabListClassic({
  onTabChange,
  isOwnProfile = true,
  activeSection = "posts",
  onSectionChange,
  activePostsFilter = "all",
  onPostsFilterChange,
}: TabListClassicProps) {
  const [legacyActiveTab, setLegacyActiveTab] = useState(legacyTabs[0].id);

  if (!isOwnProfile) {
    return (
      <div className="space-y-3">
        <div className="grid w-full grid-cols-3 gap-1.5 rounded-[20px] border border-widget-border bg-[#000000] p-1.5">
          {primaryTabs.map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSectionChange?.(tab.id)}
                className={TAB_VARIANTS.item(isActive)}
              >
                <span className="text-xs font-semibold sm:text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeSection === "posts" ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {postSubFilters.map((chip) => {
              const isActive = activePostsFilter === chip.id;
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
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  const handleLegacyTabClick = (tabId: string) => {
    setLegacyActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="sticky top-0 z-20 -mx-6 bg-background/95 px-6 backdrop-blur-md">
      <div className="grid w-full grid-cols-2 overflow-x-auto sm:grid-cols-4 md:grid-cols-[1fr_2fr_1fr_1fr]">
        {legacyTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleLegacyTabClick(tab.id)}
            className="flex w-full items-center justify-center px-3 text-xs font-bold text-[#777] transition hover:bg-[#111] sm:px-6 sm:text-sm md:px-9 md:text-[15px]"
          >
            <span
              className={cn(
                "relative w-full px-2 py-3 sm:py-4 md:py-5",
                legacyActiveTab === tab.id &&
                  "text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:rounded-[40px] after:bg-[#A06AFF]"
              )}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
