import type { FC } from "react";

import { LAB_CATEGORY_CONFIG, LAB_CATEGORY_LABELS, type LabCategory } from "./categoryConfig";

const QUICK_FILTERS: { title: string; description: string; categories: LabCategory[] }[] = [
  {
    title: "Фо��ус на сигналах",
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

interface TestRightSidebarProps {
  onApplyQuickFilter: (categories: LabCategory[]) => void;
  savedCategories: LabCategory[];
  onResetSaved: () => void;
}

const TestRightSidebar: FC<TestRightSidebarProps> = ({ onApplyQuickFilter, savedCategories, onResetSaved }) => {
  return (
    <aside className="hidden w-full max-w-[320px] flex-col gap-5 lg:flex">
      <div className="sticky top-24 flex flex-col gap-5">
        <section className="rounded-[24px] border border-[#16C784] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
          <h3 className="text-lg font-semibold text-white">Быстрые фильтры</h3>
          <p className="mt-1 text-sm text-[#A3A6B4]">
            Сохранённые пресеты помогают быстро переключаться между сценариями просмотра.
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {QUICK_FILTERS.map((preset) => (
              <li key={preset.title}>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[#16C784] bg-white/5 px-4 py-3 text-left transition hover:border-[#A06AFF]/40 hover:bg-[#A06AFF]/10"
                  onClick={() => onApplyQuickFilter(preset.categories)}
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

        <section className="rounded-[24px] border border-[#16C784] bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
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
              onClick={onResetSaved}
            >
              Очистить предпочтения
            </button>
          ) : null}
        </section>
      </div>
    </aside>
  );
};

export default TestRightSidebar;
