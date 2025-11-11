import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { defaultProfile, getProfileTimeline } from "@/data/socialProfile";
import type { SocialProfileData } from "@/data/socialProfile";
import type { SocialPost, SocialPostType, SentimentType } from "@/data/socialPosts";
import type { RootState } from "@/store/store";
import ProfileHero from "./ProfileHero";
import TabListClassic, { type ProfilePostsFilter, type ProfileSection, type ProfileSortOption } from "./TabListClassic";
import ProfileTweetsClassic from "./ProfileTweetsClassic";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import { TierBadge } from "@/components/common/TierBadge";
import type { User, Post } from "@/services/api/custom-backend";
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";
import ProfileAvatar from "@/components/common/ProfileAvatar";
import ProfileCover from "@/components/common/ProfileCover";

interface ProfileContentClassicProps {
  isOwnProfile?: boolean;
  profile?: User | null;
  posts?: Post[];
  isFollowing?: boolean;
  onFollowToggle?: (userId: string, currentState: boolean) => Promise<void>;
}

const normalizeHandle = (value?: string) =>
  value?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";

const derivePostFilterKey = (post: SocialPost): ProfilePostsFilter => {
  const category = post.category?.toLowerCase() ?? "";
  const title = post.title.toLowerCase();
  const preview = post.preview?.toLowerCase() ?? "";

  if (category.includes("analysis") || category.includes("analytics")) {
    return "analytics";
  }
  if (category.includes("insight") || category.includes("education")) {
    return "ideas";
  }
  if (category.includes("opinion") || category.includes("commentary")) {
    return "opinions";
  }
  if (category.includes("followers") || category.includes("community") || category.includes("lifestyle")) {
    return "soft";
  }

  if (title.includes("analysis") || preview.includes("analysis")) {
    return "analytics";
  }
  if (title.includes("opinion") || preview.includes("opinion")) {
    return "opinions";
  }
  if (title.includes("soft") || preview.includes("soft")) {
    return "soft";
  }

  return "ideas";
};

const isMediaPost = (post: SocialPost) => Boolean(post.type === "video" || post.videoUrl || post.mediaUrl);
const isPremiumPost = (post: SocialPost) => Boolean(post.isPremium || typeof post.price === "number" || typeof post.subscriptionPrice === "number");

const LIKED_POST_IDS = ["crypto-video", "john-premium-1", "john-premium-2", "tyrian-followers-only"];

