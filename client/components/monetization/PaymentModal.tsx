import React, { useState, useEffect } from "react";
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayment, getErrorMessage } from "@/hooks/usePayment";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { createStripeCheckout, redirectToStripeCheckout } from "@/lib/stripe";
import Portal from "@/components/ui/Portal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "unlock" | "subscribe";
  amount: number;
  postId?: string;
  authorId?: string;
  authorName?: string;
  plan?: "monthly" | "yearly";
  onSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  type,
  amount,
  postId,
  authorId,
  authorName,
  plan = "monthly",
  onSuccess,
}: PaymentModalProps) {
  const { status, error, purchasePost, subscribe, reset } = usePayment();
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);

  // Lock body scroll when modal is open
  useModalScrollLock(isOpen);

  // Block all clicks outside modal
  useEffect(() => {
    if (!isOpen) return;

    const blockClicks = (e: MouseEvent) => {
      const modalContent = document.querySelector('[data-modal-content="payment"]');
      const target = e.target as Node;
      
      // If click is outside modal content, prevent it from reaching other elements
      if (modalContent && !modalContent.contains(target)) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    // Capture phase to intercept before other handlers
    document.addEventListener('click', blockClicks, { capture: true });
    return () => document.removeEventListener('click', blockClicks, { capture: true });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStripeCheckout = async () => {
    setIsLoadingStripe(true);

    try {
      // Create Stripe Checkout session
      const checkoutUrl = await createStripeCheckout({
        type,
        amount,
        postId,
        authorId,
        authorName,
        plan,
        successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancelled`,
      });

      // Close modal before redirect
      handleClose();

      // Redirect to Stripe Checkout
      // In production, this redirects to real Stripe checkout page
      // For demo, we'll simulate the payment flow
      console.log("🔵 Redirecting to Stripe Checkout:", checkoutUrl);
      
      // Mock successful payment after 2 seconds (remove in production)
      setTimeout(async () => {
        let success = false;
        if (type === "unlock" && postId) {
          success = await purchasePost(postId, amount);
        } else if (type === "subscribe" && authorId) {
          success = await subscribe(authorId, plan);
        }
        
        if (success) {
          onSuccess?.();
        }
      }, 2000);

      // PRODUCTION CODE (uncomment when Stripe is configured):
      // redirectToStripeCheckout(checkoutUrl);
    } catch (error) {
      console.error("Stripe Checkout error:", error);
      setIsLoadingStripe(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          data-modal-content="payment"
          className="relative w-full max-w-md rounded-2xl border border-[#2F2F31] bg-[#0B0E13] p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {type === "unlock" ? "Разблокировать пост" : "Оформить подписку"}
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status */}
          {status === "success" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold">Готово! ✓</p>
                <p className="text-sm">
                  {type === "unlock"
                    ? "Пост разблокирован. Наслаждайтесь чтением!"
                    : `Подписка на ${authorName} оформлена!`}
                </p>
              </div>
            </div>
          )}

          {status === "failed" && error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Ошибка оплаты</p>
                <p className="text-sm">{getErrorMessage(error)}</p>
              </div>
            </div>
          )}

          {status === "processing" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-semibold">Обработка платежа...</p>
                <p className="text-sm">Пожалуйста, подождите. Не закрывайте окно.</p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="mb-6 rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Сумма</span>
              <span className="text-2xl font-bold text-white">
                ${amount}
                {type === "subscribe" && <span className="text-sm text-gray-400">/{plan === "monthly" ? "мес" : "год"}</span>}
              </span>
            </div>
            {type === "subscribe" && (
              <p className="mt-2 text-xs text-gray-500">
                {plan === "monthly"
                  ? "Следующее списание через 30 дней"
                  : "Следующее списание через 1 год (экономия 17%)"}
              </p>
            )}
          </div>

          {/* Stripe Info */}
          {status !== "success" && (
            <div className="mb-6 rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#635BFF]/10 p-2">
                  <CreditCard className="h-5 w-5 text-[#635BFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">Безопасная оплата через Stripe</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Мы используем Stripe для обработки платежей. Ваши данные защищены и не хранятся на наших серверах.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>🔒 256-bit SSL</span>
                    <span>•</span>
                    <span>PCI DSS Level 1</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={status === "processing" || isLoadingStripe}
              className="flex-1 rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-[#A06AFF]/40 disabled:opacity-50"
            >
              Отменить
            </button>
            <button
              onClick={handleStripeCheckout}
              disabled={status === "processing" || status === "success" || isLoadingStripe}
              className="group flex-1 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#0A2540] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-20px_rgba(99,91,255,0.75)] transition-all hover:shadow-[0_16px_40px_-12px_rgba(99,91,255,1)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
            >
              {status === "processing" || isLoadingStripe ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLoadingStripe ? "Загрузка..." : "Обработка..."}
                </span>
              ) : status === "success" ? (
                "Готово ✓"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Оплатить ${amount}
                  <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
