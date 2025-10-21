import React from "react";
import { TrendingUp } from "lucide-react";
import { WidgetCard } from "./WidgetCard";

interface TopTickerData {
  ticker: string;
  postsCount: number;
}

interface TopTickersWidgetProps {
  tickers: TopTickerData[];
  onTickerClick?: (ticker: string) => void;
  selectedTicker?: string | null;
}

export default function TopTickersWidget({
  tickers,
  onTickerClick,
  selectedTicker,
}: TopTickersWidgetProps) {
  return (
    <WidgetCard title="Top Tickers" icon={TrendingUp}>
      <div className="space-y-2">
        {tickers.map((item) => (
          <button
            key={item.ticker}
            onClick={() => onTickerClick?.(item.ticker)}
            className={`flex w-full items-center justify-between rounded-lg p-2 transition ${
              selectedTicker === item.ticker
                ? "bg-[#A06AFF]/20 border border-[#A06AFF]"
                : "hover:bg-white/5"
            }`}
          >
            <span className="text-sm font-semibold text-white">{item.ticker}</span>
            <span className="text-xs text-gray-400">{item.postsCount} posts</span>
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}
