import { FC } from "react";
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
  if (level >= 76) return "from-yellow-400 via-pink-500 to-purple-600";
  if (level >= 51) return "from-yellow-400 to-yellow-600";
  if (level >= 26) return "from-purple-500 to-purple-700";
  if (level >= 11) return "from-blue-500 to-blue-700";
  return "from-gray-500 to-gray-700";
};

const getLevelBorderClass = (level: number) => {
  if (level >= 76) return "border-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 animate-pulse";
  if (level >= 51) return "border-yellow-400";
  if (level >= 26) return "border-purple-500";
  if (level >= 11) return "border-blue-500";
  return "border-gray-500";
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

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Level & Progress Section */}
      <div className="rounded-2xl border border-[#16C784] bg-[rgba(12,16,20,0.5)] backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${getLevelColor(gamificationData.level)} text-white font-bold text-sm shadow-lg`}>
              {gamificationData.level}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{getLevelTitle(gamificationData.level)}</h3>
              <p className="text-xs text-[#8B98A5]">Level {gamificationData.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-white">{gamificationData.rating}</span>
            <span className="text-xs text-[#8B98A5]">({gamificationData.totalRatings})</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B98A5]">
              {gamificationData.currentXP.toLocaleString()} / {gamificationData.xpToNextLevel.toLocaleString()} XP
            </span>
            <span className="font-semibold text-emerald-400">
              {Math.floor(progressPercentage)}%
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#181B22]">
            <div
              className={`h-full bg-gradient-to-r ${getLevelColor(gamificationData.level)} transition-all duration-500 ease-out`}
              style={{ width: `${progressPercentage}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          <p className="text-[10px] text-[#8B98A5] text-center">
            {(gamificationData.xpToNextLevel - gamificationData.currentXP).toLocaleString()} XP to Level {gamificationData.level + 1}
          </p>
        </div>
      </div>

      {/* Badges Section */}
      <div className="rounded-2xl border border-widget-border bg-[rgba(12,16,20,0.5)] backdrop-blur-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8B98A5] mb-3">Achievements</h3>
        <div className="grid grid-cols-2 gap-2">
          {gamificationData.badges.map((badge) => {
            const Icon = getBadgeIcon(badge.icon);
            return (
              <div
                key={badge.id}
                className={`group relative rounded-2xl border p-2.5 transition-all duration-200 ${
                  badge.earned
                    ? "border-[#16C784] bg-[#16C784]/10 hover:bg-[#16C784]/20"
                    : "border-widget-border bg-[#0C1014] opacity-60"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      badge.earned ? "bg-[#16C784]/20 text-[#16C784]" : "bg-widget-bg text-[#8B98A5]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] font-semibold leading-tight ${badge.earned ? "text-white" : "text-[#8B98A5]"}`}>
                      {badge.name}
                    </p>
                    {!badge.earned && badge.progress !== undefined && (
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-widget-bg">
                        <div
                          className="h-full bg-gradient-to-r from-[#A06AFF] to-[#482090]"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/90 px-2 py-1 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-10">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="rounded-2xl border border-widget-border bg-[rgba(12,16,20,0.5)] backdrop-blur-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8B98A5] mb-2">Next Milestone</h3>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white font-bold text-xs">
            {gamificationData.level + 1}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Unlock Advanced Tier</p>
            <p className="text-[10px] text-[#8B98A5]">Premium features + animated avatar border</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
