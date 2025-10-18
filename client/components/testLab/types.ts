import type { SentimentType, SocialAuthor, SocialPostType } from "@/data/socialPosts";

import type { LabCategory } from "./categoryConfig";

export type LabAudience = "everyone" | "followers";

export interface LabPostAuthor extends SocialAuthor {
  isFollowed?: boolean;
}

export interface LabPost {
  id: string;
  type: SocialPostType;
  author: LabPostAuthor;
  timestamp: string;
  title: string;
  preview?: string;
  body?: string;
  videoUrl?: string;
  mediaUrl?: string;
  sentiment: SentimentType;
  likes: number;
  comments: number;
  views?: number;
  hashtags?: string[];
  isFollowing?: boolean;
  category: LabCategory;
  isPremium?: boolean;
  price?: number;
  subscriptionPrice?: number;
  unlocked?: boolean;
  stickyTag?: string;
  audience?: LabAudience;
  assets?: string[];
}
