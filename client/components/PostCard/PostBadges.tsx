import { FC } from "react";
import { DollarSign, LockKeyhole, Sparkles, TrendingUp, Newspaper, GraduationCap, BarChart3, Brain, Code2, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type PostType = "signal" | "news" | "analysis" | "code" | "general" | "education" | "macro" | "onchain" | "video";
type PriceType = "free" | "pay-per-post" | "subscribers-only";

interface PostBadgesProps {
  postType?: PostType;
  price: PriceType;
  isPaidLocked: boolean;
  isFollowing?: boolean;
  className?: string;
}

const CATEGORY_CONFIG_MAP: Record<string, { icon: typeof TrendingUp; badgeClassName: string; label: string }> = {
  'signal': { icon: TrendingUp, badgeClassName: 'bg-[#2EBD85]/15 text-[#2EBD85]', label: 'Сигналы' },
  'signals': { icon: TrendingUp, badgeClassName: 'bg-[#2EBD85]/15 text-[#2EBD85]', label: 'Сигналы' },
  'news': { icon: Newspaper, badgeClassName: 'bg-[#4D7CFF]/15 text-[#4D7CFF]', label: 'Новости' },
  'education': { icon: GraduationCap, badgeClassName: 'bg-[#F78DA7]/15 text-[#F78DA7]', label: 'Обучение' },
  'analysis': { icon: BarChart3, badgeClassName: 'bg-[#A06AFF]/15 text-[#A06AFF]', label: 'Аналитика' },
  'analytics': { icon: BarChart3, badgeClassName: 'bg-[#A06AFF]/15 text-[#A06AFF]', label: 'Аналитика' },
  'macro': { icon: Brain, badgeClassName: 'bg-[#FFD166]/15 text-[#FFD166]', label: 'Прогнозы' },
  'code': { icon: Code2, badgeClassName: 'bg-[#64B5F6]/15 text-[#64B5F6]', label: 'Код' },
  'video': { icon: Video, badgeClassName: 'bg-[#FF8A65]/20 text-[#FF8A65]', label: 'Мультимедиа' },
  'media': { icon: Video, badgeClassName: 'bg-[#FF8A65]/20 text-[#FF8A65]', label: 'Мультимедиа' },
  'article': { icon: Sparkles, badgeClassName: 'bg-[#8E92A0]/20 text-[#8E92A0]', label: 'Статья' },
  'general': { icon: Sparkles, badgeClassName: 'bg-[#8E92A0]/20 text-[#8E92A0]', label: 'Общее' },
};

export const PostBadges: FC<PostBadgesProps> = ({ 
  postType, 
  price, 
  isPaidLocked, 
  isFollowing = false,
  className 
}) => {
  const categoryKey = postType === 'signal' ? 'signal' :
                    postType === 'news' ? 'news' :
                    postType === 'education' ? 'education' :
                    postType === 'analysis' ? 'analysis' :
                    postType === 'macro' ? 'macro' :
                    postType === 'code' ? 'code' :
                    postType === 'video' ? 'video' :
                    postType === 'general' ? 'general' : null;

  const categoryConfig = categoryKey ? CATEGORY_CONFIG_MAP[categoryKey] : null;

  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold", className)}>
      {/* Category badge */}
      {categoryConfig && (
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]", categoryConfig.badgeClassName)}>
          <categoryConfig.icon className="h-3.5 w-3.5" />
          {categoryConfig.label}
        </span>
      )}
      
      {/* Monetization badge */}
      <span className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
        isPaidLocked
          ? "bg-[#2A1C3F] text-[#CDBAFF] border border-[#A06AFF]/50"
          : price !== "free" 
            ? "bg-[#1F1630] text-[#CDBAFF] border border-[#6F4BD3]/40"
            : "bg-[#14243A] text-[#6CA8FF] border border-[#3B82F6]/40"
      )}>
        {price !== "free" ? <DollarSign className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
        {price !== "free" ? (isPaidLocked ? "Premium · закрыто" : "Premium · открыт") : "Free доступ"}
      </span>

      {/* Lock badge when post is locked */}
      {isPaidLocked && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFA800]/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[#FFA800]">
          <LockKeyhole className="h-3 w-3" />
          Закрыто
        </span>
      )}

      {/* Following badge */}
      {isFollowing && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#2EBD85]/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[#2EBD85]">
          Подписаны
        </span>
      )}
    </div>
  );
};
