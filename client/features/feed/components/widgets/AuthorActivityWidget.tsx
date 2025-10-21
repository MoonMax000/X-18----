import React from "react";
import { TrendingUp, MessageCircle, Heart, Users } from "lucide-react";
import WidgetCard, { WidgetHeader } from "./WidgetCard";

interface AuthorActivityWidgetProps {
  period?: string;
  posts: number;
  likesReceived: number;
  comments: number;
  newFollowers: number;
}

export default function AuthorActivityWidget({
  period = "7d",
  posts,
  likesReceived,
  comments,
  newFollowers,
}: AuthorActivityWidgetProps) {
  const stats = [
    { label: "Posts", value: posts, icon: TrendingUp, color: "text-blue-400" },
    { label: "Likes", value: likesReceived.toLocaleString(), icon: Heart, color: "text-pink-400" },
    { label: "Comments", value: comments, icon: MessageCircle, color: "text-green-400" },
    { label: "Followers", value: `+${newFollowers}`, icon: Users, color: "text-purple-400" },
  ];

  return (
    <WidgetCard>
      <WidgetHeader title={`Activity (Last ${period === "7d" ? "7 days" : period})`} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-lg bg-white/5 p-3 transition hover:bg-white/10"
          >
            <div className="flex items-center gap-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <span className="text-lg font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}
