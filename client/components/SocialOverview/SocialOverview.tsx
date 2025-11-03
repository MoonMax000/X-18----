import { type FC, type ReactNode, useState, memo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CARD_VARIANTS } from "@/features/feed/styles";
import SubscriptionsWidget from "@/features/feed/components/widgets/SubscriptionsWidget";
import PurchasedPostsWidget from "@/features/feed/components/widgets/PurchasedPostsWidget";
import { Eye, Heart, MessageCircle, Loader2 } from "lucide-react";
import { useProfileStats } from "@/hooks/useProfileStats";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import ProfileHero from "@/components/socialProfile/ProfileHero";
import { useAuth } from "@/contexts/AuthContext";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

const sectionCardClass = cn(
  CARD_VARIANTS.widget.default,
  "p-6 md:p-7 bg-[#0C101480] border border-widget-border/80"
);

const statCardClass = cn(
  CARD_VARIANTS.widget.compact,
  "flex flex-col gap-2 bg-[#0C101480] border border-widget-border/80 p-4 md:p-5 transition-colors hover:border-[#A06AFF]/40"
);

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

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const SocialOverview: FC = () => {
  const { user } = useAuth();
  const currentUser = useSelector((state: RootState) => state.profile.currentUser);
  const { stats, activity: realActivity, topPosts: realTopPosts, followerGrowth: growthData, isLoading, refetchFollowerGrowth } = useProfileStats();
  const [subscriberTimeRange, setSubscriberTimeRange] = useState<"week" | "month">("month");

  // Create profile data for ProfileHero
  console.log('[SocialOverview] Creating profileData:');
  console.log('[SocialOverview] - user from AuthContext:', user);
  console.log('[SocialOverview] - user.avatar_url:', user?.avatar_url);
  console.log('[SocialOverview] - user.header_url:', user?.header_url);
  console.log('[SocialOverview] - currentUser from Redux:', currentUser);
  console.log('[SocialOverview] - currentUser.avatar:', currentUser?.avatar);
  console.log('[SocialOverview] - currentUser.cover:', currentUser?.cover);
  
  const profileData = {
    id: user?.id || '',
    name: user?.display_name || currentUser?.name || 'User',
    username: user?.username || currentUser?.username || 'user',
    bio: user?.bio || currentUser?.bio || '',
    avatar: user?.avatar_url || currentUser?.avatar || '',
    cover: user?.header_url || currentUser?.cover || '',
    location: currentUser?.location || '',
    website: currentUser?.website ? { label: currentUser.website, url: currentUser.website } : undefined,
    joined: user ? new Date(user.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }) : 'Недавно',
    stats: {
      tweets: user?.posts_count || stats?.posts_this_month || 0,
      following: user?.following_count || 0,
      followers: user?.followers_count || stats?.total_followers || 0,
      likes: stats?.total_likes || 0,
    },
  };
  
  console.log('[SocialOverview] Final profileData:', profileData);
  console.log('[SocialOverview] Final profileData.avatar:', profileData.avatar);
  console.log('[SocialOverview] Final profileData.cover:', profileData.cover);

  // Refetch follower growth when time range changes
  useEffect(() => {
    refetchFollowerGrowth(subscriberTimeRange);
  }, [subscriberTimeRange, refetchFollowerGrowth]);

  // Mock data for subscriptions and purchases (будет заменено позже)
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
  ];

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Convert follower growth data to percentages
  const maxGrowth = Math.max(...(growthData?.map(d => d.count) || [1]));
  const growthPercentages = growthData?.map(d => Math.round((d.count / maxGrowth) * 100)) || [];

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-8 md:gap-10">
      {/* Profile Hero with Avatar/Cover Upload */}
      <ProfileHero 
        profile={profileData}
        tweetsCount={stats?.posts_this_month || 0}
        isOwnProfile={true}
      />
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
        <StatCard 
          label="Посты за месяц" 
          value={stats?.posts_this_month || 0} 
          change={stats?.posts_change ? `${stats.posts_change.toFixed(1)}%` : undefined}
          isPositive={stats ? stats.posts_change >= 0 : true}
        />
        <StatCard 
          label="Лайки" 
          value={stats?.total_likes || 0} 
          change={stats?.likes_change ? `${stats.likes_change.toFixed(1)}%` : undefined}
          isPositive={stats ? stats.likes_change >= 0 : true}
        />
        <StatCard 
          label="Комментарии" 
          value={stats?.total_comments || 0} 
          change={stats?.comments_change ? `${stats.comments_change.toFixed(1)}%` : undefined}
          isPositive={stats ? stats.comments_change >= 0 : true}
        />
        <StatCard 
          label="Подписчики" 
          value={stats?.total_followers || 0} 
          change={stats?.followers_change ? `${stats.followers_change.toFixed(1)}%` : undefined}
          isPositive={stats ? stats.followers_change >= 0 : true}
        />
      </div>

      {/* Follower Growth Chart */}
      <SectionCard>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className={sectionTitleClass}>Рост подписчиков</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSubscriberTimeRange("month")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                subscriberTimeRange === "month"
                  ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]"
                  : "border border-widget-border/80 text-[#B0B0B0] hover:text-white hover:border-[#A06AFF]/50"
              )}
            >
              Месяц
            </button>
            <button
              type="button"
              onClick={() => setSubscriberTimeRange("week")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                subscriberTimeRange === "week"
                  ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]"
                  : "border border-widget-border/80 text-[#B0B0B0] hover:text-white hover:border-[#A06AFF]/50"
              )}
            >
              Неделя
            </button>
          </div>
        </div>
        <div className="relative mt-6 h-48 flex items-end gap-2">
          {growthPercentages.length > 0 ? (
            growthPercentages.map((height, index) => (
              <div key={index} className="group flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#A06AFF] to-[#482090] transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${height}%` }}
                    title={`${growthData?.[index]?.count || 0} подписчиков`}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/90 border border-[#A06AFF] rounded px-2 py-1 text-xs font-bold text-white whitespace-nowrap z-10">
                    {growthData?.[index]?.count || 0}
                  </div>
                </div>
                <span className="text-xs text-[#B0B0B0]">{growthData?.[index]?.date || index + 1}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              Нет данных
            </div>
          )}
        </div>
      </SectionCard>

      {/* Activity and Top Posts */}
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <SectionCard>
          <h3 className={sectionTitleClass}>Последняя активность</h3>
          <div className="mt-4 flex flex-col gap-3">
            {realActivity && realActivity.length > 0 ? (
              realActivity.map((item, index) => (
                <ActivityItem 
                  key={`${item.username}-${index}`}
                  type={item.type}
                  user={item.user}
                  action={item.action}
                  time={formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ru })}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Нет активности
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className={sectionTitleClass}>Популярные посты</h3>
          <div className="mt-4 flex flex-col divide-y divide-[#181B22]">
            {realTopPosts && realTopPosts.length > 0 ? (
              realTopPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/[0.02] first:pt-0"
                >
                  <div className="h-14 w-20 flex-shrink-0 rounded-xl border border-[#181B22] bg-[#0A0D12]" />

                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h3 className="truncate text-sm font-bold text-white">
                      {post.content?.substring(0, 60)}...
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#6C7280]">
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(post.likes_count)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{formatNumber(post.replies_count)}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Нет постов
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Subscriptions and Purchases */}
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        <div className="h-full">
          <SubscriptionsWidget subscriptions={mockSubscriptions} />
        </div>
        <div className="h-full">
          <PurchasedPostsWidget posts={mockPurchasedPosts} />
        </div>
      </div>

      {/* Engagement Metrics */}
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
    </div>
  );
};

export default memo(SocialOverview);
