import { useState } from "react";

export type PaymentStatus = "idle" | "processing" | "success" | "failed";

export interface PaymentResult {
  status: PaymentStatus;
  error?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export function usePayment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // Send httpOnly cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const purchasePost = async (postId: string, amount: number): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Create payment intent for post purchase
      const data = await fetchAPI('/payments/create-post-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ postId, amount }),
      });

      if (data && data.clientSecret) {
        // Payment intent created successfully
        // The PaymentModal component will handle the actual Stripe payment
        setStatus("success");
        return true;
      } else {
        throw new Error("Failed to create payment intent");
      }
    } catch (err: any) {
      setStatus("failed");
      const errorMessage = err.message || "payment_failed";
      setError(errorMessage);
      console.error("Purchase post error:", err);
      return false;
    }
  };

  const subscribe = async (authorId: string, plan: "monthly" | "yearly" = "monthly"): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Create subscription payment intent
      const data = await fetchAPI('/payments/create-subscription-intent', {
        method: 'POST',
        body: JSON.stringify({ authorId, plan }),
      });

      if (data && data.clientSecret) {
        // Subscription intent created successfully
        // The PaymentModal component will handle the actual Stripe payment
        setStatus("success");
        return true;
      } else {
        throw new Error("Failed to create subscription intent");
      }
    } catch (err: any) {
      setStatus("failed");
      const errorMessage = err.message || "subscription_failed";
      setError(errorMessage);
      console.error("Subscribe error:", err);
      return false;
    }
  };

  const sendTip = async (authorId: string, amount: number, message?: string): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Create tip payment intent
      const data = await fetchAPI('/payments/create-tip-intent', {
        method: 'POST',
        body: JSON.stringify({ authorId, amount, message }),
      });

      if (data && data.clientSecret) {
        setStatus("success");
        return true;
      } else {
        throw new Error("Failed to create tip intent");
      }
    } catch (err: any) {
      setStatus("failed");
      const errorMessage = err.message || "tip_failed";
      setError(errorMessage);
      console.error("Send tip error:", err);
      return false;
    }
  };

  const checkPostAccess = async (postId: string): Promise<boolean> => {
    try {
      const data = await fetchAPI(`/payments/check-post-access/${postId}`);
      return data?.hasAccess || false;
    } catch (err) {
      console.error("Check post access error:", err);
      return false;
    }
  };

  const reset = () => {
    setStatus("idle");
    setError(null);
  };

  return {
    status,
    error,
    purchasePost,
    subscribe,
    sendTip,
    checkPostAccess,
    reset,
  };
}

// Функция для получения сообщения об ошибке
export function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    card_declined: "Ваша карта была отклонена",
    insufficient_funds: "Недостаточно средств на карте",
    payment_failed: "Ошибка оплаты. Попробуйте ещё раз",
    already_purchased: "Вы уже приобрели этот пост",
    already_subscribed: "У вас уже есть активная подписка",
    subscription_failed: "Ошибка подписки. Попробуйте позже",
    tip_failed: "Не удалось отправить донат",
    network_error: "Ошибка сети. Проверьте подключение",
  };

  return messages[errorCode] || "Произошла ошибка";
}
