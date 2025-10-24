import React from "react";
import { Users, Calendar, TrendingUp, Sparkles, Crown } from "lucide-react";
import WidgetCard, { WidgetHeader, WidgetShowMore } from "./WidgetCard";

interface Subscription {
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  subscribedAt: string;
  price: number;
  totalPosts: number;
  newPostsThisWeek: number;
}

interface SubscriptionsWidgetProps {
  subscriptions: Subscription[];
  onViewAll?: () => void;
}

export default function SubscriptionsWidget({
  subscriptions,
  onViewAll,
}: SubscriptionsWidgetProps) {
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

  if (subscriptions.length === 0) {
    return (
      <WidgetCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#A06AFF] to-[#482090]">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-white">Your Subscriptions</h3>
        </div>
        <div className="text-center">
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A06AFF]/10 to-[#482090]/5">
              <Crown className="h-8 w-8 text-[#A06AFF]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No subscriptions yet</p>
              <p className="mt-1 text-xs text-[#6C7280]">
                Subscribe to unlock exclusive content
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#A06AFF] to-[#482090]">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Your Subscriptions</h3>
            <p className="text-xs text-[#6C7280]">{subscriptions.length} active</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {subscriptions.slice(0, 4).map((sub) => (
          <div
            key={sub.authorId}
            className="group relative flex items-center gap-3 rounded-xl border border-widget-border/80 bg-[#0C101480] p-3 backdrop-blur-xl transition-all hover:border-[#A06AFF]/50 hover:bg-[#A06AFF]/5"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-[#A06AFF]/30 bg-gradient-to-br from-[#A06AFF]/20 to-transparent">
                <img
                  src={sub.authorAvatar}
                  alt={sub.authorName}
                  className="h-full w-full object-cover"
                />
              </div>
              {sub.newPostsThisWeek > 0 && (
                <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#2EBD85] to-[#1A6A4A] text-[10px] font-bold text-white shadow-lg">
                  {sub.newPostsThisWeek}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="truncate text-xs font-bold text-white">{sub.authorName}</h4>
                {sub.newPostsThisWeek > 0 && (
                  <Sparkles className="h-3 w-3 text-[#2EBD85]" />
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] text-[#6C7280]">
                <span className="truncate">{sub.authorHandle}</span>
                <span>•</span>
                <span>{sub.totalPosts} posts</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-bold text-[#A06AFF]">${sub.price}</span>
              <span className="text-[10px] text-[#6C7280]">/month</span>
            </div>
          </div>
        ))}

        {subscriptions.length > 4 && (
          <WidgetShowMore onClick={onViewAll}>
            View all {subscriptions.length} subscriptions
          </WidgetShowMore>
        )}
      </div>
    </WidgetCard>
  );
}
