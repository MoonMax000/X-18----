import React from "react";
import { FEED_TABS } from "../constants";
import { TAB_VARIANTS } from "../styles";
import type { FeedTab } from "../types";

interface FeedTabsProps {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <div className={TAB_VARIANTS.container}>
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
            className={TAB_VARIANTS.item(isActive, isAll)}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Icon className="h-4 w-4 shrink-0" />
              <span className={isAll ? "inline" : "hidden sm:inline"}>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
