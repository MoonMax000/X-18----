import { type FC, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import SuggestedProfilesWidget from "@/components/SocialFeedWidgets/SuggestedProfilesWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";
import UnifiedPostDetail from "@/components/PostCard/UnifiedPostDetail";
import { getSocialPostById, type SocialPost } from "@/data/socialPosts";

const HomePostDetail: FC = () => {
  const navigate = useNavigate();
  const { postId } = useParams<{ postId: string }>();
  const location = useLocation();

  const postFromState = location.state as SocialPost | undefined;
  const post = useMemo(() => {
    if (postFromState) {
      return postFromState;
    }
    if (postId) {
      return getSocialPostById(postId);
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

        <UnifiedPostDetail post={post} />
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

export default HomePostDetail;
