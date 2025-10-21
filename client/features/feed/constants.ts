// features/feed/constants.ts
import { FeedTab } from "./types";
import { LayoutGrid, Lightbulb, MessageCircle, BarChart3, Code, Heart } from "lucide-react";

export const FILTERS_CONFIG = {
  // Тема (Topic) - независимый фильтр
  topic: { type: 'select' as const, opts: ['All', 'News', 'Education', 'Analysis', 'Macro', 'On-chain', 'Code', 'Video', 'Signal'] },

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

// Табы теперь определяют Type (вид контента)
// Topic - это ортогональный фильтр (тематика)
export const TABS_CONFIG = {
  all: {
    type: 'all' as const,
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  },
  ideas: {
    type: 'idea' as const,
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  },
  opinions: {
    type: 'opinion' as const,
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  },
  analytics: {
    type: 'analysis' as const,
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', period: 'All time', verified: false }
  },
  soft: {
    type: 'code' as const,
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  },
  liked: {
    type: 'all' as const, // Liked показывает все типы
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  },
  following: {
    type: 'all' as const, // NEW: Following показывает все типы от подписок
    visible: ['topic', 'market', 'price', 'period', 'symbol', 'verified'] as const,
    defaults: { topic: 'All', market: 'All', price: 'All', period: 'All time', verified: false }
  }
} as const;

import { Users } from "lucide-react";

export const FEED_TABS = [
  { key: "all" as FeedTab, label: "All", icon: LayoutGrid },
  { key: "ideas" as FeedTab, label: "Ideas", icon: Lightbulb },
  { key: "opinions" as FeedTab, label: "Opinions", icon: MessageCircle },
  { key: "analytics" as FeedTab, label: "Analytics", icon: BarChart3 },
  { key: "soft" as FeedTab, label: "Soft", icon: Code },
  { key: "liked" as FeedTab, label: "Liked", icon: Heart },
  { key: "following" as FeedTab, label: "Following", icon: Users }
];

export const SIGNAL_PRESETS = [
  { key: "scalp" as const, label: "Scalp", config: { timeframe: "15m" as const, risk: "high" as const } },
  { key: "day" as const, label: "Day", config: { timeframe: "4h" as const, risk: "medium" as const } },
  { key: "swing" as const, label: "Swing", config: { timeframe: "1d" as const, risk: "low" as const } }
] as const;
