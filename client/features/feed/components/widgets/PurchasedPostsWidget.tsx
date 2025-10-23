import React from "react";
import { ShoppingBag, Lock, Calendar, Eye } from "lucide-react";
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
        <WidgetHeader title="🔐 Purchased Posts" />
        <div className="mt-4 text-center">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="rounded-full bg-white/5 p-4">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No purchases yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Unlock premium posts from your favorite authors
              </p>
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <WidgetHeader 
        title={`🔐 Purchased Posts (${posts.length})`}
        subtitle={`Total spent: $${totalSpent}`}
      />
      <div className="mt-4 space-y-3">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.postId}
            className="group cursor-pointer rounded-lg border border-widget-border bg-gradient-to-br from-white/[0.02] to-transparent p-3 transition-all hover:border-green-500/30 hover:bg-white/5"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail or Icon */}
              <div className="relative flex-shrink-0">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                    <Lock className="h-5 w-5 text-green-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-green-400 transition-colors">
                  {post.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="h-4 w-4 rounded-full"
                  />
                  <p className="truncate text-xs text-gray-400">
                    {post.authorHandle}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.purchasedAt)}</span>
                  </div>
                  {post.views !== undefined && (
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                  )}
                  <div className="ml-auto font-semibold text-green-400">
                    ${post.price}
                  </div>
                </div>
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
