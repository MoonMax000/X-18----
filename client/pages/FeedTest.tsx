import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  Search, TrendingUp, TrendingDown, Sparkles, DollarSign, Users, BarChart3, Activity, Code, Image, Video, FileText,
  MessageCircle, Heart, Repeat2, Bookmark, Share2, Eye, ChevronDown, Filter, Send, UserPlus, UserCheck, Flame, Star,
  Zap, Lock, LockKeyhole, Crown, Info, SlidersHorizontal, X, Check, AlertCircle, LineChart, Clock, Shield, Hash, PlayCircle,
  ChevronUp, Calendar, Globe, Maximize2, Save, BarChart, TrendingUpIcon, LayoutGrid, Lightbulb, Newspaper, GraduationCap,
  Brain, Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/PostCard/FollowButton";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import { PostBadges } from "@/components/PostCard/PostBadges";
import { SignalPostCard } from "@/components/PostCard/SignalPostCard";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";
import { FearGreedWidget } from "@/components/testLab/FearGreedWidget";
import { CommunitySentimentWidget } from "@/components/testLab/CommunitySentimentWidget";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import NewsWidget, { type NewsItem } from "@/components/SocialFeedWidgets/TrendingTopicsWidget";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import { DEFAULT_SUGGESTED_PROFILES, DEFAULT_NEWS_ITEMS } from "@/components/SocialFeedWidgets/sidebarData";
import InlineComposer from "@/components/socialComposer/InlineComposer";
import CreatePostModal from "@/components/CreatePostBox/CreatePostModal";
import { ComposerBlockState, MediaItem } from "@/components/CreatePostBox/types";
import { EmojiPicker } from "@/components/CreatePostBox/EmojiPicker";
import { CodeBlockModal } from "@/components/CreatePostBox/CodeBlockModal";
import { MediaEditor } from "@/components/CreatePostBox/MediaEditor";
import { MediaGrid } from "@/components/CreatePostBox/MediaGrid";
import { useAdvancedComposer } from "@/components/CreatePostBox/useAdvancedComposer";
import { PaidPostModal, PaidPostConfig } from "@/components/CreatePostBox/PaidPostModal";

// Types
type FeedTab = "all" | "ideas" | "opinions" | "analytics" | "soft" | "liked";
type PostType = "signal" | "news" | "analysis" | "code" | "general" | "education" | "macro" | "onchain" | "video";
type SentimentType = "bullish" | "bearish" | "neutral";
type PriceType = "free" | "pay-per-post" | "subscribers-only";
type MarketType = "crypto" | "stocks" | "forex" | "commodities" | "indices";
type DirectionType = "long" | "short";
type TimeframeType = "15m" | "1h" | "4h" | "1d" | "1w";
type RiskType = "low" | "medium" | "high";

interface ComposerData {
  text: string;
  teaser: string;
  sentiment: "bullish" | "bearish" | null;
  isPaid: boolean;
  isCode: boolean;
  
  // Signal fields
  ticker: string;
  direction: DirectionType | "";
  timeframe: TimeframeType | "";
  risk: RiskType | "";
  entry: string;
  stopLoss: string;
  takeProfit: string;
  
  // Code fields
  language: string;
  codeDescription: string;
  codeSnippet: string;
  compatibility: string;
  
  // Access/Price
  accessType: PriceType;
  price: string;
  verifiedOnly: boolean;
  
  // Audience/Schedule
  visibility: "all" | "subscribers" | "buyers" | "followers";
  scheduledDate: string;
  scheduledTime: string;
  expiryDays: string;
  commentsEnabled: boolean;
}

// Filter Configuration (matching /testovaya style)
const CATEGORY_CONFIG_MAP: Record<string, { icon: typeof TrendingUp; badgeClassName: string; label: string; color: string }> = {
  'Signal': { icon: TrendingUp, badgeClassName: 'bg-[#2EBD85]/15 text-[#2EBD85]', label: 'Signal', color: '#2EBD85' },
  'Macro': { icon: Brain, badgeClassName: 'bg-[#FFD166]/15 text-[#FFD166]', label: 'Macro', color: '#FFD166' },
  'News': { icon: Newspaper, badgeClassName: 'bg-[#4D7CFF]/15 text-[#4D7CFF]', label: 'News', color: '#4D7CFF' },
  'Education': { icon: GraduationCap, badgeClassName: 'bg-[#F78DA7]/15 text-[#F78DA7]', label: 'Education', color: '#F78DA7' },
  'Analysis': { icon: BarChart3, badgeClassName: 'bg-[#A06AFF]/15 text-[#A06AFF]', label: 'Analysis', color: '#A06AFF' },
  'Code': { icon: Code2, badgeClassName: 'bg-[#64B5F6]/15 text-[#64B5F6]', label: 'Code', color: '#64B5F6' },
  'Video': { icon: Video, badgeClassName: 'bg-[#FF8A65]/20 text-[#FF8A65]', label: 'Video', color: '#FF8A65' },
  'On-chain': { icon: BarChart3, badgeClassName: 'bg-[#A06AFF]/15 text-[#A06AFF]', label: 'On-chain', color: '#A06AFF' },
};

const FILTERS_CONFIG = {
  market: { type: 'select', opts: ['All', 'Crypto', 'Stocks', 'Forex', 'Futures', 'Commodities'] },
  price: { type: 'select', opts: ['All', 'Free', 'Paid', 'Subscription'] },
  period: { type: 'select', opts: ['All time', 'Today', '7d', '30d', 'YTD', 'Custom'] },
  category: { type: 'chips', opts: ['Signal', 'Macro', 'News', 'Education', 'Analysis', 'Code', 'Video', 'On-chain'] },
  sort: { type: 'select', opts: ['Popular', 'New', 'Top 24h', 'Top 7d', 'Recent'] },
  sentiment: { type: 'chips', opts: ['Bullish', 'Bearish', 'Neutral'] },
  strategy: { type: 'chips', opts: ['TA', 'Quant', 'News', 'Options', 'On-chain'] },
  symbol: { type: 'autocomplete' },
  direction: { type: 'select', opts: ['Long', 'Short'] },
  timeframe: { type: 'select', opts: ['15m', '1h', '4h', '1d', '1w'] },
  risk: { type: 'select', opts: ['Low', 'Medium', 'High'] },
  accuracy: { type: 'buckets', opts: ['≥60%', '≥70%', '���80%'] },
  minSamples: { type: 'select', opts: ['≥30', '≥50', '≥100'] },
  verified: { type: 'toggle' }
} as const;

const TABS_CONFIG = {
  all: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  ideas: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  opinions: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  analytics: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  soft: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  },
  liked: {
    visible: ['market', 'price', 'period', 'category', 'symbol', 'verified'],
    defaults: { market: 'All', price: 'All', period: 'All time', verified: false }
  }
} as const;

const FEED_TABS = [
  { key: "all" as FeedTab, label: "All", icon: LayoutGrid },
  { key: "ideas" as FeedTab, label: "Ideas", icon: Lightbulb },
  { key: "opinions" as FeedTab, label: "Opinions", icon: MessageCircle },
  { key: "analytics" as FeedTab, label: "Analytics", icon: BarChart3 },
  { key: "soft" as FeedTab, label: "Soft", icon: Code },
  { key: "liked" as FeedTab, label: "Liked", icon: Heart }
];

const SIGNAL_PRESETS = [
  { key: "scalp", label: "Scalp", config: { timeframe: "15m", risk: "High" } },
  { key: "day", label: "Day", config: { timeframe: "4h", risk: "Medium" } },
  { key: "swing", label: "Swing", config: { timeframe: "1d", risk: "Low" } }
];

interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    isPremium?: boolean;
    isFollowing?: boolean;
  };
  timestamp: string;
  type: PostType;
  text: string;
  sentiment?: SentimentType;
  market?: MarketType;
  price?: PriceType;
  
  ticker?: string;
  direction?: DirectionType;
  timeframe?: TimeframeType;
  risk?: RiskType;
  accuracy?: number;
  sampleSize?: number;
  entry?: string;
  stopLoss?: string;
  takeProfit?: string;
  
  language?: string;
  codeSnippet?: string;
  
  mediaUrl?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  isEditorPick?: boolean;
  tags?: string[];
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    author: { name: "Alex Trader", handle: "@alextrader", avatar: "https://i.pravatar.cc/120?img=12", verified: true, isPremium: true },
    timestamp: "2h ago",
    type: "signal",
    text: "Strong bullish pattern on $AAPL. Breaking resistance at $180. Perfect risk/reward setup for swing traders.",
    sentiment: "bullish",
    market: "stocks",
    price: "subscribers-only",
    ticker: "$AAPL",
    direction: "long",
    timeframe: "1d",
    risk: "medium",
    accuracy: 78,
    sampleSize: 125,
    entry: "$180",
    stopLoss: "$175",
    takeProfit: "$195",
    likes: 2340,
    comments: 145,
    reposts: 289,
    views: 12450,
    tags: ["#TechnicalAnalysis", "#Stocks", "#Signals"],
    isEditorPick: true
  },
  {
    id: "2",
    author: { name: "Crypto Whale", handle: "@cryptowhale", avatar: "https://i.pravatar.cc/120?img=33", verified: true },
    timestamp: "4h ago",
    type: "analysis",
    text: "Bitcoin forming a perfect head and shoulders pattern. Watch for breakdown below $42k. This could trigger massive liquidations.",
    sentiment: "bearish",
    market: "crypto",
    price: "pay-per-post",
    ticker: "$BTC",
    likes: 1567,
    comments: 323,
    reposts: 534,
    views: 8456,
    tags: ["#Bitcoin", "#Crypto", "#TechnicalAnalysis"],
    isEditorPick: true
  },
  {
    id: "3",
    author: { name: "Algo Dev", handle: "@algodev", avatar: "https://i.pravatar.cc/120?img=25", verified: true, isPremium: true },
    timestamp: "6h ago",
    type: "code",
    text: "New mean reversion strategy showing 65% win rate. Full implementation available for premium subscribers. Backtested on 3 years of data.",
    market: "crypto",
    price: "subscribers-only",
    language: "Python",
    codeSnippet: "def calculate_signals(df):\n    rsi = ta.rsi(df['close'], 14)\n    return rsi < 30",
    likes: 945,
    comments: 178,
    reposts: 256,
    views: 5234,
    tags: ["#AlgoTrading", "#Python", "#Code"],
    sentiment: "neutral"
  },
  {
    id: "4",
    author: { name: "Market News", handle: "@marketnews", avatar: "https://i.pravatar.cc/120?img=41", verified: true },
    timestamp: "8h ago",
    type: "news",
    text: "Breaking: Fed announces interest rate decision. Market volatility expected across all sectors. FOMC statement released at 2 PM EST.",
    sentiment: "neutral",
    market: "stocks",
    price: "free",
    likes: 2789,
    comments: 634,
    reposts: 1145,
    views: 15678,
    tags: ["#Fed", "#MarketNews", "#Economy"]
  },
  {
    id: "5",
    author: { name: "Tech Analyst", handle: "@techanalyst", avatar: "https://i.pravatar.cc/120?img=55", verified: true },
    timestamp: "10h ago",
    type: "signal",
    text: "Bearish signal on $TSLA. Support breaking at $200. Consider shorting with tight stops.",
    sentiment: "bearish",
    market: "stocks",
    price: "free",
    ticker: "$TSLA",
    direction: "short",
    timeframe: "4h",
    risk: "high",
    accuracy: 68,
    sampleSize: 45,
    entry: "$200",
    stopLoss: "$210",
    takeProfit: "$180",
    likes: 1123,
    comments: 89,
    reposts: 178,
    views: 6789,
    tags: ["#TSLA", "#Signals"]
  },
  {
    id: "6",
    author: { name: "Options Master", handle: "@optionsmaster", avatar: "https://i.pravatar.cc/120?img=18", verified: true, isPremium: true },
    timestamp: "12h ago",
    type: "signal",
    text: "Bullish call spread on $SPY. Entry at $420. Expiration in 30 days.",
    sentiment: "bullish",
    market: "stocks",
    price: "pay-per-post",
    ticker: "$SPY",
    direction: "long",
    timeframe: "1d",
    risk: "low",
    accuracy: 72,
    sampleSize: 89,
    entry: "$420",
    stopLoss: "$415",
    takeProfit: "$435",
    likes: 856,
    comments: 123,
    reposts: 145,
    views: 4567,
    tags: ["#Options", "#Trading"]
  },
  {
    id: "7",
    author: { name: "Forex Pro", handle: "@forexpro", avatar: "https://i.pravatar.cc/120?img=22", verified: false },
    timestamp: "1d ago",
    type: "analysis",
    text: "EUR/USD continuing its downtrend. Strong resistance at 1.0850. Watch the daily close.",
    sentiment: "bearish",
    market: "forex",
    price: "free",
    likes: 567,
    comments: 78,
    reposts: 92,
    views: 3421,
    tags: ["#ForexTrading", "#EUR", "#Analysis"]
  },
  {
    id: "8",
    author: { name: "Education Hub", handle: "@eduhub", avatar: "https://i.pravatar.cc/120?img=30", verified: true },
    timestamp: "1d ago",
    type: "education",
    text: "Complete guide to support and resistance levels. Learn how to identify key price zones using multiple timeframes.",
    sentiment: "neutral",
    market: "crypto",
    price: "free",
    likes: 2134,
    comments: 456,
    reposts: 678,
    views: 18934,
    tags: ["#Education", "#TechnicalAnalysis", "#Trading"]
  },
  {
    id: "9",
    author: { name: "Gold Guru", handle: "@goldguru", avatar: "https://i.pravatar.cc/120?img=42", verified: true, isPremium: true },
    timestamp: "14h ago",
    type: "signal",
    text: "Precious metals showing strength. Gold breaking through $2000 resistance. Major shift in market sentiment.",
    sentiment: "bullish",
    market: "commodities",
    price: "subscribers-only",
    ticker: "$GC",
    direction: "long",
    timeframe: "1d",
    risk: "low",
    accuracy: 85,
    sampleSize: 112,
    entry: "$2000",
    stopLoss: "$1995",
    takeProfit: "$2020",
    likes: 1456,
    comments: 234,
    reposts: 345,
    views: 7890,
    tags: ["#Gold", "#Commodities", "#Signals"]
  },
  {
    id: "10",
    author: { name: "Macro Analyst", handle: "@macroanalyst", avatar: "https://i.pravatar.cc/120?img=50", verified: true },
    timestamp: "16h ago",
    type: "macro",
    text: "Analyzing the global macro environment: Central banks tightening, inflation cooling, but recession risks remain elevated.",
    sentiment: "neutral",
    market: "indices",
    price: "free",
    likes: 1890,
    comments: 567,
    reposts: 456,
    views: 12345,
    tags: ["#MacroAnalysis", "#Economics"]
  },
  {
    id: "11",
    author: { name: "On-chain Detective", handle: "@onchaindet", avatar: "https://i.pravatar.cc/120?img=28", verified: true },
    timestamp: "18h ago",
    type: "onchain",
    text: "Large whale accumulation detected. 50,000 BTC moved to exchange wallets. This could signal a price move.",
    sentiment: "neutral",
    market: "crypto",
    price: "pay-per-post",
    likes: 2345,
    comments: 789,
    reposts: 567,
    views: 14567,
    tags: ["#OnChain", "#Bitcoin", "#Whales"]
  },
  {
    id: "12",
    author: { name: "Pine Script Expert", handle: "@pinescript", avatar: "https://i.pravatar.cc/120?img=35", verified: true, isPremium: true },
    timestamp: "20h ago",
    type: "code",
    text: "Advanced RSI divergence indicator. Pine Script v5. Works on all timeframes. Included with commentary.",
    market: "crypto",
    price: "pay-per-post",
    language: "Pine Script",
    codeSnippet: "study('RSI Divergence', overlay=false)\nlength = input(14)\nrsi = rsi(close, length)\nplot(rsi)",
    likes: 1234,
    comments: 345,
    reposts: 456,
    views: 8765,
    tags: ["#PineScript", "#TradingView"]
  },
  {
    id: "13",
    author: { name: "JS Trader", handle: "@jstrader", avatar: "https://i.pravatar.cc/120?img=40", verified: false },
    timestamp: "1d ago",
    type: "code",
    text: "Simple moving average crossover bot in JavaScript. Works with Binance API.",
    market: "crypto",
    price: "free",
    language: "JavaScript",
    codeSnippet: "const sma = (data, period) => {\n  return data.slice(-period).reduce((a,b) => a+b) / period;\n}",
    likes: 678,
    comments: 123,
    reposts: 234,
    views: 4567,
    tags: ["#JavaScript", "#Bot"]
  },
  {
    id: "14",
    author: { name: "Video Trader", handle: "@videotrader", avatar: "https://i.pravatar.cc/120?img=38", verified: true },
    timestamp: "2d ago",
    type: "video",
    text: "Step-by-step video guide: How to identify chart patterns. 45 minute masterclass. Link in bio.",
    sentiment: "neutral",
    market: "stocks",
    price: "subscribers-only",
    likes: 3456,
    comments: 678,
    reposts: 890,
    views: 25678,
    tags: ["#Video", "#Education"]
  },
  {
    id: "15",
    author: { name: "Low Risk Trader", handle: "@lowrisk", avatar: "https://i.pravatar.cc/120?img=26", verified: true },
    timestamp: "3h ago",
    type: "signal",
    text: "Scalp setup on $ETH. Quick 2% profit target. Very tight stops. Duration: 15-30 minutes.",
    sentiment: "bullish",
    market: "crypto",
    price: "free",
    ticker: "$ETH",
    direction: "long",
    timeframe: "15m",
    risk: "low",
    accuracy: 81,
    sampleSize: 156,
    entry: "$2400",
    stopLoss: "$2395",
    takeProfit: "$2450",
    likes: 2567,
    comments: 234,
    reposts: 456,
    views: 9876,
    tags: ["#ETH", "#Scalp"]
  },
  {
    id: "16",
    author: { name: "Swing King", handle: "@swingking", avatar: "https://i.pravatar.cc/120?img=44", verified: true, isPremium: true },
    timestamp: "5h ago",
    type: "signal",
    text: "3-day swing trade on $GS. Higher highs forming. Looking for continuation.",
    sentiment: "bullish",
    market: "stocks",
    price: "subscribers-only",
    ticker: "$GS",
    direction: "long",
    timeframe: "1d",
    risk: "medium",
    accuracy: 74,
    sampleSize: 98,
    entry: "$380",
    stopLoss: "$370",
    takeProfit: "$410",
    likes: 1678,
    comments: 289,
    reposts: 345,
    views: 7654,
    tags: ["#SwingTrade", "#Stocks"]
  }
];

const TRENDING_TICKERS = [
  { ticker: "$AAPL", change: "+2.4%", sentiment: "bullish" as SentimentType, mentions: 1234 },
  { ticker: "$TSLA", change: "-1.2%", sentiment: "bearish" as SentimentType, mentions: 987 },
  { ticker: "$BTC", change: "+5.6%", sentiment: "bullish" as SentimentType, mentions: 2345 },
  { ticker: "$ETH", change: "+3.8%", sentiment: "bullish" as SentimentType, mentions: 1567 },
  { ticker: "$NVDA", change: "+4.2%", sentiment: "bullish" as SentimentType, mentions: 890 }
];

const TOP_AUTHORS = [
  { name: "Alex Trader", handle: "@alextrader", avatar: "https://i.pravatar.cc/120?img=12", followers: "45.2K", isFollowing: false },
  { name: "Crypto Whale", handle: "@cryptowhale", avatar: "https://i.pravatar.cc/120?img=33", followers: "38.5K", isFollowing: true },
  { name: "Algo Dev", handle: "@algodev", avatar: "https://i.pravatar.cc/120?img=25", followers: "32.1K", isFollowing: false }
];

const INITIAL_COMPOSER_STATE: ComposerData = {
  text: "",
  teaser: "",
  sentiment: null,
  isPaid: false,
  isCode: false,
  ticker: "",
  direction: "",
  timeframe: "1h",
  risk: "medium",
  entry: "",
  stopLoss: "",
  takeProfit: "",
  language: "Python",
  codeDescription: "",
  codeSnippet: "",
  compatibility: "",
  accessType: "free",
  price: "",
  verifiedOnly: false,
  visibility: "all",
  scheduledDate: "",
  scheduledTime: "",
  expiryDays: "",
  commentsEnabled: true
};

