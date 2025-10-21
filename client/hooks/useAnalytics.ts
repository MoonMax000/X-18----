import { useCallback } from "react";
import type { AnalyticsEvent, BaseEventPayload } from "@/shared/analytics/events";

interface AnalyticsPayload extends BaseEventPayload {
  [key: string]: any;
}

/**
 * Хук для отправки аналитических событий
 * 
 * Поддерживает:
 * - Google Analytics (gtag)
 * - Собственный backend (/api/analytics/events)
 * - Console лог в dev mode
 */
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent, payload: AnalyticsPayload = {}) => {
    const eventData = {
      event,
      payload,
      timestamp: new Date().toISOString(),
      userId: getUserId(), // из AuthContext или localStorage
    };

    // Console log в dev mode
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", eventData);
    }

    // Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event, payload);
    }

    // Собственный backend (fire-and-forget)
    fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    }).catch(() => {
      // Игнорируем ошибки (не хотим ломать UX из-за аналитики)
    });
  }, []);

  return { track };
}

// Helper функции

function getUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  
  // Mock user ID (в реальности из AuthContext)
  return localStorage.getItem("userId") || undefined;
}

/**
 * Примеры использования:
 * 
 * const { track } = useAnalytics();
 * 
 * // При создании поста
 * track("post_create", { 
 *   postId: "post-123", 
 *   type: "idea", 
 *   topic: "analysis",
 *   accessLevel: "paid"
 * });
 * 
 * // При разблокировке
 * track("post_unlock", { 
 *   postId: "post-123", 
 *   amount: 9, 
 *   method: "card" 
 * });
 * 
 * // При подписке
 * track("subscribe_success", { 
 *   authorId: "user-456", 
 *   subscriptionId: "sub-999", 
 *   amount: 29 
 * });
 * 
 * // При применении фильтров
 * track("filter_apply", { 
 *   tab: "ideas", 
 *   type: "idea", 
 *   topic: "news", 
 *   ticker: "$BTC" 
 * });
 */
