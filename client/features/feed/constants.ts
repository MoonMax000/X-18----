// features/feed/constants.ts
import { FeedTab } from "./types";
import { LayoutGrid, TrendingUp, Newspaper, GraduationCap, BarChart3, Brain, Code, Video, Heart } from "lucide-react";

export const FILTERS_CONFIG = {
  // Тема (Topic) - дополнительный фильтр для таба All
  topic: { type: 'select' as const, opts: ['All', 'Signal', 'News', 'Education', 'Analysis', 'Macro', 'Code', 'Video', 'General'] },

  // Остальные фильтры
  market: { type: 'select' as const, opts: ['All', 'Crypto', 'Stocks', 'Forex', 'Futures', 'Commodities'] },
  price: { type: 'select' as const, opts: ['All', 'Free', 'Paid', 'Subscription'] },
  period: { type: 'select' as const, opts: ['All time', 'Today', '7d', '30d', 'YTD', 'Custom'] },

  // Удалено category (заменено на topic)
  sort: { type: 'select' as const, opts: ['Popular', 'New', 'Top 24h', 'Top 7d', 'Recent'] },
  sentiment: { type: 'chips' as const, opts: ['Bullish', 'Bearish', 'Neutral'] },
  strategy: { type: 'chips' as const, opts: ['TA', 'Quant', 'News', 'Options', 'On-chain'] },
  symbol: { type: 'autocomplete' as const },
  direction: { type: 'select' as const, opts: ['Long', 'Short'] },
  timeframe: { type: 'select' as const, opts: ['15m', '1h', '4h', '1d', '1w'] },
  risk: { type: 'select' as const, opts: ['Low', 'Medium', 'High'] },
  accuracy: { type: 'buckets' as const, opts: ['≥60%', '≥70%', '≥80%'] },
  minSamples: { type: 'select' as const, opts: ['≥30', '≥50', '≥100'] },
  verified: { type: 'toggle' as const }
} as const;

// Табы напрямую соответствуют типам контента (категориям)
export const TABS_CONFIG = {
  all: {
    type: 'all' as const,
    visible: ['market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  signal: {
    type: 'signal' as const,
    visible: ['market', 'direction', 'timeframe', 'risk', 'period', 'symbol', 'verified'] as const,
    defaults: { market: 'All', period: 'All time', verified: false }
  },
  news: {
    type: 'news' as const,
    visible: ['market', 'period', 'symbol', 'verified'] as const,
    defaults: { market: 'All', period: 'All time', verified: false }
  },
  education: {
    type: 'education' as const,
    visible: ['market', 'price', 'period', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  analysis: {
    type: 'analysis' as const,
    visible: ['market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  macro: {
    type: 'macro' as const,
    visible: ['market', 'price', 'period', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  code: {
    type: 'code' as const,
    visible: ['market', 'price', 'period', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  video: {
    type: 'video' as const,
    visible: ['market', 'price', 'period', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  liked: {
    type: 'all' as const,
    visible: ['market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  }
} as const;

export const FEED_TABS = [
  { key: "all" as FeedTab, label: "All", icon: LayoutGrid },
  { key: "signal" as FeedTab, label: "Signal", icon: TrendingUp },
  { key: "news" as FeedTab, label: "News", icon: Newspaper },
  { key: "education" as FeedTab, label: "Education", icon: GraduationCap },
  { key: "analysis" as FeedTab, label: "Analysis", icon: BarChart3 },
  { key: "macro" as FeedTab, label: "Macro", icon: Brain },
  { key: "code" as FeedTab, label: "Code", icon: Code },
  { key: "video" as FeedTab, label: "Video", icon: Video },
  { key: "liked" as FeedTab, label: "Liked", icon: Heart }
];

export const SIGNAL_PRESETS = [
  { key: "scalp" as const, label: "Scalp", config: { timeframe: "15m" as const, risk: "high" as const } },
  { key: "day" as const, label: "Day", config: { timeframe: "4h" as const, risk: "medium" as const } },
  { key: "swing" as const, label: "Swing", config: { timeframe: "1d" as const, risk: "low" as const } }
] as const;
