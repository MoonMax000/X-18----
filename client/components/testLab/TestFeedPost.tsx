import { type FC, type MouseEvent, useMemo, useState } from "react";
import { DollarSign, LockKeyhole, Sparkles } from "lucide-react";

import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import UserAvatar from "@/components/ui/Avatar/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { LAB_CATEGORY_MAP } from "./categoryConfig";
import { LAB_ASSET_MAP, LAB_AUDIENCE_MAP } from "./postMetaConfig";
import type { LabPost } from "./types";

interface TestFeedPostProps {
  post: LabPost;
  onUnlock?: (postId: string) => void;
  onSubscribe?: (postId: string) => void;
  onOpen?: (postId: string) => void;
}

const TestFeedPost: FC<TestFeedPostProps> = ({ post, onUnlock, onSubscribe, onOpen }) => {
  const [isFollowing, setIsFollowing] = useState(post.author.isFollowed ?? false);

  const content = post.body ?? post.preview ?? "";
  const formattedContent = useMemo(() => content, [content]);
  const shouldShowToggle = formattedContent.length > 260 && !(post.isPremium && !post.unlocked);
  const [expanded, setExpanded] = useState(!shouldShowToggle);

  const displayedContent = useMemo(() => {
    if (post.isPremium && !post.unlocked) {
      return post.preview ?? formattedContent.slice(0, 200) + (formattedContent.length > 200 ? "…" : "");
    }

    if (expanded || !shouldShowToggle) {
      return formattedContent;
    }

    if (formattedContent.length <= 240) {
      return formattedContent;
    }

    return `${formattedContent.slice(0, 240)}${formattedContent.length > 240 ? "…" : ""}`;
  }, [expanded, formattedContent, post.isPremium, post.preview, post.unlocked, shouldShowToggle]);

  const categoryConfig = LAB_CATEGORY_MAP[post.category] ?? LAB_CATEGORY_MAP['other'];
  const CategoryIcon = categoryConfig.icon;
  const showLock = Boolean(post.isPremium && !post.unlocked);
  const audienceConfig = post.audience ? LAB_AUDIENCE_MAP[post.audience] : undefined;
  const monetizationBadgeClassName = post.isPremium
    ? showLock
      ? "bg-[#2A1C3F] text-[#CDBAFF] border border-[#A06AFF]/50"
      : "bg-[#1F1630] text-[#CDBAFF] border border-[#6F4BD3]/40"
    : "bg-[#14243A] text-[#6CA8FF] border border-[#3B82F6]/40";
  const monetizationLabel = post.isPremium ? (showLock ? "Premium · закрыто" : "Premium · открыт") : "Free доступ";

  const handleShowMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setExpanded(true);
  };

  const handleUnlock = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onUnlock?.(post.id);
  };

  const handleSubscribe = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSubscribe?.(post.id);
  };

  const likesLabel = post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes;
  const viewsLabel = typeof post.views === "number" ? (post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views) : undefined;
  const sentimentClasses =
    post.sentiment === "bullish"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : "border-rose-400/40 bg-rose-400/10 text-rose-300";

  return (
    <article
      onClick={() => onOpen?.(post.id)}
      className={cn(
        "post-hover-glow mx-auto flex w-full max-w-full flex-col gap-3 rounded-3xl border border-[#181B22] bg-background p-5 shadow-[0_24px_60px_-35px_rgba(0,0,0,0.65)] backdrop-blur-[32px] transition-colors duration-200 hover:border-[#A06AFF]/60",
        onOpen && "cursor-pointer",
      )}
    >
      {post.stickyTag ? (
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#A06AFF]">
          <span className="rounded-full border border-[#A06AFF]/40 bg-[#A06AFF]/10 px-2 py-0.5">
            {post.stickyTag}
          </span>
        </div>
      ) : null}
      <header className="flex w-full items-start justify-between gap-3">
        <UserHoverCard
          author={{ ...post.author, followers: post.author.followers, following: post.author.following }}
          isFollowing={isFollowing}
          onFollowToggle={setIsFollowing}
          showFollowButton={!post.author.isCurrentUser}
        >
          <div className="flex items-start gap-3">
            <UserAvatar src={post.author.avatar} alt={post.author.name} size={48} accent={false} />
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5 text-base font-semibold leading-tight text-white">
                <span className="hover:underline hover:underline-offset-2 transition-all">{post.author.name}</span>
                {post.author.verified ? <VerifiedBadge size={16} /> : null}
                {post.author.handle ? (
                  <span className="text-xs font-normal text-[#7C7C7C]">{post.author.handle}</span>
                ) : null}
                <span className="text-xs font-normal text-[#7C7C7C]">· {post.timestamp}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#B0B0B0]">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                    categoryConfig.badgeClassName,
                  )}
                >
                  <CategoryIcon className="h-3.5 w-3.5" />
                  {categoryConfig.label}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                    monetizationBadgeClassName,
                  )}
                >
                  {post.isPremium ? <DollarSign className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                  {monetizationLabel}
                </span>
                {audienceConfig ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em]",
                      audienceConfig.badgeClassName,
                    )}
                  >
                    <audienceConfig.icon className="h-3 w-3" />
                    {audienceConfig.label}
                  </span>
                ) : null}
                {showLock ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFA800]/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[#FFA800]">
                    <LockKeyhole className="h-3 w-3" />
                    Закрыто
                  </span>
                ) : null}
                {isFollowing ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2EBD85]/15 px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] text-[#2EBD85]">
                    Подписаны
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </UserHoverCard>
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            aria-label="More options"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#9BA0AF] transition-colors duration-200 hover:bg-[#482090]/10 hover:text-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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

      {post.assets && post.assets.length > 0 ? (
        <div className="ml-14 flex flex-wrap items-center gap-1.5 text-xs text-[#8E92A0]">
          {post.assets.map((asset) => {
            const assetConfig = LAB_ASSET_MAP[asset];
            if (!assetConfig) return null;
            const AssetIcon = assetConfig.icon;
            return (
              <Badge
                key={asset}
                variant="outline"
                className={cn(
                  "flex items-center gap-1 rounded-xl border-[#2A2F3A] bg-[#11161E] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white",
                  assetConfig.accentClassName,
                )}
              >
                <AssetIcon className="h-3 w-3" />
                {asset}
              </Badge>
            );
          })}
        </div>
      ) : null}

      {post.title ? (
        <h2 className="ml-14 text-xl font-semibold leading-snug text-white">{post.title}</h2>
      ) : null}

      <section className="ml-14 flex flex-col gap-2 text-sm leading-relaxed text-white/90">
        <p>{displayedContent}</p>
        {post.hashtags && post.hashtags.length > 0 && !showLock ? (
          <p className="text-sm leading-relaxed mt-1">
            {post.hashtags.map((tag) => (
              <span key={tag} className="text-[#4D7CFF] font-normal">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            )).reduce((prev, curr) => [prev, ' ', curr] as any)}
          </p>
        ) : null}
        {showLock ? (
          <div className="rounded-2xl border border-dashed border-[#A06AFF]/40 bg-[#A06AFF]/5 p-4 text-sm text-[#CDBAFF]">
            Этот пост доступен после оплаты. Оформите подписку или разблокируйте единично.
          </div>
        ) : null}
        {shouldShowToggle && !expanded ? (
          <button
            type="button"
            onClick={handleShowMore}
            className="w-fit text-left text-sm font-semibold text-[#4D7CFF] transition-colors hover:text-white hover:underline"
          >
            Показать больше
          </button>
        ) : null}
      </section>

      {post.mediaUrl || post.videoUrl ? (
        <div className="ml-14 overflow-hidden rounded-2xl border border-[#181B22]">
          {post.mediaUrl ? (
            <div className="relative">
              <img
                src={post.mediaUrl}
                alt=""
                className={cn(
                  "h-full w-full object-cover transition",
                  showLock ? "scale-[1.02] brightness-[0.55] blur-[2px]" : "",
                )}
              />
              {showLock ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0F16]/80 backdrop-blur-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#A06AFF] via-[#482090] to-[#111827] text-white shadow-[0_18px_40px_-20px_rgba(160,106,255,0.7)]">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                  <p className="max-w-[240px] text-center text-sm font-semibold text-white">
                    Изображение заблокировано. Откройте доступ, чтобы увидеть оригинал и разметк�� автора.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          {post.videoUrl ? (
            <div className="relative">
              <video src={post.videoUrl} className="w-full" controls={!showLock} />
              {showLock ? <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" /> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <footer className="ml-14 flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-[#6D6D6D]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7.5L10 3L17 7.5V16H3V7.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {viewsLabel ?? "—"}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 17.5L8.825 16.425C4.75 12.775 2 10.275 2 7.33333C2 4.83333 3.91667 3 6.33333 3C7.75 3 9.1 3.66667 10 4.75C10.9 3.66667 12.25 3 13.6667 3C16.0833 3 18 4.83333 18 7.33333C18 10.275 15.25 12.775 11.175 16.4333L10 17.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {likesLabel}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
                fill="currentColor"
              />
            </svg>
            {post.comments >= 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments}
          </span>
        </div>
        {showLock ? (
          <div className="flex flex-wrap items-center gap-2">
            {typeof post.price === "number" ? (
              <button
                type="button"
                onClick={handleUnlock}
                className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_10px_30px_-18px_rgba(160,106,255,0.8)]"
              >
                Разблокировать за ${post.price}
              </button>
            ) : null}
            {typeof post.subscriptionPrice === "number" ? (
              <button
                type="button"
                onClick={handleSubscribe}
                className="inline-flex items-center gap-1 rounded-full border border-[#A06AFF]/40 px-4 py-2 text-sm font-semibold text-[#A06AFF] transition hover:bg-[#A06AFF]/10"
              >
                Подписка ${post.subscriptionPrice}/мес
              </button>
            ) : null}
          </div>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] font-semibold",
              sentimentClasses,
            )}
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {post.sentiment === "bullish" ? (
                <>
                  <path
                    d="M13.3333 8.66671V5.33337H10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13.3334 5.33337L10.0001 8.66671C9.41168 9.25511 9.11755 9.54924 8.75648 9.58177C8.69675 9.58717 8.63675 9.58717 8.57702 9.58177C8.21595 9.54924 7.92181 9.25511 7.33341 8.66671C6.74501 8.07831 6.45085 7.78417 6.08979 7.75164C6.03011 7.74624 5.97005 7.74624 5.91037 7.75164C5.54931 7.78417 5.25512 8.07831 4.66675 8.66671L2.66675 10.6667"
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
                    d="M13.3334 10.6668L10.0001 7.3335C9.41168 6.7451 9.11755 6.45093 8.75648 6.41841C8.69675 6.41303 8.63675 6.41303 8.57702 6.41841C8.21595 6.45093 7.92181 6.7451 7.33341 7.3335C6.74501 7.9219 6.45085 8.21603 6.08979 8.24856C6.03011 8.25396 5.97005 8.25396 5.91037 8.24856C5.54931 8.21603 5.25512 7.9219 4.66675 7.3335L2.66675 5.3335"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
            {post.sentiment === "bullish" ? "Bullish" : "Bearish"}
          </span>
        )}
      </footer>
    </article>
  );
};

export default TestFeedPost;
