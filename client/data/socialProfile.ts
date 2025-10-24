import type { SocialPost } from "./socialPosts";
import { socialPosts } from "./socialPosts";

export interface SocialProfileStats {
  tweets: number;
  following: number;
  followers: number;
  likes: number;
}

export interface SocialProfileLink {
  label: string;
  url: string;
}

export interface SocialProfileData {
  id: string;
  name: string;
  username: string;
  bio: string;
  role?: string;
  location?: string;
  website?: SocialProfileLink;
  joined: string;
  avatar: string;
  cover?: string;
  stats: SocialProfileStats;
  highlightedPostId?: string;
}

export const defaultProfile: SocialProfileData = {
  id: "tyrian-trade",
  name: "Tyrian Trade",
  username: "tyrian_trade",
  bio: "Аналитика рынков, алгоритмические сделки и макроэкономика в формате коротких постов.",
  role: "Crypto Analyst",
  location: "Dubai, UAE",
  website: {
    label: "tyrian.trade",
    url: "https://tyrian.trade",
  },
  joined: "Март 2021",
  avatar: "https://i.pravatar.cc/300?img=33",
  cover:
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&h=400&fit=crop",
  stats: {
    tweets: 1480,
    following: 312,
    followers: 28400,
    likes: 9620,
  },
  highlightedPostId: "tyrian-long-post",
};

export const getProfileTimeline = (
  profile: SocialProfileData,
): SocialPost[] => {
  if (profile.highlightedPostId) {
    const pinned = socialPosts.find(
      (post) => post.id === profile.highlightedPostId,
    );
    if (pinned) {
      const rest = socialPosts.filter((post) => post.id !== pinned.id);
      return [pinned, ...rest];
    }
  }
  return socialPosts;
};
