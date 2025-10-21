import React, { useEffect, useState } from "react";
import { Users, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";

interface CommunitySentimentWidgetProps {
  bullishPercent?: number; // 0-100
  votesText?: string; // e.g., "1.9M votes"
  onBullish?: () => void;
  onBearish?: () => void;
}

export const CommunitySentimentWidget: React.FC<CommunitySentimentWidgetProps> = ({
  bullishPercent = 82,
  votesText = "1.9M votes",
  onBullish,
  onBearish,
}) => {
  const [bullFill, setBullFill] = useState(0);
  const [bearFill, setBearFill] = useState(0);
  const bearishPercent = Math.max(0, Math.min(100, 100 - bullishPercent));

  useEffect(() => {
    const bp = Math.max(0, Math.min(100, bullishPercent));
    setTimeout(() => setBullFill(bp), 50);
    setTimeout(() => setBearFill(Math.max(0, Math.min(100, 100 - bp))), 50);
  }, [bullishPercent]);

  return (
    <div className="rounded-2xl border border-[#0F131A] bg-[#000000] p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#A06AFF]" />
          <span className="text-sm font-semibold text-white">Community sentiment</span>
          <span className="text-xs text-[#6C7280]">{votesText}</span>
        </div>
      </div>

      {/* Body */}
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Bullish side */}
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A0D12] ring-1 ring-[#1B1F27]">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400">{bullishPercent}%</div>
        </div>

        {/* Center bars */}
        <div className="flex w-32 flex-col gap-2">
          <div className="h-2.5 overflow-hidden rounded-full bg-[#10131A] ring-1 ring-[#1B1F27]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_16px_rgba(16,185,129,0.35)] transition-all duration-700 ease-out"
              style={{ width: `${bullFill}%` }}
            />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#10131A] ring-1 ring-[#1B1F27]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_16px_rgba(244,63,94,0.35)] transition-all duration-700 ease-out"
              style={{ width: `${bearFill}%` }}
            />
          </div>
        </div>

        {/* Bearish side */}
        <div className="flex items-center justify-end gap-2">
          <div className="text-lg font-bold text-rose-400">{bearishPercent}%</div>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A0D12] ring-1 ring-[#1B1F27]">
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onBullish}
          className="inline-flex items-center justify-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
        >
          <TrendingUp className="h-3 w-3" /> Bullish
        </button>
        <button
          type="button"
          onClick={onBearish}
          className="inline-flex items-center justify-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-300 transition-all hover:bg-rose-500/20 hover:text-rose-200"
        >
          <TrendingDown className="h-3 w-3" /> Bearish
        </button>
      </div>
    </div>
  );
}
