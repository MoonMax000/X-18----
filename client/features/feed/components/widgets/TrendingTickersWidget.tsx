import React from "react";
import { cn } from "@/lib/utils";
import WidgetCard, { WidgetHeader } from "./WidgetCard";
import { WIDGET_VARIANTS } from "../../styles";

export interface TrendingTicker {
  ticker: string;
  change?: string;
  sentiment?: "bullish" | "bearish" | "neutral";
  mentions: string;
}

interface TrendingTickersWidgetProps {
  tickers: TrendingTicker[];
  selectedTicker?: string;
  onTickerClick?: (ticker: string) => void;
  title?: string;
}

export default function TrendingTickersWidget({
  tickers,
  selectedTicker,
  onTickerClick,
  title = "Trending Tickers"
}: TrendingTickersWidgetProps) {
  return (
    <WidgetCard variant="compact">
      <WidgetHeader title={title} className="mb-4" />
      <div className="space-y-3">
        {tickers.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onTickerClick?.(item.ticker)}
            className={WIDGET_VARIANTS.ticker(selectedTicker === item.ticker)}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{item.ticker}</span>
              {item.change && (
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.sentiment === "bullish" && "text-emerald-400",
                    item.sentiment === "bearish" && "text-rose-400",
                    item.sentiment === "neutral" && "text-[#6C7280]"
                  )}
                >
                  {item.change}
                </span>
              )}
            </div>
            <div className="text-xs text-[#6C7280]">{item.mentions}</div>
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}
