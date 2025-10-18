import type { LucideIcon } from "lucide-react";
import { BarChart3, Bitcoin, Coins, Flame, Globe, LineChart, Users, Wallet } from "lucide-react";

import type { LabAudience } from "./types";

export interface LabAudienceOption {
  value: LabAudience;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeClassName: string;
}

export const LAB_AUDIENCE_OPTIONS: LabAudienceOption[] = [
  {
    value: "everyone",
    label: "Все",
    description: "Видят все пользователи платформы",
    icon: Globe,
    badgeClassName: "bg-[#14243A] text-[#3B82F6]",
  },
  {
    value: "followers",
    label: "Подписчики",
    description: "Только ваши подписчики",
    icon: Users,
    badgeClassName: "bg-[#19392A] text-[#2EBD85]",
  },
];

export const LAB_AUDIENCE_MAP = LAB_AUDIENCE_OPTIONS.reduce<Record<LabAudience, LabAudienceOption>>(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<LabAudience, LabAudienceOption>,
);

export const DEFAULT_LAB_AUDIENCE: LabAudience = "everyone";

export interface LabAssetOption {
  value: string;
  label: string;
  icon: LucideIcon;
  accentClassName: string;
}

export const LAB_ASSET_OPTIONS: LabAssetOption[] = [
  {
    value: "BTC",
    label: "Bitcoin",
    icon: Bitcoin,
    accentClassName: "text-[#F7931A]",
  },
  {
    value: "ETH",
    label: "Ethereum",
    icon: LineChart,
    accentClassName: "text-[#627EEA]",
  },
  {
    value: "SOL",
    label: "Solana",
    icon: Coins,
    accentClassName: "text-[#9945FF]",
  },
  {
    value: "USDT",
    label: "Tether",
    icon: Wallet,
    accentClassName: "text-[#26A17B]",
  },
  {
    value: "SPX",
    label: "S&P 500",
    icon: BarChart3,
    accentClassName: "text-[#FF8C42]",
  },
  {
    value: "OIL",
    label: "Brent Oil",
    icon: Flame,
    accentClassName: "text-[#F97316]",
  },
];

export const LAB_ASSET_MAP = LAB_ASSET_OPTIONS.reduce<Record<string, LabAssetOption>>((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});

export const DEFAULT_LAB_ASSET = LAB_ASSET_OPTIONS[0]?.value ?? "BTC";
