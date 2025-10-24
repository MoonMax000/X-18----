import { type FC, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CARD_VARIANTS } from "@/features/feed/styles";
import SubscriptionsWidget from "@/features/feed/components/widgets/SubscriptionsWidget";
import PurchasedPostsWidget from "@/features/feed/components/widgets/PurchasedPostsWidget";

const sectionCardClass = cn(
  CARD_VARIANTS.widget.default,
  "p-6 md:p-7 bg-[#0C101480] border border-widget-border/80"
);

const statCardClass = cn(
  CARD_VARIANTS.widget.compact,
  "flex flex-col gap-2 bg-[#0C101480] border border-widget-border/80 p-4 md:p-5 transition-colors hover:border-[#A06AFF]/40"
);

const listItemClass = "flex items-center gap-3 rounded-2xl border border-transparent bg-white/5 p-3 transition-colors hover:border-[#A06AFF]/35 hover:bg-white/10";
const sectionTitleClass = "text-xl font-bold text-white";
const sectionSubtitleClass = "text-xs font-semibold uppercase tracking-wide text-[#8B98A5]";

interface SectionCardProps {
  className?: string;
  children: ReactNode;
}

const SectionCard: FC<SectionCardProps> = ({ className, children }) => (
  <section className={cn(sectionCardClass, className)}>{children}</section>
);

const StatCard: FC<{
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}> = ({ label, value, change, isPositive }) => (
  <div className={statCardClass}>
    <span className={sectionSubtitleClass}>{label}</span>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-white">{value}</span>
      {change && (
        <span
          className={cn(
            "text-sm font-semibold",
            isPositive ? "text-[#2EBD85]" : "text-[#FF6B6B]"
          )}
        >
          {isPositive ? "+" : ""}
          {change}
        </span>
      )}
    </div>
  </div>
);

