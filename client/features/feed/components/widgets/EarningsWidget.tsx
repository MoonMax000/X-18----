import React from "react";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import WidgetCard, { WidgetHeader } from "./WidgetCard";

interface EarningsWidgetProps {
  period?: string;
  mrr: number; // Monthly Recurring Revenue
  arpu: number; // Average Revenue Per User
  activeSubscribers: number;
  topPostsByRevenue: {
    postId: string;
    title: string;
    revenue: number;
  }[];
}

export default function EarningsWidget({
  period = "30d",
  mrr,
  arpu,
  activeSubscribers,
  topPostsByRevenue,
}: EarningsWidgetProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <WidgetCard>
      <WidgetHeader title={`💰 Your Earnings (Last ${period === "30d" ? "30 days" : period})`} />
      <div className="mt-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3">
            <span className="text-xs text-gray-400">MRR</span>
            <span className="text-lg font-bold text-green-400">{formatAmount(mrr)}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-3">
            <span className="text-xs text-gray-400">ARPU</span>
            <span className="text-lg font-bold text-blue-400">{formatAmount(arpu)}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-3">
            <span className="text-xs text-gray-400">Subs</span>
            <span className="text-lg font-bold text-purple-400">{activeSubscribers}</span>
          </div>
        </div>

        {/* Top Posts by Revenue */}
        {topPostsByRevenue.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold text-gray-400">Top posts by revenue:</h4>
            <div className="space-y-2">
              {topPostsByRevenue.slice(0, 3).map((post, index) => (
                <div
                  key={post.postId}
                  className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="truncate text-sm text-gray-300" title={post.title}>
                      {post.title.length > 20 ? `${post.title.slice(0, 20)}...` : post.title}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-400">
                    {formatAmount(post.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WidgetCard>
  );
}
