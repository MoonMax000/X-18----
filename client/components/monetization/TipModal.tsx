import React, { useState } from "react";
import { X, Heart, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePayment, getErrorMessage } from "@/hooks/usePayment";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  authorName: string;
  authorAvatar: string;
}

const PRESET_AMOUNTS = [5, 10, 25, 50];

export default function TipModal({
  isOpen,
  onClose,
  authorId,
  authorName,
  authorAvatar,
}: TipModalProps) {
  const { status, error, sendTip, reset } = usePayment();
  const [amount, setAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    const success = await sendTip(authorId, finalAmount, message);

    if (success) {
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    reset();
    setAmount(10);
    setCustomAmount("");
    setMessage("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-[#2F2F31] bg-[#0B0E13] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Отправить донат</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Author Info */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent p-4">
          <img src={authorAvatar} alt={authorName} className="h-12 w-12 rounded-full ring-2 ring-white/10" />
          <div>
            <p className="font-semibold text-white">{authorName}</p>
            <p className="text-sm text-gray-400">Получит ваш донат</p>
          </div>
        </div>

        {/* Status */}
        {status === "success" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-500/10 p-4 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-semibold">Донат отправлен! ✓</p>
              <p className="text-sm">Вы отправили ${customAmount || amount} {authorName}. Спасибо за поддержку!</p>
            </div>
          </div>
        )}

        {status === "failed" && error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Ошибка</p>
              <p className="text-sm">{getErrorMessage(error)}</p>
            </div>
          </div>
        )}

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-white">Выберите сумму</label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount("");
                }}
                disabled={status === "processing"}
                className={cn(
                  "rounded-xl border p-3 transition-all duration-200",
                  !customAmount && amount === preset
                    ? "border-[#A06AFF]/70 bg-[#1C1430] text-white shadow-[0_8px_22px_-18px_rgba(160,106,255,0.7)]"
                    : "border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent text-gray-400 hover:border-[#A06AFF]/40 hover:bg-[#1C1430]/70"
                )}
              >
                <span className="text-lg font-bold">${preset}</span>
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-xs text-gray-400">Или укажите свою сумму</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0"
                disabled={status === "processing"}
                className="w-full rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent py-2.5 pl-8 pr-3 text-white placeholder-gray-500 transition-colors focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-white">
            Сообщение <span className="text-gray-500">(опционально)</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Спасибо за отличную аналитику!"
            maxLength={200}
            disabled={status === "processing"}
            className="w-full rounded-xl border border-[#2F2F31] bg-gradient-to-br from-white/[0.02] to-transparent p-3 text-white placeholder-gray-500 transition-colors focus:border-[#A06AFF] focus:outline-none disabled:opacity-50"
            rows={3}
          />
          <p className="mt-1 text-right text-xs text-gray-500">{message.length}/200</p>
        </div>

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
            onClick={handleSend}
            disabled={status === "processing" || status === "success"}
            className="flex-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_-20px_rgba(244,114,182,0.75)] transition-all hover:shadow-[0_16px_40px_-12px_rgba(244,114,182,1)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
          >
            {status === "processing" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Отправка...
              </span>
            ) : status === "success" ? (
              "Отправлено ✓"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Heart className="h-4 w-4" />
                Отправить ${customAmount || amount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
