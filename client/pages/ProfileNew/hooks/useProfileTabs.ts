import { useState, useCallback } from 'react';
import type {
  Tab,
  ProfileSubTab,
  SocialSubTab,
  PortfolioSubTab,
  MarketplaceSubTab,
  StreamingSubTab,
} from '../types';

/**
 * Hook to manage all tab states in ProfileNew page
 * Centralizes tab state management logic
 */
export const useProfileTabs = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeProfileSubTab, setActiveProfileSubTab] = useState<ProfileSubTab>('profile');
  const [activeSocialSubTab, setActiveSocialSubTab] = useState<SocialSubTab>('overview');
  const [activePortfolioSubTab, setActivePortfolioSubTab] = useState<PortfolioSubTab>('my');
  const [activeMarketplaceSubTab, setActiveMarketplaceSubTab] = useState<MarketplaceSubTab>('products');
  const [activeStreamingSubTab, setActiveStreamingSubTab] = useState<StreamingSubTab>('profile');

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  const handleProfileSubTabChange = useCallback((subTab: ProfileSubTab) => {
    setActiveProfileSubTab(subTab);
  }, []);

  const handleSocialSubTabChange = useCallback((subTab: SocialSubTab) => {
    setActiveSocialSubTab(subTab);
  }, []);

  const handlePortfolioSubTabChange = useCallback((subTab: PortfolioSubTab) => {
    setActivePortfolioSubTab(subTab);
  }, []);

  const handleMarketplaceSubTabChange = useCallback((subTab: MarketplaceSubTab) => {
    setActiveMarketplaceSubTab(subTab);
  }, []);

  const handleStreamingSubTabChange = useCallback((subTab: StreamingSubTab) => {
    setActiveStreamingSubTab(subTab);
  }, []);

  return {
    activeTab,
    activeProfileSubTab,
    activeSocialSubTab,
    activePortfolioSubTab,
    activeMarketplaceSubTab,
    activeStreamingSubTab,
    setActiveTab: handleTabChange,
    setActiveProfileSubTab: handleProfileSubTabChange,
    setActiveSocialSubTab: handleSocialSubTabChange,
    setActivePortfolioSubTab: handlePortfolioSubTabChange,
    setActiveMarketplaceSubTab: handleMarketplaceSubTabChange,
    setActiveStreamingSubTab: handleStreamingSubTabChange,
  };
};
