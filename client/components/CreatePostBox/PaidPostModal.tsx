import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaidPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PaidPostConfig) => void;
  initialConfig?: PaidPostConfig;
}

export interface PaidPostConfig {
  price: number;
}

export const PaidPostModal = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}: PaidPostModalProps) => {
  const [price, setPrice] = useState(initialConfig?.price || 5);

  if (!isOpen) return null;

  const handleSave = () => {
    const config: PaidPostConfig = {
      price,
    };
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[#181B22] bg-[#0C1014] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181B22] px-6 py-4">
          <h2 className="text-xl font-bold text-white">💎 Paid Post Settings</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-[#808283]" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {/* Info Banner */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#A06AFF]/30 bg-gradient-to-br from-[#A06AFF]/10 to-[#6B46C1]/10 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#A06AFF]/30 to-[#6B46C1]/30 text-2xl">
              💰
            </div>
            <div>
              <h3 className="font-semibold text-white">One-time Payment</h3>
              <p className="mt-1 text-xs text-[#808283]">
                Readers will pay once to unlock this post permanently
              </p>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-white">
              Price (USD)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-[#808283]">
                $
              </span>
              <input
                type="number"
                min="1"
                max="999"
                value={price}
                onChange={(e) =>
                  setPrice(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="h-14 w-full rounded-xl border border-[#1B1F27] bg-[#0C1014] pl-10 pr-4 text-lg font-semibold text-white transition-colors hover:border-[#A06AFF]/50 focus:border-[#A06AFF] focus:outline-none"
                placeholder="5"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-[#1B1F27] bg-gradient-to-br from-[#A06AFF]/5 to-[#6B46C1]/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#808283]">
              Preview
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#A06AFF]">
                ${price}
              </span>
              <span className="text-sm text-[#808283]">USD</span>
            </div>
            <p className="mt-2 text-xs text-[#808283]">
              One-time payment to unlock this post
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[#181B22] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#1B1F27] bg-[#0C1014] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#1C1430]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#6B46C1] px-4 py-3 font-semibold text-white shadow-lg shadow-[#A06AFF]/25 transition-all hover:shadow-xl hover:shadow-[#A06AFF]/40"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
