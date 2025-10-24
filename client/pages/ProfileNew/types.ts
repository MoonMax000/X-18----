export type Tab =
  | 'dashboard'
  | 'profile'
  | 'marketplace'
  | 'streaming'
  | 'social'
  | 'portfolios';

export type ProfileSubTab =
  | 'profile'
  | 'security'
  | 'notifications'
  | 'billing'
  | 'referrals'
  | 'api'
  | 'kyc';

export type SocialSubTab =
  | 'overview'
  | 'posts'
  | 'subscriptions'
  | 'monetization';

export type PortfolioSubTab = 'my' | 'following';

export type MarketplaceSubTab =
  | 'overview'
  | 'products'
  | 'sales'
  | 'purchases'
  | 'coupons'
  | 'reviews'
  | 'payouts'
  | 'settings';

export type StreamingSubTab =
  | 'profile'
  | 'streams'
  | 'donations'
  | 'notifications'
  | 'subscriptions';

export interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
}

export interface SubTabConfig<T = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
}

export const DASHBOARD_WIDGET_VISIBILITY = {
  myRevenue: false,
  liveStreaming: false,
  aiAssistant: false,
  followingPortfolios: false,
} as const;
