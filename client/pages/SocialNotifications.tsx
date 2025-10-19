import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: "follow" | "like" | "mention" | "repost";
  actor: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  message: string;
  timestamp: string;
  meta?: string;
}

const notificationFilters = [
  { id: "all", label: "Все" },
  { id: "mentions", label: "Упоминания" },
] as const;

type NotificationFilterId = (typeof notificationFilters)[number]["id"];

const notifications: NotificationItem[] = [
  {
    id: "n-follow-01",
    type: "follow",
    actor: {
      name: "Eva Nakamura",
      handle: "@quantumflow",
      avatar: "https://i.pravatar.cc/120?img=47",
      verified: true,
    },
    message: "подписалась на ваши обновления",
    timestamp: "2 мин назад",
  },
  {
    id: "n-like-01",
    type: "like",
    actor: {
      name: "Macro Sensei",
      handle: "@macroSensei",
      avatar: "https://i.pravatar.cc/120?img=41",
    },
    message: "лайкнул ваш тред «Ликвидность в азиатскую сессию»",
    timestamp: "12 мин назад",
  },
  {
    id: "n-mention-01",
    type: "mention",
    actor: {
      name: "Tyrian Research",
      handle: "@tyrianresearch",
      avatar: "https://i.pravatar.cc/120?img=56",
      verified: true,
    },
    message: "упомянул вас в обзоре «Как фонды хеджируют риск перед CPI»",
    timestamp: "33 мин назад",
  },
  {
    id: "n-repost-01",
    type: "repost",
    actor: {
      name: "Мария Козина",
      handle: "@delta_maria",
      avatar: "https://i.pravatar.cc/120?img=28",
    },
    message: "поделилась вашим постом «AI-индикаторы для фьючерсов на индекс»",
    timestamp: "1 ч назад",
    meta: "+687 показов",
  },
  {
    id: "n-like-02",
    type: "like",
    actor: {
      name: "Crypto Scout",
      handle: "@scout_io",
      avatar: "https://i.pravatar.cc/120?img=33",
    },
    message: "лайкнул ваш ответ в треде про staking",
    timestamp: "2 ч назад",
  },
  {
    id: "n-mention-02",
    type: "mention",
    actor: {
      name: "Gamma Insider",
      handle: "@gamma_io",
      avatar: "https://i.pravatar.cc/120?img=15",
    },
    message: "отметил вас в аналитике по волатильности опционов",
    timestamp: "5 ч назад",
    meta: "+42 перехода",
  },
];

