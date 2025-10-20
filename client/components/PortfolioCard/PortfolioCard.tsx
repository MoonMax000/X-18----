import { FC, useMemo, useState } from "react";

import { useToast } from "@/hooks/use-toast";

interface LiveStream {
  id: string;
  title: string;
  thumbnail: string;
  viewers?: number;
  isLive?: boolean;
}

interface ScheduledStream {
  id: string;
  title: string;
  thumbnail: string;
}

interface PortfolioCardProps {
  title?: string;
  liveStreams?: LiveStream[];
  comingUpStreams?: ScheduledStream[];
  archivedStreams?: ScheduledStream[];
}

type TabId = "live" | "chats" | "groups";

const PortfolioCard: FC<PortfolioCardProps> = ({
  title = "Jane's Activity",
  liveStreams = [
    {
      id: "1",
      title: "Investing in a new Solana solutions for the market",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/dbbd62b80e49836f6450b147295360f9250a7666?width=744",
      viewers: 345,
      isLive: true,
    },
  ],
  comingUpStreams = [
    {
      id: "1",
      title: "Profit Potential - Deep Dive!",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/006e9797db01c840c8cbe514616d9d83c627a4d1?width=168",
    },
  ],
  archivedStreams = [
    {
      id: "1",
      title: "Instant Trades: Masterclass on Forex",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/e1bec4bad2ac9d7ed565fa25667f2a51deae4d6a?width=168",
    },
    {
      id: "2",
      title: "Bitcoin & Ethereum Market Analysis",
      thumbnail:
        "https://api.builder.io/api/v1/image/assets/TEMP/67dada7740037fe3a61dfd94adab83a7097c5803?width=168",
    },
  ],
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const { toast } = useToast();

  const tabs = useMemo(
    () => [
      { id: "live" as const, label: "Live Streams" },
      { id: "chats" as const, label: "Chats" },
      { id: "groups" as const, label: "Groups" },
    ],
    [],
  );

  const handleShowAll = () => {
    toast({
      title: "Opening full activity feed",
      description: "We will redirect you once the hub is ready.",
    });
  };

  const handleStreamClick = (streamTitle: string) => {
    toast({
      title: streamTitle,
      description: "Stream details will be available soon.",
    });
  };

  const renderComingSoon = (
    headline: string,
    description: string,
    actionLabel: string,
  ) => (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] p-6 text-center backdrop-blur-[50px]">
      <h4 className="text-lg font-bold text-white">{headline}</h4>
      <p className="text-sm text-[#B0B0B0]">{description}</p>
      <button
        type="button"
        onClick={() =>
          toast({
            title: `${headline} reminders enabled`,
            description: "We will notify you as soon as it launches.",
          })
        }
        className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
      >
        {actionLabel}
      </button>
    </div>
  );

  return (
    <div className="flex w-full flex-col items-center gap-3 self-stretch rounded-3xl border border-[rgba(40,44,52,1)] bg-[rgba(12,16,20,0.50)] p-4 backdrop-blur-[50px]">
      <div className="flex items-baseline self-stretch pb-2">
        <div className="flex-1 text-2xl font-bold leading-normal text-white">
          {title}
        </div>
        <button
          type="button"
          onClick={handleShowAll}
          className="group inline-flex items-center gap-2 rounded-full border border-transparent bg-[#A06AFF]/10 px-3 py-1.5 text-[15px] font-semibold leading-normal text-[#E3D8FF] transition-all duration-200 hover:border-[#A06AFF] hover:bg-[#A06AFF]/20 hover:text-white hover:shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A06AFF]/50 focus-visible:ring-offset-0"
        >
          Show all
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF]/60 to-[#482090]/60 text-white transition-all duration-200 group-hover:from-[#A06AFF] group-hover:to-[#482090]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path
                d="M10.7402 15.53L14.2602 12L10.7402 8.46997"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3 self-stretch">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex h-10 items-center justify-center rounded-[32px] px-4 py-3 text-[15px] font-bold transition ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_8px_20px_-8px_rgba(160,106,255,0.7)]"
                : "border border-[rgba(24,27,34,0.95)] bg-[rgba(12,16,20,0.50)] text-white/80 hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.8)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "live" && (
        <>
          <div className="flex flex-col items-start gap-4 self-stretch pt-3">
            <div className="flex h-5 items-center gap-2 self-stretch">
              <div className="flex flex-1 flex-col justify-center self-stretch text-[19px] font-bold leading-normal text-white">
                Live Now
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 self-stretch">
              {liveStreams.map((stream) => (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => handleStreamClick(stream.title)}
                  className="flex flex-col items-start gap-2.5 rounded-3xl border border-transparent p-1 text-left transition hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.65)]"
                >
                  <div className="relative w-full max-w-[372px] overflow-hidden rounded-lg">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="h-auto w-full rounded-lg transition-transform duration-300 hover:scale-[1.02]"
                      style={{ aspectRatio: "372/209" }}
                    />
                    {stream.isLive && (
                      <div className="absolute left-3 top-3 flex items-center justify-center gap-1 rounded bg-[#EF454A] px-2 py-0.5 text-xs font-bold uppercase text-white">
                        LIVE
                      </div>
                    )}
                    {stream.viewers && (
                      <div className="absolute bottom-3 left-3 flex items-center justify-center gap-1 rounded bg-[#23252D] px-2 py-0.5 text-xs font-bold uppercase text-white">
                        {stream.viewers} viewers
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-stretch px-1">
                    <div className="flex-1 text-[19px] font-bold leading-normal text-white">
                      {stream.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {comingUpStreams.length > 0 && (
            <div className="flex flex-col items-start gap-4 self-stretch border-t border-[rgba(24,27,34,0.95)] pt-3">
              <div className="flex h-5 items-center gap-2 self-stretch">
                <div className="flex flex-1 flex-col justify-center self-stretch text-[19px] font-bold leading-normal text-white">
                  Coming Up
                </div>
              </div>
              {comingUpStreams.map((stream) => (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => handleStreamClick(stream.title)}
                  className="flex items-center gap-2 self-stretch rounded-2xl border border-transparent px-1 py-1 transition hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.65)]"
                >
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="h-11 w-[84px] rounded-lg"
                    style={{ aspectRatio: "21/11" }}
                  />
                  <div className="flex flex-1 flex-col items-start gap-0.5 self-stretch text-left text-[15px] font-bold leading-normal text-white">
                    {stream.title}
                  </div>
                </button>
              ))}
            </div>
          )}

          {archivedStreams.length > 0 && (
            <div className="flex flex-col items-start gap-4 self-stretch border-t border-[rgba(24,27,34,0.95)] pt-3">
              <div className="flex h-5 items-center gap-2 self-stretch">
                <div className="flex flex-1 flex-col justify-center self-stretch text-[19px] font-bold leading-normal text-white">
                  Archived
                </div>
              </div>
              {archivedStreams.map((stream) => (
                <button
                  key={stream.id}
                  type="button"
                  onClick={() => handleStreamClick(stream.title)}
                  className="flex items-center gap-2 self-stretch rounded-2xl border border-transparent px-1 py-1 transition hover:border-[#2F3240] hover:bg-[rgba(18,22,28,0.65)]"
                >
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="h-11 w-[84px] rounded-lg"
                    style={{ aspectRatio: "21/11" }}
                  />
                  <div className="flex flex-1 flex-col items-start gap-0.5 self-stretch text-left text-[15px] font-bold leading-normal text-[#B0B0B0]">
                    {stream.title}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "chats" &&
        renderComingSoon(
          "Chat with Jane",
          "Private chat sessions are launching soon. Follow Jane to be first in line.",
          "Notify me",
        )}

      {activeTab === "groups" &&
        renderComingSoon(
          "Community Groups",
          "Exclusive market groups are being curated. We will invite you when they open.",
          "Join waitlist",
        )}
    </div>
  );
};

export default PortfolioCard;
