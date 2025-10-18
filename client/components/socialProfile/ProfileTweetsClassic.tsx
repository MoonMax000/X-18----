import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SocialPost } from "@/data/socialPosts";
import ContinuousFeedTimeline from "@/components/testLab/ContinuousFeedTimeline";

interface ProfileTweetsClassicProps {
  posts: SocialPost[];
}

export default function ProfileTweetsClassic({
  posts,
}: ProfileTweetsClassicProps) {
  const navigate = useNavigate();
  const [followingAuthors, setFollowingAuthors] = useState<Set<string>>(new Set());

  const toggleFollow = (handle: string) => {
    setFollowingAuthors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(handle)) {
        newSet.delete(handle);
      } else {
        newSet.add(handle);
      }
      return newSet;
    });
  };

  const handlePostClick = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    navigate(`/social/post/${postId}`, { state: post });
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#888]">
        <p className="text-lg">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="pt-6">
      <ContinuousFeedTimeline
        posts={posts}
        onFollowToggle={(handle) => toggleFollow(handle)}
        onPostClick={handlePostClick}
      />
    </div>
  );
}
