import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, DollarSign, Users, UserCheck, Lock, Sparkles, Globe, UserPlus, BadgeCheck, AtSign } from "lucide-react";

type AccessType = "free" | "pay-per-post" | "subscribers-only" | "followers-only" | "premium";
type ReplyPolicy = "everyone" | "following" | "verified" | "mentioned";

interface AccessTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccessType: AccessType;
  currentPrice: number;
  currentReplyPolicy: ReplyPolicy;
  onSave: (accessType: AccessType, price: number, replyPolicy: ReplyPolicy) => void;
}

const replyOptions = [
  {
    id: "everyone" as const,
    label: "Everyone",
    description: "Anyone can reply to this post",
    icon: Globe,
    color: "#1D9BF0",
  },
  {
    id: "following" as const,
    label: "People you follow",
    description: "Only accounts you follow",
    icon: UserPlus,
    color: "#2EBD85",
  },
  {
    id: "verified" as const,
    label: "Verified accounts",
    description: "Only verified users can reply",
    icon: BadgeCheck,
    color: "#FFD166",
  },
  {
    id: "mentioned" as const,
    label: "Only mentioned",
    description: "Only people you mention",
    icon: AtSign,
    color: "#A06AFF",
  },
];

const accessOptions = [
  {
    id: "free" as const,
    label: "Free Access",
    description: "Anyone can see this post for free",
    icon: Sparkles,
    color: "#6CA8FF",
    bg: "bg-[#14243A]",
    border: "border-[#3B82F6]/40",
    gradient: "from-[#3B82F6]/20 to-[#6CA8FF]/10",
  },
  {
    id: "pay-per-post" as const,
    label: "Pay-per-post",
    description: "Users pay once to unlock this post",
    icon: DollarSign,
    color: "#A06AFF",
    bg: "bg-[#2A1C3F]",
    border: "border-[#A06AFF]/50",
    gradient: "from-[#A06AFF]/20 to-[#6B46C1]/10",
  },
  {
    id: "subscribers-only" as const,
    label: "Subscribers Only",
    description: "Only your monthly subscribers can see",
    icon: Users,
    color: "#2EBD85",
    bg: "bg-[#1A3A30]",
    border: "border-[#2EBD85]/40",
    gradient: "from-[#2EBD85]/20 to-[#1A6A4A]/10",
  },
  {
    id: "followers-only" as const,
    label: "Followers Only",
    description: "Only people who follow you can see",
    icon: UserCheck,
    color: "#FFD166",
    bg: "bg-[#3A3420]",
    border: "border-[#FFD166]/40",
    gradient: "from-[#FFD166]/20 to-[#B8941F]/10",
  },
  {
    id: "premium" as const,
    label: "Premium",
    description: "Premium tier subscribers only",
    icon: Lock,
    color: "#FF6B6B",
    bg: "bg-[#3A2020]",
    border: "border-[#FF6B6B]/40",
    gradient: "from-[#FF6B6B]/20 to-[#CC4444]/10",
  },
];

export function AccessTypeModal({
  isOpen,
  onClose,
  currentAccessType,
  currentPrice,
  currentReplyPolicy,
  onSave,
}: AccessTypeModalProps) {
  const [selectedType, setSelectedType] = useState<AccessType>(currentAccessType);
  const [price, setPrice] = useState<number>(currentPrice);
  const [selectedReplyPolicy, setSelectedReplyPolicy] = useState<ReplyPolicy>(currentReplyPolicy);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(currentAccessType);
      setPrice(currentPrice);
      setSelectedReplyPolicy(currentReplyPolicy);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentAccessType, currentPrice, currentReplyPolicy]);

  const handleSave = () => {
    console.log('[AccessTypeModal] handleSave - Передаём значения:', {
      selectedType,
      price,
      selectedReplyPolicy,
    });
    onSave(selectedType, price, selectedReplyPolicy);
    onClose();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setPrice(value);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[380px] max-h-[calc(100vh-120px)] overflow-hidden rounded-2xl border border-[#181B22] bg-black shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181B22] px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-white">Post Settings</h2>
            <p className="text-xs text-[#808283] mt-0.5">Configure access and reply permissions</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#808283] transition-all hover:bg-[#2F3336] hover:text-white active:scale-95"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 py-3 max-h-[calc(100vh-200px)] scrollbar">
          {/* Access Type Section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-white mb-2">Who can see this post</h3>
            <div className="space-y-2">
            {accessOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.id;
              
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedType(option.id)}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border p-2.5 text-left transition-all",
                    isSelected
                      ? `${option.border} bg-gradient-to-br ${option.gradient}`
                      : "border-[#1B1F27] hover:border-[#2F3336] bg-[#0A0D12]"
                  )}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="flex h-4 w-4 items-center justify-center rounded-full" style={{ backgroundColor: option.color }}>
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                        isSelected ? option.bg : "bg-[#1B1F27] group-hover:bg-[#2F3336]"
                      )}
                    >
                      <Icon className="h-4 w-4" style={{ color: option.color }} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-white">
                        {option.label}
                      </h3>
                      <p className="text-[11px] text-[#808283]">
                        {option.description}
                      </p>

                      {/* Price input for pay-per-post */}
                      {option.id === "pay-per-post" && isSelected && (
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs font-medium text-white">Price:</label>
                          <div className="flex items-center gap-1 rounded-xl border border-[#A06AFF]/40 bg-[#000000] px-2 py-1.5 transition-colors hover:border-[#A06AFF]">
                            <span className="text-sm font-bold text-[#A06AFF]">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={price}
                              onChange={handlePriceChange}
                              onClick={(e) => e.stopPropagation()}
                              className="w-16 bg-transparent text-sm font-semibold text-[#A06AFF] outline-none"
                              placeholder="5.00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>

          {/* Reply Policy Section */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-2">Who can reply</h3>
            <div className="space-y-1.5">
              {replyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedReplyPolicy === option.id;
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedReplyPolicy(option.id)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl border p-2.5 text-left transition-all",
                      isSelected
                        ? "border-[#1D9BF0]/50 bg-[#1D9BF0]/10"
                        : "border-[#1B1F27] hover:border-[#2F3336] bg-[#0A0D12]"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                          isSelected ? "bg-[#1D9BF0]/20" : "bg-[#1B1F27] group-hover:bg-[#2F3336]"
                        )}
                      >
                        <Icon className="h-4 w-4" style={{ color: isSelected ? option.color : "#808283" }} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white">
                          {option.label}
                        </h4>
                        <p className="text-[11px] text-[#808283]">
                          {option.description}
                        </p>
                      </div>

                      {/* Radio indicator */}
                      <div className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isSelected ? "border-[#1D9BF0]" : "border-[#2F3336]"
                      )}>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-[#1D9BF0]" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#181B22] px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#1B1F27] bg-transparent px-3 py-2 text-xs font-semibold text-[#808283] transition-all duration-200 hover:border-[#2F3336] hover:bg-white/5 hover:text-white hover:scale-[1.02] active:scale-[0.98] active:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#A06AFF] via-[#7F57FF] to-[#482090] px-3 py-2 text-xs font-semibold text-white shadow-[0_20px_44px_-20px_rgba(160,106,255,0.9)] transition-all duration-200 hover:shadow-[0_24px_50px_-18px_rgba(160,106,255,1)] hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.96] active:translate-y-0"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
