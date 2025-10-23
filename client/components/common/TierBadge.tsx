import React from "react";

type TierLevel = 1 | 2 | 3 | 4;

interface TierBadgeProps {
  tier: TierLevel;
  className?: string;
}

const TIER_CONFIG = {
  1: {
    gradientId: "tier1Gradient",
    gradientStops: [
      { offset: "0%", color: "#DCB99D" },
      { offset: "100%", color: "#766354" },
    ],
    gradientDirection: { x1: "18", y1: "10", x2: "0", y2: "10" },
  },
  2: {
    gradientId: "tier2Gradient",
    gradientStops: [
      { offset: "0%", color: "#9BE4FF" },
      { offset: "100%", color: "#5D8899" },
    ],
    gradientDirection: { x1: "18", y1: "10", x2: "0", y2: "10" },
  },
  3: {
    gradientId: "tier3Gradient",
    gradientStops: [
      { offset: "0%", color: "#734E2B" },
      { offset: "100%", color: "#D99351" },
    ],
    gradientDirection: { x1: "0", y1: "10", x2: "18", y2: "10" },
  },
  4: {
    gradientId: "tier4Gradient",
    gradientStops: [
      { offset: "0%", color: "#A06AFF" },
      { offset: "100%", color: "#482090" },
    ],
    gradientDirection: { x1: "18", y1: "10", x2: "0", y2: "10" },
  },
} as const;

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = "" }) => {
  const config = TIER_CONFIG[tier];

  return (
    <div className={`inline-flex items-center justify-center gap-1 ${className}`}>
      <span className="text-xs font-bold uppercase leading-normal text-white">
        Tier
      </span>
      <div className="relative flex h-5 w-[18px] flex-shrink-0 items-center justify-center">
        <svg
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-0 top-0"
        >
          <path
            d="M18 9.1833V6.28029C18 4.64029 18 3.82028 17.5959 3.28529C17.1918 2.75029 16.2781 2.49056 14.4507 1.9711C13.2022 1.6162 12.1016 1.18863 11.2223 0.79829C10.0234 0.2661 9.424 0 9 0C8.576 0 7.9766 0.2661 6.77771 0.79829C5.89839 1.18863 4.79784 1.61619 3.54933 1.9711C1.72193 2.49056 0.80822 2.75029 0.40411 3.28529C-5.96046e-08 3.82028 0 4.64029 0 6.28029V9.1833C0 14.8085 5.06277 18.1835 7.594 19.5194C8.2011 19.8398 8.5046 20 9 20C9.4954 20 9.7989 19.8398 10.406 19.5194C12.9372 18.1835 18 14.8085 18 9.1833Z"
            fill={`url(#${config.gradientId})`}
          />
          <defs>
            <linearGradient
              id={config.gradientId}
              x1={config.gradientDirection.x1}
              y1={config.gradientDirection.y1}
              x2={config.gradientDirection.x2}
              y2={config.gradientDirection.y2}
              gradientUnits="userSpaceOnUse"
            >
              {config.gradientStops.map((stop, index) => (
                <stop key={index} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>
        </svg>
        <span className="relative z-10 text-xs font-bold uppercase leading-normal text-white">
          {tier}
        </span>
      </div>
    </div>
  );
};