// Quick Composer Component
function QuickComposer({
  onExpand
}: {
  onExpand: (data: Partial<ComposerData>) => void;
}) {
  const [sentiment, setSentiment] = useState<"bullish" | "bearish" | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [replySetting, setReplySetting] = useState<"everyone" | "following" | "verified" | "mentioned">("everyone");
  const [isReplyMenuOpen, setIsReplyMenuOpen] = useState(false);
  const [replyMenuPosition, setReplyMenuPosition] = useState<{ top: number; left: number; openBelow?: boolean } | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCodeBlockOpen, setIsCodeBlockOpen] = useState(false);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isAdvancedComposerOpen, setIsAdvancedComposerOpen] = useState(false);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [paidConfig, setPaidConfig] = useState<PaidPostConfig | null>(null);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);

  // Post metadata for filtering
  const [postMarket, setPostMarket] = useState<string>('Crypto');
  const [postCategory, setPostCategory] = useState<string>('Analysis');
  const [postSymbol, setPostSymbol] = useState<string>('');

  // Category configuration with icons and colors
  const categoryConfig = {
    'News': { icon: Newspaper, color: '#4D7CFF', bg: 'bg-[#4D7CFF]/15' },
    'Education': { icon: GraduationCap, color: '#F78DA7', bg: 'bg-[#F78DA7]/15' },
    'Analysis': { icon: BarChart3, color: '#A06AFF', bg: 'bg-[#A06AFF]/15' },
    'Macro': { icon: Brain, color: '#FFD166', bg: 'bg-[#FFD166]/15' },
    'On-chain': { icon: BarChart3, color: '#A06AFF', bg: 'bg-[#A06AFF]/15' },
    'Code': { icon: Code2, color: '#64B5F6', bg: 'bg-[#64B5F6]/15' },
    'Video': { icon: Video, color: '#FF8A65', bg: 'bg-[#FF8A65]/20' },
    'Signal': { icon: TrendingUp, color: '#2EBD85', bg: 'bg-[#2EBD85]/15' },
  };
  const [postTimeframe, setPostTimeframe] = useState<string>('');
  const [postRisk, setPostRisk] = useState<string>('');

  const replyButtonRef = useRef<HTMLButtonElement>(null);
  const replyMenuRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Use the advanced composer hook for proper media/code block handling
  const {
    blocks,
    activeBlockId,
    addMedia,
    removeMedia,
    replaceMedia,
    reorderMedia,
    insertCodeBlock,
    removeCodeBlock,
    updateBlockText,
    addBlock,
    deleteBlock,
  } = useAdvancedComposer();

  const MAX_CHARS = 300;
  const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];
  const text = activeBlock?.text || "";
  const charRatio = Math.min(text.length / MAX_CHARS, 1);
  const remainingChars = MAX_CHARS - text.length;
  const isNearLimit = remainingChars < 20 && remainingChars >= 0;
  const isOverLimit = remainingChars < 0;
  const circumference = 88;
  const dashOffset = circumference - charRatio * circumference;
  const canAddBlock = blocks.length < 10 && text.trim().length > 0;

  const replyOptions = [
    { id: "everyone" as const, label: "Everyone", description: "Anyone can reply." },
    { id: "following" as const, label: "Accounts you follow", description: "Only people you follow can reply." },
    { id: "verified" as const, label: "Verified accounts", description: "Only verified users can reply." },
    { id: "mentioned" as const, label: "Only accounts you mention", description: "Only people you mention can reply." },
  ];

  const replySummary = replyOptions.find(opt => opt.id === replySetting)?.label || "Everyone";

  const handleAddBlock = () => {
    addBlock();
  };

  const handleReplyButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 200;

    // Check if there's enough space above
    const spaceAbove = rect.top;
    const shouldOpenBelow = spaceAbove < menuHeight;

    const top = shouldOpenBelow ? rect.bottom + 10 : rect.top - 10;
    setReplyMenuPosition({ top, left: rect.left, openBelow: shouldOpenBelow });
    setIsReplyMenuOpen((prev) => !prev);
  };

  const openMediaPicker = () => {
    mediaInputRef.current?.click();
  };

  const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.xls', '.xlsx'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi'];

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      addMedia(blockId, files);
    }
    event.target.value = "";
  };

  const validateDocument = (file: File): boolean => {
    const isValidType = ALLOWED_DOCUMENT_TYPES.includes(file.type);
    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_DOCUMENT_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB max

    if (!isValidType && !isValidExtension) {
      alert(`Document type not allowed. Allowed formats: ${ALLOWED_DOCUMENT_EXTENSIONS.join(', ')}`);
      return false;
    }
    if (!isValidSize) {
      alert('Document size must be less than 50MB');
      return false;
    }
    return true;
  };

  const validateVideo = (file: File): boolean => {
    const isValidType = ALLOWED_VIDEO_TYPES.includes(file.type);
    const fileName = file.name.toLowerCase();
    const isValidExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const isValidSize = file.size <= 500 * 1024 * 1024; // 500MB max

    if (!isValidType && !isValidExtension) {
      alert(`Video type not allowed. Allowed formats: ${ALLOWED_VIDEO_EXTENSIONS.join(', ')}`);
      return false;
    }
    if (!isValidSize) {
      alert('Video size must be less than 500MB');
      return false;
    }
    return true;
  };

  // Hook for virus scanning (to be implemented with backend)
  const scanFileForViruses = async (file: File): Promise<boolean> => {
    // TODO: Integrate with backend virus scanning service (e.g., ClamAV)
    // For now, just return true (pass)
    console.log('Scanning file for viruses:', file.name);
    // const response = await fetch('/api/scan-file', { method: 'POST', body: file });
    // return response.ok;
    return true;
  };

  // Hook for video transcoding/codec conversion (to be implemented with backend)
  const transcodeVideo = async (file: File): Promise<{ success: boolean; url?: string }> => {
    // TODO: Integrate with backend video transcoding service (e.g., FFmpeg API)
    console.log('Transcoding video:', file.name);
    // const formData = new FormData();
    // formData.append('file', file);
    // const response = await fetch('/api/transcode-video', { method: 'POST', body: formData });
    // return response.json();
    return { success: true };
  };

  const handleDocumentSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file format and size
    if (!validateDocument(file)) {
      event.target.value = "";
      return;
    }

    // Scan for viruses
    const isSafe = await scanFileForViruses(file);
    if (!isSafe) {
      alert('File failed security scan. Please try another file.');
      event.target.value = "";
      return;
    }

    // Add document to media
    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      addMedia(blockId, files);
    }
    event.target.value = "";
  };

  const handleVideoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file format and size
    if (!validateVideo(file)) {
      event.target.value = "";
      return;
    }

    // Scan for viruses
    const isSafe = await scanFileForViruses(file);
    if (!isSafe) {
      alert('File failed security scan. Please try another file.');
      event.target.value = "";
      return;
    }

    // Transcode video if needed
    const transcodeResult = await transcodeVideo(file);
    if (!transcodeResult.success) {
      alert('Video processing failed. Please try another file.');
      event.target.value = "";
      return;
    }

    // Add video to media
    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      addMedia(blockId, files);
    }
    event.target.value = "";
  };

  const handleEmojiToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isEmojiPickerOpen) {
      const rect = event.currentTarget.getBoundingClientRect();
      setEmojiPickerPosition({ top: rect.bottom + 10, left: rect.left });
    }
    setIsEmojiPickerOpen(prev => !prev);
  };

  const handleEmojiSelect = (emoji: string) => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (!blockId) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block || block.text.length + emoji.length > MAX_CHARS) return;

    updateBlockText(blockId, block.text + emoji);
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  const handleCloseEmojiPicker = () => {
    setIsEmojiPickerOpen(false);
    setEmojiPickerPosition(null);
  };

  // Handle click outside emoji picker and reply menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEmojiPickerOpen &&
          emojiPickerRef.current &&
          emojiButtonRef.current &&
          !emojiPickerRef.current.contains(event.target as Node) &&
          !emojiButtonRef.current.contains(event.target as Node)) {
        handleCloseEmojiPicker();
      }
      if (isReplyMenuOpen &&
          replyMenuRef.current &&
          replyButtonRef.current &&
          !replyMenuRef.current.contains(event.target as Node) &&
          !replyButtonRef.current.contains(event.target as Node)) {
        setIsReplyMenuOpen(false);
      }
    };

    if (isEmojiPickerOpen || isReplyMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEmojiPickerOpen, isReplyMenuOpen]);

  // Update emoji picker position on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isEmojiPickerOpen && emojiButtonRef.current) {
        const rect = emojiButtonRef.current.getBoundingClientRect();
        setEmojiPickerPosition({ top: rect.bottom + 10, left: rect.left });
      }
    };

    if (isEmojiPickerOpen) {
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isEmojiPickerOpen]);

  const handleCodeBlockInsert = (code: string, language: string) => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (!blockId) return;

    insertCodeBlock(blockId, code, language);
    setIsCodeBlockOpen(false);
  };

  const handleBoldToggle = () => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (!blockId) return;

    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Add bold formatting to the text
    const boldText = `**${block.text}**`;
    updateBlockText(blockId, boldText);
    setIsBoldActive(!isBoldActive);
  };

  const handleMediaEdit = (media: MediaItem) => {
    setEditingMedia(media);
  };

  const handleMediaSave = (updatedMedia: MediaItem) => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      replaceMedia(blockId, updatedMedia);
    }
    setEditingMedia(null);
  };

  const handleMediaRemove = (mediaId: string) => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      removeMedia(blockId, mediaId);
    }
  };

  const handleMediaReorder = (fromIndex: number, toIndex: number) => {
    const blockId = activeBlockId || blocks[0]?.id;
    if (blockId) {
      reorderMedia(blockId, fromIndex, toIndex);
    }
  };

  const handleOpenAdvancedComposer = () => {
    if (blocks[0]) {
      setIsAdvancedComposerOpen(true);
    }
  };

  // Auto-detect patterns in text
  useEffect(() => {
    const tickerMatch = text.match(/\$[A-Z]{2,5}/);
    const timeframeMatch = text.match(/\b(15m|1h|4h|1d|1w)\b/i);
    const directionMatch = text.match(/\b(long|short)\b/i);

    if (tickerMatch && timeframeMatch && directionMatch && !sentiment) {
      // Auto-suggest Signal mode
      const shouldEscalate = window.confirm(
        `Detected trading signal pattern. Would you like to create a Signal post with advanced options?`
      );
      if (shouldEscalate) {
        const detectedSentiment = directionMatch[0].toLowerCase() === 'long' ? 'bullish' : 'bearish';
        setSentiment(detectedSentiment);
        onExpand({
          text: blocks[0]?.text || text,
          sentiment: detectedSentiment,
          ticker: tickerMatch[0],
          timeframe: timeframeMatch[0].toLowerCase() as TimeframeType,
          direction: directionMatch[0].toLowerCase() as DirectionType
        });
      }
    }
  }, [text, sentiment, onExpand, blocks]);

  // Escalation logic
  useEffect(() => {
    const MEDIA_LIMIT = 4;
    const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];
    const blockMediaLength = activeBlock?.media?.length || 0;

    if (isPaid || sentiment || blockMediaLength > MEDIA_LIMIT) {
      onExpand({
        text: blocks[0]?.text || text,
        isPaid,
        sentiment,
        accessType: isPaid ? "pay-per-post" : "free"
      });
    }
  }, [isPaid, sentiment, blocks, activeBlockId, text, onExpand]);

  const highlightText = (input: string) => {
    return input
      .replace(/(\$[A-Z]{2,5})/g, '<span class="text-blue-400 font-semibold">$1</span>')
      .replace(/(#\w+)/g, '<span class="text-purple-400">$1</span>')
      .replace(/(@\w+)/g, '<span class="text-green-400">$1</span>');
  };

  return (
    <div className="flex gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://cdn.builder.io/api/v1/image/assets%2F96d248c4e0034c7db9c7e11fff5853f9%2Fbfe82f3f6ef549f2ba8b6ec6c1b11e87" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Share your trading ideas, signals, or analysis... ($TICKER, #tags, @mentions)"
          value={text}
          onChange={(e) => {
            const blockId = activeBlockId || blocks[0]?.id;
            if (blockId && e.target.value.length <= MAX_CHARS) {
              updateBlockText(blockId, e.target.value);
            }
          }}
          maxLength={MAX_CHARS}
          className="!min-h-[60px] !resize-none !border-none !bg-[#000000] !text-[15px] !text-white !placeholder:text-[#6C7280] !focus-visible:ring-0"
        />

        {/* Display Media Items */}
        {activeBlock?.media && activeBlock.media.length > 0 && (
          <MediaGrid
            media={activeBlock.media}
            onEdit={handleMediaEdit}
            onRemove={handleMediaRemove}
            onReorder={handleMediaReorder}
            readOnly={false}
          />
        )}

        {/* Display Code Blocks */}
        {activeBlock?.codeBlocks && activeBlock.codeBlocks.length > 0 && (
          <div className="mt-3 space-y-2">
            {activeBlock.codeBlocks.map((codeBlock) => (
              <div
                key={codeBlock.id}
                className="relative group rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] border-b border-[#6B46C1]/20">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#9F7AEA]" />
                    <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">
                      {codeBlock.language}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const blockId = activeBlockId || blocks[0]?.id;
                      if (blockId) {
                        removeCodeBlock(blockId, codeBlock.id);
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#6B46C1]/20 rounded-lg text-[#9F7AEA] hover:text-[#A06AFF]"
                    aria-label="Remove code block"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs text-[#D4B5FD] overflow-x-auto max-h-40 font-mono bg-[#05030A]">
                  <code>{codeBlock.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div>
            {text.length > 0 && (
              <button
                ref={replyButtonRef}
                type="button"
                onClick={handleReplyButtonClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-1 text-xs font-semibold text-[#A06AFF] transition-colors hover:bg-white/10"
              >
                <span className="-ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[#A06AFF]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 2v1.5M12 20.5V22M4.5 12H2M22 12h-2.5M7.05 4.05l1.06 1.06M15.89 17.95l1.06 1.06M5.56 18.44l1.06-1.06M17.38 6.62l1.06-1.06"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.75 17.5 8 14l-1-3-2.2-1.27"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m17 14-.5-3-1-3 2.5-1"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-xs">{replySummary}</span>
              </button>
            )}
          </div>
        </div>

        {/* Post Metadata Selectors */}
        {text.length > 0 && (
          <div className="mt-3 border-t border-[#1B1F27] pt-3">
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
                      <span className="truncate">{postMarket}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-40 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['Crypto', 'Stocks', 'Forex', 'Commodities', 'Indices'].map((market) => (
                        <button
                          key={market}
                          type="button"
                          onClick={() => setPostMarket(market)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postMarket === market
                              ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                              : "text-[#D5D8E1] hover:bg-white/5"
                          )}
                        >
                          {market}
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
                          const config = categoryConfig[postCategory as keyof typeof categoryConfig];
                          const Icon = config.icon;
                          return (
                            <>
                              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: config.color }} />
                              <span className="truncate">{postCategory}</span>
                            </>
                          );
                        })()}
                      </span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-48 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['News', 'Education', 'Analysis', 'Macro', 'On-chain', 'Code', 'Video', 'Signal'].map((category) => {
                        const config = categoryConfig[category as keyof typeof categoryConfig];
                        const Icon = config.icon;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setPostCategory(category)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors",
                              postCategory === category
                                ? `${config.bg} font-semibold`
                                : "text-[#D5D8E1] hover:bg-white/5"
                            )}
                          >
                            <span className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded",
                              postCategory === category ? config.bg : "bg-[#2F3336]"
                            )}>
                              <Icon className="h-3 w-3" style={{ color: config.color }} />
                            </span>
                            <span style={{ color: postCategory === category ? config.color : undefined }}>
                              {category}
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
                  value={postSymbol}
                  onChange={(e) => setPostSymbol(e.target.value.toUpperCase())}
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
                      <span className="truncate">{postTimeframe || 'None'}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['', '15m', '1h', '4h', '1d', '1w'].map((tf) => (
                        <button
                          key={tf || 'none'}
                          type="button"
                          onClick={() => setPostTimeframe(tf)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postTimeframe === tf
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
                      <span className="truncate">{postRisk || 'None'}</span>
                      <ChevronDown className="h-3 w-3 shrink-0 text-[#6B7280]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-28 rounded-xl border border-[#1B1F27]/70 bg-[#0F131A]/95 p-1.5 text-white shadow-xl backdrop-blur-xl">
                    <div className="grid gap-0.5 text-xs">
                      {['', 'Low', 'Medium', 'High'].map((risk) => (
                        <button
                          key={risk || 'none'}
                          type="button"
                          onClick={() => setPostRisk(risk)}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-left transition-colors",
                            postRisk === risk
                              ? "bg-[#A06AFF]/20 text-[#A06AFF] font-semibold"
                              : "text-[#D5D8E1] hover:bg-white/5"
                          )}
                        >
                          {risk || 'None'}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]"
              onClick={() => setMediaCount(prev => prev + 1)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M2 11C2 7.70017 2 6.05025 3.02513 5.02513C4.05025 4 5.70017 4 9 4H10C13.2998 4 14.9497 4 15.9749 5.02513C17 6.05025 17 7.70017 17 11V13C17 16.2998 17 17.9497 15.9749 18.9749C14.9497 20 13.2998 20 10 20H9C5.70017 20 4.05025 20 3.02513 18.9749C2 17.9497 2 16.2998 2 13V11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M17 8.90585L17.1259 8.80196C19.2417 7.05623 20.2996 6.18336 21.1498 6.60482C22 7.02628 22 8.42355 22 11.2181V12.7819C22 15.5765 22 16.9737 21.1498 17.3952C20.2996 17.8166 19.2417 16.9438 17.1259 15.198L17 15.0941"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={openMediaPicker}
              className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]"
              title="Add photos or images"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M6.25 7.5C6.94036 7.5 7.5 6.94036 7.5 6.25C7.5 5.55964 6.94036 5 6.25 5C5.55964 5 5 5.55964 5 6.25C5 6.94036 5.55964 7.5 6.25 7.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.08301 10C2.08301 6.26809 2.08301 4.40212 3.24237 3.24274C4.40175 2.08337 6.26772 2.08337 9.99967 2.08337C13.7316 2.08337 15.5976 2.08337 16.757 3.24274C17.9163 4.40212 17.9163 6.26809 17.9163 10C17.9163 13.732 17.9163 15.598 16.757 16.7574C15.5976 17.9167 13.7316 17.9167 9.99967 17.9167C6.26772 17.9167 4.40175 17.9167 3.24237 16.7574C2.08301 15.598 2.08301 13.732 2.08301 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M4.16699 17.5C7.81071 13.1458 11.8954 7.40334 17.9149 11.2853"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]"
              title="Add documents (PDF, DOCX, PPTX, etc.)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14.5 5H12.5C9.67157 5 8.25736 5 7.37868 5.87868C6.5 6.75736 6.5 8.17157 6.5 11V16C6.5 18.8284 6.5 20.2426 7.37868 21.1213C8.25736 22 9.67157 22 12.5 22H13.8431C14.6606 22 15.0694 22 15.4369 21.8478C15.8045 21.6955 16.0935 21.4065 16.6716 20.8284L19.3284 18.1716C19.9065 17.5935 20.1955 17.3045 20.3478 16.9369C20.5 16.5694 20.5 16.1606 20.5 15.3431V11C20.5 8.17157 20.5 6.75736 19.6213 5.87868C18.7426 5 17.3284 5 14.5 5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 21.5V20.5C15 18.6144 15 17.6716 15.5858 17.0858C16.1716 16.5 17.1144 16.5 19 16.5H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 19C4.84315 19 3.5 17.6569 3.5 16V8C3.5 5.17157 3.5 3.75736 4.37868 2.87868C5.25736 2 6.67157 2 9.5 2H14.5004C16.1572 2.00001 17.5004 3.34319 17.5004 5.00003"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.0011 13H14.0011M10.0011 9H17.0011"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsCodeBlockOpen(true)}
              className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 7L3 12L8 17M16 7L21 12L16 17M14 3L10 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

            <button
              ref={emojiButtonRef}
              type="button"
              onClick={handleEmojiToggle}
              className="flex h-8 items-center justify-center gap-1.5 text-[#6C7280] transition-colors hover:text-[#A06AFF] relative"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 9.5C8 8.119 8.672 7 9.5 7S11 8.119 11 9.5 10.328 12 9.5 12 8 10.881 8 9.5zm6.5 2.5c.828 0 1.5-1.119 1.5-2.5S15.328 7 14.5 7 13 8.119 13 9.5s.672 2.5 1.5 2.5zM12 16c-2.224 0-3.021-2.227-3.051-2.316l-1.897.633c.05.15 1.271 3.684 4.949 3.684s4.898-3.533 4.949-3.684l-1.896-.638c-.033.095-.83 2.322-3.053 2.322zm10.25-4.001c0 5.652-4.598 10.25-10.25 10.25S1.75 17.652 1.75 12 6.348 1.75 12 1.75 22.25 6.348 22.25 12zm-2 0c0-4.549-3.701-8.25-8.25-8.25S3.75 7.451 3.75 12s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleBoldToggle}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 transition-colors",
                isBoldActive ? "text-[#A06AFF]" : "text-[#6C7280] hover:text-[#A06AFF]"
              )}
              aria-label="Bold"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15.636 11.671c2.079-.583 3.093-2.18 3.093-3.929 0-2.307-1.471-4.741-5.983-4.741H5.623V21h7.579c4.411 0 6.008-2.484 6.008-4.994 0-2.383-1.343-3.955-3.574-4.335zm-3.295-6.287c2.535 0 3.27 1.319 3.27 2.662 0 1.242-.583 2.611-3.27 2.611H8.69V5.384h3.651zM8.69 18.617v-5.628h4.208c2.231 0 3.194 1.166 3.194 2.738 0 1.547-.887 2.89-3.397 2.89H8.69z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <div className="ml-2 h-6 w-px bg-[#1B1F27]" />

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSentiment(sentiment === "bullish" ? null : "bullish")}
                className={cn(
                  "flex h-6 items-center gap-1 rounded-full px-2 transition-all",
                  sentiment === "bullish"
                    ? "bg-gradient-to-l from-[#2EBD85] to-[#1A6A4A] hover:shadow-[0_4px_12px_rgba(46,189,133,0.4)] hover:brightness-110"
                    : "bg-transparent hover:bg-[#2EBD85]/15"
                )}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.3333 8.66665V5.33331H10"
                    stroke={sentiment === "bullish" ? "white" : "#2EBD85"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3337 5.33331L10.0003 8.66665C9.41193 9.25505 9.11779 9.54918 8.75673 9.58171C8.69699 9.58711 8.63699 9.58711 8.57726 9.58171C8.21619 9.54918 7.92206 9.25505 7.33366 8.66665C6.74526 8.07825 6.45109 7.78411 6.09004 7.75158C6.03035 7.74618 5.9703 7.74618 5.91061 7.75158C5.54956 7.78411 5.25537 8.07825 4.66699 8.66665L2.66699 10.6666"
                    stroke={sentiment === "bullish" ? "white" : "#2EBD85"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className={cn(
                  "text-xs font-bold",
                  sentiment === "bullish" ? "text-white" : "text-white"
                )}>
                  Bullish
                </span>
              </button>

              <div className="h-5 w-px bg-[#1B1F27]" />

              <button
                type="button"
                onClick={() => setSentiment(sentiment === "bearish" ? null : "bearish")}
                className={cn(
                  "flex h-6 items-center gap-1 rounded-full px-2 transition-all",
                  sentiment === "bearish"
                    ? "bg-gradient-to-l from-[#FF2626] to-[#7F1414] hover:shadow-[0_4px_12px_rgba(255,38,38,0.4)] hover:brightness-110"
                    : "bg-transparent hover:bg-[#EF454A]/15"
                )}
              >
                <span className={cn(
                  "text-xs font-bold",
                  sentiment === "bearish" ? "text-white" : "text-white"
                )}>
                  Bearish
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13.3333 7.33331V10.6666H10"
                    stroke={sentiment === "bearish" ? "white" : "#EF454A"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3337 10.6666L10.0003 7.33331C9.41193 6.74491 9.11779 6.45075 8.75673 6.41823C8.69699 6.41285 8.63699 6.41285 8.57726 6.41823C8.21619 6.45075 7.92206 6.74491 7.33366 7.33331C6.74526 7.92171 6.45109 8.21585 6.09004 8.24838C6.03035 8.25378 5.9703 8.25378 5.91061 8.24838C5.54956 8.21585 5.25537 7.92171 4.66699 7.33331L2.66699 5.33331"
                    stroke={sentiment === "bearish" ? "white" : "#EF454A"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isPaid) {
                  setIsPaid(false);
                  setPaidConfig(null);
                } else {
                  setIsPaidModalOpen(true);
                }
              }}
              className={cn(
                "ml-2 flex h-6 items-center gap-1 rounded-full px-2 transition-all",
                isPaid
                  ? "bg-gradient-to-l from-[#A06AFF] to-[#6B46C1] hover:shadow-[0_4px_12px_rgba(160,106,255,0.4)] hover:brightness-110"
                  : "bg-transparent border border-[#A06AFF]/40 hover:bg-[#A06AFF]/15"
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
                  stroke={isPaid ? "white" : "#A06AFF"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className={cn(
                "text-xs font-bold",
                isPaid ? "text-white" : "text-[#A06AFF]"
              )}>
                Paid
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="#2F3336"
                  strokeWidth="4"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke={
                    isOverLimit ? "#EF454A" : isNearLimit ? "#FFD400" : "#A06AFF"
                  }
                  strokeWidth="4"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span
                className={cn(
                  "absolute text-sm font-medium tabular-nums",
                  isOverLimit
                    ? "text-[#EF454A]"
                    : isNearLimit
                      ? "text-[#FFD400]"
                      : "text-[#808283]",
                )}
              >
                {remainingChars < 20 ? remainingChars : ""}
              </span>
            </div>

            {/* TODO: Re-enable after MVP */}
            {false && canAddBlock && (
              <button
                type="button"
                onClick={handleAddBlock}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                title="Add another post"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="none">
                  <path
                    d="M12 8V16M16 12H8"
                    stroke="#A06AFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                    stroke="#A06AFF"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            )}

            <button
              className={cn(
                "group relative inline-flex h-8 items-center justify-center gap-1.5 overflow-hidden rounded-full px-3 text-xs font-semibold transition-all duration-200 transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/40 focus-visible:ring-offset-0",
                text.length > 0
                  ? "bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] text-white shadow-[0_20px_44px_-20px_rgba(160,106,255,0.9)] hover:shadow-[0_24px_50px_-18px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98]"
                  : "cursor-not-allowed bg-[#6C7280]/20 text-[#6C7280]",
              )}
              disabled={text.length === 0}
            >
              {text.length > 0 && (
                <span
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.18)_0%,_rgba(255,255,255,0.05)_40%,_rgba(255,255,255,0)_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "transition-transform duration-200",
                    text.length > 0 && "group-hover:translate-x-0.5 group-hover:scale-110"
                  )}
                >
                  <path
                    d="M5 12L4 5L20 12L4 19L5 12ZM5 12H12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden sm:inline">Post</span>
              </span>
            </button>
          </div>

          {isReplyMenuOpen && replyMenuPosition &&
            createPortal(
              <div
                ref={replyMenuRef}
                className="fixed z-[2300] w-[90vw] sm:w-72 rounded-2xl border border-[#5E5E5E] bg-black shadow-2xl backdrop-blur-[100px] p-3"
                style={{
                  top: replyMenuPosition.openBelow ? `${replyMenuPosition.top}px` : `${replyMenuPosition.top - 200}px`,
                  left: `${replyMenuPosition.left}px`,
                }}
              >
                <h3 className="mb-2 text-xs font-semibold text-white">
                  Who can reply?
                </h3>
                <div className="space-y-1.5">
                  {replyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setReplySetting(opt.id);
                        setIsReplyMenuOpen(false);
                      }}
                      className="flex w-full items-start gap-2.5 rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10 text-xs"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill={replySetting === opt.id ? "#A06AFF" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        {replySetting === opt.id && (
                          <circle cx="12" cy="12" r="4" fill="#A06AFF" />
                        )}
                      </svg>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-white">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#808283]">
                          {opt.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>,
              document.body
            )
          }
        </div>

        {/* Emoji Picker */}
        {isEmojiPickerOpen && emojiPickerPosition &&
          createPortal(
            <div
              ref={emojiPickerRef}
              className="fixed z-[2300] h-[45vh] sm:h-64 w-[65vw] sm:w-80 max-w-[320px] rounded-2xl sm:rounded-3xl border border-[#5E5E5E] bg-black p-3 sm:p-4 shadow-2xl backdrop-blur-[100px]"
              style={{
                top: `${emojiPickerPosition.top}px`,
                left: `${emojiPickerPosition.left}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>,
            document.body,
          )}

        {/* Code Block Modal */}
        <CodeBlockModal
          isOpen={isCodeBlockOpen}
          onClose={() => setIsCodeBlockOpen(false)}
          onInsert={handleCodeBlockInsert}
        />

        {/* Media Editor Modal */}
        {editingMedia && (
          <MediaEditor
            media={editingMedia}
            onSave={handleMediaSave}
            onClose={() => setEditingMedia(null)}
          />
        )}

        {/* Advanced Composer Modal */}
        <CreatePostModal
          isOpen={isAdvancedComposerOpen}
          onClose={() => setIsAdvancedComposerOpen(false)}
          initialBlocks={blocks}
          initialReplySetting={replySetting}
          initialSentiment={sentiment as any}
        />

        {/* Paid Post Settings Modal */}
        <PaidPostModal
          isOpen={isPaidModalOpen}
          onClose={() => setIsPaidModalOpen(false)}
          onSave={(config) => {
            setPaidConfig(config);
            setIsPaid(true);
          }}
          initialConfig={paidConfig || undefined}
        />

        {/* Hidden File Inputs */}
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleMediaSelect}
        />
        <input
          ref={documentInputRef}
          type="file"
          accept={ALLOWED_DOCUMENT_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleDocumentSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept={ALLOWED_VIDEO_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleVideoSelect}
        />

      </div>
    </div>
  );
}

// Advanced Composer Component
function AdvancedComposer({
  isOpen,
  onClose,
  initialData
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<ComposerData>;
}) {
  const [data, setData] = useState<ComposerData>({ 
    ...INITIAL_COMPOSER_STATE, 
    ...initialData 
  });
  const [activeTab, setActiveTab] = useState("content");
  const [previewMode, setPreviewMode] = useState<"public" | "subscriber" | "buyer">("public");

  const updateData = (updates: Partial<ComposerData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Validation
  const canPublish = useMemo(() => {
    if (data.sentiment && (!data.ticker || !data.direction || !data.timeframe)) {
      return false;
    }
    if (data.isPaid && data.teaser.length < 20) {
      return false;
    }
    if (data.isCode && (!data.language || !data.codeDescription)) {
      return false;
    }
    return data.text.length > 0;
  }, [data]);

  const handlePublish = () => {
    if (!canPublish) {
      alert("Please fill in all required fields");
      return;
    }
    console.log("Publishing post:", data);
    onClose();
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", data);
    alert("Draft saved!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden border-[#1B1F27] bg-[#0F131A] p-0 text-white">
        <DialogHeader className="border-b border-[#1B1F27] p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Create New Post</DialogTitle>
            <div className="flex gap-2">
              <Badge className={cn(
                "gap-1",
                data.sentiment && "bg-green-500/20 text-green-400",
                data.isCode && "bg-orange-500/20 text-orange-400",
                data.isPaid && "bg-purple-500/20 text-purple-400"
              )}>
                {data.sentiment && <><Zap className="h-3 w-3" /> {data.sentiment === 'bullish' ? 'Bullish' : 'Bearish'} Signal</>}
                {data.isCode && <><Code className="h-3 w-3" /> Code</>}
                {data.isPaid && <><Lock className="h-3 w-3" /> Paid</>}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1">
            <TabsList className="flex h-auto w-48 flex-col items-stretch gap-1 rounded-none border-r border-[#1B1F27] bg-transparent p-3">
              <TabsTrigger 
                value="content" 
                className="justify-start gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              {data.sentiment && (
                <TabsTrigger 
                  value="signal" 
                  className="justify-start gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
                >
                  <Zap className="h-4 w-4" />
                  Signal
                </TabsTrigger>
              )}
              {data.isCode && (
                <TabsTrigger 
                  value="code" 
                  className="justify-start gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  <Code className="h-4 w-4" />
                  Code
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="access" 
                className="justify-start gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <Lock className="h-4 w-4" />
                Access/Price
              </TabsTrigger>
              <TabsTrigger 
                value="audience" 
                className="justify-start gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Users className="h-4 w-4" />
                Audience
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Content Tab */}
              <TabsContent value="content" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-[#C5C9D3]">Post Content *</Label>
                  <Textarea
                    placeholder="Share your analysis, ideas, or insights... Use $TICKER for tickers, #tags for hashtags"
                    value={data.text}
                    onChange={(e) => updateData({ text: e.target.value })}
                    className="mt-2 min-h-[200px] border-[#1B1F27] bg-[#0A0D12] text-white"
                  />
                  <div className="mt-1 text-xs text-[#6C7280]">{data.text.length} / 5000</div>
                </div>

                {data.isPaid && (
                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Teaser (visible to all) *</Label>
                    <Textarea
                      placeholder="Give a preview of your content to entice readers..."
                      value={data.teaser}
                      onChange={(e) => updateData({ teaser: e.target.value })}
                      className="mt-2 min-h-[80px] border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                    <div className="mt-1 text-xs text-[#6C7280]">
                      {data.teaser.length} / 300 (min 20 characters)
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 border-[#1B1F27]">
                    <Image className="h-4 w-4" /> Add Photo
                  </Button>
                  <Button variant="outline" className="gap-2 border-[#1B1F27]">
                    <Video className="h-4 w-4" /> Add Video
                  </Button>
                </div>
              </TabsContent>

              {/* Signal Tab */}
              {data.sentiment && (
                <TabsContent value="signal" className="mt-0 space-y-4">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <Info className="h-4 w-4" />
                      <span>Signal posts help traders follow your analysis. Fill in key details below.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Ticker *</Label>
                      <Input
                        placeholder="$BTC, $ETH, $AAPL..."
                        value={data.ticker}
                        onChange={(e) => updateData({ ticker: e.target.value })}
                        className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Direction *</Label>
                      <Select value={data.direction} onValueChange={(v) => updateData({ direction: v as DirectionType })}>
                        <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                        <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                          <SelectItem value="long" className="text-white">Long</SelectItem>
                          <SelectItem value="short" className="text-white">Short</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Timeframe *</Label>
                      <Select value={data.timeframe} onValueChange={(v) => updateData({ timeframe: v as TimeframeType })}>
                        <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                          <SelectItem value="15m" className="text-white">15 minutes</SelectItem>
                          <SelectItem value="1h" className="text-white">1 hour</SelectItem>
                          <SelectItem value="4h" className="text-white">4 hours</SelectItem>
                          <SelectItem value="1d" className="text-white">1 day</SelectItem>
                          <SelectItem value="1w" className="text-white">1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Risk Level</Label>
                      <Select value={data.risk} onValueChange={(v) => updateData({ risk: v as RiskType })}>
                        <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                          <SelectItem value="low" className="text-white">Low</SelectItem>
                          <SelectItem value="medium" className="text-white">Medium</SelectItem>
                          <SelectItem value="high" className="text-white">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm text-[#C5C9D3]">Price Levels (Optional)</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Input
                          placeholder="Entry price"
                          value={data.entry}
                          onChange={(e) => updateData({ entry: e.target.value })}
                          className="border-[#1B1F27] bg-[#0A0D12] text-white"
                        />
                        <div className="mt-1 text-xs text-[#6C7280]">Entry</div>
                      </div>
                      <div>
                        <Input
                          placeholder="Stop loss"
                          value={data.stopLoss}
                          onChange={(e) => updateData({ stopLoss: e.target.value })}
                          className="border-[#1B1F27] bg-[#0A0D12] text-white"
                        />
                        <div className="mt-1 text-xs text-red-400">Stop Loss</div>
                      </div>
                      <div>
                        <Input
                          placeholder="Take profit"
                          value={data.takeProfit}
                          onChange={(e) => updateData({ takeProfit: e.target.value })}
                          className="border-[#1B1F27] bg-[#0A0D12] text-white"
                        />
                        <div className="mt-1 text-xs text-green-400">Take Profit</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#6C7280]">
                    ���️ Disclaimer: Trading signals are for educational purposes only. Not financial advice.
                  </div>
                </TabsContent>
              )}

              {/* Code Tab */}
              {data.isCode && (
                <TabsContent value="code" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Language *</Label>
                      <Select value={data.language} onValueChange={(v) => updateData({ language: v })}>
                        <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                          <SelectItem value="Python" className="text-white">Python</SelectItem>
                          <SelectItem value="JavaScript" className="text-white">JavaScript</SelectItem>
                          <SelectItem value="Pine Script" className="text-white">Pine Script</SelectItem>
                          <SelectItem value="MQL4" className="text-white">MQL4</SelectItem>
                          <SelectItem value="Other" className="text-white">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm text-[#C5C9D3]">Compatibility</Label>
                      <Input
                        placeholder="TradingView, MT4, Custom..."
                        value={data.compatibility}
                        onChange={(e) => updateData({ compatibility: e.target.value })}
                        className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Description *</Label>
                    <Textarea
                      placeholder="Describe what this code does, strategy details, features..."
                      value={data.codeDescription}
                      onChange={(e) => updateData({ codeDescription: e.target.value })}
                      className="mt-2 min-h-[80px] border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Code Preview/Snippet</Label>
                    <Textarea
                      placeholder="Paste your code here..."
                      value={data.codeSnippet}
                      onChange={(e) => updateData({ codeSnippet: e.target.value })}
                      className="mt-2 min-h-[200px] font-mono text-sm border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                  </div>
                </TabsContent>
              )}

              {/* Access/Price Tab */}
              <TabsContent value="access" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-[#C5C9D3]">Access Type</Label>
                  <Select 
                    value={data.accessType} 
                    onValueChange={(v) => updateData({ 
                      accessType: v as PriceType,
                      isPaid: v !== "free" 
                    })}
                  >
                    <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                      <SelectItem value="free" className="text-white">Free - Everyone can see</SelectItem>
                      <SelectItem value="pay-per-post" className="text-white">Pay-per-post - One-time payment</SelectItem>
                      <SelectItem value="subscribers-only" className="text-white">Subscribers only - Must subscribe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.accessType === "pay-per-post" && (
                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Price (USD)</Label>
                    <Input
                      type="number"
                      placeholder="2.99"
                      value={data.price}
                      onChange={(e) => updateData({ price: e.target.value })}
                      className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                    <div className="mt-1 text-xs text-[#6C7280]">
                      Recommended: $0.99 - $9.99 for individual posts
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-lg border border-[#1B1F27] bg-[#0A0D12] p-3">
                  <Switch
                    checked={data.verifiedOnly}
                    onCheckedChange={(v) => updateData({ verifiedOnly: v })}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-white">Verified users only</div>
                    <div className="text-xs text-[#6C7280]">Only verified accounts can view this post</div>
                  </div>
                </div>

                {data.isPaid && (
                  <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-400">
                      <Crown className="h-4 w-4" />
                      Paywall Preview
                    </div>
                    <div className="text-xs text-[#C5C9D3]">
                      Your teaser will be visible to everyone. Full content {data.accessType === "pay-per-post" ? `unlocks for $${data.price || "X.XX"}` : "is for subscribers only"}.
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Audience/Schedule Tab */}
              <TabsContent value="audience" className="mt-0 space-y-4">
                <div>
                  <Label className="text-sm text-[#C5C9D3]">Who can see this?</Label>
                  <Select value={data.visibility} onValueChange={(v) => updateData({ visibility: v as any })}>
                    <SelectTrigger className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-[#1B1F27] bg-[#0F131A]">
                      <SelectItem value="all" className="text-white">Everyone</SelectItem>
                      <SelectItem value="subscribers" className="text-white">Subscribers only</SelectItem>
                      <SelectItem value="followers" className="text-white">Followers only</SelectItem>
                      <SelectItem value="buyers" className="text-white">Buyers only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Schedule Date (Optional)</Label>
                    <Input
                      type="date"
                      value={data.scheduledDate}
                      onChange={(e) => updateData({ scheduledDate: e.target.value })}
                      className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-[#C5C9D3]">Time</Label>
                    <Input
                      type="time"
                      value={data.scheduledTime}
                      onChange={(e) => updateData({ scheduledTime: e.target.value })}
                      className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-[#C5C9D3]">Auto-expire after (days)</Label>
                  <Input
                    type="number"
                    placeholder="Leave empty for permanent"
                    value={data.expiryDays}
                    onChange={(e) => updateData({ expiryDays: e.target.value })}
                    className="mt-2 border-[#1B1F27] bg-[#0A0D12] text-white"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-[#1B1F27] bg-[#0A0D12] p-3">
                  <Switch
                    checked={data.commentsEnabled}
                    onCheckedChange={(v) => updateData({ commentsEnabled: v })}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-white">Enable comments</div>
                    <div className="text-xs text-[#6C7280]">Allow users to comment on this post</div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="border-t border-[#1B1F27] p-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 border-[#1B1F27]">
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 border-[#1B1F27] bg-[#0F131A]">
                  <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setPreviewMode("public")}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Public view
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setPreviewMode("subscriber")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Subscriber view
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setPreviewMode("buyer")}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Buyer view
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-[#1B1F27]"
                onClick={handleSaveDraft}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} className="border-[#1B1F27]">
                Cancel
              </Button>
              {data.scheduledDate && (
                <Button size="sm" className="gap-2 bg-purple-500 hover:bg-purple-600">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              )}
              <Button 
                size="sm" 
                className="gap-2 bg-blue-500 hover:bg-blue-600"
                onClick={handlePublish}
                disabled={!canPublish}
              >
                <Send className="h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function FeedTest() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedTab>("all");
  const [feedMode, setFeedMode] = useState<'recent' | 'hot'>('hot');
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
  const [searchQuery, setSearchQuery] = useState("");
  const [tickerSearch, setTickerSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(new Set(["@cryptowhale", "@marketnews"]));
  const [topAuthorsFollowing, setTopAuthorsFollowing] = useState<Set<string>>(new Set(["@cryptowhale"]));
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(["1", "3", "5"]));
  const [savedCategories, setSavedCategories] = useState<string[]>([]);

  // Composer state
  const [isAdvancedComposerOpen, setIsAdvancedComposerOpen] = useState(false);
  const [advancedComposerData, setAdvancedComposerData] = useState<Partial<ComposerData>>({});

  // New posts indicator state
  const [displayedPosts, setDisplayedPosts] = useState<Post[]>(MOCK_POSTS);
  const [newPostsCount, setNewPostsCount] = useState(0);

  const handleInlineComposerSubmit = async (blocks: ComposerBlockState[]) => {
    blocks.forEach((block, index) => {
      const trimmed = block.text.trim();
      if (!trimmed && block.media.length === 0) return;

      const newPost: Post = {
        id: `post-${Date.now()}-${index}`,
        author: {
          name: "You",
          handle: "@yourhandle",
          avatar: "https://i.pravatar.cc/120?img=1",
          verified: true,
          isPremium: false
        },
        timestamp: "now",
        type: block.media.length > 0 ? "video" : "analysis",
        text: trimmed,
        sentiment: "neutral",
        market: "crypto",
        price: "free",
        likes: 0,
        comments: 0,
        reposts: 0,
        views: 0,
      };

      setDisplayedPosts((prev) => [newPost, ...prev]);
    });
  };

  const activeConfig = useMemo(() => TABS_CONFIG[activeTab] || TABS_CONFIG.popular, [activeTab]);

  // Simulate new posts arriving
  useEffect(() => {
    const interval = setInterval(() => {
      setNewPostsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const loadNewPosts = () => {
    // In a real app, this would fetch from an API
    // For demo, we'll just reset the counter and scroll to top
    setNewPostsCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFollow = (handle: string) => {
    setFollowingAuthors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(handle)) {
        newSet.delete(handle);
      } else {
        newSet.add(handle);
      }
      return newSet;
    });
  };

  const handlePostClick = (postId: string) => {
    const post = displayedPosts.find(p => p.id === postId);
    navigate(`/home/post/${postId}`, { state: post });
  };

  const toggleTopAuthorFollow = (handle: string) => {
    setTopAuthorsFollowing(prev => {
      const newSet = new Set(prev);
      if (newSet.has(handle)) {
        newSet.delete(handle);
      } else {
        newSet.add(handle);
      }
      return newSet;
    });
  };

  const applyPreset = (preset: typeof SIGNAL_PRESETS[0]) => {
    setFilters(prev => ({ ...prev, ...preset.config }));
    setActivePreset(preset.key);
  };

  const saveCurrentCategory = () => {
    if (filters.category && !savedCategories.includes(filters.category)) {
      setSavedCategories(prev => [...prev, filters.category]);
    }
  };

  const removeSavedCategory = (category: string) => {
    setSavedCategories(prev => prev.filter(c => c !== category));
  };

  const handleExpandComposer = useCallback((data: Partial<ComposerData>) => {
    setAdvancedComposerData(data);
    setIsAdvancedComposerOpen(true);
  }, []);

  const filteredPosts = useMemo(() => {
    let posts = [...displayedPosts];

    // Tab-specific filtering
    if (activeTab === "all") {
      // Show all posts, no tab filtering
    } else if (activeTab === "ideas") {
      posts = posts.filter(p => ['education', 'analysis', 'news'].includes(p.type));
    } else if (activeTab === "opinions") {
      posts = posts.filter(p => ['general', 'macro'].includes(p.type));
    } else if (activeTab === "analytics") {
      posts = posts.filter(p => ['analysis', 'macro', 'onchain'].includes(p.type));
    } else if (activeTab === "soft") {
      posts = posts.filter(p => p.type === "code");
    } else if (activeTab === "liked") {
      posts = posts.filter(p => likedPosts.has(p.id));
    }

    if (filters.market && filters.market !== "All") {
      posts = posts.filter(p => p.market?.toLowerCase() === filters.market.toLowerCase());
    }
    if (selectedCategories.length > 0) {
      posts = posts.filter(p => selectedCategories.some(cat => p.type === cat.toLowerCase()));
    }
    if (filters.sentiment && filters.sentiment !== "All") {
      posts = posts.filter(p => p.sentiment === filters.sentiment.toLowerCase());
    }
    if (filters.price && filters.price !== "All") {
      posts = posts.filter(p => p.price === filters.price.toLowerCase().replace(/ /g, "-"));
    }
    if (filters.direction) {
      posts = posts.filter(p => p.direction === filters.direction.toLowerCase());
    }
    if (filters.timeframe) {
      posts = posts.filter(p => p.timeframe === filters.timeframe);
    }
    if (filters.risk) {
      posts = posts.filter(p => p.risk === filters.risk.toLowerCase());
    }
    if (filters.verified) {
      posts = posts.filter(p => p.author.verified);
    }
    if (filters.freeOnly) {
      posts = posts.filter(p => p.price === "free");
    }
    if (filters.videoOnly) {
      posts = posts.filter(p => p.type === "video");
    }
    if (selectedTicker) {
      posts = posts.filter(p => p.ticker === selectedTicker);
    }
    if (filters.symbol) {
      const symbolQuery = filters.symbol.toUpperCase();
      posts = posts.filter(p => p.ticker?.toUpperCase().includes(symbolQuery));
    }

    // Apply feed mode sorting
    if (feedMode === 'hot') {
      posts = posts.sort((a, b) => (b.likes + b.views / 10) - (a.likes + a.views / 10));
    } else if (feedMode === 'recent') {
      // Sort by timestamp (assuming timestamp is a string like "2h ago", for real app use Date)
      // For now, reverse the array to show newest first
      posts = posts.reverse();
    }

    return posts;
  }, [activeTab, filters, selectedCategories, followingAuthors, selectedTicker, displayedPosts, feedMode, likedPosts]);

  const renderSignalCard = (post: Post) => {
    const isFollowing = followingAuthors.has(post.author.handle);
    const isPaidLocked = post.price !== "free";

    return (
      <div key={post.id} className="border-b border-[#5E5E5E] bg-[#000000] p-4 transition-colors hover:bg-[#0A0D12]">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1 pt-0.5">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-white">{post.author.name}</span>
                {post.author.verified && <Badge className="h-4 bg-blue-500/20 px-1 text-[10px] text-blue-400">���</Badge>}
                {post.author.verified && (
                  <Badge className="h-5 bg-blue-500/20 px-1.5 text-[10px] text-blue-400 rounded-md flex items-center gap-0.5">
                    <Check className="h-3 w-3" />
                  </Badge>
                )}
                {post.author.isPremium && (
                  <Badge className="h-5 bg-purple-500/20 px-1.5 text-[10px] text-purple-400 rounded-md flex items-center gap-0.5 font-semibold">
                    <Crown className="h-3 w-3" />
                  </Badge>
                )}
              </div>
                <span className="text-xs text-[#6C7280]">{post.author.handle}</span>
                <span className="text-xs text-[#6C7280]">•</span>
                <span className="text-xs text-[#6C7280]">{post.timestamp}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className="bg-green-500/20 text-[11px] font-semibold text-green-400 rounded-full">SIGNAL</Badge>
            <Button size="sm" variant={isFollowing ? "outline" : "default"} className={cn("h-7 gap-1 text-xs rounded-full", isFollowing ? "border-[#5E5E5E] bg-[#000000] text-[#C5C9D3] hover:bg-[#0A0D12]" : "bg-blue-500 hover:bg-blue-600")} onClick={() => toggleFollow(post.author.handle)}>
              {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className={cn("gap-1 px-2.5 py-1 rounded-full font-semibold", post.sentiment === "bullish" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
            {post.sentiment === "bullish" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {post.ticker}
          </Badge>
          <Badge className="bg-blue-500/20 px-2.5 py-1 text-blue-400 rounded-full font-semibold">{post.direction?.toUpperCase()}</Badge>
          <Badge className="bg-purple-500/20 px-2.5 py-1 text-purple-400 rounded-full font-semibold">{post.timeframe}</Badge>
          <Badge className={cn("px-2.5 py-1 rounded-full font-semibold", post.risk === "high" ? "bg-red-500/20 text-red-400" : post.risk === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")}>
            {post.risk?.toUpperCase()} RISK
          </Badge>
          {post.price === "pay-per-post" && (
            <Badge className="gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
              <DollarSign className="h-3 w-3" />
              Pay-per-post
            </Badge>
          )}
          {post.price === "subscribers-only" && (
            <Badge className="gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-400 rounded-full font-semibold">
              <Crown className="h-3 w-3" />
              Subscribers Only
            </Badge>
          )}
        </div>

        <div className="mb-3 flex items-center gap-4 rounded-xl border border-[#5E5E5E] bg-[#000000] p-3">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">Accuracy {post.accuracy}%</span>
          </div>
          <div className="text-sm text-[#6C7280]">·</div>
          <div className="text-sm text-[#6C7280]">{post.sampleSize} signals / 90d</div>
        </div>

        <p className={cn("mb-3 text-[15px] leading-relaxed text-[#E5E7EB]", isPaidLocked && "blur-sm select-none")}>{post.text}</p>

        {isPaidLocked ? (
          <div className="mb-3 relative rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <Lock className="mx-auto mb-2 h-8 w-8 text-purple-400" />
                <p className="mb-2 font-semibold text-white">Premium Content</p>
                <p className="mb-3 text-sm text-[#C5C9D3]">{post.price === "subscribers-only" ? "Subscribe to unlock" : "$2.99 one-time"}</p>
                <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full">
                  <Crown className="h-4 w-4" />
                  {post.price === "subscribers-only" ? "Subscribe" : "Buy Post"}
                </Button>
              </div>
            </div>
            <div className="blur-md">
              <div className="flex gap-4">
                <div><span className="text-xs text-[#6C7280]">Entry:</span> <span className="font-semibold text-white">$XXX</span></div>
                <div><span className="text-xs text-[#6C7280]">Stop:</span> <span className="font-semibold text-red-400">$XXX</span></div>
                <div><span className="text-xs text-[#6C7280]">TP:</span> <span className="font-semibold text-green-400">$XXX</span></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex gap-4 rounded-xl border border-[#5E5E5E] bg-[#000000] p-3">
            <div><span className="text-xs text-[#6C7280]">Entry</span> <span className="font-semibold text-white block">{post.entry}</span></div>
            <div><span className="text-xs text-[#6C7280]">Stop</span> <span className="font-semibold text-red-400 block">{post.stopLoss}</span></div>
            <div><span className="text-xs text-[#6C7280]">TP</span> <span className="font-semibold text-green-400 block">{post.takeProfit}</span></div>
          </div>
        )}

        {post.tags && <div className="mb-3 flex flex-wrap gap-2">{post.tags.map((tag, i) => <span key={i} className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 transition">{tag}</span>)}</div>}

        <div className="flex items-center gap-6 text-[#6C7280] border-t border-[#5E5E5E] pt-3 mt-3">
          <button className="flex items-center gap-1.5 transition hover:text-red-400 hover:scale-105"><Heart className="h-5 w-5" /><span className="text-sm font-medium">{post.likes}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-blue-400 hover:scale-105"><MessageCircle className="h-5 w-5" /><span className="text-sm font-medium">{post.comments}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-green-400 hover:scale-105"><Repeat2 className="h-5 w-5" /><span className="text-sm font-medium">{post.reposts}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-purple-400 hover:scale-105"><Bookmark className="h-5 w-5" /></button>
          <div className="ml-auto flex items-center gap-1.5 text-[#6C7280]"><Eye className="h-4 w-4" /><span className="text-sm font-medium">{post.views.toLocaleString()}</span></div>
        </div>
        <p className="mt-3 text-xs text-[#6C7280]">��️ Trading signals are educational. Not financial advice.</p>
      </div>
    );
  };

  const renderCodeCard = (post: Post) => {
    const isFollowing = followingAuthors.has(post.author.handle);
    const isPaidLocked = post.price !== "free";

    return (
      <div key={post.id} className="border-b border-[#5E5E5E] bg-[#000000] p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1 pt-0.5">
            <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.name[0]}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-white">{post.author.name}</span>
                {post.author.verified && <VerifiedBadge size={16} />}
                {post.author.handle ? (
                  <span className="text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
                ) : null}
                <span className="text-xs font-normal text-[#7C7C7C]">· {post.timestamp}</span>
              </div>
              <PostBadges
                postType="code"
                price={post.price || "free"}
                isPaidLocked={isPaidLocked}
                isFollowing={isFollowing}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant={isFollowing ? "outline" : "default"} className={cn("h-7 gap-1 text-xs rounded-full", isFollowing ? "border-[#5E5E5E] bg-[#000000] text-[#C5C9D3] hover:bg-[#0A0D12]" : "bg-blue-500 hover:bg-blue-600")} onClick={() => toggleFollow(post.author.handle)}>
              {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <p className="mb-3 text-[15px] text-[#E5E7EB]">{post.text}</p>

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge className="bg-[#000000] text-[#C5C9D3] border border-[#5E5E5E] rounded-full">{post.market}</Badge>
          <Badge className="bg-[#000000] text-[#C5C9D3] border border-[#5E5E5E] rounded-full">{post.language}</Badge>
          <Badge className="bg-[#000000] text-[#C5C9D3] border border-[#5E5E5E] rounded-full">Algo Trading</Badge>
        </div>

        <div className="mb-3 rounded-xl border border-[#5E5E5E] bg-[#000000] p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-semibold text-orange-400">Code Preview</span>
            </div>
            {isPaidLocked && <Badge className="bg-purple-500/20 text-[10px] text-purple-400 rounded-full">Premium</Badge>}
          </div>
          {isPaidLocked ? (
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-lg">
                <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <Crown className="h-4 w-4" />
                  Subscribe to unlock
                </Button>
              </div>
              <pre className="blur-md rounded-lg overflow-hidden"><code className="text-sm text-[#C5C9D3]">{post.codeSnippet}</code></pre>
            </div>
          ) : (
            <pre className="rounded-lg overflow-hidden bg-[#000000]"><code className="text-sm text-[#C5C9D3]">{post.codeSnippet}</code></pre>
          )}
        </div>

        {post.tags && <div className="mb-3 flex flex-wrap gap-2">{post.tags.map((tag, i) => <span key={i} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition">{tag}</span>)}</div>}

        <div className="flex items-center gap-6 text-[#6C7280] border-t border-[#5E5E5E] pt-3 mt-3">
          <button className="flex items-center gap-1.5 transition hover:text-red-400 hover:scale-105"><Heart className="h-5 w-5" /><span className="text-sm font-medium">{post.likes}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-blue-400 hover:scale-105"><MessageCircle className="h-5 w-5" /><span className="text-sm font-medium">{post.comments}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-green-400 hover:scale-105"><Repeat2 className="h-5 w-5" /><span className="text-sm font-medium">{post.reposts}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-purple-400 hover:scale-105"><Bookmark className="h-5 w-5" /></button>
          <div className="ml-auto flex items-center gap-1.5 text-[#6C7280]"><Eye className="h-4 w-4" /><span className="text-sm font-medium">{post.views.toLocaleString()}</span></div>
        </div>
      </div>
    );
  };

  const renderRegularPost = (post: Post) => {
    const isFollowing = followingAuthors.has(post.author.handle);
    const isPaidLocked = post.price !== "free";

    return (
      <div key={post.id} className="border-b border-[#5E5E5E] bg-[#000000] p-4">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="flex gap-3 flex-1 pt-0.5">
            <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={post.author.avatar} /><AvatarFallback>{post.author.name[0]}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-white">{post.author.name}</span>
                {post.author.verified && <VerifiedBadge size={16} />}
                {post.author.handle ? (
                  <span className="text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
                ) : null}
                <span className="text-xs font-normal text-[#7C7C7C]">· {post.timestamp}</span>
              </div>
              <PostBadges
                postType={post.type as any}
                price={post.price || "free"}
                isPaidLocked={isPaidLocked}
                isFollowing={isFollowing}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant={isFollowing ? "outline" : "default"} className={cn("h-7 gap-1 text-xs rounded-full", isFollowing ? "border-[#5E5E5E] bg-[#000000] text-[#C5C9D3] hover:bg-[#0A0D12]" : "bg-blue-500 hover:bg-blue-600")} onClick={() => toggleFollow(post.author.handle)}>
              {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        <div className={cn(isPaidLocked && "relative")}>
          {isPaidLocked && (
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <Lock className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                  <Crown className="mr-1 h-3 w-3" />
                  {post.price === "pay-per-post" ? "$2.99" : "Subscribe"}
                </Button>
              </div>
            </div>
          )}
          <p className={cn("mb-3 text-[15px] text-[#E5E7EB]", isPaidLocked && "blur-sm")}>{post.text}</p>
        </div>

        {post.tags && <div className="mb-3 flex flex-wrap gap-2">{post.tags.map((tag, i) => <span key={i} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition">{tag}</span>)}</div>}

        <div className="flex items-center gap-6 text-[#6C7280] border-t border-[#5E5E5E] pt-3 mt-3">
          <button className="flex items-center gap-1.5 transition hover:text-red-400 hover:scale-105"><Heart className="h-5 w-5" /><span className="text-sm font-medium">{post.likes}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-blue-400 hover:scale-105"><MessageCircle className="h-5 w-5" /><span className="text-sm font-medium">{post.comments}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-green-400 hover:scale-105"><Repeat2 className="h-5 w-5" /><span className="text-sm font-medium">{post.reposts}</span></button>
          <button className="flex items-center gap-1.5 transition hover:text-purple-400 hover:scale-105"><Bookmark className="h-5 w-5" /></button>
          <div className="ml-auto flex items-center gap-1.5 text-[#6C7280]"><Eye className="h-4 w-4" /><span className="text-sm font-medium">{post.views.toLocaleString()}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full gap-6">
      <div className="flex-1 max-w-[720px]">
        {/* Quick Composer */}
        <div className="mb-4 rounded-2xl border border-[#5E5E5E] bg-[#000000] p-4">
          <QuickComposer onExpand={handleExpandComposer} />
        </div>

        {/* Feed Tabs & Filters Section */}
        <div
          className="sticky top-0 z-30 -mx-2 sm:-mx-4 md:-mx-6 px-2 sm:px-4 md:px-6"
          style={{
            backgroundColor: "#000000",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          {/* Tabs */}
          <div className="mb-3 flex items-center overflow-x-auto rounded-full border border-[#5E5E5E] bg-[#000000] p-0.5">
            {FEED_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const isAllTab = tab.key === 'all';
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tab.key)}
                  className={`${isAllTab ? 'flex-none min-w-[60px]' : 'flex-1 min-w-[120px]'} px-3 py-0.75 text-xs font-semibold leading-tight transition-all duration-300 sm:px-4 sm:py-1 sm:text-sm relative group ${
                    isActive
                      ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1),inset_0_0_12px_rgba(0,0,0,0.3)]"
                      : "rounded-full text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20 hover:shadow-[0_8px_20px_-12px_rgba(160,106,255,0.5)]"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Icon className={`h-4 w-4 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
                    <span className={isAllTab ? "inline" : "hidden sm:inline"}>{tab.label}</span>
                  </span>
                  {/* Underline animation for inactive tabs - fade from center */}
                  {!isActive && (
                    <div className="absolute bottom-0 left-1/2 h-0.5 w-0 rounded-full transform -translate-x-1/2 group-hover:w-3/4 transition-all duration-300"
                         style={{
                           background: 'linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)'
                         }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters and Toggle Layout */}
          <div className="flex items-end justify-between gap-3">
            {/* Filters */}
            <div className="flex items-end gap-3 flex-wrap flex-1">
              {/* Market Filter */}
              {activeConfig?.visible?.includes('market') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Рынок
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#5E5E5E] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                      >
                        <span className="truncate">{filters.market || 'All'}</span>
                        <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={10}
                      className="w-[240px] rounded-[18px] border border-[#1B1F27]/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                    >
                      <div className="grid gap-1.5 text-[12px]">
                        {FILTERS_CONFIG.market.opts.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateFilter('market', opt)}
                            className={cn(
                              "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                              filters.market === opt
                                ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                            )}
                          >
                            <span className="truncate">{opt}</span>
                            {filters.market === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Price Filter */}
              {activeConfig?.visible?.includes('price') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Цена
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#5E5E5E] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                      >
                        <span className="truncate">{filters.price || 'All'}</span>
                        <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={10}
                      className="w-[240px] rounded-[18px] border border-[#1B1F27]/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                    >
                      <div className="grid gap-1.5 text-[12px]">
                        {FILTERS_CONFIG.price.opts.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateFilter('price', opt)}
                            className={cn(
                              "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                              filters.price === opt
                                ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                            )}
                          >
                            <span className="truncate">{opt}</span>
                            {filters.price === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Period and Category Filters - side by side */}
              <div className="flex items-end gap-3">
                {/* Period Filter */}
                {activeConfig?.visible?.includes('period') && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Период
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#5E5E5E] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                        >
                          <span className="truncate">{filters.period || 'All time'}</span>
                          <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={10}
                        className="w-[240px] rounded-[18px] border border-[#1B1F27]/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                      >
                        <div className="grid gap-1.5 text-[12px]">
                          {FILTERS_CONFIG.period.opts.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateFilter('period', opt)}
                              className={cn(
                                "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                                filters.period === opt
                                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                  : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                              )}
                            >
                              <span className="truncate">{opt}</span>
                              {filters.period === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {/* Category Filter */}
                {activeConfig?.visible?.includes('category') && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      Category
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#5E5E5E] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430]"
                        >
                          <span className="truncate">{filters.category || 'All'}</span>
                          <ChevronDown className="h-4 w-4 text-[#C4C7D4]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={10}
                        className="w-[240px] rounded-[18px] border border-[#1B1F27]/70 bg-[#0F131A]/95 p-3 text-white shadow-[0_18px_36px_-24px_rgba(12,16,20,0.9)] backdrop-blur-xl"
                      >
                        <div className="grid gap-1.5 text-[12px]">
                          <button
                            type="button"
                            onClick={() => updateFilter('category', undefined)}
                            className={cn(
                              "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                              !filters.category
                                ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                            )}
                          >
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2F3336]/60 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                              All
                            </span>
                            <span className="truncate">All</span>
                            {!filters.category ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                          </button>
                          {FILTERS_CONFIG.category.opts.map((opt) => {
                            const config = CATEGORY_CONFIG_MAP[opt];
                            const IconComponent = config?.icon || Sparkles;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => updateFilter('category', opt)}
                                className={cn(
                                  "flex items-center gap-2 rounded-[14px] border px-3 py-1.5 text-left font-medium transition-colors",
                                  filters.category === opt
                                    ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                                    : "border-transparent bg-white/5 text-[#C4C7D4] hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70",
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex h-6 w-6 items-center justify-center rounded-lg flex-shrink-0",
                                    filters.category === opt ? config?.badgeClassName ?? "bg-[#2F3336] text-white/70" : "bg-[#2F3336] text-white/70",
                                  )}
                                >
                                  <IconComponent
                                    className="h-3.5 w-3.5"
                                    style={{ color: config?.color }}
                                  />
                                </span>
                                <span
                                  className="truncate"
                                  style={{ color: filters.category === opt && config?.color ? config.color : undefined }}
                                >
                                  {opt}
                                </span>
                                {filters.category === opt ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                              </button>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>

              {/* Symbol/Pair Filter */}
              {activeConfig?.visible?.includes('symbol') && (
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Пара/Актив
                  </label>
                  <input
                    type="text"
                    placeholder="BTC, AAPL..."
                    value={filters.symbol || ''}
                    onChange={(e) => updateFilter('symbol', e.target.value)}
                    className="h-[26px] w-[140px] rounded-[24px] border border-[#5E5E5E] bg-[#000000] px-3 text-[12px] font-semibold text-[#D5D8E1] placeholder-[#6B7280] transition-colors hover:border-[#A06AFF]/50 hover:bg-[#1C1430] focus:border-[#A06AFF]/70 focus:outline-none focus:bg-[#1C1430]"
                  />
                </div>
              )}

              {/* Verified Authors Toggle */}
              {activeConfig?.visible?.includes('verified') && (
                <button
                  type="button"
                  onClick={() => updateFilter('verified', !filters.verified)}
                  className={cn(
                    "inline-flex h-[26px] items-center gap-2 rounded-[24px] border px-3 text-[11px] font-semibold transition-colors",
                    filters.verified
                      ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                      : "border-[#5E5E5E] bg-[#0C1014]/55 text-[#D5D8E1] backdrop-blur-[36px] hover:border-[#A06AFF]/50 hover:bg-[#120F1D]/60"
                  )}
                >
                  <VerifiedBadge size={14} />
                  Verified
                </button>
              )}

              {/* Save Filter Button */}
              {filters.category && !savedCategories.includes(filters.category) && (
                <button
                  type="button"
                  onClick={saveCurrentCategory}
                  className="inline-flex h-[26px] items-center gap-2 rounded-[24px] border border-[#2EBD85]/50 bg-[#2EBD85]/10 px-3 text-[11px] font-semibold text-[#2EBD85] transition-colors hover:border-[#2EBD85] hover:bg-[#2EBD85]/20"
                >
                  <Save className="h-3.5 w-3.5" />
                  Сохранить фильтр
                </button>
              )}

            </div>

            {/* Feed Mode Toggle - positioned on the right */}
            <div className="inline-flex items-center rounded-full border border-[#5E5E5E] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] p-0.5 mb-0.5">
              <button
                type="button"
                onClick={() => setFeedMode('recent')}
                className={cn(
                  "flex items-center justify-center w-[28px] h-[28px] rounded-full transition-all duration-200",
                  feedMode === 'recent'
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-lg shadow-purple-500/40"
                    : "text-[#A0AEC0] hover:text-white"
                )}
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setFeedMode('hot')}
                className={cn(
                  "flex items-center justify-center w-[28px] h-[28px] rounded-full transition-all duration-200",
                  feedMode === 'hot'
                    ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-lg shadow-purple-500/40"
                    : "text-[#A0AEC0] hover:text-white"
                )}
              >
                <Flame className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* New Posts Indicator */}
        {newPostsCount > 0 && (
          <div className="mt-6 mb-3">
            <button
              onClick={loadNewPosts}
              className="mx-auto flex items-center justify-center gap-1.5 group px-4 py-2 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:from-[#B47FFF] hover:to-[#5A2FA5] transition-all duration-300 shadow-lg hover:shadow-xl shadow-purple-500/30"
            >
              <div className="flex items-center justify-center">
                <div className="relative h-1.5 w-1.5">
                  <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
                  <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75" />
                </div>
              </div>
              <span className="font-bold text-white text-xs sm:text-sm group-hover:text-white transition">
                {newPostsCount} new
              </span>
              <ChevronUp className="h-3 w-3 text-white group-hover:text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Posts Feed */}
        <ContinuousFeedTimeline
          posts={filteredPosts}
          onFollowToggle={(handle, isFollowing) => toggleFollow(handle)}
          onPostClick={handlePostClick}
        />
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-[340px] space-y-4">
        {/* Мои рубрики */}
        <section className="rounded-[24px] border border-[#5E5E5E] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
          <h3 className="text-lg font-semibold text-white">My Categories</h3>
          {savedCategories.length === 0 ? (
            <p className="mt-2 text-sm text-[#A3A6B4]">
              You haven't saved any preferences yet. Choose categories in the filters and save them.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {savedCategories.map((category) => {
                const config = CATEGORY_CONFIG_MAP[category];
                const IconComponent = config?.icon || Sparkles;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => updateFilter('category', category)}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl border border-[#5E5E5E] bg-white/5 px-4 py-3 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10",
                      filters.category === category && "border-[#A06AFF]/70 bg-[#A06AFF]/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0",
                          config?.badgeClassName ?? "bg-[#2F3336] text-white/70"
                        )}
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: config?.color }}
                        />
                      </span>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: config?.color || '#FFFFFF' }}
                      >
                        {category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSavedCategory(category);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8E92A0] hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Top Authors */}
        <div className="rounded-2xl border border-[#5E5E5E] bg-[#000000] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Users className="h-5 w-5 text-purple-400" />
            Top Authors
          </h3>
          <div className="space-y-3">
            {TOP_AUTHORS.map((author, idx) => {
              const isFollowing = topAuthorsFollowing.has(author.handle);
              return (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <UserHoverCard
                    author={{
                      name: author.name,
                      handle: author.handle,
                      avatar: author.avatar,
                      verified: false,
                      followers: author.followers,
                      following: Math.floor(Math.random() * 2000) + 100,
                      bio: "Top cryptocurrency trader and analyst",
                    }}
                    isFollowing={isFollowing}
                    onFollowToggle={() => toggleTopAuthorFollow(author.handle)}
                    showFollowButton={true}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{author.name}</div>
                        <div className="text-sm text-[#6C7280] truncate">{author.handle}</div>
                      </div>
                    </div>
                  </UserHoverCard>
                  <FollowButton
                    profileId={author.handle}
                    size="compact"
                    isFollowing={isFollowing}
                    onToggle={() => toggleTopAuthorFollow(author.handle)}
                    stopPropagation
                  />
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
          >
            View More
          </button>
        </div>

        {/* Fear & Greed Index Widget */}
        <FearGreedWidget score={32} />

        {/* Community Sentiment Widget */}
        <CommunitySentimentWidget bullishPercent={82} votesText="1.9M votes" />

        {/* Trending Tickers */}
        <div className="rounded-2xl border border-[#5E5E5E] bg-[#000000] p-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <Activity className="h-5 w-5 text-blue-400" />
            Trending Tickers
          </h3>
          <div className="space-y-3">
            {TRENDING_TICKERS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedTicker(item.ticker)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg p-2 transition",
                  selectedTicker === item.ticker ? "bg-blue-500/20" : "hover:bg-[#1B1F27]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.ticker}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {item.sentiment === "bullish" ? (
                      <ChevronUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-rose-400" />
                    )}
                    <span className={cn(
                      "text-sm font-semibold",
                      item.sentiment === "bullish" ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {item.change}
                    </span>
                  </div>
                  <span className="text-xs text-[#6C7280]">{item.mentions}</span>
                </div>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
          >
            View More
          </button>
        </div>

        {/* Social Widgets from x_Home */}
        <SuggestedProfilesWidget profiles={DEFAULT_SUGGESTED_PROFILES} />
        <NewsWidget items={DEFAULT_NEWS_ITEMS as NewsItem[]} />
        <FollowRecommendationsWidget profiles={DEFAULT_SUGGESTED_PROFILES} />

      </div>
    </div>
  );
}
