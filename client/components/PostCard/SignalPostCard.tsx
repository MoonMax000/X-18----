import { FC } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VerifiedBadge from "./VerifiedBadge";
import { PostBadges } from "./PostBadges";
import {
  TrendingUp, TrendingDown, UserCheck, UserPlus, Lock, Crown, Shield,
  Heart, MessageCircle, Repeat2, Bookmark, Eye
} from "lucide-react";

interface SignalPostCardProps {
  post: any;
  isFollowing: boolean;
  toggleFollow: (handle: string) => void;
}

export const SignalPostCard: FC<SignalPostCardProps> = ({ post, isFollowing, toggleFollow }) => {
  const isPaidLocked = post.price !== "free";

  return (
    <div key={post.id} className="border-b border-[#0F131A] bg-[#000000] p-4 transition-colors hover:bg-[#0A0D12]">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 pt-0.5">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-white">{post.author.name}</span>
              {post.author.verified && <VerifiedBadge size={16} />}
              {post.author.handle ? (
                <span className="text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
              ) : null}
              <span className="text-xs font-normal text-[#7C7C7C]">· {post.timestamp}</span>
            </div>
            <PostBadges 
              postType="signal"
              price={post.price || "free"} 
              isPaidLocked={isPaidLocked} 
              isFollowing={isFollowing}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" variant={isFollowing ? "outline" : "default"} className={cn("h-7 gap-1 text-xs rounded-full", isFollowing ? "border-[#0F131A] bg-[#000000] text-[#C5C9D3] hover:bg-[#0A0D12]" : "bg-blue-500 hover:bg-blue-600")} onClick={() => toggleFollow(post.author.handle)}>
            {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Badge className={cn("gap-1 px-2.5 py-1 rounded-full font-semibold", post.sentiment === "bullish" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
          {post.sentiment === "bullish" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {post.ticker}
        </Badge>
        <Badge className="bg-blue-500/20 px-2.5 py-1 text-blue-400 rounded-full font-semibold">{post.direction?.toUpperCase()}</Badge>
        <Badge className="bg-purple-500/20 px-2.5 py-1 text-purple-400 rounded-full font-semibold">{post.timeframe}</Badge>
        <Badge className={cn("px-2.5 py-1 rounded-full font-semibold", post.risk === "high" ? "bg-red-500/20 text-red-400" : post.risk === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400")}>
          {post.risk?.toUpperCase()} RISK
        </Badge>
      </div>

      <div className="mb-3 flex items-center gap-4 rounded-xl border border-[#0F131A] bg-[#000000] p-3">
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-green-400" />
          <span className="text-sm font-semibold text-green-400">Accuracy {post.accuracy}%</span>
        </div>
        <div className="text-sm text-[#6C7280]">·</div>
        <div className="text-sm text-[#6C7280]">{post.sampleSize} signals / 90d</div>
      </div>

      <p className={cn("mb-3 text-[15px] leading-relaxed text-[#E5E7EB]", isPaidLocked && "blur-sm select-none")}>{post.text}</p>

      {isPaidLocked ? (
        <div className="mb-3 relative rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4">
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <Lock className="mx-auto mb-2 h-8 w-8 text-purple-400" />
              <p className="mb-2 font-semibold text-white">Premium Content</p>
              <p className="mb-3 text-sm text-[#C5C9D3]">{post.price === "subscribers-only" ? "Subscribe to unlock" : "$2.99 one-time"}</p>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-full">
                <Crown className="h-4 w-4" />
                {post.price === "subscribers-only" ? "Subscribe" : "Buy Post"}
              </Button>
            </div>
          </div>
          <div className="blur-md">
            <div className="flex gap-4">
              <div><span className="text-xs text-[#6C7280]">Entry:</span> <span className="font-semibold text-white">$XXX</span></div>
              <div><span className="text-xs text-[#6C7280]">Stop:</span> <span className="font-semibold text-red-400">$XXX</span></div>
              <div><span className="text-xs text-[#6C7280]">TP:</span> <span className="font-semibold text-green-400">$XXX</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 flex gap-4 rounded-xl border border-[#0F131A] bg-[#000000] p-3">
          <div><span className="text-xs text-[#6C7280]">Entry</span> <span className="font-semibold text-white block">{post.entry}</span></div>
          <div><span className="text-xs text-[#6C7280]">Stop</span> <span className="font-semibold text-red-400 block">{post.stopLoss}</span></div>
          <div><span className="text-xs text-[#6C7280]">TP</span> <span className="font-semibold text-green-400 block">{post.takeProfit}</span></div>
        </div>
      )}

      {post.tags && <div className="mb-3 flex flex-wrap gap-2">{post.tags.map((tag: string, i: number) => <span key={i} className="cursor-pointer text-sm text-blue-400 hover:text-blue-300 transition">{tag}</span>)}</div>}

      <div className="flex items-center gap-6 text-[#6C7280] border-t border-[#0F131A] pt-3 mt-3">
        <button className="flex items-center gap-1.5 transition hover:text-red-400 hover:scale-105"><Heart className="h-5 w-5" /><span className="text-sm font-medium">{post.likes}</span></button>
        <button className="flex items-center gap-1.5 transition hover:text-blue-400 hover:scale-105"><MessageCircle className="h-5 w-5" /><span className="text-sm font-medium">{post.comments}</span></button>
        <button className="flex items-center gap-1.5 transition hover:text-green-400 hover:scale-105"><Repeat2 className="h-5 w-5" /><span className="text-sm font-medium">{post.reposts}</span></button>
        <button className="flex items-center gap-1.5 transition hover:text-purple-400 hover:scale-105"><Bookmark className="h-5 w-5" /></button>
        <div className="ml-auto flex items-center gap-1.5 text-[#6C7280]"><Eye className="h-4 w-4" /><span className="text-sm font-medium">{post.views.toLocaleString()}</span></div>
      </div>
      <p className="mt-3 text-xs text-[#6C7280]">⚠️ Trading signals are educational. Not financial advice.</p>
    </div>
  );
};
