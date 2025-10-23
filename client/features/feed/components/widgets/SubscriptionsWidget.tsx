import React from "react";
import { Users, Calendar, TrendingUp } from "lucide-react";
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
        <WidgetHeader title="📚 Your Subscriptions" />
        <div className="mt-4 text-center">
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="rounded-full bg-white/5 p-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">No subscriptions yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Subscribe to authors to unlock their exclusive content
              </p>
            </div>
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard>
      <WidgetHeader title={`📚 Your Subscriptions (${subscriptions.length})`} />
      <div className="mt-4 space-y-3">
        {subscriptions.slice(0, 4).map((sub) => (
          <div
            key={sub.authorId}
            className="group flex items-start gap-3 rounded-lg border border-widget-border bg-gradient-to-br from-white/[0.02] to-transparent p-3 transition-all hover:border-[#A06AFF]/30 hover:bg-white/5"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={sub.authorAvatar}
                alt={sub.authorName}
                className="h-12 w-12 rounded-full ring-2 ring-[#A06AFF]/20"
              />
              {sub.newPostsThisWeek > 0 && (
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-xs font-bold text-white">
                  {sub.newPostsThisWeek}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h4 className="truncate text-sm font-bold text-white">{sub.authorName}</h4>
              </div>
              <p className="truncate text-xs text-gray-400">{sub.authorHandle}</p>
              
              {/* Stats */}
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(sub.subscribedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{sub.totalPosts} posts</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-[#A06AFF]">${sub.price}/mo</span>
              <span className="text-xs text-gray-500">Active</span>
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
