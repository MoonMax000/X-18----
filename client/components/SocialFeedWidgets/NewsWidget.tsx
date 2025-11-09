import type { FC } from "react";
import { useNews } from "../../hooks/useWidgets";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

interface NewsWidgetProps {
  limit?: number;
  category?: string;
}

const NewsWidget: FC<NewsWidgetProps> = ({ limit = 5, category }) => {
  const { news, isLoading, error } = useNews({ limit, category });

  if (error) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <p className="text-sm text-red-400">Ошибка загрузки новостей</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <header className="flex items-center justify-between gap-3">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
        </header>
        <ul className="mt-4 flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="rounded-[18px] bg-transparent p-3">
              <div className="h-4 w-full animate-pulse rounded bg-gray-700" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-700" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (news.length === 0) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <header className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Новости</h3>
        </header>
        <p className="mt-4 text-sm text-[#8E8E94]">Нет доступных новостей</p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Новости</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {news.map((item) => {
          const publishedAgo = formatDistanceToNow(new Date(item.published_at), {
            addSuffix: true,
            locale: ru,
          });

          return (
            <li
              key={item.id}
              className="group rounded-[18px] bg-transparent p-3 transition-colors duration-200 hover:bg-[#482090]/12"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {item.image_url && (
                  <div className="mb-2 overflow-hidden rounded-lg">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm font-semibold leading-snug text-white group-hover:text-[#E3D8FF]">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 text-xs text-[#8E8E94] line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[#8E8E94]">
                  <span>{publishedAgo}</span>
                  {item.source && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[#2F3336]" aria-hidden />
                      <span>{item.source}</span>
                    </>
                  )}
                  {item.category && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[#2F3336]" aria-hidden />
                      <span className="text-[#A06AFF]">{item.category}</span>
                    </>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default NewsWidget;