export default function ProfileContentClassic({
  isOwnProfile = true,
  profile: externalProfile,
  posts: externalPosts,
  isFollowing,
  onFollowToggle,
}: ProfileContentClassicProps) {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);
  const [profile, setProfile] = useState<SocialProfileData | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [activeSection, setActiveSection] = useState<ProfileSection>("posts");
  const [activePostsFilter, setActivePostsFilter] = useState<ProfilePostsFilter>("all");
  const [sortOption, setSortOption] = useState<ProfileSortOption>("newest");
  const { handle, user_id } = useParams();

  useEffect(() => {
    const loadProfile = async () => {
      console.log('🔄 [ProfileContentClassic] loadProfile START');
      console.log('   📦 externalProfile:', externalProfile);
      console.log('   📸 RAW avatar_url:', externalProfile?.avatar_url);
      console.log('   🖼️ RAW header_url:', externalProfile?.header_url);
      console.log('   🔍 avatar_url type:', typeof externalProfile?.avatar_url);
      console.log('   🔍 header_url type:', typeof externalProfile?.header_url);
      console.log('   🔍 avatar_url empty?:', !externalProfile?.avatar_url);
      console.log('   🔍 header_url empty?:', !externalProfile?.header_url);
      
      // If external data provided, use it directly
      if (externalProfile && externalPosts) {
        setIsLoading(true);

        // Convert User to SocialProfileData - let ProfileAvatar/ProfileCover handle fallbacks
        const profileData: SocialProfileData = {
          id: externalProfile.id,
          name: externalProfile.display_name || externalProfile.username,
          username: externalProfile.username,
          bio: externalProfile.bio || '',
          avatar: externalProfile.avatar_url || '',
          cover: externalProfile.header_url || '',
          location: '',
          website: externalProfile.website ? { label: externalProfile.website, url: externalProfile.website } : undefined,
          joined: new Date(externalProfile.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
          stats: {
            tweets: externalProfile.posts_count || 0,
            following: externalProfile.following_count || 0,
            followers: externalProfile.followers_count || 0,
            likes: 0,
          },
        };
        
        console.log('   ✅ [ProfileContentClassic] profileData created:');
        console.log('   📸 Final avatar:', profileData.avatar);
        console.log('   🖼️ Final cover:', profileData.cover);
        
        setProfile(profileData);
        
        // Extract user level (use type assertion since level may not be in type yet)
        setUserLevel((externalProfile as any).level || 1);

        // Convert Post[] to SocialPost[]
        const convertedPosts: SocialPost[] = externalPosts.map(post => ({
          id: post.id,
          title: post.content?.substring(0, 100) || '',
          preview: post.content || '',
          author: {
            name: post.user?.display_name || post.user?.username || 'Unknown',
            handle: `@${post.user?.username || 'unknown'}`,
            avatar: post.user?.avatar_url || '',
          },
          timestamp: post.created_at,
          likes: post.likes_count || 0,
          comments: post.replies_count || 0,
          shares: post.retweets_count || 0,
          isLiked: post.is_liked || false,
          isBookmarked: post.is_bookmarked || false,
          type: 'article' as SocialPostType,
          sentiment: 'bullish' as SentimentType,
          category: 'General',
        }));

        setPosts(convertedPosts);
        setLikedPosts([]);
        setIsLoading(false);
        return;
      }

      // Fallback to mock data if no external data
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const profileData = isOwnProfile
        ? {
            ...defaultProfile,
            name: currentUser.name,
            username: currentUser.username,
            bio: currentUser.bio,
            role: currentUser.role,
            location: currentUser.location,
            website: currentUser.website ? { label: currentUser.website, url: currentUser.website } : defaultProfile.website,
            avatar: currentUser.avatar || defaultProfile.avatar,
            cover: currentUser.cover || defaultProfile.cover,
          }
        : defaultProfile;

      setProfile(profileData);

      const allPosts = getProfileTimeline(defaultProfile);
      const profileKey = normalizeHandle(defaultProfile.username) || normalizeHandle(defaultProfile.name);
      const userPosts = allPosts.filter((post) => {
        const handleKey = normalizeHandle(post.author.handle) || normalizeHandle(post.author.name);
        return handleKey === profileKey;
      });

      const liked = allPosts.filter((post) => {
        if (!LIKED_POST_IDS.includes(post.id) || post.id === defaultProfile.highlightedPostId) {
          return false;
        }
        const likedHandle = normalizeHandle(post.author.handle) || normalizeHandle(post.author.name);
        return likedHandle !== profileKey;
      });

      setPosts(userPosts);
      setLikedPosts(liked);
      setIsLoading(false);
    };

    loadProfile();
  }, [handle, user_id, isOwnProfile, currentUser, externalProfile, externalProfile?.avatar_url, externalProfile?.header_url, externalPosts]);

  const postFilterCounts = useMemo(() => {
    const counts: Record<ProfilePostsFilter, number> = {
      all: 0,
      ideas: 0,
      opinions: 0,
      analytics: 0,
      soft: 0,
    };

    posts.forEach((post) => {
      counts.all += 1;
      const key = derivePostFilterKey(post);
      counts[key] += 1;
    });

    return counts;
  }, [posts]);

  useEffect(() => {
    if (activeSection !== "posts" && activePostsFilter !== "all") {
      setActivePostsFilter("all");
    }
  }, [activeSection, activePostsFilter]);

  useEffect(() => {
    if (activeSection !== "posts") {
      return;
    }

    if (activePostsFilter !== "all" && (postFilterCounts[activePostsFilter] ?? 0) === 0) {
      setActivePostsFilter("all");
    }
  }, [activeSection, activePostsFilter, postFilterCounts]);

  useEffect(() => {
    if (activeSection !== "posts" && sortOption !== "newest") {
      setSortOption("newest");
    }
  }, [activeSection, sortOption]);

  const likesTabEnabled = useMemo(() => {
    if (isOwnProfile) {
      return true;
    }
    return likedPosts.length > 0;
  }, [isOwnProfile, likedPosts.length]);

  useEffect(() => {
    if (!likesTabEnabled && activeSection === "likes") {
      setActiveSection("posts");
    }
  }, [likesTabEnabled, activeSection]);

  const filteredPosts = useMemo(() => {
    if (activeSection === "likes") {
      return likedPosts;
    }

    if (!posts.length) {
      return [];
    }

    if (activeSection === "media") {
      return posts.filter(isMediaPost);
    }

    if (activeSection === "premium") {
      const premiumPosts = posts.filter(isPremiumPost);
      if (isOwnProfile) {
        return premiumPosts.map((post) => ({ ...post, unlocked: true }));
      }
      return premiumPosts;
    }

    if (activePostsFilter === "all") {
      return [...posts];
    }

    return posts.filter((post) => derivePostFilterKey(post) === activePostsFilter);
  }, [posts, likedPosts, activeSection, activePostsFilter, isOwnProfile]);

  const sortedPosts = useMemo(() => {
    if (sortOption === "likes") {
      return [...filteredPosts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    }

    return filteredPosts;
  }, [filteredPosts, sortOption]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  const tweetsCount = posts.length;

  return (
    <div
      className="min-h-screen"
      style={{ "--profile-image-size": "120px" } as CSSProperties}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-black/80">
        <div className="flex items-center gap-9 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-[#ffffff]/[0.15] active:bg-[#ffffff]/[0.25] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M11.6667 5L6.66675 10L11.6667 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-bold leading-6 text-[#F7F9F9]">
                {profile.name}
              </h2>
              <VerifiedBadge size={20} />
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{display: 'none'}}>
                <path
                  d="M18.9999 10.5C18.9837 9.9156 18.8054 9.34658 18.4843 8.85717C18.1641 8.36867 17.7135 7.97786 17.1834 7.72999C17.3852 7.18087 17.4277 6.58653 17.3101 6.01389C17.1916 5.44035 16.9147 4.91204 16.5122 4.48776C16.087 4.0852 15.5596 3.80928 14.986 3.68987C14.4134 3.57226 13.8191 3.61478 13.2699 3.81652C13.023 3.28549 12.6331 2.83408 12.1437 2.51384C11.6543 2.19359 11.0852 2.01447 10.4999 2C9.91554 2.01538 9.34833 2.19269 8.85983 2.51384C8.37132 2.83498 7.98323 3.2864 7.73807 3.81652C7.18805 3.61478 6.59189 3.57046 6.01745 3.68987C5.443 3.80747 4.91379 4.08429 4.4886 4.48776C4.08604 4.91294 3.81103 5.44216 3.69433 6.01479C3.57673 6.58743 3.62196 7.18178 3.8246 7.72999C3.29357 7.97786 2.84125 8.36776 2.5192 8.85627C2.19715 9.34477 2.01713 9.9147 1.99994 10.5C2.01803 11.0853 2.19715 11.6543 2.5192 12.1437C2.84125 12.6322 3.29357 13.023 3.8246 13.27C3.62196 13.8182 3.57673 14.4126 3.69433 14.9852C3.81193 15.5587 4.08604 16.0871 4.4877 16.5122C4.91288 16.913 5.44119 17.188 6.01383 17.3065C6.58646 17.4259 7.18081 17.3825 7.72993 17.1835C7.9778 17.7136 8.3677 18.1641 8.85711 18.4853C9.34562 18.8055 9.91554 18.9837 10.4999 19C11.0852 18.9855 11.6543 18.8073 12.1437 18.4871C12.6331 18.1668 13.023 17.7145 13.2699 17.1844C13.8164 17.4006 14.4152 17.4522 14.9915 17.3327C15.5668 17.2133 16.0951 16.9284 16.5113 16.5122C16.9274 16.0961 17.2133 15.5678 17.3327 14.9915C17.4521 14.4153 17.4005 13.8164 17.1834 13.27C17.7135 13.0221 18.1641 12.6322 18.4852 12.1428C18.8054 11.6543 18.9837 11.0853 18.9999 10.5018V10.5Z"
                  fill="#A06AFF"
                />
              </svg>
            </div>
            <p className="text-[13px] font-normal leading-4 text-[#8B98A5]">
              {tweetsCount} post
            </p>
          </div>
        </div>
      </div>

      <ProfileHero
        profile={profile}
        tweetsCount={tweetsCount}
        isOwnProfile={isOwnProfile}
        isFollowing={isFollowing}
        onFollowToggle={onFollowToggle}
        profileUserId={externalProfile?.id}
        level={userLevel}
      />
      <main className="mt-4 sm:mt-5 md:mt-6">
        <div className="px-3 sm:px-4 md:px-6">
          <div className="mt-8">
            <TabListClassic
              isOwnProfile={isOwnProfile}
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              activePostsFilter={activePostsFilter}
              onPostsFilterChange={setActivePostsFilter}
              postFilterCounts={postFilterCounts}
              sortOption={sortOption}
              onSortChange={setSortOption}
              showLikesTab={likesTabEnabled}
            />
          </div>
        </div>
        <ProfileTweetsClassic userId={externalProfile?.id || ''} />
      </main>
    </div>
  );
}
