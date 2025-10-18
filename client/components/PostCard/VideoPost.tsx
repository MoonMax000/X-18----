import { type FC, type MouseEvent, useMemo, useState } from "react";

import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import { cn } from "@/lib/utils";

import VerifiedBadge from "./VerifiedBadge";
import UserHoverCard from "./UserHoverCard";
import { PostBadges } from "./PostBadges";

export interface FeedPostProps {
  author: {
    name: string;
    avatar: string;
    handle?: string;
    verified?: boolean;
    bio?: string;
    followers?: number;
    following?: number;
    isCurrentUser?: boolean;
  };
  timestamp: string;
  title: string;
  content?: string;
  mediaUrl?: string | null;
  videoUrl?: string | null;
  sentiment?: "bullish" | "bearish";
  likes?: number;
  comments?: number;
  views?: number;
  isFollowing?: boolean;
  hashtags?: string[];
  category?: string;
  type?: "video" | "article" | "signal" | "news" | "education" | "analysis" | "code" | string;
  price?: "free" | "pay-per-post" | "subscribers-only";
  isPaidLocked?: boolean;
  truncate?: boolean;
  onOpen?: () => void;
  className?: string;
}

const FeedPost: FC<FeedPostProps> = ({
  author,
  timestamp,
  title,
  content,
  mediaUrl,
  sentiment = "bullish",
  likes = 0,
  comments = 0,
  views,
  isFollowing: initialFollowing,
  hashtags,
  category,
  type = "article",
  price = "free",
  isPaidLocked = false,
  truncate = false,
  onOpen,
  className,
}) => {
  const [expanded, setExpanded] = useState(!truncate);
  const [isFollowing, setIsFollowing] = useState(initialFollowing ?? false);

  const formattedContent = useMemo(() => content ?? "", [content]);
  const shouldShowToggle =
    truncate && !expanded && formattedContent.length > 260;
  const showFollowButton = !author.isCurrentUser;

  const displayedContent = useMemo(() => {
    if (expanded || !truncate) {
      return formattedContent;
    }

    if (formattedContent.length <= 240) {
      return formattedContent;
    }

    return `${formattedContent.slice(0, 240)}${formattedContent.length > 240 ? "…" : ""}`;
  }, [expanded, formattedContent, truncate]);

  const handleShowMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setExpanded(true);
  };

  const handleMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const sentimentClasses =
    sentiment === "bullish"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : "border-rose-400/40 bg-rose-400/10 text-rose-300";

  const categoryLabel = category ?? (type === "video" ? "Video" : undefined);
  const hasMedia = Boolean(mediaUrl);
  const isVideo = type === "video" && hasMedia;
  const likesLabel = likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes;

  return (
    <article
      onClick={onOpen}
      className={cn(
        "mx-auto flex w-full max-w-full sm:max-w-[680px] flex-col gap-3 sm:gap-4 md:gap-6 rounded-xl sm:rounded-2xl md:rounded-3xl border border-[#181B22] bg-black p-2.5 sm:p-3 md:p-6 backdrop-blur-[50px] transition-colors duration-200 hover:border-[#A06AFF]/60 hover:bg-[#482090]/10",
        onOpen && "cursor-pointer",
        className,
      )}
    >
      <header className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
        <UserHoverCard
          author={author}
          isFollowing={isFollowing}
          onFollowToggle={(nextState) => setIsFollowing(nextState)}
          showFollowButton={showFollowButton}
        >
          <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3">
            <UserAvatar
              src={author.avatar}
              alt={author.name}
              size={44}
              accent={false}
              containerClassName="flex-shrink-0 sm:w-12 sm:h-12"
            />
            <div className="flex flex-1 flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 text-[15px] sm:text-base md:text-[15px] font-bold md:font-semibold leading-tight text-white">
                <span className="truncate">{author.name}</span>
                {author.verified ? <VerifiedBadge size={17} /> : null}
                <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">
                  {author.handle || ''}
                </span>
                {author.handle && (
                  <>
                    <svg className="hidden md:inline w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                      <circle cx="2" cy="2" r="1.5" />
                    </svg>
                    <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">
                      {timestamp}
                    </span>
                  </>
                )}
              </div>
              <div className="flex md:hidden items-center gap-1 sm:gap-1.5 text-[13px] sm:text-sm font-normal text-[#7C7C7C] mt-0.5">
                <span>{author.handle || ''}</span>
                <svg className="w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                  <circle cx="2" cy="2" r="1.5" />
                </svg>
                <span>{timestamp}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B0B0B0]">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                    sentimentClasses,
                  )}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {sentiment === "bullish" ? (
                      <>
                        <path
                          d="M13.3333 8.66659V5.33325H10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.3334 5.33325L10 8.66659C9.41162 9.25499 9.11749 9.54912 8.75642 9.58165C8.69669 9.58705 8.63669 9.58705 8.57695 9.58165C8.21589 9.54912 7.92175 9.25499 7.33335 8.66659C6.74495 8.07819 6.45079 7.78405 6.08973 7.75152C6.03005 7.74612 5.96999 7.74612 5.91031 7.75152C5.54925 7.78405 5.25506 8.07819 4.66669 8.66659L2.66669 10.6666"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M13.3333 7.3335V10.6668H10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M13.3334 10.6668L10 7.3335C9.41162 6.7451 9.11749 6.45093 8.75642 6.41841C8.69669 6.41303 8.63669 6.41303 8.57695 6.41841C8.21589 6.45093 7.92175 6.7451 7.33335 7.3335C6.74495 7.9219 6.45079 8.21603 6.08973 8.24856C6.03005 8.25396 5.96999 8.25396 5.91031 8.24856C5.54925 8.21603 5.25506 7.9219 4.66669 7.3335L2.66669 5.3335"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                  {sentiment === "bullish" ? "Bullish" : "Bearish"}
                </span>
                {categoryLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#482090] to-[#A06AFF] px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-white shadow-[0_12px_28px_-20px_rgba(160,106,255,0.75)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M1.33301 7.33366C1.33301 5.13377 1.33301 4.03383 2.01643 3.35041C2.69984 2.66699 3.79979 2.66699 5.99967 2.66699H6.66634C8.86621 2.66699 9.96614 2.66699 10.6496 3.35041C11.333 4.03383 11.333 5.13377 11.333 7.33366V8.66699C11.333 10.8669 11.333 11.9668 10.6496 12.6503C9.96614 13.3337 8.86621 13.3337 6.66634 13.3337H5.99967C3.79979 13.3337 2.69984 13.3337 2.01643 12.6503C1.33301 11.9668 1.33301 10.8669 1.33301 8.66699V7.33366Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M11.333 5.93691L11.4169 5.86765C12.8275 4.70383 13.5327 4.12192 14.0995 4.40289C14.6663 4.68386 14.6663 5.61538 14.6663 7.47841V8.52094C14.6663 10.384 14.6663 11.3155 14.0995 11.5965C13.5327 11.8774 12.8275 11.2955 11.4169 10.1317L11.333 10.0624"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7.66699 7.33301C8.21928 7.33301 8.66699 6.88529 8.66699 6.33301C8.66699 5.78072 8.21928 5.33301 7.66699 5.33301C7.11471 5.33301 6.66699 5.78072 6.66699 6.33301C6.66699 6.88529 7.11471 7.33301 7.66699 7.33301Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                    {categoryLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </UserHoverCard>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={handleMenuClick}
            aria-label="More options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="-rotate-90 h-4 w-4"
            >
              <path
                d="M8.00004 8.66675C8.17685 8.66675 8.34642 8.59651 8.47145 8.47149C8.59647 8.34646 8.66671 8.17689 8.66671 8.00008C8.66671 7.82327 8.59647 7.6537 8.47145 7.52868C8.34642 7.40365 8.17685 7.33341 8.00004 7.33341C7.82323 7.33341 7.65366 7.40365 7.52864 7.52868C7.40361 7.6537 7.33337 7.82327 7.33337 8.00008C7.33337 8.17689 7.40361 8.34646 7.52864 8.47149C7.65366 8.59651 7.82323 8.66675 8.00004 8.66675Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.6667 8.66675C12.8435 8.66675 13.013 8.59651 13.1381 8.47149C13.2631 8.34646 13.3333 8.17689 13.3333 8.00008C13.3333 7.82327 13.2631 7.6537 13.1381 7.52868C13.013 7.40365 12.8435 7.33341 12.6667 7.33341C12.4899 7.33341 12.3203 7.40365 12.1953 7.52868C12.0702 7.6537 12 7.82327 12 8.00008C12 8.17689 12.0702 8.34646 12.1953 8.47149C12.3203 8.59651 12.4899 8.66675 12.6667 8.66675Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.33329 8.66675C3.5101 8.66675 3.67967 8.59651 3.8047 8.47149C3.92972 8.34646 3.99996 8.17689 3.99996 8.00008C3.99996 7.82327 3.92972 7.6537 3.8047 7.52868C3.67967 7.40365 3.5101 7.33341 3.33329 7.33341C3.15648 7.33341 2.98691 7.40365 2.86189 7.52868C2.73686 7.6537 2.66663 7.82327 2.66663 8.00008C2.66663 8.17689 2.73686 8.34646 2.86189 8.47149C2.98691 8.59651 3.15648 8.66675 3.33329 8.66675Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px]">
        {title && (
          <h2 className="hidden md:block text-xl md:text-2xl font-bold leading-snug text-white">
            {title}
          </h2>
        )}
        {displayedContent ? (
          <p className="whitespace-pre-line text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white">
            {displayedContent}
            {hashtags && hashtags.length > 0 ? (
              <>
                {' '}
                {hashtags.map((tag) => (
                  <span key={tag} className="text-[#4D7CFF] font-normal">
                    #{tag}
                  </span>
                )).reduce((prev, curr) => [prev, ' ', curr] as any)}
              </>
            ) : null}
          </p>
        ) : null}
        {shouldShowToggle ? (
          <button
            type="button"
            onClick={handleShowMore}
            className="w-fit text-left text-[15px] font-semibold text-[#4D7CFF] transition-colors hover:text-white hover:underline"
          >
            Show more
          </button>
        ) : null}
      </section>

      {hasMedia ? (
        <div className="relative w-full ml-[48px] sm:ml-[52px] md:ml-[56px] max-w-[calc(100%_-_48px)] sm:max-w-[calc(100%_-_52px)] md:max-w-[calc(100%_-_56px)] rounded-xl sm:rounded-xl md:rounded-2xl overflow-hidden border border-[#6D6D6D]/20">
          <img src={mediaUrl ?? ""} alt="" className="w-full object-cover aspect-[16/10] sm:aspect-video md:aspect-auto" />
          {isVideo ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white shadow-[0_12px_24px_0_rgba(0,0,0,0.48)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 25 25"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="md:w-6 md:h-6"
                >
                  <path
                    d="M4.5 12.5004V8.94038C4.5 4.52038 7.63 2.71039 11.46 4.92039L14.55 6.70039L17.64 8.48039C21.47 10.6904 21.47 14.3104 17.64 16.5204L14.55 18.3004L11.46 20.0804C7.63 22.2904 4.5 20.4804 4.5 16.0604V12.5004Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <footer className="relative flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
        <span
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 rounded-full bg-[#181B22]/70"
          aria-hidden="true"
        />
        <div className="flex w-[2.75rem] sm:w-12" aria-hidden="true" />
        <div className="flex flex-1 items-center justify-between pr-2 sm:pr-3 md:pr-4 text-[11px] sm:text-xs md:text-sm font-normal text-[#6D6D6D]">
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
            aria-label="Comments"
          >
            <svg
              className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.94043 9.84328C1.94043 5.61993 5.36497 2.19922 9.58927 2.19922H13.761C18.0512 2.19922 21.5283 5.67727 21.5283 9.96749C21.5283 12.7958 19.9928 15.3948 17.519 16.7612L9.82337 21.0227V17.4969H9.75935C5.46912 17.5924 1.94043 14.1431 1.94043 9.84328ZM9.58927 4.11023C6.41985 4.11023 3.85144 6.68055 3.85144 9.84328C3.85144 13.0633 6.4982 15.6528 9.71635 15.5859L10.0517 15.5763H11.7344V17.774L16.595 15.089C18.4592 14.0571 19.6173 12.0983 19.6173 9.96749C19.6173 6.72832 16.9954 4.11023 13.761 4.11023H9.58927Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{comments >= 1000 ? `${(comments / 1000).toFixed(1)}K` : comments}</span>
            <span className="md:hidden">{comments >= 1000 ? `${(comments / 1000).toFixed(1)}k` : comments}</span>
          </button>

          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#00BA7C]"
            aria-label="Retweet"
          >
            <svg
              className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{likes >= 10000 ? `${(likes / 1000).toFixed(1)}K` : likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : Math.floor(likes / 1000 * 11.2)}</span>
            <span className="md:hidden">11.2k</span>
          </button>

          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#F91880]"
            aria-label="Like"
          >
            <svg
              className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{likesLabel}</span>
            <span className="md:hidden">36.3k</span>
          </button>

          {typeof views === "number" ? (
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
              aria-label="Views"
            >
              <svg
                className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden md:inline">{views >= 1000 ? `${(views / 1000).toFixed(1)}K` : views}</span>
              <span className="md:hidden">97.4k</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            aria-label="Save"
            className="relative z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[#9BA0AF] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white"
          >
            <svg
              className="w-[14px] h-[14px] sm:w-[15px] sm:h-[15px]"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.33301 14.9838V8.08945C3.33301 5.06164 3.33301 3.54774 4.30932 2.60712C5.28563 1.6665 6.85697 1.6665 9.99967 1.6665C13.1423 1.6665 14.7138 1.6665 15.69 2.60712C16.6663 3.54774 16.6663 5.06164 16.6663 8.08945V14.9838C16.6663 16.9054 16.6663 17.8662 16.0223 18.2101C14.7751 18.876 12.4357 16.6542 11.3247 15.9852C10.6803 15.5972 10.3582 15.4032 9.99967 15.4032C9.64117 15.4032 9.31901 15.5972 8.67467 15.9852C7.56367 16.6542 5.22423 18.876 3.97705 18.2101C3.33301 17.8662 3.33301 16.9054 3.33301 14.9838Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </footer>
    </article>
  );
};

export default FeedPost;
