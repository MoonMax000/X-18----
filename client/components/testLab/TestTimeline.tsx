import { type FC } from "react";

import type { FC } from "react";

import TestFeedPost from "./TestFeedPost";
import type { LabPost } from "./types";
import { cn } from "@/lib/utils";

interface TestTimelineProps {
  posts: LabPost[];
  className?: string;
  onUnlock?: (postId: string) => void;
  onSubscribe?: (postId: string) => void;
  onOpen?: (postId: string) => void;
}

const TestTimeline: FC<TestTimelineProps> = ({ posts, className, onUnlock, onSubscribe, onOpen }) => {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#482090]/40 bg-[#482090]/5 p-10 text-center text-sm text-[#C5C9D3]">
        Контент по выбранным фильтрам пока не найден. Попробуйте изменить актив, формат монетизации или рубрику.
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      {posts.map((post) => (
        <TestFeedPost
          key={post.id}
          post={post}
          onUnlock={onUnlock}
          onSubscribe={onSubscribe}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default TestTimeline;
