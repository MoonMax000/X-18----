import { FC } from 'react';
import { TrendingUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingSearchesWidgetProps {
  className?: string;
}

// Mock trending searches - TODO: заменить на реальные данные из API
const mockTrendingSearches = [
  { query: 'Bitcoin', count: 1234, trend: '+12%' },
  { query: 'Ethereum', count: 987, trend: '+8%' },
  { query: 'Trading tips', count: 756, trend: '+15%' },
  { query: 'Market analysis', count: 654, trend: '+5%' },
  { query: 'Crypto news', count: 543, trend: '+3%' },
];

/**
 * Widget показывающий популярные поисковые запросы
 */
export const TrendingSearchesWidget: FC<TrendingSearchesWidgetProps> = ({ className }) => {
  const handleSearchClick = (query: string) => {
    // Trigger search with this query
    window.location.href = `/social/explore?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className={cn(
      "rounded-2xl border border-widget-border bg-[#000000] p-4",
      className
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-[#A06AFF]" />
        <h3 className="text-lg font-bold text-white">Популярные запросы</h3>
      </div>

      {/* Trending Searches List */}
      <div className="space-y-2">
        {mockTrendingSearches.map((item, index) => (
          <button
            key={item.query}
            onClick={() => handleSearchClick(item.query)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F1117] hover:bg-[#1A1D24] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#6C7280] w-5">
                {index + 1}
              </span>
              <Search className="h-4 w-4 text-[#6C7280] group-hover:text-[#A06AFF] transition-colors" />
              <span className="text-sm font-medium text-white group-hover:text-[#A06AFF] transition-colors">
                {item.query}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6C7280]">
                {item.count.toLocaleString('ru-RU')}
              </span>
              <span className="text-xs font-semibold text-[#2EBD85]">
                {item.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-widget-border">
        <p className="text-xs text-[#6C7280] text-center">
          Обновляется каждый час
        </p>
      </div>
    </div>
  );
};
