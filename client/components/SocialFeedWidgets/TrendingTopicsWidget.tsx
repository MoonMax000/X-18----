import type { FC } from "react";

const FALLBACK_AVATARS = [
  "https://i.pravatar.cc/120?img=10",
  "https://i.pravatar.cc/120?img=22",
  "https://i.pravatar.cc/120?img=34",
  "https://i.pravatar.cc/120?img=48",
  "https://i.pravatar.cc/120?img=53",
];

interface NewsItem {
  id: string;
  title: string;
  category?: string;
  publishedAgo: string;
  engagement?: string;
  commentCount?: number;
  avatars?: string[];
}

interface NewsWidgetProps {
  title?: string;
  items: NewsItem[];
}

const NewsWidget: FC<NewsWidgetProps> = ({ title = "Today's News", items }) => {
  return (
    <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {items.map((item) => {
          const hasComments = (item.commentCount ?? 0) > 0;
          const avatarSources = hasComments
            ? item.avatars && item.avatars.length > 0
              ? item.avatars
              : FALLBACK_AVATARS
            : [];

          return (
            <li
              key={item.id}
              className="group rounded-[18px] bg-transparent p-3 transition-colors duration-200 hover:bg-[#482090]/12"
            >
              <p className="text-sm font-semibold leading-snug text-white group-hover:text-[#E3D8FF]">
                {item.title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-[#8E8E94]">
                {avatarSources.length > 0 ? (
                  <div className="mr-1 flex items-center -space-x-2">
                    {avatarSources.slice(0, 3).map((avatar, index) => (
                      <span
                        key={`${item.id}-avatar-${index}`}
                        className="inline-flex h-5 w-5 overflow-hidden rounded-full"
                      >
                        <img
                          src={avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                    ))}
                  </div>
                ) : null}
                <span>{item.publishedAgo}</span>
                {item.category ? (
                  <>
                    <span
                      className="h-1 w-1 rounded-full bg-[#2F3336]"
                      aria-hidden
                    />
                    <span>{item.category}</span>
                  </>
                ) : null}
                {item.engagement ? (
                  <>
                    <span
                      className="h-1 w-1 rounded-full bg-[#2F3336]"
                      aria-hidden
                    />
                    <span>{item.engagement}</span>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="mt-3 text-sm font-semibold text-[#A06AFF] transition-colors duration-200 hover:text-white"
      >
        Show more
      </button>
    </section>
  );
};

export type { NewsItem };
export default NewsWidget;
