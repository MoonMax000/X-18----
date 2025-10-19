import { type FC } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import SuggestedProfilesWidget, {
  type SuggestedProfile,
} from "./SuggestedProfilesWidget";
import FollowRecommendationsWidget from "./FollowRecommendationsWidget";
import NewsWidget, { type NewsItem } from "./TrendingTopicsWidget";
import {
  DEFAULT_SUGGESTED_PROFILES,
  DEFAULT_NEWS_ITEMS,
} from "./sidebarData";

interface SocialRightSidebarProps {
  profiles?: SuggestedProfile[];
  followRecommendations?: SuggestedProfile[];
  newsItems?: NewsItem[];
  showSearch?: boolean;
  className?: string;
}

const SocialRightSidebar: FC<SocialRightSidebarProps> = ({
  profiles = DEFAULT_SUGGESTED_PROFILES,
  followRecommendations = DEFAULT_SUGGESTED_PROFILES,
  newsItems = DEFAULT_NEWS_ITEMS,
  showSearch = true,
  className,
}) => {
  return (
    <aside className={cn("hidden w-full max-w-[360px] xl:max-w-[380px] flex-shrink-0 flex-col gap-5 lg:flex", className)}>
      <div className="sticky top-28 flex flex-col gap-5 bg-background">
        {showSearch ? (
          <div className="relative bg-background rounded-full">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-webGray z-10"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Поиск по авторам и темам"
              className="w-full rounded-full border border-[#525252]/40 bg-background py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-webGray transition-all duration-300 hover:border-[#A06AFF]/60 hover:shadow-[0_0_20px_rgba(160,106,255,0.2)] focus:border-[#A06AFF] focus:outline-none focus:ring-2 focus:ring-[#A06AFF]/40"
            />
          </div>
        ) : null}
        <SuggestedProfilesWidget profiles={profiles} />
        <NewsWidget items={newsItems} />
        <FollowRecommendationsWidget profiles={followRecommendations} />
      </div>
    </aside>
  );
};

export default SocialRightSidebar;
