import { type FC, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import PostDetailView from "@/components/PostCard/PostDetailView";
import { getSocialPostById, type SocialPost } from "@/data/socialPosts";
import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";

// TODO: Implement real post fetching from custom-backend API
function fetchPostFromAPI(postId: string): SocialPost | undefined {
  // Fallback to local mock data for now
  return getSocialPostById(postId);
}

const SocialPostDetail: FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();

  const postFromState = location.state as SocialPost | undefined;
  
  // Get post data
  const post = useMemo(() => {
    // Priority 1: Post from navigation state
    if (postFromState) {
      return postFromState;
    }

    // Priority 2: Fetch from API (TODO: implement custom-backend API)
    if (postId) {
      return fetchPostFromAPI(postId) || getSocialPostById(postId);
    }

    return undefined;
  }, [postFromState, postId]);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/feedtest");
    }
  };

  // Loading state - removed as we're using sync data for now
  const isLoading = false;
  const error = null;
  
  if (false) {
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

        {/* Comments Section - TODO: Implement with custom-backend API */}
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
