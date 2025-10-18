import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Code2,
  GraduationCap,
  Image as ImageIcon,
  Newspaper,
  Sparkles,
  TrendingUp,
  Video as VideoIcon,
  MessageSquare,
  BarChart3,
} from "lucide-react";

export type LabCategory =
  | "signals"
  | "forecasts"
  | "news"
  | "education"
  | "analytics"
  | "code"
  | "media"
  | "text"
  | "other";

export interface LabCategoryConfig {
  value: LabCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeClassName: string;
}

export const LAB_CATEGORY_CONFIG: LabCategoryConfig[] = [
  {
    value: "signals",
    label: "Сигналы",
    description: "Точки входа и сделки",
    icon: TrendingUp,
    badgeClassName: "bg-[#2EBD85]/15 text-[#2EBD85]",
  },
  {
    value: "forecasts",
    label: "Прогнозы",
    description: "Ожидания по рынку",
    icon: Brain,
    badgeClassName: "bg-[#FFD166]/15 text-[#FFD166]",
  },
  {
    value: "news",
    label: "Новости",
    description: "Макро и отчёты",
    icon: Newspaper,
    badgeClassName: "bg-[#4D7CFF]/15 text-[#4D7CFF]",
  },
  {
    value: "education",
    label: "Обучение",
    description: "Гайды и уроки",
    icon: GraduationCap,
    badgeClassName: "bg-[#F78DA7]/15 text-[#F78DA7]",
  },
  {
    value: "analytics",
    label: "Аналитика",
    description: "Глубокие обзоры",
    icon: BarChart3,
    badgeClassName: "bg-[#A06AFF]/15 text-[#A06AFF]",
  },
  {
    value: "code",
    label: "Код",
    description: "Скрипты и боты",
    icon: Code2,
    badgeClassName: "bg-[#64B5F6]/15 text-[#64B5F6]",
  },
  {
    value: "media",
    label: "Мультимедиа",
    description: "Видео и графики",
    icon: VideoIcon,
    badgeClassName: "bg-[#FF8A65]/20 text-[#FF8A65]",
  },
  {
    value: "text",
    label: "Текст",
    description: "Заметки и мысли",
    icon: MessageSquare,
    badgeClassName: "bg-[#C5C9D3]/20 text-[#C5C9D3]",
  },
  {
    value: "other",
    label: "Прочее",
    description: "Остальной контент",
    icon: Sparkles,
    badgeClassName: "bg-[#8E92A0]/20 text-[#8E92A0]",
  },
];

export const LAB_CATEGORY_MAP = Object.fromEntries(
  LAB_CATEGORY_CONFIG.map((item) => [item.value, item]),
) as Record<LabCategory, LabCategoryConfig>;

export const LAB_CATEGORY_LABELS = LAB_CATEGORY_CONFIG.reduce<Record<LabCategory, string>>(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {
    signals: "Сигналы",
    forecasts: "Прогнозы",
    news: "Новости",
    education: "Обучение",
    analytics: "Аналитика",
    code: "Код",
    media: "Мультимедиа",
    text: "Текст",
    other: "Прочее",
  },
);

export const DEFAULT_LAB_CATEGORY: LabCategory = "signals";
