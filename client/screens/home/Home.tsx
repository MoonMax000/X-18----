import { FC, useMemo, useState } from "react";

import ActivityCard from "@/components/ActivityCard/ActivityCard";
import PortfolioCard from "@/components/PortfolioCard/PortfolioCard";
import ProductsCard from "@/components/ProductsCard/ProductsCard";
import SubscribeBlock from "@/components/SubscribeBlock/SubscribeBlock";
import UserHeader from "@/components/UserHeader/UserHeader";
import UserTabs from "@/components/UserTabs";
import CreatePostBox from "@/components/CreatePostBox/CreatePostBox";
import Pagination from "@/components/ui/Pagination/Pagination";
import UserInfoCards from "@/components/UserInfoCards/UserInfoCards";
import UserMarketsCard from "@/components/UserMarketsCard/UserMarketsCard";
import { LAB_CATEGORY_CONFIG, LAB_CATEGORY_LABELS, type LabCategory } from "@/components/testLab/categoryConfig";
import { cn } from "@/lib/utils";

export type ViewMode = "normal" | "compact";
type MonetizationFilter = "all" | "free" | "premium";

const QUICK_FILTERS: { title: string; description: string; categories: LabCategory[] }[] = [
  {
    title: "Фокус на сигналах",
    description: "Показывать только свежие точки входа",
    categories: ["signals", "analytics"],
  },
  {
    title: "Обучение",
    description: "Материалы для прокачки навыков",
    categories: ["education", "analytics", "code"],
  },
  {
    title: "Мультимедиа",
    description: "Видеоразборы и графики",
    categories: ["media", "news"],
  },
];

const monetizationFilterLabels: Record<MonetizationFilter, string> = {
  all: "Все форматы",
  free: "Только бесплатные",
  premium: "Только платные",
};

interface Props {
  isOwn?: boolean;
}

const HomeScreen: FC<Props> = ({ isOwn = true }) => {
  const [, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("normal");

  const handlePageChange = (val: number) => {
    setCurrentPage(val);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "normal" ? "compact" : "normal"));
  };

  return (
    <div id="root-content" className="flex min-w-0 flex-col gap-6">
      <UserHeader isOwn={isOwn} />
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <UserInfoCards />
          <SubscribeBlock isOwn={isOwn} />
          <CreatePostBox onToggleView={toggleViewMode} viewMode={viewMode} />
          <UserTabs isOwn={isOwn} viewMode={viewMode} />
          <Pagination
            totalPages={4}
            currentPage={1}
            onChange={handlePageChange}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <UserMarketsCard />
          <PortfolioCard />
          <ActivityCard />
          <ProductsCard />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
