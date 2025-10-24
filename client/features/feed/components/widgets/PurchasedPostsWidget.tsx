import React from "react";
import { ShoppingBag, Lock, Calendar, Eye, CheckCircle2, DollarSign } from "lucide-react";
import WidgetCard, { WidgetHeader, WidgetShowMore } from "./WidgetCard";

interface PurchasedPost {
  postId: string;
  title: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  purchasedAt: string;
  price: number;
  views?: number;
  thumbnail?: string;
}

interface PurchasedPostsWidgetProps {
  posts: PurchasedPost[];
  onViewAll?: () => void;
}

export default function PurchasedPostsWidget({
  posts,
  onViewAll,
}: PurchasedPostsWidgetProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const totalSpent = posts.reduce((sum, post) => sum + post.price, 0);

  if (posts.length === 0) {
    return (
      <WidgetCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2EBD85] to-[#1A6A4A]">
            <Lock className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Purchased Posts</h3>
        </div>
        <div className="text-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2EBD85]/10 to-[#1A6A4A]/5">
              <ShoppingBag className="h-8 w-8 text-[#2EBD85]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No purchases yet</p>
              <p className="mt-1 text-xs text-[#6C7280]">
                Unlock premium posts from authors
              </p>
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#2EBD85] to-[#1A6A4A]">
            <Lock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Purchased Posts</h3>
            <p className="text-xs text-[#6C7280]">{posts.length} unlocked</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#2EBD85]/30 bg-[#2EBD85]/10 px-2 py-1">
          <DollarSign className="h-3 w-3 text-[#2EBD85]" />
          <span className="text-xs font-bold text-[#2EBD85]">{totalSpent}</span>
        </div>
      </div>
      <div className="space-y-2">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.postId}
            className="group relative cursor-pointer rounded-xl border border-widget-border/80 bg-[#0C101480] p-3 backdrop-blur-xl transition-all hover:border-[#2EBD85]/50 hover:bg-[#2EBD85]/5"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail or Icon */}
              <div className="relative flex-shrink-0">
                {post.thumbnail ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <CheckCircle2 className="h-4 w-4 text-[#2EBD85]" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2EBD85]/30 bg-gradient-to-br from-[#2EBD85]/10 to-transparent">
                    <Lock className="h-4 w-4 text-[#2EBD85]" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-[#2EBD85]">
                  {post.title}
                </h4>
                <div className="mt-1 flex items-center gap-1.5">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="h-4 w-4 rounded-full border border-widget-border/60"
                  />
                  <p className="truncate text-xs text-[#6C7280]">
                    {post.authorHandle}
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-1.5 flex items-center gap-2 text-xs text-[#6C7280]">
                  <span>{formatDate(post.purchasedAt)}</span>
                  {post.views !== undefined && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Price Badge */}
              <div className="flex items-center gap-1 rounded-lg border border-[#2EBD85]/30 bg-[#2EBD85]/10 px-2 py-1">
                <DollarSign className="h-3.5 w-3.5 text-[#2EBD85]" />
                <span className="text-sm font-bold text-[#2EBD85]">{post.price}</span>
              </div>
            </div>
          </div>
        ))}

        {posts.length > 3 && (
          <WidgetShowMore onClick={onViewAll}>
            View all {posts.length} purchased posts
          </WidgetShowMore>
        )}
      </div>
    </WidgetCard>
  );
}
