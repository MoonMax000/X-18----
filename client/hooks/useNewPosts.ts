import { useState, useEffect, useCallback } from "react";
import type { Post } from "@/features/feed/types";
import type { FeedFilters } from "@/shared/types";

interface UseNewPostsOptions {
  feedParams: Partial<FeedFilters>;
  enabled?: boolean;
}

/**
 * Хук для реалтайм-уведомлений о новых постах через WebSocket
 * 
 * В реальном приложении:
 * - Подключается к WebSocket серверу (wss://api.tyrian.trade/feed)
 * - Подписывается на события new_post с фильтрами
 * - Накапливает ID новых постов
 * - Показывает баннер "X new posts available"
 * 
 * Сейчас:
 * - Mock через setInterval (имитация новых постов каждые 30 секунд)
 * - Fallback для тестирования без backend
 */
export function useNewPosts({ feedParams, enabled = true }: UseNewPostsOptions) {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [newPostsIds, setNewPostsIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled) return;

    // Mock WebSocket: имитируем новые посты каждые 30 секунд
    const interval = setInterval(() => {
      // 50% шанс появления новых постов
      if (Math.random() > 0.5) {
        const count = Math.floor(Math.random() * 5) + 1; // 1-5 новых постов
        const newIds = Array.from({ length: count }, (_, i) => `new-post-${Date.now()}-${i}`);
        
        setNewPostsIds((prev) => [...prev, ...newIds]);
        setNewPostsCount((prev) => prev + count);
      }
    }, 30000); // каждые 30 секунд

    return () => clearInterval(interval);

    /* Реальная реализация с WebSocket:
    
    const ws = new WebSocket("wss://api.tyrian.trade/feed");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          action: "subscribe",
          params: feedParams,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_post") {
        setNewPostsIds((prev) => [...prev, data.postId]);
        setNewPostsCount((prev) => prev + 1);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      // Fallback на polling если WebSocket не работает
    };

    return () => {
      ws.close();
    };
    */
  }, [enabled, feedParams]);

  /**
   * Загружает новые посты и очищает очередь
   */
  const loadNewPosts = useCallback(async (): Promise<Post[]> => {
    if (newPostsIds.length === 0) return [];

    // Mock: возвращаем пустой массив (в реальности - запрос на API)
    // const res = await fetch(`/api/posts?ids=${newPostsIds.join(",")}`);
    // const posts = await res.json();

    setNewPostsCount(0);
    setNewPostsIds([]);

    return []; // Вернём моковые посты когда будет API

    /* Реальная реализация:
    
    try {
      const response = await fetch(`/api/posts?ids=${newPostsIds.join(",")}`);
      const posts = await response.json();
      
      setNewPostsCount(0);
      setNewPostsIds([]);
      
      return posts;
    } catch (error) {
      console.error("Failed to load new posts:", error);
      return [];
    }
    */
  }, [newPostsIds]);

  /**
   * Сбрасывает счётчик новых постов без загрузки
   */
  const dismissNewPosts = useCallback(() => {
    setNewPostsCount(0);
    setNewPostsIds([]);
  }, []);

  return {
    newPostsCount,
    loadNewPosts,
    dismissNewPosts,
  };
}

/**
 * Пример использования:
 * 
 * const { newPostsCount, loadNewPosts } = useNewPosts({
 *   feedParams: { tab: "all", topic: "news" },
 *   enabled: true
 * });
 * 
 * // В компоненте:
 * {newPostsCount > 0 && (
 *   <button onClick={async () => {
 *     const newPosts = await loadNewPosts();
 *     setPosts(prev => [...newPosts, ...prev]);
 *   }}>
 *     {newPostsCount} new posts available
 *   </button>
 * )}
 */
