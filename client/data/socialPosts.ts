export type TabType = "popular" | "editors" | "foryou" | "following" | "signals";
export type FilterType = "all" | "video";
export type SentimentType = "bullish" | "bearish";
export type SocialPostType = "video" | "article";

export interface SocialAuthor {
  name: string;
  avatar: string;
  handle?: string;
  verified?: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  isCurrentUser?: boolean;
}

export interface SocialPost {
  id: string;
  type: SocialPostType;
  author: SocialAuthor;
  timestamp: string;
  title: string;
  category?: string;
  preview?: string;
  body?: string;
  videoUrl?: string;
  mediaUrl?: string;
  sentiment: SentimentType;
  likes: number;
  comments: number;
  isFollowing?: boolean;
  hashtags?: string[];
  views?: number;
  isPremium?: boolean;
  price?: number;
  subscriptionPrice?: number;
  unlocked?: boolean;
  audience?: "followers" | "everyone";
}

export const socialPosts: SocialPost[] = [
  {
    id: "tyrian-long-post",
    type: "article",
    author: {
      name: "Tyrian Trade",
      avatar: "https://i.pravatar.cc/120?img=45",
      handle: "@TyrianTrade",
      verified: true,
      bio: "Macro-focused trading desk delivering distilled hedge fund tactics.",
      followers: 128400,
      following: 412,
      isCurrentUser: true,
    },
    timestamp: "30 minutes ago",
    title: "The Psychology of Professional Trading: What Separates Winners from Losers",
    preview: "A deep dive into the mental frameworks that distinguish consistently profitable traders from those who struggle.",
    body: "Trading psychology is often dismissed as soft science, but it's the single biggest determinant of long-term success. Technical skills and market knowledge are necessary, but not sufficient. The difference between winning and losing traders comes down to mental discipline.\n\nConsider this: most traders know the basics. They understand support and resistance, moving averages, and risk management principles. Yet 90% still lose money. Why? Because knowledge doesn't translate to execution under pressure.\n\nProfessional traders develop three core psychological skills that amateurs lack:\n\n1. Emotional detachment from individual trades. Pros view trading as a probability game played over thousands of iterations. A single loss means nothing. Amateurs get emotionally invested in each position, leading to revenge trading and position sizing errors.\n\n2. Systematic decision-making under uncertainty. Markets are inherently uncertain, yet our brains crave certainty. Pros embrace probabilistic thinking. They're comfortable taking trades with 60% win rates, knowing losses are part of the process. Amateurs seek certainty, falling victim to prediction addiction.\n\n3. Self-awareness and adaptive learning. Winners constantly analyze their performance, identifying cognitive biases and behavioral patterns. They keep detailed journals, review mistakes, and adjust. Losers blame external factors and repeat the same errors.\n\nThe most insidious psychological trap is overconfidence after winning streaks. When you hit a hot streak, your brain releases dopamine, creating a biochemical feedback loop that encourages risk-taking. This is when amateurs blow up their accounts. Professionals recognize this pattern and actually reduce position sizes during hot streaks.\n\nAnother critical insight: your trading style must match your personality. If you're naturally anxious, day trading will destroy you. If you're impatient, swing trading won't work. Self-awareness about your psychological makeup determines which strategies you can actually execute consistently.\n\nThe bottom line: master your mind before you can master the markets. No strategy works if you can't execute it with discipline.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2F528e6e1f2fd14ced880f4b37bf7d1a52?format=webp&width=800",
    sentiment: "bullish",
    category: "Education",
    likes: 892,
    comments: 147,
    views: 18500,
    hashtags: ["TradingPsychology", "MentalGame", "ProfessionalTrading"],
  },
  {
    id: "tyrian-premium-1",
    type: "article",
    author: {
      name: "Tyrian Trade",
      avatar: "https://i.pravatar.cc/120?img=45",
      handle: "@TyrianTrade",
      verified: true,
      bio: "Macro-focused trading desk delivering distilled hedge fund tactics.",
      followers: 128400,
      following: 412,
      isCurrentUser: true,
    },
    timestamp: "2 hours ago",
    title: "How Market Makers Influence Stock Prices and Liquidity",
    preview: "Understanding the role of market makers in financial markets and their impact on price discovery.",
    body: "Market makers play a crucial role in ensuring liquidity in financial markets. They continuously provide buy and sell quotes, making it easier for traders to execute orders without significant price impact.\n\nBy maintaining tight bid-ask spreads, market makers reduce trading costs for all participants. Their inventory management strategies directly influence short-term price movements and volatility patterns.\n\nIn modern electronic markets, high-frequency trading firms have become dominant market makers, using sophisticated algorithms to manage risk and capture spread profits. Understanding their behavior is essential for any serious trader looking to navigate institutional-grade markets.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2F528e6e1f2fd14ced880f4b37bf7d1a52?format=webp&width=800",
    sentiment: "bullish",
    category: "Premium Education",
    likes: 482,
    comments: 63,
    views: 12800,
    isPremium: true,
    price: 9,
    subscriptionPrice: 29,
    unlocked: false,
    audience: "followers",
    hashtags: ["MarketMakers", "Liquidity", "TradingEducation"],
  },
  {
    id: "tyrian-premium-2",
    type: "article",
    author: {
      name: "Tyrian Trade",
      avatar: "https://i.pravatar.cc/120?img=45",
      handle: "@TyrianTrade",
      verified: true,
      bio: "Macro-focused trading desk delivering distilled hedge fund tactics.",
      followers: 128400,
      following: 412,
      isCurrentUser: true,
    },
    timestamp: "Yesterday",
    title: "How Trading Algorithms Emerged",
    preview: "The evolution of algorithmic trading from simple automation to sophisticated AI-driven strategies.",
    body: "Trading algorithms have revolutionized financial markets over the past three decades. What started as simple rule-based systems has evolved into complex machine learning models capable of processing millions of data points per second.\n\nThe first wave of algorithmic trading emerged in the 1980s with program trading, where computers executed large basket orders. The second wave came with high-frequency trading in the 2000s, leveraging low-latency infrastructure and co-location.\n\nToday, we're witnessing the third wave: AI-driven adaptive algorithms that learn from market microstructure, sentiment analysis, and alternative data sources. These systems can identify patterns invisible to human traders and adjust strategies in real-time based on changing market conditions.\n\nUnderstanding this evolution is crucial for modern traders. Even retail participants now have access to algorithmic tools that were once exclusive to institutional players. The key is knowing how to use them effectively without over-relying on automation.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2F4f8899be94ba4b6a8ed27ed98043f01e?format=webp&width=800",
    sentiment: "bullish",
    category: "Premium Education",
    likes: 610,
    comments: 104,
    views: 15400,
    isPremium: true,
    price: 12,
    subscriptionPrice: 39,
    unlocked: false,
    audience: "followers",
    hashtags: ["AlgoTrading", "AI", "TradingTech"],
  },
  {
    id: "crypto-video",
    type: "video",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=18",
      handle: "@johncrypto",
      verified: true,
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "January 31, 5:10 PM",
    title: "New Tools for Crypto Analytics",
    preview: "Short teaser about our upcoming analytics dashboard launch.",
    videoUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/e4b8b038e464896411fd0b568f4594d8cfdf3453?width=2086",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    isFollowing: false,
    hashtags: ["MacroInvesting", "SmartTrading", "HedgeFundTactics"],
  },
  {
    id: "john-premium-1",
    type: "article",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=18",
      handle: "@johncrypto",
      verified: true,
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "3 hours ago",
    title: "Bulls vs. Bears: What Does the Financial World Have to Do With It?",
    preview: "Exploring the origins and meaning of market terminology that shapes our understanding of financial cycles.",
    body: "The terms 'bulls' and 'bears' are deeply embedded in financial culture, but few traders know their true origins. These animal metaphors date back to 18th-century London markets, where bearskin jobbers would sell pelts they didn't yet own, hoping to buy them cheaper later — the original short sellers.\n\nBulls got their name from the way they attack: thrusting their horns upward. Bears, conversely, swipe their paws downward. This simple visual became the foundation for describing market direction.\n\nBut there's more to it than linguistics. Bull and bear markets represent fundamentally different investor psychology. Bulls are driven by optimism, FOMO, and expanding valuations. Bears emerge from fear, deleveraging, and flight to safety.\n\nUnderstanding these cycles isn't just academic — it's practical. Professional traders use sentiment indicators to identify when markets transition from one regime to another. Recognizing early signs of a regime change can be the difference between capturing a trend and getting caught in a reversal.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2Fba380dde37124530aa837834b7740c85?format=webp&width=800",
    sentiment: "bullish",
    category: "Premium Education",
    likes: 845,
    comments: 121,
    views: 19200,
    isPremium: true,
    price: 15,
    subscriptionPrice: 45,
    unlocked: false,
    audience: "everyone",
    hashtags: ["MarketPsychology", "Trading", "FinancialHistory"],
  },
  {
    id: "crypto-video-long",
    type: "video",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=27",
      handle: "@johncrypto",
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "January 31, 5:10 PM",
    title: "New Tools for Crypto Analytics",
    preview:
      "On the other hand, the continued development of various activities significantly drives the creation of new strategic directions.",
    body: "On the other hand, the continued development of various activities significantly drives the creation of new strategic directions. In this context, introducing a new organizational model serves as a valuable experiment in testing growth frameworks. High-level strategic thinking, along with the strengthening and evolution of internal structures, plays a key role in shaping effective training systems that address current workforce needs.\n\nOur broad and diverse experience — supported by ongoing communication and outreach — helps lay the groundwork for inclusive, large-scale participation. At the same time, it's important to recognize that effective training enables a wider range of professionals to actively shape their roles and responsibilities in meeting organizational goals.",
    videoUrl:
      "https://api.builder.io/api/v1/image/assets/TEMP/e4b8b038e464896411fd0b568f4594d8cfdf3453?width=2086",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    isFollowing: true,
    hashtags: ["MacroInvesting", "SmartTrading", "HedgeFundTactics"],
  },
  {
    id: "ai-article",
    type: "article",
    author: {
      name: "Tyrian Trade",
      avatar: "https://i.pravatar.cc/120?img=45",
      handle: "@TyrianTrade",
      verified: true,
      bio: "Macro-focused trading desk delivering distilled hedge fund tactics.",
      followers: 128400,
      following: 412,
      isCurrentUser: true,
    },
    category: "Idea",
    timestamp: "5:01 AM · Oct 8, 2025",
    title: "FIRE: How Living With Less Can Help You Retire Sooner",
    preview:
      "The Financial Independence, Retire Early movement has transformed how millennials think about money, work, and freedom.",
    body: "FIRE (Financial Independence, Retire Early) isn't just a trend — it's a fundamental rethinking of the traditional work-until-65 model. The core principle is simple: maximize savings rate, minimize expenses, and invest the difference aggressively.\n\nThe math is compelling. If you can save 50% of your income and invest it in index funds returning 7% annually, you can retire in roughly 17 years. Increase that to 70%, and you're looking at under 9 years. The key variable isn't how much you earn — it's how much you keep.\n\nBut FIRE isn't about deprivation. It's about intentionality. Practitioners focus spending on what truly matters while cutting ruthlessly on status symbols and lifestyle inflation. The goal isn't to live like a monk — it's to buy back your time.\n\nCritics argue FIRE ignores healthcare costs, market volatility, and the psychological challenges of early retirement. Valid points. But the movement has evolved. Modern FIRE advocates emphasize 'Coast FIRE' (working part-time) and 'Barista FIRE' (maintaining minimal income for benefits) as more sustainable paths.\n\nWhether you pursue full FIRE or just adopt its principles, the underlying lesson is powerful: your relationship with money determines your freedom. High earners who spend everything remain trapped. Modest earners who save aggressively gain options.\n\nThe real question isn't 'Can I retire at 40?' It's 'What would I do with my life if money weren't a constraint?' Answer that, and FIRE becomes a tool for designing the life you actually want.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2F533007ae98e24a37abb331beea55d988?format=webp&width=800",
    sentiment: "bullish",
    likes: 1500,
    comments: 563,
    hashtags: ["FIRE", "FinancialFreedom", "PersonalFinance"],
    views: 5,
  },
  {
    id: "johncrypto-premium-2",
    type: "article",
    author: {
      name: "John Smith",
      avatar: "https://i.pravatar.cc/120?img=18",
      handle: "@johncrypto",
      verified: true,
      bio: "Market strategist sharing actionable insights on digital assets.",
      followers: 405800,
      following: 253,
    },
    timestamp: "2 days ago",
    title: "The Best Trades by George Soros",
    preview: "Analyzing the legendary trades that made Soros one of history's greatest speculators.",
    body: "George Soros is best known for 'breaking the Bank of England' in 1992, earning $1 billion in a single day by shorting the British pound. But this trade wasn't luck — it was the culmination of deep macroeconomic analysis and conviction.\n\nSoros identified a fundamental misalignment: the UK was trying to maintain an artificially high currency peg while its economy weakened. He bet that political pressure would force a devaluation. When it happened, his fund made history.\n\nBut Soros's genius extends beyond this single trade. His investments in Asian currencies during the 1997 crisis, his tech bets in the late 90s, and his contrarian plays during 2008 all share common traits: asymmetric risk/reward, macroeconomic catalysts, and willingness to act on conviction.\n\nThe lesson for modern traders isn't to copy his trades — it's to adopt his framework. Study macro fundamentals. Identify structural imbalances. Wait for catalysts. Size positions appropriately. And most importantly, have the courage to act when your analysis says the market is wrong.",
    mediaUrl:
      "https://cdn.builder.io/api/v1/image/assets%2Fc1dd850bb9274af09e30dc23d6b4a456%2F4273816a83704eb3a0cad2ae05bdbf04?format=webp&width=800",
    sentiment: "bullish",
    category: "Premium Analysis",
    likes: 188,
    comments: 35,
    views: 5400,
    isPremium: true,
    price: 15,
    subscriptionPrice: 45,
    unlocked: false,
    audience: "followers",
    hashtags: ["Soros", "MacroTrading", "LegendaryTrades"],
  },
];

export const getSocialPostById = (id: string): SocialPost | undefined =>
  socialPosts.find((post) => post.id === id);
