import React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Newspaper, GraduationCap, BarChart3, Brain, Code2, Video, TrendingUp, MessageCircle } from "lucide-react";

// Category configuration with icons and colors (aligned with feed tabs)
const categoryConfig = {
  'Signal': { icon: TrendingUp, color: '#2EBD85', bg: 'bg-[#2EBD85]/15' },
  'News': { icon: Newspaper, color: '#4D7CFF', bg: 'bg-[#4D7CFF]/15' },
  'Education': { icon: GraduationCap, color: '#F78DA7', bg: 'bg-[#F78DA7]/15' },
  'Analysis': { icon: BarChart3, color: '#A06AFF', bg: 'bg-[#A06AFF]/15' },
  'Macro': { icon: Brain, color: '#FFD166', bg: 'bg-[#FFD166]/15' },
  'Code': { icon: Code2, color: '#64B5F6', bg: 'bg-[#64B5F6]/15' },
  'Video': { icon: Video, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
  'General': { icon: MessageCircle, color: '#9CA3AF', bg: 'bg-[#9CA3AF]/15' },
};

export interface ComposerMetadataProps {
  market: string;
  category: string;
  symbol: string;
  timeframe: string;
  risk: string;
  onMarketChange: (market: string) => void;
  onCategoryChange: (category: string) => void;
  onSymbolChange: (symbol: string) => void;
  onTimeframeChange: (timeframe: string) => void;
  onRiskChange: (risk: string) => void;
  visible?: boolean;
}

export function ComposerMetadata({
  market,
  category,
  symbol,
  timeframe,
  risk,
  onMarketChange,
  onCategoryChange,
  onSymbolChange,
  onTimeframeChange,
  onRiskChange,
  visible = true,
}: ComposerMetadataProps) {
  if (!visible) return null;

  return (
    <div className="border-t border-[#1B1F27] pt-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {/* Market Selector */}
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Market <span className="text-[#EF454A]">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
              >
                <span className="truncate">{market}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="z-[2100] w-40 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
              <div className="grid gap-0.5 text-xs">
                {['Crypto', 'Stocks', 'Forex', 'Commodities', 'Indices'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onMarketChange(m)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                      market === m
                        ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                        : "text-[#D5D8E1] hover:bg-white/5"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category Selector */}
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Category <span className="text-[#EF454A]">*</span>
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
              >
                <span className="flex items-center gap-1.5 truncate">
                  {(() => {
                    const config = categoryConfig[category as keyof typeof categoryConfig];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <>
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: config.color }} />
                        <span className="truncate">{category}</span>
                      </>
                    );
                  })()}
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="z-[2100] w-48 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
              <div className="grid gap-0.5 text-xs">
                {Object.keys(categoryConfig).map((cat) => {
                  const config = categoryConfig[cat as keyof typeof categoryConfig];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onCategoryChange(cat)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                        category === cat
                          ? `${config.bg} font-semibold`
                          : "text-[#D5D8E1] hover:bg-white/5"
                      )}
                    >
                      <span className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded",
                        category === cat ? config.bg : "bg-[#2F3336]"
                      )}>
                        <Icon className="h-3 w-3" style={{ color: config.color }} />
                      </span>
                      <span style={{ color: category === cat ? config.color : undefined }}>
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Symbol Input */}
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
            placeholder="BTC, ETH..."
            className="flex h-8 w-full rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] placeholder:text-[#6B7280] transition-colors hover:border-[#A06AFF]/50 focus:border-[#A06AFF] focus:outline-none"
            maxLength={10}
          />
        </div>

        {/* Timeframe Selector */}
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Timeframe
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
              >
                <span className="truncate">{timeframe || 'None'}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
              <div className="grid gap-0.5 text-xs">
                {['', '15m', '1h', '4h', '1d', '1w'].map((tf) => (
                  <button
                    key={tf || 'none'}
                    type="button"
                    onClick={() => onTimeframeChange(tf)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                      timeframe === tf
                        ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                        : "text-[#D5D8E1] hover:bg-white/5"
                    )}
                  >
                    {tf || 'None'}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Risk Level */}
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Risk
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-full items-center justify-between gap-1 rounded-xl border border-[#1B1F27] bg-[#000000] px-2.5 text-xs font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
              >
                <span className="truncate">{risk || 'None'}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
              <div className="grid gap-0.5 text-xs">
                {['', 'Low', 'Medium', 'High'].map((r) => (
                  <button
                    key={r || 'none'}
                    type="button"
                    onClick={() => onRiskChange(r)}
                    className={cn(
                      "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                      risk === r
                        ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                        : "text-[#D5D8E1] hover:bg-white/5"
                    )}
                  >
                    {r || 'None'}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
