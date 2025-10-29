import { type FC, useMemo, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import UnifiedPostDetail from "@/components/PostCard/UnifiedPostDetail";
import { getSocialPostById, type SocialPost } from "@/data/socialPosts";
import { MOCK_POSTS } from "@/features/feed/mocks";
import type { Post } from "@/features/feed/types";
import NewsWidget from "@/components/SocialFeedWidgets/NewsWidget";
import TrendingTickersWidget from "@/components/SocialFeedWidgets/TrendingTickersWidget";
import TopAuthorsWidget from "@/components/SocialFeedWidgets/TopAuthorsWidget";
import { useAuth } from "@/contexts/AuthContext";
import MyEarningsWidget from "@/components/SocialFeedWidgets/MyEarningsWidget";

const HomePostDetail: FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  const postFromState = location.state as (SocialPost | Post) | undefined;
  const post = useMemo(() => {
    if (postFromState) {
      return postFromState;
    }
    if (postId) {
      const socialPost = getSocialPostById(postId);
      if (socialPost) return socialPost;

      const feedPost = MOCK_POSTS.find(p => p.id === postId);
      if (feedPost) return feedPost;
    }
    return undefined;
  }, [postFromState, postId]);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/home");
    }
  };

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center text-white">
        <div className="text-3xl font-semibold">Post not found</div>
        <button
          type="button"
          onClick={() => navigate("/home")}
          className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#A06AFF]/30"
        >
          Back to feed
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
            className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-[#ffffff]/[0.15] active:bg-[#ffffff]/[0.25]"
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

        <UnifiedPostDetail post={post} />
      </div>

      {/* Right Sidebar with Widgets */}
      <div className="hidden lg:block w-[340px]">
        <div className="sticky top-20 space-y-4">
          <NewsWidget limit={5} />
          <TrendingTickersWidget limit={10} timeframe="24h" />
          <TopAuthorsWidget limit={5} timeframe="7d" />
          {user && <MyEarningsWidget period="30d" />}
        </div>
      </div>
    </div>
  );
};

export default HomePostDetail;
