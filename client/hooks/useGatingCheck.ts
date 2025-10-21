import { useState, useEffect } from "react";
import type { Post } from "@/features/feed/types";

// Mock current user (в реальности из AuthContext)
const MOCK_USER_ID = "user-current";
const MOCK_SUBSCRIPTIONS = new Set(["user-456"]); // подписки пользователя
const MOCK_PURCHASES = new Set(["post-123"]); // разовые покупки
const MOCK_FOLLOWING = new Set(["user-456", "user-789"]); // фолловинги

interface GatingCheckResult {
  canAccess: boolean;
  reason: "author" | "public" | "follower" | "subscribed" | "purchased" | "denied";
  loading: boolean;
}

export function useGatingCheck(post: Post, userId?: string): GatingCheckResult {
  const [result, setResult] = useState<GatingCheckResult>({
    canAccess: false,
    reason: "denied",
    loading: true,
  });

  useEffect(() => {
    async function check() {
      const currentUserId = userId || MOCK_USER_ID;

      // 1. Автор всегда видит
      if (currentUserId === post.author.userId) {
        setResult({ canAccess: true, reason: "author", loading: false });
        return;
      }

      // 2. Публичный пост
      if (post.accessLevel === "public") {
        setResult({ canAccess: true, reason: "public", loading: false });
        return;
      }

      // 3. Анонимы не видят ��риватное
      if (!currentUserId) {
        setResult({ canAccess: false, reason: "denied", loading: false });
        return;
      }

      // 4. Followers-only
      if (post.accessLevel === "followers") {
        const isFollower = MOCK_FOLLOWING.has(post.author.userId);
        setResult({
          canAccess: isFollower,
          reason: isFollower ? "follower" : "denied",
          loading: false,
        });
        return;
      }

      // 5. Subscribers-only
      if (post.accessLevel === "subscribers") {
        const isSubscribed = MOCK_SUBSCRIPTIONS.has(post.author.userId);
        setResult({
          canAccess: isSubscribed,
          reason: isSubscribed ? "subscribed" : "denied",
          loading: false,
        });
        return;
      }

      // 6. Paid (one-off)
      if (post.accessLevel === "paid") {
        const hasPurchased = MOCK_PURCHASES.has(post.id);
        const isSubscribed = MOCK_SUBSCRIPTIONS.has(post.author.userId);
        const canAccess = hasPurchased || isSubscribed;
        setResult({
          canAccess,
          reason: hasPurchased ? "purchased" : isSubscribed ? "subscribed" : "denied",
          loading: false,
        });
        return;
      }

      setResult({ canAccess: false, reason: "denied", loading: false });
    }

    check();
  }, [post.id, post.accessLevel, post.author.userId, userId]);

  return result;
}

// Mock API для проверки доступа (заменить на реальный API)
export async function checkAccessAPI(postId: string, userId: string): Promise<{
  canAccess: boolean;
  reason: string;
}> {
  // Имитация задержки сети
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock логика
  return {
    canAccess: Math.random() > 0.5,
    reason: "subscribed",
  };
}

// Функция для разблокировки поста (optimistic update)
export function unlockPost(postId: string) {
  MOCK_PURCHASES.add(postId);
}

// Функция для подписки на автора (optimistic update)
export function subscribeToAuthor(authorId: string) {
  MOCK_SUBSCRIPTIONS.add(authorId);
}
