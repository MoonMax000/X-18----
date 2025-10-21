import { useMemo } from "react";
import type { Post } from "@/features/feed/types";

// Параметры Hot Score (можно вынести в конфиг)
const HOT_SCORE_CONFIG = {
  likesWeight: 1,
  commentsWeight: 3, // комменты ценнее
  repostsWeight: 2,
  viewsWeight: 0.01, // просмотры меньше влияют
  decayHalfLife: 24, // затухание за 24 часа
};

/**
 * Рассчитывает "горячесть" поста
 * 
 * Формула:
 * hotScore = engagement × decay
 * 
 * engagement = (likes × 1) + (comments × 3) + (reposts × 2) + (views × 0.01)
 * decay = e^(-ageHours / 24)
 * 
 * @param post - пост
 * @param now - текущее время (для консистентности расчётов)
 * @returns число (чем выше, тем "горячее")
 */
export function calculateHotScore(post: Post, now: Date): number {
  const postDate = new Date(post.timestamp);
  const ageMs = now.getTime() - postDate.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Экспоненциальное затухание: e^(-ageHours / halfLife)
  const decay = Math.exp(-ageHours / HOT_SCORE_CONFIG.decayHalfLife);

  // Взвешенная сумма engagement
  const engagement =
    (post.stats.likes || 0) * HOT_SCORE_CONFIG.likesWeight +
    (post.stats.comments || 0) * HOT_SCORE_CONFIG.commentsWeight +
    (post.stats.reposts || 0) * HOT_SCORE_CONFIG.repostsWeight +
    (post.stats.views || 0) * HOT_SCORE_CONFIG.viewsWeight;

  return engagement * decay;
}

/**
 * Хук для сортировки постов по Hot Score
 * 
 * @param posts - массив постов
 * @param enabled - включена ли сортировка по Hot
 * @returns отсортированный массив (новая ссылка, если enabled=true)
 */
export function useHotScore(posts: Post[], enabled: boolean): Post[] {
  return useMemo(() => {
    if (!enabled || posts.length === 0) {
      return posts;
    }

    const now = new Date();
    
    // Создаём новый массив с расчётом hot score
    const postsWithScore = posts.map((post) => ({
      post,
      hotScore: calculateHotScore(post, now),
    }));

    // Сортируем по убыванию hot score
    postsWithScore.sort((a, b) => b.hotScore - a.hotScore);

    // Возвращаем только посты
    return postsWithScore.map((item) => item.post);
  }, [posts, enabled]);
}

/**
 * Пример использования:
 * 
 * const sortedPosts = useHotScore(posts, feedMode === "hot");
 */
