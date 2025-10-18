import { getRandomUsers, CURRENT_USER_ID } from "@/data/users";

export interface SuggestedProfile {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  isVerified?: boolean;
  verified?: boolean;
}

export interface NewsItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  stats?: string;
  publishedAgo: string;
}

// Get random users excluding current user
const randomUsers = getRandomUsers(5, CURRENT_USER_ID);

export const DEFAULT_SUGGESTED_PROFILES: SuggestedProfile[] = randomUsers.map(
  (user) => ({
    id: user.id,
    name: user.name,
    handle: user.username,
    avatar: user.avatar,
    isVerified: user.isVerified,
  })
);

export const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: "1",
    category: "Crypto · Trending",
    title: "Bitcoin",
    subtitle: "BTC hits new all-time high",
    stats: "125K posts",
    publishedAgo: "2h ago",
  },
  {
    id: "2",
    category: "Technology · Trending",
    title: "AI Revolution",
    subtitle: "New GPT-5 rumors surface",
    stats: "89K posts",
    publishedAgo: "4h ago",
  },
  {
    id: "3",
    category: "Business · Trending",
    title: "DeFi Growth",
    subtitle: "Total Value Locked reaches $100B",
    stats: "45K posts",
    publishedAgo: "6h ago",
  },
  {
    id: "4",
    category: "Markets · Trending",
    title: "Stock Rally",
    subtitle: "Tech stocks surge on earnings",
    stats: "67K posts",
    publishedAgo: "1h ago",
  },
];

// Function to get fresh random users (useful for testing)
export const getNewSuggestedProfiles = (count: number = 5): SuggestedProfile[] => {
  const users = getRandomUsers(count, CURRENT_USER_ID);
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    handle: user.username,
    avatar: user.avatar,
    isVerified: user.isVerified,
  }));
};
