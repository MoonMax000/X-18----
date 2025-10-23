import type { FC } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Repeat2, MessageCircle, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import FollowRecommendationsWidget from "@/components/SocialFeedWidgets/FollowRecommendationsWidget";
import { DEFAULT_SUGGESTED_PROFILES } from "@/components/SocialFeedWidgets/sidebarData";

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
        <FollowRecommendationsWidget title="Who to follow" profiles={DEFAULT_SUGGESTED_PROFILES} />
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
    <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-[#1A1A1A]">
      <img
        src={notification.actor.avatar}
        alt={notification.actor.name}
        className="h-12 w-12 rounded-full object-cover"
      />
    </div>
    <div className="grid grid-cols-[1fr_auto] gap-2 text-sm text-white">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-[15px]">
          <NotificationIcon type={notification.type} />
          <span className="font-semibold">{notification.actor.name}</span>
          {notification.actor.verified && <VerifiedBadge size={16} />}
          <span className="text-xs text-[#6C7080]">{notification.actor.handle}</span>
        </div>
        <p className="mt-2 text-[15px] text-[#E3D8FF]">{notification.message}</p>
      </div>
      <div className="flex flex-col items-end gap-1 pt-0.5">
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
              </div>
            </>
          )}
        </div>
        <span className="text-xs text-[#6C7080] whitespace-nowrap">{notification.timestamp}</span>
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
        : "Вы в курсе всех событий. Новые уведомления появятся сразу после активн��сти."}
    </p>
  </div>
);

interface NotificationIconProps {
  type: NotificationItem["type"];
}

const NotificationIcon: FC<NotificationIconProps> = ({ type }) => {
  const iconClass = "h-4 w-4 text-[#A06AFF]";

  return (
    <>
      {type === "follow" && <UserPlus className={iconClass} />}
      {type === "like" && <Heart className={iconClass} />}
      {type === "mention" && <MessageCircle className={iconClass} />}
      {type === "repost" && <Repeat2 className={iconClass} />}
    </>
  );
};

export default SocialNotifications;
