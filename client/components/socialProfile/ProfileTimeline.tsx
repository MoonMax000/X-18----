import type { FC } from "react";

import FeedPost from "@/components/PostCard/VideoPost";
import type { SocialPost } from "@/data/socialPosts";

interface ProfileTimelineProps {
  posts: SocialPost[];
  activeTab: string;
  highlightedPostId?: string;
  onOpenPost?: (post: SocialPost) => void;
}

const emptyStateByTab: Record<string, { title: string; description: string }> = {
  replies: {
    title: "Пока без ответов",
    description: "Когда вы ответите на другие посты, они появятся здесь.",
  },
  media: {
    title: "Нет медиа",
    description: "Прикреплённые изображения и видео появятся в этом разделе.",
  },
  likes: {
    title: "Нет отметок 'Нравится'",
    description: "Посты, которые вы отм��тите, будут собраны на этой вкладке.",
  },
};

const ProfileTimeline: FC<ProfileTimelineProps> = ({ posts, activeTab, highlightedPostId, onOpenPost }) => {
  if (activeTab !== "tweets") {
    const state = emptyStateByTab[activeTab] ?? {
      title: "Пока пусто",
      description: "Этот раздел появится позже.",
    };

    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#1F242B] bg-[rgba(12,16,20,0.4)] p-12 text-center">
        <h3 className="text-lg font-semibold text-white">{state.title}</h3>
        <p className="max-w-[320px] text-sm text-[#8B98A5]">{state.description}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {posts.map((post, index) => {
        const isPinned = highlightedPostId && post.id === highlightedPostId && index === 0;

        return (
          <div key={post.id} className="flex w-full max-w-[680px] flex-col gap-2">
            {isPinned ? (
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-tyrian/30 bg-tyrian/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-tyrian-light">
                З��креплённый пост
              </span>
            ) : null}
            <FeedPost
              author={post.author}
              timestamp={post.timestamp}
              title={post.title}
              content={post.body ?? post.preview}
              mediaUrl={post.videoUrl ?? post.mediaUrl ?? null}
              sentiment={post.sentiment}
              likes={post.likes}
              comments={post.comments}
              views={post.views}
              isFollowing={post.isFollowing}
              hashtags={post.hashtags}
              category={post.category}
              type={post.type}
              onOpen={onOpenPost ? () => onOpenPost(post) : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ProfileTimeline;
