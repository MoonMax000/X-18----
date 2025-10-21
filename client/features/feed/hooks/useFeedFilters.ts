// features/feed/hooks/useFeedFilters.ts
import { useMemo, useState, useCallback } from "react";
import type { FeedTab, Post } from "../types";
import { TABS_CONFIG } from "../constants";

type FeedMode = "recent" | "hot";

export function useFeedFilters(initialTab: FeedTab = "all") {
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [feedMode, setFeedMode] = useState<FeedMode>("hot");
  const [filters, setFilters] = useState<Record<string, any>>({
    market: "All",
    price: "All",
    period: "All time",
    category: undefined,
    symbol: "",
    verified: false,
    freeOnly: false,
    videoOnly: false
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("");

  const activeConfig = useMemo(() => TABS_CONFIG[activeTab], [activeTab]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const applyToPosts = useCallback((posts: Post[]) => {
    let res = [...posts];

    if (activeTab === "ideas") res = res.filter(p => ["education", "analysis", "news"].includes(p.type));
    if (activeTab === "opinions") res = res.filter(p => ["general", "macro"].includes(p.type));
    if (activeTab === "analytics") res = res.filter(p => ["analysis", "macro", "onchain"].includes(p.type));
    if (activeTab === "soft") res = res.filter(p => p.type === "code");
    if (activeTab === "liked") res = res.filter(p => (p as any).__liked);

    if (filters.market && filters.market !== "All") {
      res = res.filter(p => p.market?.toLowerCase() === filters.market.toLowerCase());
    }
    if (selectedCategories.length > 0) {
      res = res.filter(p => selectedCategories.some(cat => p.type === cat.toLowerCase()));
    }
    if (filters.sentiment && filters.sentiment !== "All") {
      res = res.filter(p => p.sentiment === filters.sentiment.toLowerCase());
    }
    if (filters.price && filters.price !== "All") {
      res = res.filter(p => p.price === filters.price.toLowerCase().replace(/ /g, "-"));
    }
    if (filters.direction) res = res.filter(p => p.direction === filters.direction.toLowerCase());
    if (filters.timeframe) res = res.filter(p => p.timeframe === filters.timeframe);
    if (filters.risk) res = res.filter(p => p.risk === filters.risk.toLowerCase());
    if (filters.verified) res = res.filter(p => p.author.verified);
    if (filters.freeOnly) res = res.filter(p => p.price === "free");
    if (filters.videoOnly) res = res.filter(p => p.type === "video");
    if (selectedTicker) res = res.filter(p => p.ticker === selectedTicker);
    if (filters.symbol) {
      const q = String(filters.symbol).toUpperCase();
      res = res.filter(p => p.ticker?.toUpperCase().includes(q));
    }

    if (feedMode === "hot") res.sort((a, b) => (b.likes + b.views / 10) - (a.likes + a.views / 10));
    if (feedMode === "recent") res = res.slice().reverse();

    return res;
  }, [activeTab, filters, selectedCategories, selectedTicker, feedMode]);

  return {
    activeTab,
    setActiveTab,
    feedMode,
    setFeedMode,
    filters,
    updateFilter,
    selectedCategories,
    toggleCategory,
    selectedTicker,
    setSelectedTicker,
    activeConfig,
    applyToPosts
  };
}
