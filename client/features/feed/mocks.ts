// features/feed/mocks.ts
import type { Post, SentimentType, ComposerData } from "./types";

export const MOCK_POSTS: Post[] = [
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
  }
];

export const TRENDING_TICKERS = [
  { ticker: "$AAPL", change: "+2.4%", sentiment: "bullish" as SentimentType, mentions: "1.2K" },
  { ticker: "$TSLA", change: "-1.2%", sentiment: "bearish" as SentimentType, mentions: "987" },
  { ticker: "$BTC", change: "+5.6%", sentiment: "bullish" as SentimentType, mentions: "2.3K" },
  { ticker: "$ETH", change: "+3.8%", sentiment: "bullish" as SentimentType, mentions: "1.6K" },
  { ticker: "$NVDA", change: "+4.2%", sentiment: "bullish" as SentimentType, mentions: "890" }
];

export const TOP_AUTHORS = [
  { name: "Alex Trader", handle: "@alextrader", avatar: "https://i.pravatar.cc/120?img=12", followers: "45.2K", isFollowing: false },
  { name: "Crypto Whale", handle: "@cryptowhale", avatar: "https://i.pravatar.cc/120?img=33", followers: "38.5K", isFollowing: true },
  { name: "Algo Dev", handle: "@algodev", avatar: "https://i.pravatar.cc/120?img=25", followers: "32.1K", isFollowing: false }
];

export const INITIAL_COMPOSER_STATE: ComposerData = {
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
