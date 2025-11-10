import type { FC } from "react";
import { useTopAuthors } from "../../hooks/useWidgets";
import { Crown } from "lucide-react";
import { getAvatarUrl } from "../../lib/avatar-utils";
import { AuthorSkeleton } from "../skeletons/WidgetSkeleton";

interface TopAuthorsWidgetProps {
  limit?: number;
  timeframe?: '24h' | '7d' | '30d';
}

const TopAuthorsWidget: FC<TopAuthorsWidgetProps> = ({ limit = 5, timeframe = '7d' }) => {
  const { authors, isLoading, error } = useTopAuthors({ limit, timeframe });

  if (error) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <p className="text-sm text-red-400">Ошибка загрузки</p>
      </section>
    );
  }

  if (isLoading) {
    return <AuthorSkeleton count={limit} />;
  }

  return (
    <section className="rounded-[24px] border border-widget-border bg-[#000000] p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px] animate-fadeIn">
      <header className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-[#A06AFF]" />
        <h3 className="text-lg font-semibold text-white">Топ авторы</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {authors.map((author, index) => (
          <li
            key={author.user_id}
            className="group flex items-center gap-3 rounded-lg bg-transparent p-2 transition-colors duration-200 hover:bg-[#482090]/12"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A06AFF]/20 text-xs font-semibold text-[#A06AFF]">
              {index + 1}
            </span>
            <img
              src={getAvatarUrl({
                avatar_url: author.avatar_url,
                username: author.username,
                display_name: author.display_name
              })}
              alt={author.display_name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:text-[#E3D8FF]">
                {author.display_name}
              </p>
              <p className="text-xs text-[#8E8E94]">
                {author.posts_count} постов • {author.likes_count} лайков
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TopAuthorsWidget;
