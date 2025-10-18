import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "tweets", label: "Tweets" },
  { id: "tweet-replies", label: "Tweets & replies" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

interface TabListClassicProps {
  onTabChange?: (tabId: string) => void;
}

export default function TabListClassic({ onTabChange }: TabListClassicProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="sticky top-0 z-20 -mx-6 px-6 bg-background/95 backdrop-blur-md">
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-[1fr_2fr_1fr_1fr] w-full overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className="text-[#777] px-3 sm:px-6 md:px-9 w-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-[15px] hover:bg-[#111] transition"
          >
            <span
              className={cn(
                "relative w-full py-3 sm:py-4 md:py-5 px-2",
                activeTab === tab.id &&
                  "text-white after:content-[''] after:h-[3px] after:w-full after:bg-[#A06AFF] after:rounded-[40px] after:absolute after:bottom-0 after:left-0",
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
