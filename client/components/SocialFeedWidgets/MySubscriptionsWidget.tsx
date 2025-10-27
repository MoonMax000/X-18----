import type { FC } from "react";
import { useMySubscriptions } from "../../hooks/useWidgets";
import { Users } from "lucide-react";

const MySubscriptionsWidget: FC = () => {
  const { subscriptions, isLoading, error } = useMySubscriptions();

  if (error) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <p className="text-sm text-red-400">Ошибка загрузки</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
        <header className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#A06AFF]" />
          <h3 className="text-lg font-semibold text-white">Мои подписки</h3>
        </header>
        <p className="mt-4 text-sm text-[#8E8E94]">У вас пока нет подписок</p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#A06AFF]" />
          <h3 className="text-lg font-semibold text-white">Мои подписки</h3>
        </div>
        <span className="rounded-full bg-[#A06AFF]/20 px-2 py-1 text-xs font-semibold text-[#A06AFF]">
          {subscriptions.length}
        </span>
      </header>

      <ul className="mt-4 flex flex-col gap-3">
        {subscriptions.map((subscription) => (
          <li
            key={subscription.id}
            className="group flex items-center gap-3 rounded-lg bg-transparent p-2 transition-colors duration-200 hover:bg-[#482090]/12"
          >
            {subscription.creator?.avatar_url && (
              <img
                src={subscription.creator.avatar_url}
                alt={subscription.creator.display_name || subscription.creator.username}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-semibold text-white group-hover:text-[#E3D8FF]">
                {subscription.creator?.display_name || subscription.creator?.username || 'Пользователь'}
              </p>
              <p className="text-xs text-[#8E8E94]">
                {subscription.status === 'active' ? 'Активна' : subscription.status}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MySubscriptionsWidget;
