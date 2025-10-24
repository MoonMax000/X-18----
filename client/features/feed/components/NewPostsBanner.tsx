import React from "react";
import { ChevronUp } from "lucide-react";

interface NewPostsBannerProps {
  count: number;
  onClick: () => void;
}

export default function NewPostsBanner({ count, onClick }: NewPostsBannerProps) {
  if (count === 0) return null;

  return (
    <div className="mt-2 mb-4 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold text-white transition-all duration-200 bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:from-[#B47FFF] hover:to-[#5A2FA5] shadow-[0_6px_12px_rgba(128,90,213,0.3)] hover:shadow-[0_10px_20px_rgba(128,90,213,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B47FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-white opacity-75 animate-ping" />
          <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-white opacity-90 animate-pulse" />
          <ChevronUp className="relative z-10 h-2.5 w-2.5 text-white" />
        </span>
        <span>
          {count} new {count === 1 ? "post" : "posts"} available
        </span>
      </button>
    </div>
  );
}
