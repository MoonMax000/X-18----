import type { FC } from "react";

import { cn } from "@/lib/utils";

export interface ProfileTab {
  id: string;
  label: string;
}

interface ProfileTabsProps {
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ProfileTabs: FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="flex overflow-x-auto rounded-3xl border border-[#1F242B] bg-[rgba(12,16,20,0.6)] p-1 text-sm text-[#8B98A5]">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 min-w-[120px] cursor-pointer rounded-2xl px-5 py-3 font-semibold transition",
              isActive
                ? "bg-gradient-to-r from-[#A06AFF]/90 to-[#482090]/90 text-white shadow-[0_12px_28px_-18px_rgba(160,106,255,0.6)]"
                : "hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default ProfileTabs;
