import React, { useState } from "react";
import { X, CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayment, getErrorMessage } from "@/hooks/usePayment";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal">("card");

  if (!isOpen) return null;

  const handlePayment = async () => {
    let success = false;

    if (type === "unlock" && postId) {
      success = await purchasePost(postId, amount);
    } else if (type === "subscribe" && authorId) {
      success = await subscribe(authorId, plan);
    }

    if (success) {
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
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
              <p className="font-semibold">Обраб��тка платежа...</p>
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

        {/* Payment Method */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-white">Способ оплаты</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("card")}
              disabled={status === "processing"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border p-3 transition-all duration-200",
                paymentMethod === "card"
                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                  : "border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent text-gray-400 hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-medium">Карта</span>
            </button>
            <button
              onClick={() => setPaymentMethod("paypal")}
              disabled={status === "processing"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border p-3 transition-all duration-200",
                paymentMethod === "paypal"
                  ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                  : "border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent text-gray-400 hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
              )}
            >
              <span className="text-sm font-medium">PayPal</span>
            </button>
          </div>
        </div>

        {/* Mock Card Input */}
        {paymentMethod === "card" && status !== "success" && (
          <div className="mb-6 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Номер карты</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                disabled={status === "processing"}
                className="w-full rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent px-3 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Срок действия</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  disabled={status === "processing"}
                  className="w-full rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent px-3 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  disabled={status === "processing"}
                  className="w-full rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent px-3 py-2.5 text-white placeholder-gray-500 transition-colors focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="flex-1 rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:border-[#A06AFF]/40 disabled:opacity-50"
          >
            Отменить
          </button>
          <button
            onClick={handlePayment}
            disabled={status === "processing" || status === "success"}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)] transition-all hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
          >
            {status === "processing" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Обработка...
              </span>
            ) : status === "success" ? (
              "Готово ✓"
            ) : (
              `Оплатить $${amount}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
