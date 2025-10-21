import React, { type ReactNode } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import type { Post } from "../../types";

interface PostHeaderProps {
  post: Post;
  isFollowing: boolean;
  onFollowToggle: (handle: string, isFollowing: boolean) => void;
  children?: ReactNode;
}

export function PostHeader({ post, isFollowing, onFollowToggle, children }: PostHeaderProps) {
  return (
    <header className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
      <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3 cursor-pointer">
        <Avatar className="flex-shrink-0 h-11 w-11 sm:w-12 sm:h-12">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 text-[15px] font-bold text-white">
            <span className="truncate">{post.author.name}</span>
            {post.author.verified && <VerifiedBadge size={16} />}
            <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
            <svg className="hidden md:inline w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
              <circle cx="2" cy="2" r="1.5" />
            </svg>
            <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">{post.timestamp}</span>
          </div>
          <div className="flex md:hidden items-center gap-1 text-[13px] font-normal text-[#7C7C7C] mt-0.5">
            <span>{post.author.handle}</span>
            <svg className="w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
              <circle cx="2" cy="2" r="1.5" />
            </svg>
            <span>{post.timestamp}</span>
          </div>
          {children && <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">{children}</div>}
        </div>
      </div>
      <button
        type="button"
        aria-label="More options"
        className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-colors hover:bg-[#482090]/10 hover:text-white"
      >
        <svg className="-rotate-90 h-4 w-4" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12.6667" cy="8" r="1.5" fill="currentColor" />
          <circle cx="3.33329" cy="8" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </header>
  );
}
