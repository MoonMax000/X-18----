import { type FC, useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PostDetailView from "@/components/PostCard/PostDetailView";
import { getSocialPostById, type SocialPost } from "@/data/socialPosts";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";
import { useGTSStatus } from "@/hooks/useGTSStatus";
import { getCurrentAccount } from "@/services/api/gotosocial";
import type { GTSStatus, GTSAccount } from "@/services/api/gotosocial";

// Convert GTSStatus to SocialPost format
function convertGTSStatusToSocialPost(
  status: GTSStatus, 
  currentUser: GTSAccount | null
): SocialPost {
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins}м`;
    if (diffHours < 24) return `${diffHours}ч`;
    if (diffDays < 7) return `${diffDays}д`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  // Extract text content (remove HTML tags)
  const textContent = status.content.replace(/<[^>]*>/g, "");
  
  // Extract hashtags
  const hashtags = status.tags?.map(tag => tag.name) || [];

  // Determine sentiment (TODO: add custom metadata support)
  // For now, default to bullish
  const sentiment: "bullish" | "bearish" = "bullish";

  // Determine if video or article
  const hasVideo = status.media_attachments?.some(m => m.type === "video" || m.type === "gifv");
  const hasImage = status.media_attachments?.some(m => m.type === "image");

  return {
    id: status.id,
    type: hasVideo ? "video" : "article",
    author: {
      name: status.account.display_name || status.account.username,
      avatar: status.account.avatar,
      handle: `@${status.account.acct}`,
      verified: status.account.verified,
      bio: status.account.note?.replace(/<[^>]*>/g, ""),
      followers: status.account.followers_count,
      following: status.account.following_count,
      isCurrentUser: currentUser?.id === status.account.id,
    },
    timestamp: getRelativeTime(status.created_at),
    title: textContent.split('\n')[0].substring(0, 100), // First line as title
    body: textContent,
    preview: textContent.substring(0, 200),
    videoUrl: status.media_attachments?.find(m => m.type === "video")?.url,
    mediaUrl: status.media_attachments?.find(m => m.type === "image")?.url,
    sentiment,
    likes: status.favourites_count,
    comments: status.replies_count,
    hashtags,
    views: 0, // TODO: Add view tracking
    
    // TODO: Add when custom metadata backend is ready
    isPremium: false,
    price: undefined,
    subscriptionPrice: undefined,
    unlocked: true,
    audience: status.visibility === "public" ? "everyone" : "followers",
  };
}

const SocialPostDetail: FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<GTSAccount | null>(null);

  // Get current user
  useEffect(() => {
    getCurrentAccount().then(setCurrentUser).catch(console.error);
  }, []);

  const postFromState = location.state as SocialPost | undefined;
  
  // Try to fetch from GoToSocial API
  const {
    status: gtsStatus,
    context,
    isLoading,
    error,
  } = useGTSStatus({
    statusId: postId || "",
    fetchContext: true,
  });

  // Convert GTS status to UI format or use local mock
  const post = useMemo(() => {
    // Priority 1: Post from navigation state
    if (postFromState) {
      return postFromState;
    }

    // Priority 2: Post from GoToSocial API
    if (gtsStatus && currentUser) {
      return convertGTSStatusToSocialPost(gtsStatus, currentUser);
    }

    // Priority 3: Fallback to local mock data
    if (postId) {
      return getSocialPostById(postId);
    }

    return undefined;
  }, [postFromState, gtsStatus, currentUser, postId]);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/feedtest");
    }
  };

  // Loading state
  if (isLoading && !postFromState) {
    return (
      <div className="flex w-full gap-8">
        <div className="flex-1 max-w-[720px]">
          <div className="sticky top-0 z-10 mb-6 flex items-center gap-3 bg-black/80 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-[#482090]/20"
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6667 5L6.66675 10L11.6667 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Post</h1>
          </div>

          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#A06AFF] border-t-transparent" />
              <p className="text-sm text-[#8E92A0]">Загружаем пост...</p>
            </div>
          </div>
        </div>

        <aside className="sticky top-4 hidden h-fit w-[340px] flex-col gap-4 lg:flex">
          <SuggestedProfilesWidget
            title="Relevant people"
            profiles={DEFAULT_SUGGESTED_PROFILES}
          />
        </aside>
      </div>
    );
  }

  // Error state
  if (error && !post) {
    return (
      <div className="flex w-full gap-8">
        <div className="flex-1 max-w-[720px]">
          <div className="sticky top-0 z-10 mb-6 flex items-center gap-3 bg-black/80 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-[#482090]/20"
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6667 5L6.66675 10L11.6667 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Post</h1>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#5E5E5E] bg-[rgba(12,16,20,0.4)] p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Ошибка загрузки поста</h3>
            <p className="max-w-[360px] text-sm text-[#B0B0B0]">{error}</p>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(160,106,255,0.4)]"
            >
              Вернуться к ленте
            </button>
          </div>
        </div>

        <aside className="sticky top-4 hidden h-fit w-[340px] flex-col gap-4 lg:flex">
          <SuggestedProfilesWidget
            title="Relevant people"
            profiles={DEFAULT_SUGGESTED_PROFILES}
          />
        </aside>
      </div>
    );
  }

  // Not found state
  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center text-white">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="text-3xl font-semibold">Пост не найден</div>
        <p className="max-w-[400px] text-sm text-[#8E92A0]">
          Пост с ID <code className="rounded bg-[#1A1A1A] px-2 py-1 font-mono text-xs">{postId}</code> не существует или был удален.
        </p>
        <button
          type="button"
          onClick={() => navigate("/feedtest")}
          className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(160,106,255,0.4)]"
        >
          Вернуться к ленте
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-8">
      <div className="flex-1 max-w-[720px]">
        <div className="sticky top-0 z-10 mb-6 flex items-center gap-3 bg-black/80 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-colors hover:bg-[#482090]/20"
            aria-label="Back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.6667 5L6.66675 10L11.6667 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Post</h1>
        </div>

        <PostDetailView post={post} />

        {/* Comments Section - TODO: Implement with context.descendants */}
        {context && context.descendants.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Комментарии ({context.descendants.length})
            </h2>
            <div className="space-y-4">
              {context.descendants.slice(0, 5).map((reply) => (
                <div key={reply.id} className="flex gap-3 p-3 rounded-lg bg-[#0A0A0A]/50">
                  <img 
                    src={reply.account.avatar} 
                    alt={reply.account.display_name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">
                        {reply.account.display_name}
                      </span>
                      <span className="text-xs text-[#6C7080]">
                        @{reply.account.acct}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/90" 
                       dangerouslySetInnerHTML={{ __html: reply.content }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="sticky top-4 hidden h-fit w-[340px] flex-col gap-4 lg:flex">
        <SuggestedProfilesWidget
          title="Relevant people"
          profiles={DEFAULT_SUGGESTED_PROFILES}
        />
      </aside>
    </div>
  );
};

export default SocialPostDetail;
