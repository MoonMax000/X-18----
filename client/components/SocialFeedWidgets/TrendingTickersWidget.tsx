import type { FC } from "react";
import { useTrendingTickers } from "../../hooks/useWidgets";
import { TrendingUp } from "lucide-react";
import { TickerSkeleton } from "../skeletons/WidgetSkeleton";

interface TrendingTickersWidgetProps {
  limit?: number;
  timeframe?: '6h' | '12h' | '24h' | '7d';
}

const TrendingTickersWidget: FC<TrendingTickersWidgetProps> = ({ 
  limit = 10, 
  timeframe = '24h' 
}) => {
  const { tickers, isLoading, error } = useTrendingTickers({ limit, timeframe });

  if (error) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <p className="text-sm text-red-400">Ошибка загрузки тикеров</p>
      </section>
    );
  }

  if (isLoading) {
    return <TickerSkeleton count={limit} />;
  }

  if (tickers.length === 0) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <header className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#A06AFF]" />
          <h3 className="text-lg font-semibold text-white">Трендовые тикеры</h3>
        </header>
        <p className="mt-4 text-sm text-[#8E8E94]">Нет данных о трендовых тикерах</p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px] animate-fadeIn">
      <header className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-[#A06AFF]" />
        <h3 className="text-lg font-semibold text-white">Трендовые тикеры</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-2">
        {tickers.map((ticker, index) => (
          <li
            key={ticker.ticker}
            className="group flex items-center justify-between rounded-lg bg-transparent p-2 transition-colors duration-200 hover:bg-[#482090]/12"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A06AFF]/20 text-xs font-semibold text-[#A06AFF]">
                {index + 1}
              </span>
              <span className="font-semibold text-white group-hover:text-[#E3D8FF]">
                ${ticker.ticker}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#8E8E94]">{ticker.count} упоминаний</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrendingTickersWidget;
