import type { SocialAuthor } from "./socialPosts";

export interface SocialComment {
  id: string;
  postId: string;
  author: SocialAuthor;
  timestamp: string;
  content: string;
  likes: number;
  replies?: number;
}

export const mockComments: Record<string, SocialComment[]> = {
  "crypto-video": [
    {
      id: "comment-1",
      postId: "crypto-video",
      author: {
        name: "Alex Morgan",
        avatar: "https://i.pravatar.cc/120?img=33",
        handle: "@alexmorgan",
        verified: true,
      },
      timestamp: "2h",
      content:
        "This is exactly what I've been waiting for! The analytics dashboard looks incredible.",
      likes: 42,
      replies: 3,
    },
    {
      id: "comment-2",
      postId: "crypto-video",
      author: {
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/120?img=20",
        handle: "@sarahchen",
        verified: false,
      },
      timestamp: "5h",
      content: "Can't wait to try this out. When's the launch date?",
      likes: 18,
      replies: 1,
    },
  ],
  "ai-article": [
    {
      id: "comment-3",
      postId: "ai-article",
      author: {
        name: "Mike Trading",
        avatar: "https://i.pravatar.cc/120?img=51",
        handle: "@miketrading",
        verified: false,
      },
      timestamp: "1h",
      content:
        "Great breakdown! I've been following these strategies for years and they work.",
      likes: 89,
      replies: 5,
    },
    {
      id: "comment-4",
      postId: "ai-article",
      author: {
        name: "Emma Rodriguez",
        avatar: "https://i.pravatar.cc/120?img=44",
        handle: "@emmarodriguez",
        verified: true,
      },
      timestamp: "3h",
      content:
        "The asymmetric risk/reward point is key. Most people overlook this completely.",
      likes: 124,
      replies: 8,
    },
    {
      id: "comment-5",
      postId: "ai-article",
      author: {
        name: "David Kim",
        avatar: "https://i.pravatar.cc/120?img=15",
        handle: "@davidkim",
        verified: false,
      },
      timestamp: "4h",
      content:
        "I use a mix of momentum and contrarian strategies. Works great in different market conditions.",
      likes: 56,
      replies: 2,
    },
  ],
  "personal-highlight": [
    {
      id: "comment-6",
      postId: "personal-highlight",
      author: {
        name: "James Wilson",
        avatar: "https://i.pravatar.cc/120?img=68",
        handle: "@jameswilson",
        verified: true,
      },
      timestamp: "30m",
      content:
        "Отличная стратегия! Интересно посмотреть как это сработает в следующем квартале.",
      likes: 156,
      replies: 12,
    },
    {
      id: "comment-7",
      postId: "personal-highlight",
      author: {
        name: "Maria Ivanova",
        avatar: "https://i.pravatar.cc/120?img=25",
        handle: "@mariaivanova",
        verified: false,
      },
      timestamp: "1h",
      content:
        "Какие конкретно инструменты вы используете для хеджирования позиций?",
      likes: 89,
      replies: 4,
    },
    {
      id: "comment-8",
      postId: "personal-highlight",
      author: {
        name: "Robert Taylor",
        avatar: "https://i.pravatar.cc/120?img=59",
        handle: "@roberttaylor",
        verified: true,
      },
      timestamp: "2h",
      content:
        "Looking forward to the AMA session! Will definitely join and ask about macro trends.",
      likes: 203,
      replies: 6,
    },
  ],
};

export const getCommentsByPostId = (postId: string): SocialComment[] => {
  return mockComments[postId] || [];
};
