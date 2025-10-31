import type { SocialProfileData } from "./socialProfile";

export interface User extends SocialProfileData {
  // Additional user fields for future backend integration
  isVerified?: boolean;
  isPremium?: boolean;
}

// Current logged-in user
export const CURRENT_USER_ID = "tyrian-trade";

export const users: Record<string, User> = {
  "tyrian-trade": {
    id: "tyrian-trade",
    name: "Tyrian Trade",
    username: "tyrian_trade",
    bio: "Аналитика рынков, алгоритмические сделки и макроэкономика в формате коротких постов.",
    location: "Dubai, UAE",
    website: {
      label: "tyrian.trade",
      url: "https://tyrian.trade",
    },
    joined: "Март 2021",
    avatar: "https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500",
    cover: "https://api.builder.io/api/v1/image/assets/TEMP/df14e9248350a32d57d5b54a31308a2e855bb11e?width=2118",
    stats: {
      tweets: 1480,
      following: 312,
      followers: 28400,
      likes: 9620,
    },
    isVerified: true,
    isPremium: true,
    highlightedPostId: "ai-article",
  },

  "crypto_analyst": {
    id: "crypto_analyst",
    name: "Alex Morrison",
    username: "crypto_analyst",
    bio: "Crypto market analyst | Bitcoin maximalist | Not financial advice",
    location: "New York, USA",
    website: {
      label: "cryptoanalysis.io",
      url: "https://cryptoanalysis.io",
    },
    joined: "Январь 2020",
    avatar: "https://i.pravatar.cc/400?img=12",
    cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1400&h=400&fit=crop",
    stats: {
      tweets: 3420,
      following: 890,
      followers: 45200,
      likes: 12300,
    },
    isVerified: true,
    isPremium: true,
  },

  "ai_researcher": {
    id: "ai_researcher",
    name: "Dr. Sarah Chen",
    username: "ai_researcher",
    bio: "AI/ML Researcher at Stanford | Focusing on LLMs and neural networks | She/Her",
    location: "Palo Alto, CA",
    website: {
      label: "sarahchen.ai",
      url: "https://sarahchen.ai",
    },
    joined: "Февраль 2019",
    avatar: "https://i.pravatar.cc/400?img=5",
    cover: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&h=400&fit=crop",
    stats: {
      tweets: 2100,
      following: 450,
      followers: 67800,
      likes: 8900,
    },
    isVerified: true,
    isPremium: true,
  },

  "market_oracle": {
    id: "market_oracle",
    name: "Marcus Webb",
    username: "market_oracle",
    bio: "Stock market predictions | Trading signals | 15 years on Wall Street",
    location: "London, UK",
    joined: "Апрель 2020",
    avatar: "https://i.pravatar.cc/400?img=33",
    cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&h=400&fit=crop",
    stats: {
      tweets: 5600,
      following: 234,
      followers: 92300,
      likes: 15600,
    },
    isVerified: true,
  },

  "defi_builder": {
    id: "defi_builder",
    name: "Elena Rodriguez",
    username: "defi_builder",
    bio: "Building the future of DeFi | Smart contract developer | Ethereum enthusiast",
    location: "Berlin, Germany",
    website: {
      label: "github.com/elenadev",
      url: "https://github.com/elenadev",
    },
    joined: "Июнь 2021",
    avatar: "https://i.pravatar.cc/400?img=9",
    cover: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1400&h=400&fit=crop",
    stats: {
      tweets: 1890,
      following: 567,
      followers: 34500,
      likes: 4300,
    },
    isVerified: true,
    isPremium: true,
  },

  "tech_insider": {
    id: "tech_insider",
    name: "James Liu",
    username: "tech_insider",
    bio: "Tech journalist | Silicon Valley insider | Writing about startups and innovation",
    location: "San Francisco, CA",
    website: {
      label: "techinsider.com",
      url: "https://techinsider.com",
    },
    joined: "Сентябрь 2018",
    avatar: "https://i.pravatar.cc/400?img=15",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=400&fit=crop",
    stats: {
      tweets: 8900,
      following: 1200,
      followers: 156000,
      likes: 23400,
    },
    isVerified: true,
  },

  "nft_collector": {
    id: "nft_collector",
    name: "Maya Santos",
    username: "nft_collector",
    bio: "NFT collector & digital artist | Building web3 communities",
    location: "Miami, FL",
    joined: "Май 2021",
    avatar: "https://i.pravatar.cc/400?img=20",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=400&fit=crop",
    stats: {
      tweets: 2300,
      following: 890,
      followers: 28900,
      likes: 6700,
    },
    isPremium: true,
  },

  "quant_trader": {
    id: "quant_trader",
    name: "Dmitry Volkov",
    username: "quant_trader",
    bio: "Quantitative trader | Math PhD | Algorithmic trading strategies",
    location: "Singapore",
    joined: "Ноябрь 2019",
    avatar: "https://i.pravatar.cc/400?img=14",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=400&fit=crop",
    stats: {
      tweets: 1200,
      following: 145,
      followers: 41200,
      likes: 3400,
    },
    isVerified: true,
  },

  "macro_trader": {
    id: "macro_trader",
    name: "Victoria Knight",
    username: "macro_trader",
    bio: "Macro trader | Economics & geopolitics | Former hedge fund manager",
    location: "Hong Kong",
    website: {
      label: "macroview.io",
      url: "https://macroview.io",
    },
    joined: "Август 2020",
    avatar: "https://i.pravatar.cc/400?img=1",
    cover: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&h=400&fit=crop",
    stats: {
      tweets: 3400,
      following: 678,
      followers: 78900,
      likes: 11200,
    },
    isVerified: true,
    isPremium: true,
  },

  "blockchain_dev": {
    id: "blockchain_dev",
    name: "Ryan Park",
    username: "blockchain_dev",
    bio: "Blockchain developer | Solidity expert | Building on Ethereum & Polygon",
    location: "Seoul, South Korea",
    website: {
      label: "github.com/ryanpark",
      url: "https://github.com/ryanpark",
    },
    joined: "Март 2021",
    avatar: "https://i.pravatar.cc/400?img=17",
    cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1400&h=400&fit=crop",
    stats: {
      tweets: 890,
      following: 234,
      followers: 19800,
      likes: 2100,
    },
  },

  "fintech_founder": {
    id: "fintech_founder",
    name: "Sophia Zhang",
    username: "fintech_founder",
    bio: "Fintech entrepreneur | CEO @PayFlow | Forbes 30 under 30",
    location: "Shanghai, China",
    website: {
      label: "payflow.io",
      url: "https://payflow.io",
    },
    joined: "Январь 2022",
    avatar: "https://i.pravatar.cc/400?img=10",
    cover: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1400&h=400&fit=crop",
    stats: {
      tweets: 567,
      following: 123,
      followers: 12300,
      likes: 1890,
    },
    isVerified: true,
  },

  "dao_builder": {
    id: "dao_builder",
    name: "Lucas Martins",
    username: "dao_builder",
    bio: "Building decentralized autonomous organizations | Web3 governance expert",
    location: "Lisbon, Portugal",
    joined: "Июль 2021",
    avatar: "https://i.pravatar.cc/400?img=8",
    cover: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1400&h=400&fit=crop",
    stats: {
      tweets: 1456,
      following: 456,
      followers: 23400,
      likes: 3890,
    },
    isPremium: true,
  },

  "venture_cap": {
    id: "venture_cap",
    name: "Amanda Foster",
    username: "venture_cap",
    bio: "VC Partner @Sequoia | Investing in crypto & web3 startups",
    location: "Menlo Park, CA",
    website: {
      label: "sequoiacap.com",
      url: "https://sequoiacap.com",
    },
    joined: "Февраль 2018",
    avatar: "https://i.pravatar.cc/400?img=45",
    cover: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=1400&h=400&fit=crop",
    stats: {
      tweets: 2890,
      following: 890,
      followers: 134000,
      likes: 8900,
    },
    isVerified: true,
    isPremium: true,
  },

  "options_pro": {
    id: "options_pro",
    name: "Michael Chen",
    username: "options_pro",
    bio: "Options trading strategies | Risk management | Teaching traders since 2015",
    location: "Chicago, IL",
    joined: "Октябрь 2019",
    avatar: "https://i.pravatar.cc/400?img=13",
    cover: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&h=400&fit=crop",
    stats: {
      tweets: 4567,
      following: 345,
      followers: 56700,
      likes: 9800,
    },
    isVerified: true,
  },

  "startup_scout": {
    id: "startup_scout",
    name: "Emma Wilson",
    username: "startup_scout",
    bio: "Startup advisor | Angel investor | Helping founders scale",
    location: "Austin, TX",
    website: {
      label: "angellist.com/emmaw",
      url: "https://angellist.com/emmaw",
    },
    joined: "Апрель 2020",
    avatar: "https://i.pravatar.cc/400?img=47",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&h=400&fit=crop",
    stats: {
      tweets: 1890,
      following: 678,
      followers: 34500,
      likes: 5600,
    },
    isPremium: true,
  },

  "forex_mentor": {
    id: "forex_mentor",
    name: "Thomas Anderson",
    username: "forex_mentor",
    bio: "Forex trader | EUR/USD specialist | Mentoring aspiring traders",
    location: "Toronto, Canada",
    joined: "Июнь 2020",
    avatar: "https://i.pravatar.cc/400?img=11",
    cover: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&h=400&fit=crop",
    stats: {
      tweets: 3200,
      following: 234,
      followers: 45600,
      likes: 7800,
    },
    isVerified: true,
  },

  "token_economist": {
    id: "token_economist",
    name: "Dr. Priya Patel",
    username: "token_economist",
    bio: "Tokenomics researcher | PhD in Economics | Designing crypto economies",
    location: "Cambridge, UK",
    website: {
      label: "tokenomics.research",
      url: "https://tokenomics.research",
    },
    joined: "Сентябрь 2021",
    avatar: "https://i.pravatar.cc/400?img=48",
    cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1400&h=400&fit=crop",
    stats: {
      tweets: 890,
      following: 345,
      followers: 29800,
      likes: 4500,
    },
    isVerified: true,
    isPremium: true,
  },

  "yield_farmer": {
    id: "yield_farmer",
    name: "Carlos Gutierrez",
    username: "yield_farmer",
    bio: "DeFi yield farming strategies | APY hunter | Liquidity mining expert",
    location: "Barcelona, Spain",
    joined: "Май 2021",
    avatar: "https://i.pravatar.cc/400?img=18",
    cover: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1400&h=400&fit=crop",
    stats: {
      tweets: 2100,
      following: 567,
      followers: 38900,
      likes: 6200,
    },
    isPremium: true,
  },

  "technical_analyst": {
    id: "technical_analyst",
    name: "Jessica Kim",
    username: "technical_analyst",
    bio: "Technical analysis & chart patterns | Support/resistance levels | Price action trader",
    location: "Tokyo, Japan",
    joined: "Декабрь 2019",
    avatar: "https://i.pravatar.cc/400?img=26",
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=400&fit=crop",
    stats: {
      tweets: 5600,
      following: 789,
      followers: 67800,
      likes: 12300,
    },
    isVerified: true,
  },

  "web3_designer": {
    id: "web3_designer",
    name: "Oliver Brown",
    username: "web3_designer",
    bio: "UI/UX designer for web3 | Creating beautiful dApps | NFT artist",
    location: "Amsterdam, Netherlands",
    website: {
      label: "oliverdesigns.eth",
      url: "https://oliverdesigns.eth",
    },
    joined: "Август 2021",
    avatar: "https://i.pravatar.cc/400?img=56",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1400&h=400&fit=crop",
    stats: {
      tweets: 1234,
      following: 456,
      followers: 21200,
      likes: 4800,
    },
  },
};

// Helper functions
export const getUserByUsername = (username: string): User | undefined => {
  return Object.values(users).find((user) => user.username === username);
};

export const getUserById = (id: string): User | undefined => {
  return users[id];
};

export const getCurrentUser = (): User => {
  return users[CURRENT_USER_ID];
};

export const getAllUsers = (): User[] => {
  return Object.values(users);
};

export const getRandomUsers = (count: number, excludeId?: string): User[] => {
  const allUsers = Object.values(users).filter((user) => user.id !== excludeId);
  return allUsers.sort(() => Math.random() - 0.5).slice(0, count);
};
