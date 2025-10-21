// features/feed/hooks/useFeedTimeline.ts
import { useCallback, useEffect, useState } from "react";
import type { Post } from "../types";

export function useFeedTimeline(initialPosts: Post[], likedIds: string[] = []) {
  const [displayed, setDisplayed] = useState<Post[]>(
    initialPosts.map(p => (likedIds.includes(p.id) ? { ...p, __liked: true } as any : p))
  );
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNewCount(prev => prev + Math.floor(Math.random() * 3) + 1), 8000);
    return () => clearInterval(id);
  }, []);

  const loadNew = useCallback(() => {
    setNewCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { displayed, setDisplayed, newCount, loadNew };
}
