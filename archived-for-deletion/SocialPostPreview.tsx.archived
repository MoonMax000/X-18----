import { type FC, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PostDetailView from "@/components/PostCard/PostDetailView";
import type { SocialPost } from "@/data/socialPosts";

interface PublishedPostState {
  post: SocialPost;
}

const SocialPostPreview: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as PublishedPostState | undefined;
  const post = state?.post;

  useEffect(() => {
    if (!post) {
      navigate("/social/explore", { replace: true });
    }
  }, [post, navigate]);

  if (!post) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col gap-8 pb-12">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.65)] p-6 text-white shadow-[0_18px_45px_-32px_rgba(160,106,255,0.8)]">
        <div className="inline-flex items-center gap-3 rounded-full border border-[#A06AFF]/30 bg-[#A06AFF]/15 px-4 py-2 text-sm font-semibold text-[#E3D8FF]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090]">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 2L12.118 4.23223L15.1962 4.47214L15.4721 7.55192L17.7044 9.66987L15.4721 11.7878L15.1962 14.8676L12.118 15.1075L10 17.3397L7.88197 15.1075L4.80384 14.8676L4.52793 11.7878L2.29577 9.66987L4.52793 7.55192L4.80384 4.47214L7.88197 4.23223L10 2Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path d="M7.5 10L9.16667 11.6667L12.5 8.33337" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Публикация готова
        </div>
        <div>
          <h1 className="text-3xl font-bold">Так будет выглядеть ваш пост</h1>
          <p className="mt-2 text-sm text-[#B0B0B0]">
            Проверьте содержимое перед тем, как подключать бэкенд: структура карточки, блок статистики и оформление соответствуют странице с опубликованными постами.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/social/explore")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]"
          >
            Перейти в ленту
          </button>
          <button
            type="button"
            onClick={() => navigate("/social/explore")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#181B22] px-6 py-2 text-sm font-semibold text-[#E3D8FF] transition hover:border-[#A06AFF]/40 hover:text-white"
          >
            Создать ещё пост
          </button>
        </div>
      </section>

      <PostDetailView post={post} />
    </div>
  );
};

export default SocialPostPreview;
