import { FC, memo } from "react";
import { Trophy, Target, Flame, Star, TrendingUp, TrendingDown, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationData {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  rating: number;
  totalRatings: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  icon: "verified" | "sharpshooter" | "onfire" | "premium" | "toprated" | "bull" | "bear" | "influencer";
  earned: boolean;
  progress?: number;
  description: string;
}

interface Props {
  data?: GamificationData;
  className?: string;
}

const getBadgeIcon = (icon: Badge["icon"]) => {
  const iconMap = {
    verified: Trophy,
    sharpshooter: Target,
    onfire: Flame,
    premium: Crown,
    toprated: Star,
    bull: TrendingUp,
    bear: TrendingDown,
    influencer: Zap,
  };
  return iconMap[icon];
};

const getLevelColor = (level: number) => {
  if (level >= 76) return "from-[#FFD700] to-[#FFA500]";
  if (level >= 51) return "from-[#A06AFF] to-[#482090]";
  if (level >= 26) return "from-[#2EBD85] to-[#1A6A4A]";
  return "from-[#6C7280] to-[#4B5563]";
};

const getLevelTitle = (level: number) => {
  if (level >= 100) return "Legend";
  if (level >= 76) return "Master";
  if (level >= 51) return "Expert";
  if (level >= 26) return "Advanced";
  if (level >= 11) return "Intermediate";
  return "Novice";
};

const GamificationPanel: FC<Props> = ({ data, className }) => {
  const defaultData: GamificationData = {
    level: 42,
    currentXP: 3750,
    xpToNextLevel: 5000,
    rating: 4.8,
    totalRatings: 156,
    badges: [
      { id: "1", name: "Verified Trader", icon: "verified", earned: true, description: "Complete KYC verification" },
      { id: "2", name: "Sharp Shooter", icon: "sharpshooter", earned: true, description: "Achieve 90%+ accuracy" },
      { id: "3", name: "On Fire", icon: "onfire", earned: true, description: "Maintain 30-day streak" },
      { id: "4", name: "Top Rated", icon: "toprated", earned: true, description: "Get 4.5+ rating" },
      { id: "5", name: "Bull Master", icon: "bull", earned: false, progress: 72, description: "Create 100 bullish signals" },
      { id: "6", name: "Influencer", icon: "influencer", earned: false, progress: 45, description: "Reach 1000 followers" },
    ],
  };

  const gamificationData = data || defaultData;
  const progressPercentage = (gamificationData.currentXP / gamificationData.xpToNextLevel) * 100;
  const earnedBadges = gamificationData.badges.filter((b) => b.earned);
  const inProgressBadges = gamificationData.badges.filter((b) => !b.earned);

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Compact Level Card */}
      <div className="rounded-2xl border border-widget-border/80 bg-[#0C101480] p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
              `${getLevelColor(gamificationData.level)}`
            )}>
              <span className="text-lg font-bold">{gamificationData.level}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-white">{getLevelTitle(gamificationData.level)}</h3>
              <p className="text-xs text-[#B0B0B0]">Level {gamificationData.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-widget-border/60 bg-black/40 px-3 py-1.5">
            <Star className="h-4 w-4 fill-[#FFD700] text-[#FFD700]" />
            <span className="text-sm font-bold text-white">{gamificationData.rating}</span>
            <span className="text-xs text-[#B0B0B0]">({gamificationData.totalRatings})</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white">
              {gamificationData.currentXP.toLocaleString()} / {gamificationData.xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="text-xs font-bold text-[#2EBD85]">
              {Math.floor(progressPercentage)}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-widget-border/60">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r transition-all duration-300",
                getLevelColor(gamificationData.level)
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-[#B0B0B0]">
            {(gamificationData.xpToNextLevel - gamificationData.currentXP).toLocaleString()} XP to reach Level {gamificationData.level + 1}
          </p>
        </div>
      </div>

      {/* Combined Achievements & Progress Card */}
      {(earnedBadges.length > 0 || inProgressBadges.length > 0) && (
        <div className="rounded-2xl border border-widget-border/80 bg-[#0C101480] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#B0B0B0]">
              Achievements ({earnedBadges.length})
            </h3>
            {inProgressBadges.length > 0 && (
              <span className="text-xs font-semibold text-[#6C7280]">
                {inProgressBadges.length} In Progress
              </span>
            )}
          </div>

          {/* Earned Badges - Compact Grid */}
          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {earnedBadges.map((badge) => {
                const Icon = getBadgeIcon(badge.icon);
                return (
                  <div
                    key={badge.id}
                    className="group relative flex items-center gap-2 rounded-xl border border-[#A06AFF]/30 bg-gradient-to-br from-[#A06AFF]/10 to-transparent p-2 transition-all hover:border-[#A06AFF]/50"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#A06AFF] to-[#482090]">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="truncate text-xs font-semibold text-white">{badge.name}</p>
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-widget-border/80 bg-black px-2 py-1 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      {badge.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* In Progress Badges - Compact */}
          {inProgressBadges.length > 0 && (
            <div className="flex flex-col gap-2">
              {inProgressBadges.map((badge) => {
                const Icon = getBadgeIcon(badge.icon);
                return (
                  <div
                    key={badge.id}
                    className="group relative flex items-center gap-2 rounded-xl border border-widget-border/60 bg-black/40 p-2"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-widget-border/40">
                      <Icon className="h-4 w-4 text-[#B0B0B0]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#B0B0B0]">{badge.name}</p>
                      {badge.progress !== undefined && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-widget-border/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090]"
                              style={{ width: `${badge.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-[#B0B0B0]">{badge.progress}%</span>
                        </div>
                      )}
                    </div>
                    <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-widget-border/80 bg-black px-2 py-1 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                      {badge.description}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default memo(GamificationPanel);
