import type { SocialPost } from "@/data/socialPosts";
import FeedPost from "@/components/PostCard/VideoPost";

interface ProfileTweetsClassicProps {
  posts: SocialPost[];
}

export default function ProfileTweetsClassic({
  posts,
}: ProfileTweetsClassicProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#888]">
        <p className="text-lg">No tweets yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-8 pt-6">
        {posts.map((post) => (
          <FeedPost
            key={post.id}
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
          />
        ))}
      </div>
    </div>
  );
}
