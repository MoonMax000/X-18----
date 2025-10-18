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
  const [activeCategory, setActiveCategory] = useState<LabCategory | "all">("all");
  const [savedCategories, setSavedCategories] = useState<LabCategory[]>([]);
  const [monetizationFilter, setMonetizationFilter] = useState<MonetizationFilter>("all");

  const effectiveCategories = useMemo<LabCategory[]>(() => {
    if (savedCategories.length > 0) {
      return savedCategories;
    }
    if (activeCategory === "all") {
      return [];
    }
    return [activeCategory];
  }, [activeCategory, savedCategories]);

  const handlePageChange = (val: number) => {
    setCurrentPage(val);
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "normal" ? "compact" : "normal"));
  };

  const handleSaveCurrentFilter = () => {
    if (activeCategory === "all") {
      setSavedCategories([]);
      return;
    }
    setSavedCategories([activeCategory]);
  };

  const handleApplyQuickFilter = (categories: LabCategory[]) => {
    setSavedCategories(categories);
    setActiveCategory("all");
  };

  const handleResetSaved = () => {
    setSavedCategories([]);
  };

  const activeCategoryLabels = effectiveCategories.map((category) => LAB_CATEGORY_LABELS[category]);

  return (
    <div id="root-content" className="flex min-w-0 flex-col gap-6">
      <UserHeader isOwn={isOwn} />
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <UserInfoCards />
          <SubscribeBlock isOwn={isOwn} />

          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#A3A6B4]">
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Активные рубрики: {activeCategoryLabels.length === 0 ? "Все" : activeCategoryLabels.join(", ")}
            </span>
            <span className="rounded-full border border-[#181B22] bg-white/5 px-3 py-1 text-white/80">
              Формат: {monetizationFilterLabels[monetizationFilter]}
            </span>
            <button
              type="button"
              className="rounded-full border border-[#A06AFF]/40 px-3 py-1 text-xs font-semibold text-[#A06AFF] transition hover:bg-[#A06AFF]/10"
              onClick={handleSaveCurrentFilter}
            >
              Сохранить текущий фильтр
            </button>
            {savedCategories.length > 0 ? (
              <span className="inline-flex flex-wrap items-center gap-1 text-[#CDBAFF]">
                {savedCategories.map((category) => (
                  <span key={category} className="rounded-full bg-[#482090]/20 px-2 py-0.5">
                    {LAB_CATEGORY_LABELS[category]}
                  </span>
                ))}
              </span>
            ) : null}
          </div>

          <CreatePostBox onToggleView={toggleViewMode} viewMode={viewMode} />
          <UserTabs isOwn={isOwn} viewMode={viewMode} effectiveCategories={effectiveCategories} monetizationFilter={monetizationFilter} />
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

          <aside className="hidden w-full max-w-[320px] flex-col gap-5 lg:flex">
            <div className="sticky top-24 flex flex-col gap-5">
              <section className="rounded-[24px] border border-[#181B22] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
                <h3 className="text-lg font-semibold text-white">Быстрые фильтры</h3>
                <p className="mt-1 text-sm text-[#A3A6B4]">
                  Сохранённые пресеты помогают быстро переключаться между сценариями просмотра.
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {QUICK_FILTERS.map((preset) => (
                    <li key={preset.title}>
                      <button
                        type="button"
                        className="w-full rounded-2xl border border-[#181B22] bg-white/5 px-4 py-3 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10"
                        onClick={() => handleApplyQuickFilter(preset.categories)}
                      >
                        <span className="text-sm font-semibold text-white">{preset.title}</span>
                        <span className="mt-1 block text-xs text-[#8E92A0]">{preset.description}</span>
                        <span className="mt-2 flex flex-wrap gap-1 text-[11px] uppercase tracking-[0.12em] text-[#CDBAFF]">
                          {preset.categories.map((category) => {
                            const categoryConfig = LAB_CATEGORY_CONFIG.find((item) => item.value === category);
                            if (!categoryConfig) return null;
                            const Icon = categoryConfig.icon;
                            return (
                              <span
                                key={category}
                                className="inline-flex items-center gap-1 rounded-full bg-[#482090]/20 px-2 py-0.5"
                              >
                                <Icon className="h-3 w-3" />
                                {categoryConfig.label}
                              </span>
                            );
                          })}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-[24px] border border-[#181B22] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
                <h3 className="text-lg font-semibold text-white">Мои рубрики</h3>
                {savedCategories.length === 0 ? (
                  <p className="mt-2 text-sm text-[#A3A6B4]">
                    Вы ещё не сохранили предпочтения. Выберите категории в фильтрах и сохраните их.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {savedCategories.map((category) => (
                      <span key={category} className="rounded-full border border-[#A06AFF]/40 bg-[#A06AFF]/15 px-3 py-1 text-xs font-semibold text-white">
                        {LAB_CATEGORY_LABELS[category]}
                      </span>
                    ))}
                  </div>
                )}
                {savedCategories.length > 0 ? (
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center justify-center rounded-full border border-[#A06AFF]/40 px-4 py-2 text-xs font-semibold text-[#A06AFF] transition hover:bg-[#A06AFF]/10"
                    onClick={handleResetSaved}
                  >
                    Очистить предпочтения
                  </button>
                ) : null}
              </section>

              <section className="rounded-[24px] border border-[#181B22] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
                <h3 className="text-lg font-semibold text-white">Монетизация</h3>
                <ul className="mt-3 space-y-3 text-sm text-[#C5C9D3]">
                  <li className="rounded-2xl border border-[#181B22] bg-white/5 p-3">
                    <span className="text-white">Pay-per-post</span>
                    <p className="mt-1 text-xs text-[#8E92A0]">
                      Разблокировка отдельного сигнала или аналитики за разовую оплату.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[#181B22] bg-white/5 p-3">
                    <span className="text-white">Подписка на автора</span>
                    <p className="mt-1 text-xs text-[#8E92A0]">
                      Доступ ко всем закрытым постам автора и мгновенные уведомления.
                    </p>
                  </li>
                  <li className="rounded-2xl border border-[#181B22] bg-white/5 p-3">
                    <span className="text-white">Комбинированная модель</span>
                    <p className="mt-1 text-xs text-[#8E92A0]">
                      Авторы сами выбирают: платный сигнал, подписочная аналитика или бесплатные идеи.
                    </p>
                  </li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
