import { FC } from "react";
import type { FC } from "react";
import { cn } from "@/lib/utils";
import SubscriptionsWidget from "@/features/feed/components/widgets/SubscriptionsWidget";
import PurchasedPostsWidget from "@/features/feed/components/widgets/PurchasedPostsWidget";

const StatCard: FC<{
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}> = ({ label, value, change, isPositive }) => (
  <div className="flex flex-col gap-2 p-4 rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
    <span className="text-xs font-bold uppercase text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
      {label}
    </span>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
        {value}
      </span>
      {change && (
        <span className={cn(
          "text-sm font-semibold pb-0.5",
          isPositive ? "text-[#2EBD85]" : "text-[#FF6B6B]"
        )} style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          {isPositive ? "+" : ""}{change}
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
        <path d="M10.5163 16.3915C10.2335 16.5416 9.76653 16.5416 9.48369 16.3915C7.30036 15.2582 1.66699 11.6665 1.66699 6.24984C1.66699 4.08317 3.41699 2.33317 5.58366 2.33317C7.08366 2.33317 8.39199 3.1415 9.16699 4.33317C9.55433 3.74984 10.0668 3.25817 10.666 2.89984C11.2652 2.5415 11.9335 2.33317 12.6337 2.33317C14.8003 2.33317 16.5503 4.08317 16.5503 6.24984C16.5503 11.6665 10.917 15.2582 10.5163 16.3915Z" fill="#FF6B6B" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    comment: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6.66699 9.16667H6.67533M10.0003 9.16667H10.0087M13.3337 9.16667H13.342" stroke="#A06AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.0929 2.74139 12.1287 3.17382 13.0547C3.28701 13.2956 3.34361 13.4161 3.36655 13.5183C3.38799 13.6144 3.39515 13.6888 3.39452 13.7877C3.39388 13.8904 3.37407 14.0015 3.33446 14.2239L2.71549 17.4855C2.64012 17.8863 2.60243 18.0867 2.67921 18.2204C2.74606 18.3371 2.86291 18.4139 2.99647 18.4288C3.14972 18.4457 3.33996 18.3459 3.72044 18.1463L6.7118 16.6509C6.89638 16.5586 6.98866 16.5125 7.07581 16.4914C7.15422 16.4727 7.21622 16.4641 7.29634 16.4621C7.38547 16.46 7.48194 16.4749 7.67488 16.5047C8.73964 16.6702 9.85251 16.6766 10.9397 16.5134" stroke="#A06AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    follow: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 17.5V16.25C2.5 14.1789 4.17893 12.5 6.25 12.5H8.75C10.8211 12.5 12.5 14.1789 12.5 16.25V17.5M14.1667 2.60833C15.2792 2.99167 16.0833 4.035 16.0833 5.25833C16.0833 6.48167 15.2792 7.525 14.1667 7.90833M17.5 17.5V16.5C17.4917 15.2767 16.6875 14.2333 15.575 13.85" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    post: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M15.8337 5H4.16699C3.24652 5 2.50033 5.74619 2.50033 6.66667V15C2.50033 15.9205 3.24652 16.6667 4.16699 16.6667H15.8337C16.7541 16.6667 17.5003 15.9205 17.5003 15V6.66667C17.5003 5.74619 16.7541 5 15.8337 5Z" stroke="#A06AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5.83301 8.33333H14.1663M5.83301 11.6667H14.1663" stroke="#A06AFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#A06AFF]/20 to-[#482090]/20 flex items-center justify-center">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          <span className="font-bold">{user}</span> {action}
        </p>
        <span className="text-xs text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          {time}
        </span>
      </div>
    </div>
  );
};

const TopPostCard: FC<{
  title: string;
  likes: number;
  comments: number;
  views: number;
}> = ({ title, likes, comments, views }) => (
  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px] hover:border-[#A06AFF]/50 transition-colors cursor-pointer">
    <h4 className="text-sm font-bold text-white mb-3 line-clamp-2" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
      {title}
    </h4>
    <div className="flex items-center gap-4 text-xs text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M10.5163 16.3915C10.2335 16.5416 9.76653 16.5416 9.48369 16.3915C7.30036 15.2582 1.66699 11.6665 1.66699 6.24984C1.66699 4.08317 3.41699 2.33317 5.58366 2.33317C7.08366 2.33317 8.39199 3.1415 9.16699 4.33317C9.55433 3.74984 10.0668 3.25817 10.666 2.89984C11.2652 2.5415 11.9335 2.33317 12.6337 2.33317C14.8003 2.33317 16.5503 4.08317 16.5503 6.24984C16.5503 11.6665 10.917 15.2582 10.5163 16.3915Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{likes}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M6.66699 9.16667H6.67533M10.0003 9.16667H10.0087M13.3337 9.16667H13.342" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 11.0929 2.74139 12.1287 3.17382 13.0547C3.28701 13.2956 3.34361 13.4161 3.36655 13.5183C3.38799 13.6144 3.39515 13.6888 3.39452 13.7877C3.39388 13.8904 3.37407 14.0015 3.33446 14.2239L2.71549 17.4855C2.64012 17.8863 2.60243 18.0867 2.67921 18.2204C2.74606 18.3371 2.86291 18.4139 2.99647 18.4288C3.14972 18.4457 3.33996 18.3459 3.72044 18.1463L6.7118 16.6509C6.89638 16.5586 6.98866 16.5125 7.07581 16.4914C7.15422 16.4727 7.21622 16.4641 7.29634 16.4621C7.38547 16.46 7.48194 16.4749 7.67488 16.5047C8.73964 16.6702 9.85251 16.6766 10.9397 16.5134" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{comments}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{views}</span>
      </div>
    </div>
  </div>
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

  // Mock data for private widgets
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
    { type: "like" as const, user: "TraderAlex", action: "лайкнул ваш пос�� о Bitcoin", time: "12 мин назад" },
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

  return (
    <div className="flex flex-col gap-6 max-w-[1059px] mx-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Посты за месяц" value={mockStats.posts} change={mockStats.postsChange} isPositive />
        <StatCard label="Лайки" value={mockStats.likes} change={mockStats.likesChange} isPositive />
        <StatCard label="Комментарии" value={mockStats.comments} change={mockStats.commentsChange} isPositive />
        <StatCard label="Подписчики" value={mockStats.followers} change={mockStats.followersChange} isPositive />
      </div>

      {/* Engagement Metrics Chart */}
      <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Рост подписчиков
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#A06AFF] to-[#482090] rounded-full">
              Месяц
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold text-[#B0B0B0] hover:text-white rounded-full transition-colors">
              Неделя
            </button>
          </div>
        </div>
        
        {/* Simple Chart Visualization */}
        <div className="relative h-48 flex items-end gap-2">
          {[42, 58, 45, 72, 65, 88, 95, 78, 92, 85, 98, 100].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gradient-to-t from-[#A06AFF] to-[#482090] rounded-t-lg transition-all hover:opacity-80" style={{ height: `${height}%` }} />
              <span className="text-xs text-[#B0B0B0]">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Последняя активность
          </h3>
          <div className="flex flex-col gap-2">
            {mockActivity.map((activity, i) => (
              <ActivityItem key={i} {...activity} />
            ))}
          </div>
          <button className="w-full mt-4 px-4 py-2 text-sm font-semibold text-[#A06AFF] hover:text-white transition-colors text-center">
            Посмотреть все →
          </button>
        </div>

        {/* Top Performing Posts */}
        <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Популярные посты
          </h3>
          <div className="flex flex-col gap-3">
            {mockTopPosts.map((post, i) => (
              <TopPostCard key={i} {...post} />
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Rate Details */}
      <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
        <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
          Метрики вовлеченности
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                Engagement Rate
              </span>
              <span className="text-lg font-bold text-white">8.4%</span>
            </div>
            <div className="w-full h-2 bg-[#181B22] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2EBD85] to-[#1a8f63]" style={{ width: '84%' }} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                Reach Rate
              </span>
              <span className="text-lg font-bold text-white">12.7%</span>
            </div>
            <div className="w-full h-2 bg-[#181B22] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#A06AFF] to-[#482090]" style={{ width: '127%' }} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                Response Rate
              </span>
              <span className="text-lg font-bold text-white">95%</span>
            </div>
            <div className="w-full h-2 bg-[#181B22] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FFB84D] to-[#FF8C42]" style={{ width: '95%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              Социальные уведомления
            </h3>
            <span className="text-xs font-semibold text-[#A06AFF]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
              19 новых взаимодействий
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {socialUpdates.map((update, index) => (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={update.avatar}
                  alt={update.title}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {update.title}
                    </span>
                    <span className="text-xs font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                      {update.timestamp}
                    </span>
                  </div>
                  <span className="text-sm text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    {update.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-9 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-sm font-semibold text-[#A06AFF] hover:text-white transition-colors" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Открыть сообщения →
          </button>
        </div>

        <div className="p-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Группы, которые вы отслеживаете
          </h3>
          <div className="flex flex-col gap-3">
            {groupChats.map((chat, index) => (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={chat.image}
                  alt={chat.name}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-bold text-primary" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    {chat.name}
                  </span>
                  <span className="text-xs font-semibold text-[#B0B0B0]" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
                    {chat.subscribers}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-9 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ fontFamily: 'Nunito Sans, -apple-system, Roboto, Helvetica, sans-serif' }}>
            Посмотреть все группы →
          </button>
        </div>
      </div>

      {/* Private Widgets Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscriptions Widget */}
        <div className="w-full">
          <SubscriptionsWidget
            subscriptions={mockSubscriptions}
            onViewAll={() => console.log('View all subscriptions')}
          />
        </div>

        {/* Purchased Posts Widget */}
        <div className="w-full">
          <PurchasedPostsWidget
            posts={mockPurchasedPosts}
            onViewAll={() => console.log('View all purchased posts')}
          />
        </div>
      </div>
    </div>
  );
};

export default SocialOverview;
