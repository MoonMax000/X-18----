import React from "react";
import { FEED_TABS } from "../constants";
import type { FeedTab } from "../types";

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className="mb-3 flex items-center overflow-x-auto rounded-full border border-[#181B22] bg-[#000000] p-0.5">
      {FEED_TABS.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        const isAll = tab.key === "all";
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            aria-pressed={isActive}
            className={`${isAll ? "flex-none min-w-[60px]" : "flex-1 min-w-[120px]"} px-3 py-1 text-xs sm:text-sm font-semibold rounded-full transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                : "text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Icon className="h-4 w-4" />
              <span className={isAll ? "inline" : "hidden sm:inline"}>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
