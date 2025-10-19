import { useState, useMemo } from "react";
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
    // Navigate to social post detail for profile pages
    navigate(`/social/post/${postId}`, { state: post });
  };

  // Transform SocialPost to match ContinuousFeedTimeline's Post interface
  const transformedPosts = useMemo(() => {
    return posts.map(post => ({
      id: post.id,
      author: {
        name: post.author.name,
        handle: post.author.handle || `@${post.author.name.toLowerCase().replace(/\s+/g, '')}`,
        avatar: post.author.avatar,
        verified: post.author.verified,
        isFollowing: post.isFollowing,
      },
      timestamp: post.timestamp,
      type: post.category || post.type || 'general',
      text: post.body || post.preview || post.title || '',
      likes: post.likes,
      comments: post.comments,
      reposts: 0,
      views: post.views || 0,
      tags: post.hashtags?.map(tag => tag.startsWith('#') ? tag : `#${tag}`),
      price: 'free', // SocialPost doesn't have pricing info, so default to free
    }));
  }, [posts]);

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
        posts={transformedPosts}
        onFollowToggle={(handle) => toggleFollow(handle)}
        onPostClick={handlePostClick}
      />
    </div>
  );
}
