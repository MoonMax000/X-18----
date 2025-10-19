import type { SocialAuthor } from "./socialPosts";

export interface SocialComment {
  id: string;
  postId: string;
  author: SocialAuthor;
  timestamp: string;
  text: string;
  likes: number;
  replies?: SocialComment[];
  replyCount?: number;
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
      text:
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
      text: "Can't wait to try this out. When's the launch date?",
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
      text:
        "Great breakdown! I've been following these strategies for years and they work.",
      likes: 89,
      replyCount: 2,
      replies: [
        {
          id: "comment-3-1",
          postId: "ai-article",
          author: {
            name: "Sarah Chen",
            avatar: "https://i.pravatar.cc/120?img=20",
            handle: "@sarahchen",
            verified: false,
          },
          timestamp: "45m",
          text: "Which strategy has worked best for you in the current market?",
          likes: 12,
        },
        {
          id: "comment-3-2",
          postId: "ai-article",
          author: {
            name: "Mike Trading",
            avatar: "https://i.pravatar.cc/120?img=51",
            handle: "@miketrading",
            verified: false,
          },
          timestamp: "30m",
          text: "@sarahchen Contrarian plays have been gold this year. Buy when others panic!",
          likes: 28,
        },
      ],
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
      text:
        "The asymmetric risk/reward point is key. Most people overlook this completely.",
      likes: 124,
      replyCount: 1,
      replies: [
        {
          id: "comment-4-1",
          postId: "ai-article",
          author: {
            name: "Alex Morgan",
            avatar: "https://i.pravatar.cc/120?img=33",
            handle: "@alexmorgan",
            verified: true,
          },
          timestamp: "2h",
          text: "Exactly! I only take trades with at least 3:1 R:R. Game changer.",
          likes: 45,
        },
      ],
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
      text:
        "I use a mix of momentum and contrarian strategies. Works great in different market conditions.",
      likes: 56,
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
      text:
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
      text:
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
      text:
        "Looking forward to the AMA session! Will definitely join and ask about macro trends.",
      likes: 203,
      replies: 6,
    },
  ],
};

export const getCommentsByPostId = (postId: string): SocialComment[] => {
  return mockComments[postId] || [];
};
