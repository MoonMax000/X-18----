import type { FC } from "react";
import { useMyActivity } from "../../hooks/useWidgets";
import { Activity } from "lucide-react";

interface MyActivityWidgetProps {
  period?: '7d' | '30d';
}

const MyActivityWidget: FC<MyActivityWidgetProps> = ({ period = '7d' }) => {
  const { activity, isLoading, error } = useMyActivity({ period });

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
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-700" />
          ))}
        </div>
      </section>
    );
  }

  if (!activity) return null;

  return (
    <section className="rounded-[24px] border border-widget-border bg-background p-5 shadow-[0_24px_48px_rgba(10,12,16,0.45)] backdrop-blur-[20px]">
      <header className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-[#A06AFF]" />
        <h3 className="text-lg font-semibold text-white">Моя активность</h3>
      </header>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg bg-[#482090]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8E8E94]">Посты</span>
            <span className="text-xl font-bold text-white">{activity.posts}</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#482090]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8E8E94]">Лайки</span>
            <span className="text-xl font-bold text-white">{activity.likes}</span>
          </div>
        </div>

        <div className="rounded-lg bg-[#482090]/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8E8E94]">Комментарии</span>
            <span className="text-xl font-bold text-white">{activity.comments}</span>
          </div>
        </div>

        <p className="text-xs text-center text-[#8E8E94]">
          За последние {period === '7d' ? '7 дней' : '30 дней'}
        </p>
      </div>
    </section>
  );
};

export default MyActivityWidget;
