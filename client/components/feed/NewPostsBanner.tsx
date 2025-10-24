import React from "react";
import { ArrowUp } from "lucide-react";

interface NewPostsBannerProps {
  count: number;
  onClick: () => void;
}

export default function NewPostsBanner({ count, onClick }: NewPostsBannerProps) {
  if (count === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex justify-center py-1 animate-in fade-in slide-in-from-top-2 duration-300">
      <button
        onClick={onClick}
        className="group flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-2.5 py-0.5 text-[9px] font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
      >
        <ArrowUp className="h-2.5 w-2.5 animate-bounce" />
        <span>
          {count} new {count === 1 ? "post" : "posts"}
        </span>
      </button>
    </div>
  );
}
