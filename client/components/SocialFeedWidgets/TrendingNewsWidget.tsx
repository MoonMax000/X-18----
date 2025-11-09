import type { FC } from "react";
import { useNews } from "../../hooks/useWidgets";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

const FALLBACK_AVATARS = [
  "https://i.pravatar.cc/120?img=10",
  "https://i.pravatar.cc/120?img=22",
  "https://i.pravatar.cc/120?img=34",
  "https://i.pravatar.cc/120?img=48",
  "https://i.pravatar.cc/120?img=53",
];

interface TrendingNewsWidgetProps {
  title?: string;
  limit?: number;
  category?: string;
  showAvatars?: boolean;
}

const TrendingNewsWidget: FC<TrendingNewsWidgetProps> = ({ 
  title = "Актуальное", 
  limit = 5,
  category,
  showAvatars = true
}) => {
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
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </header>
        <p className="mt-4 text-sm text-[#8E8E94]">Нет доступных новостей</p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {news.map((item, index) => {
          const publishedAgo = formatDistanceToNow(new Date(item.published_at), {
            addSuffix: true,
            locale: ru,
          });

          // Используем случайные аватары для визуального эффекта
          const avatarSources = showAvatars ? FALLBACK_AVATARS.slice(0, 3) : [];

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
                <p className="text-sm font-semibold leading-snug text-white group-hover:text-[#E3D8FF]">
                  {item.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[#8E8E94]">
                  {avatarSources.length > 0 && (
                    <div className="mr-1 flex items-center -space-x-2">
                      {avatarSources.map((avatar, avatarIndex) => (
                        <span
                          key={`${item.id}-avatar-${avatarIndex}`}
                          className="inline-flex h-5 w-5 overflow-hidden rounded-full border border-[#1a1a1a]"
                        >
                          <img
                            src={avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  )}
                  <span>{publishedAgo}</span>
                  {item.category && (
                    <>
                      <span
                        className="h-1 w-1 rounded-full bg-[#2F3336]"
                        aria-hidden
                      />
                      <span className="text-[#A06AFF]">{item.category}</span>
                    </>
                  )}
                  {item.source && (
                    <>
                      <span
                        className="h-1 w-1 rounded-full bg-[#2F3336]"
                        aria-hidden
                      />
                      <span>{item.source}</span>
                    </>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      
      {news.length >= limit && (
        <button
          type="button"
          onClick={() => window.open('/news', '_blank')}
          className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
        >
          Показать больше
        </button>
      )}
    </section>
  );
};

export default TrendingNewsWidget;
