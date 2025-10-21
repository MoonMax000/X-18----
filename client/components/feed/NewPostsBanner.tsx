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
        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
      >
        <ArrowUp className="h-4 w-4 animate-bounce" />
        <span>
          {count} new {count === 1 ? "post" : "posts"} available
        </span>
      </button>
    </div>
  );
}
