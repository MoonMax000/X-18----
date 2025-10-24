import React from "react";
import { ArrowUp } from "lucide-react";

interface NewPostsBannerProps {
  count: number;
  onClick: () => void;
}

export default function NewPostsBanner({ count, onClick }: NewPostsBannerProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex justify-center py-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={onClick}
        className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-3 py-1.5 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 scale-[0.7]"
      >
        <ArrowUp className="h-3.5 w-3.5 animate-bounce" />
        <span>
          {count} new {count === 1 ? "post" : "posts"} available
        </span>
      </button>
    </div>
  );
}
