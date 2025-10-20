import type { FC } from "react";

interface ConversationPreview {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
}

const conversations: ConversationPreview[] = [
  {
    id: "conv-01",
    name: "Quant Alliance",
    handle: "Групповой чат",
    avatar: "https://i.pravatar.cc/120?img=12",
    lastMessage: "Дружины, мы фиксируем профит по NASDAQ?",
    timestamp: "1 мин",
    unread: 12,
  },
  {
    id: "conv-02",
    name: "Мария Власова",
    handle: "@optionsmaria",
    avatar: "https://i.pravatar.cc/120?img=18",
    lastMessage: "Отправила тебе новый плейлист с опционами",
    timestamp: "9 мин",
  },
  {
    id: "conv-03",
    name: "Tyrian Research",
    handle: "@tyrianresearch",
    avatar: "https://i.pravatar.cc/120?img=56",
    lastMessage: "Посмотри график EURUSD перед CPI",
    timestamp: "32 мин",
    unread: 3,
  },
  {
    id: "conv-04",
    name: "Кирилл",
    handle: "@kirtrades",
    avatar: "https://i.pravatar.cc/120?img=45",
    lastMessage: "Буду на лайве через 15 минут",
    timestamp: "1 ч",
  },
];

const SocialMessages: FC = () => {
  return (
    <div className="flex w-full justify-center pb-12">
      <div className="grid w-full max-w-[1180px] grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="flex h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden rounded-3xl border border-widget-border bg-[rgba(12,16,20,0.6)]">
          <div className="border-b border-widget-border px-5 py-4">
            <h1 className="text-xl font-bold text-white">Сообщения</h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Поиск диалогов"
                  className="w-full rounded-full border border-widget-border bg-[rgba(12,16,20,0.6)] py-2 pl-10 pr-4 text-sm text-white placeholder:text-[#6C7080] focus:border-[#A06AFF] focus:outline-none"
                />
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C7080]"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="9" cy="9" r="5" />
                  <path d="M13 13L16 16" strokeLinecap="round" />
                </svg>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
                aria-label="Новое сообщение"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 4.16669V15.8334" />
                  <path d="M4.16602 9.99935H15.8327" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className="flex w-full items-center gap-3 border-b border-[#181B22] px-5 py-4 text-left transition hover:bg-white/5"
              >
                <div className="relative">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {conversation.unread ? (
                    <span className="absolute -bottom-1 -right-1 inline-flex min-w-[22px] items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                      {conversation.unread}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between text-sm text-white">
                    <span className="font-semibold">{conversation.name}</span>
                    <span className="text-xs text-[#6C7080]">{conversation.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6C7080]">
                    <span>{conversation.handle}</span>
                    <span className="hidden h-[2px] w-6 rounded-full bg-[#6C7080]/40 sm:block" />
                    <span className="line-clamp-1 text-[13px] text-[#B0B0B0]">
                      {conversation.lastMessage}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="hidden h-[calc(100vh-220px)] min-h-[520px] flex-col rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.6)] lg:flex">
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF]/30 to-[#482090]/30">
              <svg
                className="h-10 w-10 text-[#A06AFF]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5.75C3 4.23122 4.23122 3 5.75 3H18.25C19.7688 3 21 4.23122 21 5.75V18.25C21 19.7688 19.7688 21 18.25 21H5.75C4.23122 21 3 19.7688 3 18.25V5.75Z" />
                <path d="M3 7L11.1056 12.4037C11.6636 12.7767 12.3364 12.7767 12.8944 12.4037L21 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-white">Выберите переписку</h2>
              <p className="text-sm text-[#B0B0B0]">
                Сообщения синхронизируются между устройствами в реальном времени. Чтобы начать новый диалог, нажмите кнопку «+» слева.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white"
            >
              Создать группу трейдеров
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialMessages;
