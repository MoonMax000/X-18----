import type { FC } from "react";
import { useMyEarnings } from "../../hooks/useWidgets";
import { DollarSign } from "lucide-react";

interface MyEarningsWidgetProps {
  period?: '7d' | '30d' | '90d';
}

const MyEarningsWidget: FC<MyEarningsWidgetProps> = ({ period = '30d' }) => {
  const { earnings, isLoading, error } = useMyEarnings({ period });

  if (error) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <p className="text-sm text-red-400">Ошибка загрузки</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-700" />
          ))}
        </div>
      </section>
    );
  }

  if (!earnings) return null;

  return (
    <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-[#A06AFF]" />
        <h3 className="text-lg font-semibold text-white">Мой заработок</h3>
      </header>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-[#482090]/10 p-4">
          <p className="text-xs text-[#8E8E94]">MRR (ежемесячный доход)</p>
          <p className="mt-1 text-2xl font-bold text-white">${earnings.mrr.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#482090]/10 p-3">
            <p className="text-xs text-[#8E8E94]">Всего</p>
            <p className="mt-1 text-lg font-semibold text-white">
              ${earnings.total_revenue.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg bg-[#482090]/10 p-3">
            <p className="text-xs text-[#8E8E94]">Подписчики</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {earnings.subscribers_count}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#482090]/10 p-3">
            <p className="text-xs text-[#8E8E94]">Продано постов</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {earnings.posts_sold}
            </p>
          </div>
          <div className="rounded-lg bg-[#482090]/10 p-3">
            <p className="text-xs text-[#8E8E94]">Средняя цена</p>
            <p className="mt-1 text-lg font-semibold text-white">
              ${earnings.avg_post_price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyEarningsWidget;
