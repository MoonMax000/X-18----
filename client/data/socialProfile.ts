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
  location: "Dubai, UAE",
  website: {
    label: "tyrian.trade",
    url: "https://tyrian.trade",
  },
  joined: "Март 2021",
  avatar: "https://api.builder.io/api/v1/image/assets/TEMP/8dcd522167ed749bb95dadfd1a39f43e695d33a0?width=500",
  cover:
    "https://api.builder.io/api/v1/image/assets/TEMP/df14e9248350a32d57d5b54a31308a2e855bb11e?width=2118",
  stats: {
    tweets: 1480,
    following: 312,
    followers: 28400,
    likes: 9620,
  },
  highlightedPostId: "ai-article",
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