const ActivityItem: FC<{
  type: "like" | "comment" | "follow" | "post";
  user: string;
  action: string;
  time: string;
}> = ({ type, user, action, time }) => {
  const icons = {
    like: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10.5163 16.3915C10.2335 16.5416 9.76653 16.5416 9.48369 16.3915C7.30036 15.2582 1.66699 11.6665 1.66699 6.24984C1.66699 4.08317 3.41699 2.33317 5.58366 2.33317C7.08366 2.33317 8.39199 3.1415 9.16699 4.33317C9.55433 3.74984 10.0668 3.25817 10.666 2.89984C11.2652 2.5415 11.9335 2.33317 12.6337 2.33317C14.8003 2.33317 16.5503 4.08317 16.5503 6.24984C16.5503 11.6665 10.917 15.2582 10.5163 16.3915Z"
          fill="#FF6B6B"
          stroke="#FF6B6B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    comment: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M6.66699 9.16667H6.67533M10.0003 9.16667H10.0087M13.3337 9.16667H13.342"
          stroke="#A06AFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.0929 2.74139 12.1287 3.17382 13.0547C3.28701 13.2956 3.34361 13.4161 3.36655 13.5183C3.38799 13.6144 3.39515 13.6888 3.39452 13.7877C3.39388 13.8904 3.37407 14.0015 3.33446 14.2239L2.71549 17.4855C2.64012 17.8863 2.60243 18.0867 2.67921 18.2204C2.74606 18.3371 2.86291 18.4139 2.99647 18.4288C3.14972 18.4457 3.33996 18.3459 3.72044 18.1463L6.7118 16.6509C6.89638 16.5586 6.98866 16.5125 7.07581 16.4914C7.15422 16.4727 7.21622 16.4641 7.29634 16.4621C7.38547 16.46 7.48194 16.4749 7.67488 16.5047C8.73964 16.6702 9.85251 16.6766 10.9397 16.5134"
          stroke="#A06AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    follow: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z"
          stroke="#2EBD85"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.5 17.5V16.25C2.5 14.1789 4.17893 12.5 6.25 12.5H8.75C10.8211 12.5 12.5 14.1789 12.5 16.25V17.5M14.1667 2.60833C15.2792 2.99167 16.0833 4.035 16.0833 5.25833C16.0833 6.48167 15.2792 7.525 14.1667 7.90833M17.5 17.5V16.5C17.4917 15.2767 16.6875 14.2333 15.575 13.85"
          stroke="#2EBD85"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    post: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.8337 5H4.16699C3.24652 5 2.50033 5.74619 2.50033 6.66667V15C2.50033 15.9205 3.24652 16.6667 4.16699 16.6667H15.8337C16.7541 16.6667 17.5003 15.9205 17.5003 15V6.66667C17.5003 5.74619 16.7541 5 15.8337 5Z"
          stroke="#A06AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.83301 8.33333H14.1663M5.83301 11.6667H14.1663"
          stroke="#A06AFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  } as const;

  return (
    <article className="flex items-start gap-3 rounded-2xl border border-transparent bg-white/5 p-4 transition-colors hover:border-[#A06AFF]/35 hover:bg-white/10">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF]/20 to-[#482090]/25">
        {icons[type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">
          <span className="font-bold">{user}</span> {action}
        </p>
        <span className="text-xs text-[#B0B0B0]">{time}</span>
      </div>
    </article>
  );
};

const TopPostCard: FC<{
  title: string;
  likes: number;
  comments: number;
  views: number;
}> = ({ title, likes, comments, views }) => (
  <article className="rounded-2xl border border-widget-border/75 bg-[#0C101480] p-4 transition-colors hover:border-[#A06AFF]/35 hover:bg-white/10">
    <h4 className="mb-3 line-clamp-2 text-sm font-bold text-white">{title}</h4>
    <div className="flex items-center gap-4 text-xs text-[#B0B0B0]">
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M10.5163 16.3915C10.2335 16.5416 9.76653 16.5416 9.48369 16.3915C7.30036 15.2582 1.66699 11.6665 1.66699 6.24984C1.66699 4.08317 3.41699 2.33317 5.58366 2.33317C7.08366 2.33317 8.39199 3.1415 9.16699 4.33317C9.55433 3.74984 10.0668 3.25817 10.666 2.89984C11.2652 2.5415 11.9335 2.33317 12.6337 2.33317C14.8003 2.33317 16.5503 4.08317 16.5503 6.24984C16.5503 11.6665 10.917 15.2582 10.5163 16.3915Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M6.66699 9.16667H6.67533M10.0003 9.16667H10.0087M13.3337 9.16667H13.342"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.0929 2.74139 12.1287 3.17382 13.0547C3.28701 13.2956 3.34361 13.4161 3.36655 13.5183C3.38799 13.6144 3.39515 13.6888 3.39452 13.7877C3.39388 13.8904 3.37407 14.0015 3.33446 14.2239L2.71549 17.4855C2.64012 17.8863 2.60243 18.0867 2.67921 18.2204C2.74606 18.3371 2.86291 18.4139 2.99647 18.4288C3.14972 18.4457 3.33996 18.3459 3.72044 18.1463L6.7118 16.6509C6.89638 16.5586 6.98866 16.5125 7.07581 16.4914C7.15422 16.4727 7.21622 16.4641 7.29634 16.4621C7.38547 16.46 7.48194 16.4749 7.67488 16.5047C8.73964 16.6702 9.85251 16.6766 10.9397 16.5134"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{comments}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path
            d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{views}</span>
      </div>
    </div>
  </article>
);

const SocialOverview: FC = () => {
  const mockStats = {
    posts: 142,
    postsChange: "12%",
    likes: 2847,
    likesChange: "23%",
    comments: 563,
    commentsChange: "8%",
    followers: 1542,
    followersChange: "15%",
  };

  const mockSubscriptions = [
    {
      authorId: "1",
      authorName: "CryptoWhale",
      authorHandle: "@cryptowhale",
      authorAvatar: "https://i.pravatar.cc/120?img=12",
      subscribedAt: "2024-01-15",
      price: 29,
      totalPosts: 156,
      newPostsThisWeek: 3,
    },
    {
      authorId: "2",
      authorName: "Market Maven",
      authorHandle: "@marketmaven",
      authorAvatar: "https://i.pravatar.cc/120?img=23",
      subscribedAt: "2024-02-01",
      price: 49,
      totalPosts: 234,
      newPostsThisWeek: 5,
    },
    {
      authorId: "3",
      authorName: "Tech Trader",
      authorHandle: "@techtrader",
      authorAvatar: "https://i.pravatar.cc/120?img=34",
      subscribedAt: "2024-01-20",
      price: 19,
      totalPosts: 89,
      newPostsThisWeek: 2,
    },
  ];

  const mockPurchasedPosts = [
    {
      postId: "p1",
      title: "Bitcoin 2024 Outlook: Why $100K is Conservative",
      authorName: "CryptoWhale",
      authorHandle: "@cryptowhale",
      authorAvatar: "https://i.pravatar.cc/120?img=12",
      purchasedAt: "2024-03-10",
      price: 9,
      views: 5,
      thumbnail: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=200&h=200&fit=crop",
    },
    {
      postId: "p2",
      title: "Advanced Options Trading: Iron Condor Strategy Deep Dive",
      authorName: "Market Maven",
      authorHandle: "@marketmaven",
      authorAvatar: "https://i.pravatar.cc/120?img=23",
      purchasedAt: "2024-03-08",
      price: 15,
      views: 12,
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop",
    },
    {
      postId: "p3",
      title: "AI Stocks: The Next Wave of Tech Dominance",
      authorName: "Tech Trader",
      authorHandle: "@techtrader",
      authorAvatar: "https://i.pravatar.cc/120?img=34",
      purchasedAt: "2024-03-05",
      price: 12,
      views: 8,
    },
  ];

  const mockActivity = [
    { type: "follow" as const, user: "Maria_Crypto", action: "подписался на вас", time: "5 мин назад" },
    { type: "like" as const, user: "TraderAlex", action: "лайкнул ваш пост о Bitcoin", time: "12 мин назад" },
    { type: "comment" as const, user: "CryptoGuru", action: "прокомментировал ваш анализ", time: "1 час назад" },
    { type: "follow" as const, user: "ETH_investor", action: "подписался на вас", time: "2 часа назад" },
    { type: "like" as const, user: "DayTrader_Pro", action: "лайкнул ваш пост", time: "3 часа назад" },
  ];

  const mockTopPosts = [
    { title: "Bitcoin достиг нового максимума! Анализ текущей ситуации", likes: 342, comments: 87, views: 5420 },
    { title: "5 правил успешного трейдинга в 2024 году", likes: 289, comments: 64, views: 4850 },
    { title: "Ethereum: что ждет нас в ближайшие месяцы?", likes: 215, comments: 52, views: 3920 },
  ];

  const socialUpdates = [
    {
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/7746a2e8ebde2c6e52ec623079f09df3e63924fe?width=88",
      title: "Sophia Light",
      subtitle: "Check out new ETH Analysis...",
      timestamp: "5 мин назад",
    },
    {
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/23996870cb880292839824f9010dd522308f5fac?width=88",
      title: "Market Chat",
      subtitle: "3 новых сообщения в группе",
      timestamp: "12 мин назад",
    },
    {
      avatar: "https://api.builder.io/api/v1/image/assets/TEMP/68682742732be9f94522a43dd137511874548bb4?width=88",
      title: "Macro Outlook 2025",
      subtitle: "17 новых сообщений",
      timestamp: "1 час назад",
    },
  ];

  const groupChats = [
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/a41932045d11fb04b12ef9336587c545788a4897?width=88",
      name: "Crypto Basics - Live Q&A",
      subscribers: "72 подписчика",
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/2fed6ad136bda82afad8c1217f85da48694cef42?width=88",
      name: "Macro Outlook 2025",
      subscribers: "2 369 подписчиков",
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/5eb00142623d95405333abe65d6e36c1831036f7?width=88",
      name: "Ask Jane: Portfolio Diversification",
      subscribers: "86 подписчиков",
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/128f58d068f62f85b2902e36565aaef59e190b49?width=88",
      name: "Fed Policy & Inflation",
      subscribers: "823 подписчика",
    },
    {
      image: "https://api.builder.io/api/v1/image/assets/TEMP/193725c84dab4dcd05d7a90347c68161b6a82c94?width=88",
      name: "ETH ETF Approval: What's Next?",
      subscribers: "72 подписчика",
    },
  ];

  const [subscriberTimeRange, setSubscriberTimeRange] = useState<"week" | "month">("month");

  const followerGrowthData = {
    week: [85, 90, 88, 92, 87, 95, 100],
    month: [42, 58, 45, 72, 65, 88, 95, 78, 92, 85, 98, 100, 85, 90, 88, 92, 87, 95, 100, 75, 82, 78, 85, 80, 90, 88, 92, 87, 95, 100],
  };

  const followerGrowth = followerGrowthData[subscriberTimeRange];

  const engagementMetrics = [
    {
      label: "Engagement Rate",
      value: "8.4%",
      progress: 84,
      gradient: "from-[#2EBD85] to-[#1A6A4A]",
    },
    {
      label: "Reach Rate",
      value: "12.7%",
      progress: 72,
      gradient: "from-[#A06AFF] to-[#482090]",
    },
    {
      label: "Response Rate",
      value: "95%",
      progress: 95,
      gradient: "from-[#FFB84D] to-[#FF8C42]",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-8 md:gap-10">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        <StatCard label="Посты за месяц" value={mockStats.posts} change={mockStats.postsChange} isPositive />
        <StatCard label="Лайки" value={mockStats.likes} change={mockStats.likesChange} isPositive />
        <StatCard label="Ком��ентарии" value={mockStats.comments} change={mockStats.commentsChange} isPositive />
        <StatCard label="Подписчики" value={mockStats.followers} change={mockStats.followersChange} isPositive />
      </div>

      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className={sectionTitleClass}>Рост подписчиков</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]"
            >
              Месяц
            </button>
            <button
              type="button"
              className="rounded-full border border-widget-border/80 px-3 py-1.5 text-xs font-semibold text-[#B0B0B0] transition-colors hover:text-white"
            >
              Неделя
            </button>
          </div>
        </div>
        <div className="relative mt-6 h-48 flex items-end gap-2">
          {followerGrowth.map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#A06AFF] to-[#482090] transition-all hover:opacity-80"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-[#B0B0B0]">{index + 1}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <SectionCard>
          <h3 className={sectionTitleClass}>Последняя активность</h3>
          <div className="mt-4 flex flex-col gap-3">
            {mockActivity.map((activity, index) => (
              <ActivityItem key={`${activity.user}-${index}`} {...activity} />
            ))}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-full border border-widget-border/80 bg-black/40 px-4 py-2 text-sm font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/35 hover:text-white"
          >
            Посмотреть все →
          </button>
        </SectionCard>

        <SectionCard>
          <h3 className={sectionTitleClass}>Популярные посты</h3>
          <div className="mt-4 flex flex-col gap-4">
            {mockTopPosts.map((post, index) => (
              <TopPostCard key={`${post.title}-${index}`} {...post} />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard>
        <h3 className={sectionTitleClass}>Метрики вовлеченности</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {engagementMetrics.map((metric) => (
            <div key={metric.label} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#B0B0B0]">{metric.label}</span>
                <span className="text-lg font-bold text-white">{metric.value}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-widget-border/60">
                <div
                  className={cn("h-full rounded-full", `bg-gradient-to-r ${metric.gradient}`)}
                  style={{ width: `${metric.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <SectionCard>
          <div className="flex items-center justify-between">
            <h3 className={sectionTitleClass}>Социальные уведомления</h3>
            <span className="text-xs font-semibold text-[#A06AFF]">19 новых взаимодействий</span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {socialUpdates.map((update, index) => (
              <div key={`${update.title}-${index}`} className={listItemClass}>
                <img src={update.avatar} alt={update.title} className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-white">{update.title}</span>
                    <span className="text-xs font-semibold text-[#B0B0B0]">{update.timestamp}</span>
                  </div>
                  <span className="text-sm text-[#B0B0B0]">{update.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-full border border-widget-border/80 bg-black/40 px-4 py-2 text-sm font-semibold text-[#A06AFF] transition-colors hover:border-[#A06AFF]/35 hover:text-white"
          >
            Открыть сообщения →
          </button>
        </SectionCard>

        <SectionCard>
          <h3 className={sectionTitleClass}>Гр��ппы, которые вы отслеживаете</h3>
          <div className="mt-4 flex flex-col gap-3">
            {groupChats.map((chat, index) => (
              <div key={`${chat.name}-${index}`} className={listItemClass}>
                <img src={chat.image} alt={chat.name} className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-primary">{chat.name}</span>
                  <span className="text-xs font-semibold text-[#B0B0B0]">{chat.subscribers}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-5 w-full rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Посмотреть все группы →
          </button>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <div className="h-full">
          <SubscriptionsWidget subscriptions={mockSubscriptions} />
        </div>
        <div className="h-full">
          <PurchasedPostsWidget posts={mockPurchasedPosts} />
        </div>
      </div>
    </div>
  );
};

export default SocialOverview;
