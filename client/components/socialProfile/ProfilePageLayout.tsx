import { useState } from "react";
import ProfileContentClassic from "./ProfileContentClassic";
import { useFollow } from "@/hooks/useFollow";
import { useAuth } from "@/contexts/AuthContext";
import NewsWidget from "@/components/SocialFeedWidgets/NewsWidget";
import TrendingTickersWidget from "@/components/SocialFeedWidgets/TrendingTickersWidget";
import TopAuthorsWidget from "@/components/SocialFeedWidgets/TopAuthorsWidget";
import MyEarningsWidget from "@/components/SocialFeedWidgets/MyEarningsWidget";
import MyActivityWidget from "@/components/SocialFeedWidgets/MyActivityWidget";
import MySubscriptionsWidget from "@/components/SocialFeedWidgets/MySubscriptionsWidget";
import type { User, Post } from "@/services/api/custom-backend";

interface ProfilePageLayoutProps {
  isOwnProfile: boolean;
  profile: User | null;
  posts?: Post[];
  initialFollowingState?: boolean;
}

export default function ProfilePageLayout({ isOwnProfile, profile, posts, initialFollowingState = false }: ProfilePageLayoutProps) {
  const { user: currentUser } = useAuth();

  // Initialize follow state with the actual following status from backend
  const initialState = profile?.id ? { [profile.id]: initialFollowingState } : {};
  console.log('[ProfilePageLayout] Initializing with:', {
    profileId: profile?.id,
    initialFollowingState,
    initialState
  });
  
  const { followUser, unfollowUser, isFollowing: isFollowingUser, followingState } = useFollow(initialState);
  
  console.log('[ProfilePageLayout] After useFollow:', {
    profileId: profile?.id,
    isFollowing: profile ? isFollowingUser(profile.id) : false,
    followingState
  });

  // Handle follow/unfollow for the viewed profile
  const handleProfileFollow = async () => {
    if (!profile) return;
    const isCurrentlyFollowing = isFollowingUser(profile.id);
    if (isCurrentlyFollowing) {
      await unfollowUser(profile.id);
    } else {
      await followUser(profile.id);
    }
  };

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <ProfileContentClassic
          isOwnProfile={isOwnProfile}
          profile={profile}
          posts={posts}
          isFollowing={profile ? isFollowingUser(profile.id) : false}
          onFollowToggle={handleProfileFollow}
        />
      </div>

      {/* Right Sidebar with Widgets */}
      <div className="hidden lg:block w-[340px]">
        <div className="sticky top-20 space-y-4">
          {isOwnProfile ? (
            <>
              {/* Own Profile: Show earnings, activity, subscriptions */}
              <MyEarningsWidget period="30d" />
              <MyActivityWidget period="7d" />
              <MySubscriptionsWidget />
            </>
          ) : (
            <>
              {/* Other Profile: Show news, tickers, authors */}
              <NewsWidget limit={5} />
              <TrendingTickersWidget limit={10} timeframe="24h" />
              <TopAuthorsWidget limit={5} timeframe="7d" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