const SocialNotifications: FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotificationFilterId>("all");
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [attentionDialogOpen, setAttentionDialogOpen] = useState(false);
  
  // Attention control settings
  const [attentionSettings, setAttentionSettings] = useState({
    showLikes: true,
    showReposts: true,
    showFollows: true,
    showMentions: true,
  });
  
  // Newsletter settings
  const [emailNotifications, setEmailNotifications] = useState(false);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "mentions") {
      return notifications.filter((notification) => notification.type === "mention");
    }

    return notifications;
  }, [activeFilter]);

  const filterCounts = useMemo(() => ({
    all: notifications.length,
    mentions: notifications.filter((notification) => notification.type === "mention").length,
  }), []);

  const filteredUnreadCount = useMemo(
    () => filteredNotifications.filter((notification) => !readNotifications.has(notification.id)).length,
    [filteredNotifications, readNotifications],
  );

  const unreadTotal = useMemo(
    () => notifications.filter((notification) => !readNotifications.has(notification.id)).length,
    [readNotifications],
  );

  const handleToggleRead = useCallback((id: string) => {
    setReadNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleMarkAllAsRead = useCallback(() => {
    setReadNotifications((prev) => {
      const next = new Set(prev);
      filteredNotifications.forEach((notification) => next.add(notification.id));
      return next;
    });
  }, [filteredNotifications]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex w-full gap-2 sm:gap-4 md:gap-8">
      <div className="flex-1 w-full sm:max-w-[720px]">
        <div className="sticky top-0 z-10 bg-black/95 backdrop-blur-md">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-[#ffffff]/[0.15] active:bg-[#ffffff]/[0.25]"
              aria-label="Back"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.6667 5L6.66675 10L11.6667 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white">Уведомления</h1>
              <p className="text-sm text-[#8E92A0]">{unreadTotal} непрочитанных</p>
            </div>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={filteredUnreadCount === 0}
              className={cn(
                "text-sm font-semibold transition-colors",
                filteredUnreadCount === 0
                  ? "text-[#8E92A0] cursor-not-allowed"
                  : "text-[#A06AFF] hover:text-[#B87AFF]"
              )}
            >
              Прочитать все
            </button>
          </div>

          <div className="px-4 py-3">
            <div className="flex items-center overflow-x-auto rounded-full border border-[#5E5E5E] bg-[#000000] p-0.5 transition-all duration-300 hover:border-[#B87AFF] hover:shadow-[0_0_20px_rgba(184,122,255,0.3)]">
              {notificationFilters.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "flex-1 min-w-[120px] px-3 py-2 text-sm font-semibold transition-all duration-300 relative group",
                      isActive
                        ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] hover:shadow-[0_16px_40px_-12px_rgba(160,106,255,1),inset_0_0_12px_rgba(0,0,0,0.3)]"
                        : "rounded-full text-[#9CA3AF] hover:text-white hover:bg-gradient-to-r hover:from-[#A06AFF]/20 hover:to-[#482090]/20 hover:shadow-[0_8px_20px_-12px_rgba(160,106,255,0.5)]"
                    )}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {filter.label}
                      <span className={cn(
                        "ml-1 rounded-full px-2 py-0.5 text-xs",
                        isActive ? "bg-white/10" : "bg-[#1A1A1A]"
                      )}>
                        {filterCounts[filter.id]}
                      </span>
                    </span>
                    {!isActive && (
                      <div
                        className="absolute bottom-0 left-1/2 h-0.5 w-0 rounded-full transform -translate-x-1/2 group-hover:w-3/4 transition-all duration-300"
                        style={{
                          background: 'linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)'
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="divide-y divide-[#1A1A1A]">
          {filteredNotifications.length === 0 ? (
            <EmptyNotificationsState activeFilter={activeFilter} />
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItemRow
                key={notification.id}
                notification={notification}
                isRead={readNotifications.has(notification.id)}
                onToggleRead={() => handleToggleRead(notification.id)}
              />
            ))
          )}
        </div>
      </div>

      <aside className="hidden h-fit w-[340px] flex-col gap-4 lg:flex">
        <div className="rounded-2xl border border-[#5E5E5E] bg-[#000000] p-5">
          <h3 className="text-lg font-semibold text-white">Контроль внимания</h3>
          <p className="mt-2 text-sm text-[#B0B0B0]">
            Выберите, какие типы уведомлений вы хотите получать.
          </p>
          <button
            type="button"
            onClick={() => setAttentionDialogOpen(true)}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:shadow-[0_0_20px_rgba(160,106,255,0.4)]"
          >
            Настроить фильтры
          </button>
        </div>
        <div className="rounded-2xl border border-[#5E5E5E] bg-[#000000] p-5">
          <h3 className="text-lg font-semibold text-white">Email уведомления</h3>
          <p className="mt-2 text-sm text-[#B0B0B0]">
            Получайте важные уведомления на вашу электронную почту.
          </p>
          <div className="mt-4">
            <label className="flex cursor-pointer items-center justify-between text-sm text-white">
              <span>Включить email уведомления</span>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </label>
          </div>
        </div>
      </aside>

      {/* Attention Control Dialog */}
      <Dialog open={attentionDialogOpen} onOpenChange={setAttentionDialogOpen}>
        <DialogContent className="border-[#5E5E5E] bg-[#0A0D12] sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Контроль внимания</DialogTitle>
            <DialogDescription className="text-[#B0B0B0]">
              Настройте, какие типы уведомлений вы хотите получать
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Типы уведомлений</h4>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-3 text-sm text-white transition-colors hover:bg-[#10131A]">
                <span>Лайки</span>
                <Switch
                  checked={attentionSettings.showLikes}
                  onCheckedChange={(checked) =>
                    setAttentionSettings((prev) => ({ ...prev, showLikes: checked }))
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-3 text-sm text-white transition-colors hover:bg-[#10131A]">
                <span>Репосты</span>
                <Switch
                  checked={attentionSettings.showReposts}
                  onCheckedChange={(checked) =>
                    setAttentionSettings((prev) => ({ ...prev, showReposts: checked }))
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-3 text-sm text-white transition-colors hover:bg-[#10131A]">
                <span>Новые подписчики</span>
                <Switch
                  checked={attentionSettings.showFollows}
                  onCheckedChange={(checked) =>
                    setAttentionSettings((prev) => ({ ...prev, showFollows: checked }))
                  }
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-3 text-sm text-white transition-colors hover:bg-[#10131A]">
                <span>Упоминания</span>
                <Switch
                  checked={attentionSettings.showMentions}
                  onCheckedChange={(checked) =>
                    setAttentionSettings((prev) => ({ ...prev, showMentions: checked }))
                  }
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => setAttentionDialogOpen(false)}
              className="w-full rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(160,106,255,0.4)]"
            >
              Сохранить настройки
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface NotificationItemRowProps {
  notification: NotificationItem;
  isRead: boolean;
  onToggleRead: () => void;
}

const NotificationItemRow: FC<NotificationItemRowProps> = ({ notification, isRead, onToggleRead }) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
  <article
    className={cn(
      "grid grid-cols-[auto_1fr] gap-4 px-4 py-4 transition-colors",
      isRead ? "opacity-70" : "hover:bg-[#0A0A0A]"
    )}
  >
    <div className="relative mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A]">
      <img
        src={notification.actor.avatar}
        alt={notification.actor.name}
        className="h-12 w-12 rounded-full object-cover"
      />
      <NotificationBadge type={notification.type} />
    </div>
    <div className="flex flex-col gap-2 text-sm text-white">
      <div className="flex flex-wrap items-center gap-2 text-[15px]">
        <span className="font-semibold">{notification.actor.name}</span>
        {notification.actor.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#4FC3F7]/20 px-2 py-0.5 text-[11px] font-semibold text-[#4FC3F7]">
            <svg
              className="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12.1807 6.41383C12.1807 8.13331 11.3342 9.45684 10.0462 10.3278C9.74616 10.5307 9.59616 10.6322 9.52216 10.7475C9.44817 10.8628 9.4229 11.0143 9.37243 11.3172L9.33317 11.5526C9.24448 12.0847 9.20015 12.3507 9.01365 12.5087C8.82715 12.6667 8.55743 12.6667 8.01796 12.6667H6.27696C5.73755 12.6667 5.46782 12.6667 5.28132 12.5087C5.09483 12.3507 5.05049 12.0847 4.9618 11.5526L4.92258 11.3172C4.87226 11.0153 4.8471 10.8644 4.77382 10.7496C4.70053 10.6348 4.55021 10.532 4.24958 10.3265C2.97529 9.45551 2.1807 8.13244 2.1807 6.41383C2.1807 3.60797 4.41928 1.33337 7.1807 1.33337C7.52317 1.33337 7.85757 1.36836 8.1807 1.435" />
              <path d="M9.514 1.33337L9.68604 1.79806C9.91141 2.40739 10.0242 2.71205 10.2465 2.9343C10.4687 3.15655 10.7734 3.26929 11.3827 3.49476L11.8474 3.66671L11.3827 3.83865C10.7734 4.06413 10.4687 4.17687 10.2465 4.39911C10.0242 4.62136 9.91141 4.92603 9.68604 5.53535L9.514 6.00004L9.34207 5.53535C9.11657 4.92603 9.00386 4.62136 8.78161 4.39911C8.55936 4.17687 8.25469 4.06413 7.64536 3.83865L7.1807 3.66671L7.64536 3.49476C8.25469 3.26929 8.55936 3.15655 8.78161 2.9343C9.00386 2.71205 9.11657 2.40739 9.34207 1.79806L9.514 1.33337Z" />
              <path d="M8.51367 12.6666V13.3333C8.51367 13.9618 8.51367 14.2761 8.31841 14.4714C8.12314 14.6666 7.80888 14.6666 7.18034 14.6666C6.55181 14.6666 6.23755 14.6666 6.04228 14.4714C5.84702 14.2761 5.84702 13.9618 5.84702 13.3333V12.6666" />
            </svg>
            Verified
          </span>
        )}
        <span className="text-xs text-[#6C7080]">{notification.actor.handle}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-[#6C7080]">{notification.timestamp}</span>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8E92A0] transition-colors hover:bg-[#1A1A1A] hover:text-[#A06AFF]"
              aria-label="More options"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="3" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="13" cy="8" r="1.5" />
              </svg>
            </button>
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-[#5E5E5E] bg-[#000000] shadow-lg"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      console.log('See less');
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[#1A1A1A]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.5 7c.828 0 1.5 1.119 1.5 2.5S10.328 12 9.5 12 8 10.881 8 9.5 8.672 7 9.5 7zm5 0c.828 0 1.5 1.119 1.5 2.5s-.672 2.5-1.5 2.5S13 10.881 13 9.5 13.672 7 14.5 7zM12 22.25C6.348 22.25 1.75 17.652 1.75 12S6.348 1.75 12 1.75 22.25 6.348 22.25 12 17.652 22.25 12 22.25zm0-18.5c-4.549 0-8.25 3.701-8.25 8.25s3.701 8.25 8.25 8.25 8.25-3.701 8.25-8.25S16.549 3.75 12 3.75zM8.947 17.322l-1.896-.638C7.101 16.534 8.322 13 12 13s4.898 3.533 4.949 3.684l-1.897.633c-.031-.09-.828-2.316-3.051-2.316s-3.021 2.227-3.053 2.322z" />
                    </svg>
                    <span>Видеть реже</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onToggleRead();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-[#1A1A1A]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    <span>{isRead ? "Отметить непрочитанным" : "Отметить прочитанным"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <p className="text-[15px] text-[#E3D8FF]">{notification.message}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-[#6C7080]">
        <span>{notification.timestamp}</span>
        {notification.meta ? (
          <span className="rounded-full bg-[#1A1A1A] px-2 py-0.5 text-white/60">{notification.meta}</span>
        ) : null}
      </div>
    </div>
  </article>
  );
};

interface EmptyNotificationsStateProps {
  activeFilter: NotificationFilterId;
}

const EmptyNotificationsState: FC<EmptyNotificationsStateProps> = ({ activeFilter }) => (
  <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#5E5E5E] bg-[rgba(12,16,20,0.4)] p-10 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 5C8.13401 5 5 7.79086 5 11C5 13.3869 6.61929 15.4362 9 16.368V19L12.2795 16.7803C12.1864 16.7899 12.0934 16.8 12 16.8C15.866 16.8 19 14.0091 19 10.8C19 7.59086 15.866 5 12 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-white">Нет уведомлений</h3>
    <p className="max-w-[360px] text-sm text-[#B0B0B0]">
      {activeFilter === "mentions"
        ? "Упоминаний пока нет. Поделитесь новой идеей — и коллеги обязательно отметят вас."
        : "Вы в курсе всех событий. Новые уведомления появятся сразу после активности."}
    </p>
  </div>
);

interface NotificationBadgeProps {
  type: NotificationItem["type"];
}

const NotificationBadge: FC<NotificationBadgeProps> = ({ type }) => {
  const iconProps = {
    className: "h-5 w-5 text-white",
    viewBox: "0 0 20 20",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#0B0D12] bg-gradient-to-br from-[#A06AFF] to-[#482090] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      {type === "follow" && (
        <svg {...iconProps}>
          <path d="M10 11.6667C12.0711 11.6667 13.75 9.98774 13.75 7.91667C13.75 5.8456 12.0711 4.16667 10 4.16667C7.92893 4.16667 6.25 5.8456 6.25 7.91667C6.25 9.98774 7.92893 11.6667 10 11.6667Z" />
          <path d="M4.16699 15.8334C4.16699 13.238 6.57159 11.25 10.0003 11.25C13.429 11.25 15.8337 13.238 15.8337 15.8334" />
        </svg>
      )}
      {type === "like" && (
        <svg {...iconProps}>
          <path d="M13.8934 4.78162C15.2237 6.08398 15.2237 8.19529 13.8934 9.49765L13.2459 10.1329C13.0805 10.2952 12.9978 10.3764 12.9242 10.4686C11.9935 11.6133 10.5717 12.5 9.16432 12.5C7.75695 12.5 6.3352 11.6133 5.40448 10.4686C5.33085 10.3764 5.24822 10.2952 5.08277 10.1329L4.43536 9.49765C3.10508 8.19529 3.10508 6.08398 4.43536 4.78162C5.76564 3.47926 7.89777 3.47926 9.22806 4.78162L9.50015 5.0499L9.77224 4.78162C11.1025 3.47926 13.2346 3.47926 14.5649 4.78162" />
        </svg>
      )}
      {type === "mention" && (
        <svg {...iconProps}>
          <path d="M10 15.8333C13.2217 15.8333 15.8333 13.2217 15.8333 10C15.8333 6.77834 13.2217 4.16666 10 4.16666C6.77834 4.16666 4.16666 6.77834 4.16666 10C4.16666 13.2217 6.77834 15.8333 10 15.8333Z" />
          <path d="M10 13.3333C11.4737 13.3333 12.6667 11.994 12.6667 10.3333C12.6667 8.6727 11.4737 7.33333 10 7.33333C8.52638 7.33333 7.33334 8.6727 7.33334 10.3333C7.33334 11.994 8.52638 13.3333 10 13.3333Z" />
          <path d="M14.1667 13.3333C15 12.5 15 10.8333 15 10" />
        </svg>
      )}
      {type === "repost" && (
        <svg {...iconProps}>
          <path d="M6.66699 11.6667L3.33366 8.33337L6.66699 5.00004" />
          <path d="M3.33366 8.33337H11.667C14.0532 8.33337 16.0003 10.2805 16.0003 12.6667C16.0003 15.0529 14.0532 17 11.667 17H10.8337" />
        </svg>
      )}
    </span>
  );
};

export default SocialNotifications;
