// features/feed/hooks/useFeedTimeline.ts
import { useCallback, useEffect, useState, useRef } from "react";
import type { Post } from "../types";

/**
 * Hook for managing feed timeline with WebSocket-like new posts detection
 * Simulates real-time updates for demo purposes
 * In production, would connect to WebSocket server
 */
export function useFeedTimeline(initialPosts: Post[], likedIds: string[] = []) {
  const [displayed, setDisplayed] = useState<Post[]>(
    initialPosts.map(p => (likedIds.includes(p.id) ? { ...p, __liked: true } as any : p))
  );
  const [newCount, setNewCount] = useState(0);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const wsSimulatorRef = useRef<NodeJS.Timeout>();

  // Simulate WebSocket connection that detects new posts
  useEffect(() => {
    // Clear any existing timer
    if (wsSimulatorRef.current) {
      clearInterval(wsSimulatorRef.current);
    }

    // Simulate new posts arriving every 12-20 seconds
    wsSimulatorRef.current = setInterval(() => {
      const shouldReceiveNewPost = Math.random() > 0.4; // 60% chance

      if (shouldReceiveNewPost) {
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 new posts
        setNewCount(prev => prev + count);

        // In production, this would be actual new posts from WebSocket
        // For demo, we just increment counter
      }
    }, Math.random() * 8000 + 12000); // 12-20 seconds

    return () => {
      if (wsSimulatorRef.current) {
        clearInterval(wsSimulatorRef.current);
      }
    };
  }, []);

  /**
   * Load new posts and add them to the top of the feed
   * In production, this would fetch from API using IDs from WebSocket
   */
  const loadNew = useCallback(() => {
    if (newCount === 0) return;

    setNewCount(0);

    // Smooth scroll to top to show new posts
    window.scrollTo({ top: 0, behavior: "smooth" });

    // In production:
    // const newPosts = await fetchNewPosts(pendingPostIds);
    // setDisplayed(prev => [...newPosts, ...prev]);
  }, [newCount]);

  return { displayed, setDisplayed, newCount, loadNew };
}
