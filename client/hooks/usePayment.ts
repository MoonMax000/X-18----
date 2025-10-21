import { useState } from "react";
import { unlockPost, subscribeToAuthor } from "./useGatingCheck";

export type PaymentStatus = "idle" | "processing" | "success" | "failed";

export interface PaymentResult {
  status: PaymentStatus;
  error?: string;
}

export function usePayment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const purchasePost = async (postId: string, amount: number): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Имитация 10% ошибок
      if (Math.random() < 0.1) {
        throw new Error("card_declined");
      }

      // Optimistic unlock
      unlockPost(postId);

      setStatus("success");
      return true;
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "payment_failed");
      return false;
    }
  };

  const subscribe = async (authorId: string, plan: "monthly" | "yearly"): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Имитация 5% ошибок
      if (Math.random() < 0.05) {
        throw new Error("payment_failed");
      }

      // Optimistic subscribe
      subscribeToAuthor(authorId);

      setStatus("success");
      return true;
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "subscription_failed");
      return false;
    }
  };

  const sendTip = async (authorId: string, amount: number, message?: string): Promise<boolean> => {
    setStatus("processing");
    setError(null);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
      return true;
    } catch (err: any) {
      setStatus("failed");
      setError(err.message || "tip_failed");
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
