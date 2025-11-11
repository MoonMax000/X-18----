import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, DollarSign, Sparkles, Newspaper, GraduationCap, BarChart3, Brain, Code2, Video, MessageCircle } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { isPostLocked, normalizeAccessLevel } from "@/lib/access-level-utils";
import VerifiedBadge from "@/components/PostCard/VerifiedBadge";
import UserHoverCard from "@/components/PostCard/UserHoverCard";
import { formatTimeAgo } from "@/lib/time-utils";
import LockedPostPlaceholder from "./LockedPostPlaceholder";
import PostMenu from "./PostMenu";
import VideoPlayer from "./VideoPlayer";
import { DocumentPreview } from "@/components/CreatePostBox/DocumentPreview";
import { PaymentModal } from "@/components/monetization/PaymentModal";
import { FollowModal } from "@/components/monetization/FollowModal";
import type { Post } from "../../types";
import { customBackendAPI } from "@/services/api/custom-backend";
import { useAuth } from "@/contexts/AuthContext";
import { usePostMenu } from "@/hooks/usePostMenu";
import { useLikeStore } from "@/store/useLikeStore";

// Category configuration with icons and colors (same as in ComposerMetadata)
const categoryConfig = {
  'Signal': { icon: TrendingUp, color: '#2EBD85' },
  'News': { icon: Newspaper, color: '#4D7CFF' },
  'Education': { icon: GraduationCap, color: '#F78DA7' },
  'Analysis': { icon: BarChart3, color: '#A06AFF' },
  'Macro': { icon: Brain, color: '#FFD166' },
  'Code': { icon: Code2, color: '#64B5F6' },
  'Video': { icon: Video, color: '#FF8A65' },
  'General': { icon: MessageCircle, color: '#9CA3AF' },
};

interface FeedPostProps {
  post: Post;
  isFollowing: boolean;
  onFollowToggle: (handle: string, isFollowing: boolean) => void;
  showTopBorder?: boolean;
}

export default function FeedPost({ post, isFollowing, onFollowToggle, showTopBorder = false }: FeedPostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isSignal = post.type === "signal";
  
  // Payment & Follow modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [paymentType, setPaymentType] = useState<"unlock" | "subscribe">("unlock");
  const [localPost, setLocalPost] = useState(post);
  
  // Use global like store
  const { getLikeState, initializeLike, toggleLike } = useLikeStore();
  const likeState = getLikeState(post.id);
  const isLiked = likeState?.isLiked ?? (post.isLiked || false);
  const likesCount = likeState?.likesCount ?? post.likes;
  
  // Initialize like state on mount
  useEffect(() => {
    initializeLike(post.id, post.isLiked || false, post.likes);
  }, [post.id, post.isLiked, post.likes, initializeLike]);

  // Check if this is the current user's post
  const currentUserHandle = user ? `@${user.username}` : null;
  const isOwnPost = currentUserHandle && post.author.handle 
    ? post.author.handle.toLowerCase() === currentUserHandle.toLowerCase()
    : false;

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // DEBUG: Log post access control info
  React.useEffect(() => {
    console.log('[FeedPost DEBUG] Post access control:', {
      postId: post.id,
      accessLevel: post.accessLevel,
      priceCents: post.priceCents,
      postPrice: post.postPrice,
      isPurchased: post.isPurchased,
      isSubscriber: post.isSubscriber,
      isFollower: post.isFollower,
      isOwnPost,
      currentUserHandle,
      authorHandle: post.author.handle,
      subscriptionPrice: post.author.subscriptionPrice,
    });
  }, [post.id, post.accessLevel, post.isPurchased, post.isSubscriber, isOwnPost]);

  // PostMenu integration
  const { handleDelete, handlePin, handleReport, handleBlockAuthor } = usePostMenu({
    postId: post.id,
    authorId: post.author.handle || post.author.name,
    onSuccess: (action) => {
      console.log(`PostMenu action ${action} completed successfully`);
      // TODO: Add toast notification
      // TODO: Refresh data if needed
    },
    onError: (error) => {
      console.error('PostMenu action failed:', error);
      // TODO: Add error toast
    },
  });

  // Используем утилиту для определения блокировки с нормализацией значений
  const isLocked = isPostLocked({
    accessLevel: localPost.accessLevel,
    isPurchased: localPost.isPurchased,
    isSubscriber: localPost.isSubscriber,
    isFollower: localPost.isFollower,
    isOwnPost
  });
  
  // DEBUG: Log lock calculation
  React.useEffect(() => {
    const normalized = normalizeAccessLevel(localPost.accessLevel);
    console.log('[FeedPost DEBUG] Lock calculation (with normalization):', {
      postId: localPost.id,
      accessLevel: localPost.accessLevel,
      normalizedAccessLevel: normalized,
      isPurchased: localPost.isPurchased,
      isSubscriber: localPost.isSubscriber,
      isFollower: localPost.isFollower,
      isOwnPost,
      isLocked,
    });
  }, [localPost.id, localPost.accessLevel, localPost.isPurchased, localPost.isSubscriber, localPost.isFollower, isOwnPost, isLocked]);

  // Update local post when prop changes
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // Payment handlers
  const handleUnlock = () => {
    setPaymentType("unlock");
    setShowPaymentModal(true);
  };

  const handleSubscribe = () => {
    setPaymentType("subscribe");
    setShowPaymentModal(true);
  };

  const handleFollow = () => {
    setShowFollowModal(true);
  };

  const handlePaymentSuccess = () => {
    // Update local post state after successful payment
    if (paymentType === "unlock") {
      setLocalPost({ ...localPost, isPurchased: true });
    } else {
      setLocalPost({ ...localPost, isSubscriber: true });
    }
    setShowPaymentModal(false);
  };

  const handleFollowSuccess = () => {
    // Update follow state
    onFollowToggle(localPost.author.handle, true);
    setShowFollowModal(false);
  };

  // Text truncation logic
  const TEXT_PREVIEW_LENGTH = 300;
  const shouldTruncate = post.text.length > TEXT_PREVIEW_LENGTH;
  const displayText = !isExpanded && shouldTruncate
    ? post.text.slice(0, TEXT_PREVIEW_LENGTH) + "..."
    : post.text;

  const handlePostClick = () => {
    navigate(`/home/post/${post.id}`, { state: post });
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const username = post.author.handle?.replace('@', '') || post.author.name.replace(/\s+/g, '-').toLowerCase();
    navigate(`/social/profile/${username}`);
  };

  const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      await toggleLike(post.id);
    } catch (error) {
      // Error already handled in store with rollback
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const previousState = isBookmarked;
    
    // Optimistic update
    setIsBookmarked(!isBookmarked);
    
    try {
      if (isBookmarked) {
        await customBackendAPI.unbookmarkPost(post.id);
      } else {
        await customBackendAPI.bookmarkPost(post.id);
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(previousState);
      console.error('Failed to toggle bookmark:', error);
    }
  };

  return (
    <>
    <article
      onClick={handlePostClick}
      className={cn(
        "flex w-full flex-col gap-3 sm:gap-4 md:gap-6 bg-black p-2.5 sm:p-3 md:p-6 backdrop-blur-[50px] transition-colors duration-200 relative cursor-pointer hover:bg-white/[0.02] min-w-0 overflow-x-hidden",
        showTopBorder && "before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#181B22] before:to-transparent"
      )}
      style={{
        borderBottom: "1px solid transparent",
        backgroundImage: `linear-gradient(to right, transparent 0%, #181B22 20%, #181B22 80%, transparent 100%)`,
        backgroundPosition: "0 100%",
        backgroundSize: "100% 1px",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Header */}
      <header className="flex w-full items-start justify-between gap-2 sm:gap-3 md:gap-4">
        <UserHoverCard
          author={{
            ...post.author,
            followers: post.author.followers ?? 0,
            following: post.author.following ?? 0,
            isCurrentUser: isOwnPost,
          }}
          isFollowing={isFollowing}
          onFollowToggle={(nextState) => onFollowToggle(post.author.handle, nextState)}
        >
          <div className="flex flex-1 items-start gap-2 sm:gap-2.5 md:gap-3">
          <div onClick={handleProfileClick} className="cursor-pointer">
            <Avatar className="flex-shrink-0 h-11 w-11 sm:w-12 sm:h-12">
              <AvatarImage src={getAvatarUrl({ avatar_url: post.author.avatar, username: post.author.handle, display_name: post.author.name })} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-1 flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5 text-[15px] sm:text-base md:text-[15px] font-bold md:font-semibold leading-tight text-white">
              <span onClick={handleProfileClick} className="truncate cursor-pointer hover:underline">{post.author.name}</span>
              {post.author.verified && <VerifiedBadge size={16} />}
              <span onClick={handleProfileClick} className="hidden md:inline text-xs font-normal text-[#7C7C7C] cursor-pointer hover:underline">{post.author.handle}</span>
              <svg className="hidden md:inline w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                <circle cx="2" cy="2" r="1.5" />
              </svg>
              <span className="hidden md:inline text-xs font-normal text-[#7C7C7C]">{formatTimeAgo(post.created_at)}</span>
            </div>
            <div className="flex md:hidden items-center gap-1 sm:gap-1.5 text-[13px] sm:text-sm font-normal text-[#7C7C7C] mt-0.5">
              <span onClick={handleProfileClick} className="cursor-pointer hover:underline">{post.author.handle}</span>
              <svg className="w-1 h-1 fill-[#7C7C7C]" viewBox="0 0 4 4">
                <circle cx="2" cy="2" r="1.5" />
              </svg>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>

            {/* Category Badges */}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {/* Market Badge */}
              {post.market && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(59, 130, 246)" }}
                >
                  {post.market}
                </span>
              )}

              {/* Symbol Badge */}
              {'ticker' in post && post.ticker && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(16, 185, 129)" }}
                >
                  {post.ticker}
                </span>
              )}

              {/* Category Badge with icon */}
              {post.category && (() => {
                const config = categoryConfig[post.category as keyof typeof categoryConfig];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <span 
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {post.category}
                  </span>
                );
              })()}

              {/* Timeframe Badge */}
              {post.timeframe && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(6, 182, 212)" }}
                >
                  {post.timeframe}
                </span>
              )}

              {/* Risk Badge */}
              {post.risk && (
                <span
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ 
                    backgroundColor: post.risk === "low" 
                      ? "rgb(34, 197, 94)" 
                      : post.risk === "medium" 
                      ? "rgb(234, 179, 8)" 
                      : "rgb(239, 68, 68)" 
                  }}
                >
                  Risk: {post.risk}
                </span>
              )}

              {/* Premium Badge */}
              {isLocked && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#2A1C3F] text-[#CDBAFF] border border-[#A06AFF]/50">
                  <DollarSign className="h-3 w-3" />
                  Premium · закрыто
                </span>
              )}
              {post.accessLevel && post.accessLevel !== "public" && !isLocked && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#1F1630] text-[#CDBAFF] border border-[#6F4BD3]/40">
                  <DollarSign className="h-3 w-3" />
                  Premium · открыт
                </span>
              )}
              {!post.accessLevel || post.accessLevel === "public" ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#14243A] text-[#6CA8FF] border border-[#3B82F6]/40">
                  <Sparkles className="h-3 w-3" />
                  FREE
                </span>
              ) : null}
            </div>
          </div>
          </div>
        </UserHoverCard>
        <PostMenu
          isOwnPost={isOwnPost}
          isAdmin={isAdmin}
          postId={post.id}
          onDelete={handleDelete}
          onCopyLink={() => {
            const postUrl = `${window.location.origin}/home/post/${post.id}`;
            navigator.clipboard.writeText(postUrl);
            console.log("Link copied to clipboard!");
            // TODO: Add toast notification
          }}
          onPin={handlePin}
          onReport={() => {
            const reason = prompt("Укажите причину жалобы:");
            if (reason && reason.trim()) {
              handleReport(reason.trim());
            }
          }}
          onBlockAuthor={handleBlockAuthor}
        />
      </header>

      {/* Content Section */}
      <section className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 ml-[48px] sm:ml-[52px] md:ml-[56px] pr-[40px] sm:pr-[44px] md:pr-[48px] min-w-0 overflow-x-hidden">
        <div>
          <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere text-[14px] sm:text-[15px] md:text-[16px] leading-[1.6] sm:leading-relaxed text-white max-w-full">
            {displayText}
          </p>
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 text-[14px] sm:text-[15px] font-medium text-[#A06AFF] transition-colors duration-200 hover:text-white hover:underline focus:outline-none"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[#4D7CFF] font-normal text-[14px] sm:text-[15px]">
                {tag}
              </span>
            ))}
          </div>
        )}
        {/* Code Blocks */}
        {post.codeBlocks && post.codeBlocks.length > 0 && (() => {
          console.log('[FeedPost] Rendering code blocks:', {
            postId: post.id,
            count: post.codeBlocks.length,
            codeBlocks: post.codeBlocks,
          });
          return (
            <div className="flex flex-col gap-3 mt-2">
              {post.codeBlocks.map((cb, idx) => (
              <div key={idx} className="post-code rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all w-full max-w-full min-w-0">
                <div className="flex items-center justify-between border-b border-[#6B46C1]/20 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] px-4 py-2">
                  <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider truncate">{cb.language}</span>
                </div>
                <pre className="p-4 text-sm leading-relaxed font-mono bg-[#05030A] overflow-x-auto max-w-full">
                  <code className="text-[#D4B5FD] whitespace-pre-wrap break-words">{cb.code}</code>
                </pre>
              </div>
              ))}
            </div>
          );
        })()}
      </section>

      {/* Signal-specific info */}
      {isSignal && !isLocked && (
        <section className="ml-[48px] sm:ml-[52px] md:ml-[56px] pr-[40px] sm:pr-[44px] md:pr-[48px]">
          {post.accuracy && (
            <div className="mb-3 text-[14px] sm:text-[15px] md:text-[16px] text-[#C5C9D3]">
              <span className="font-semibold text-green-400">Accuracy {post.accuracy}%</span>
              <span className="text-[#6C7280]"> · </span>
              <span className="text-[#6C7280]">{post.sampleSize} signals / 90d</span>
            </div>
          )}
          {post.entry && (
            <div className="flex gap-4 text-[14px] sm:text-[15px] md:text-[16px]">
              <div>
                <div className="text-xs text-[#6C7280]">Entry</div>
                <div className="font-semibold text-white">{post.entry}</div>
              </div>
              <div>
                <div className="text-xs text-[#6C7280]">Stop</div>
                <div className="font-semibold text-red-400">{post.stopLoss}</div>
              </div>
              <div>
                <div className="text-xs text-[#6C7280]">TP</div>
                <div className="font-semibold text-green-400">{post.takeProfit}</div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Gated/Locked Content - Only show this for locked posts */}
      {isLocked ? (
        <section className="ml-[48px] sm:ml-[52px] md:ml-[56px] pr-[40px] sm:pr-[44px] md:pr-[48px]">
          <LockedPostPlaceholder
            accessLevel={localPost.accessLevel!}
            postId={localPost.id}
            authorId={localPost.author.handle}
            postPrice={localPost.postPrice}
            subscriptionPrice={localPost.author.subscriptionPrice}
            authorName={localPost.author.name}
            previewImageUrl={localPost.media?.[0]?.url || localPost.mediaUrl}
            isPurchased={localPost.isPurchased}
            isSubscriber={localPost.isSubscriber}
            isOwnPost={isOwnPost}
            onUnlock={handleUnlock}
            onSubscribe={handleSubscribe}
            onFollow={handleFollow}
          />
        </section>
      ) : (
        /* Media - Only show for unlocked posts */
        ((post.media && post.media.length > 0) || post.mediaUrl) && (
          <section className="ml-[48px] sm:ml-[52px] md:ml-[56px] pr-[40px] sm:pr-[44px] md:pr-[48px]">
            {post.media && post.media.length > 0 ? (
              (() => {
                // Разделяем медиа на документы и другие типы
                const documents = post.media.filter(item => item.type === 'document');
                const nonDocuments = post.media.filter(item => item.type !== 'document');
                
                return (
                  <>
                    {/* Отображаем документы */}
                    {documents.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {documents.map((doc, index) => (
                          <DocumentPreview
                            key={doc.id || `doc-${index}`}
                            document={{
                              id: doc.id,
                              url: doc.url.startsWith('http') ? doc.url : `http://localhost:8080${doc.url}`,
                              type: 'document' as const,
                              fileName: doc.file_name || 'Document',
                              fileSize: doc.size_bytes || 0,
                              fileExtension: doc.file_extension || 'txt',
                            }}
                            readOnly={true}
                            onDownload={(e?: React.MouseEvent) => {
                              if (e) {
                                e.stopPropagation();
                                e.preventDefault();
                              }
                              const link = document.createElement('a');
                              link.href = doc.url.startsWith('http') ? doc.url : `http://localhost:8080${doc.url}`;
                              link.download = doc.file_name || 'download';
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Отображаем изображения и видео */}
                    {nonDocuments.length > 0 && (
                      <div className="grid gap-2 grid-cols-1">
                        {nonDocuments.slice(0, 4).map((mediaItem, index) => (
                          <div key={mediaItem.id || index} className="overflow-hidden rounded-2xl border border-[#181B22]">
                            {mediaItem.type === 'image' || mediaItem.type === 'gif' ? (
                              <img
                                src={mediaItem.url.startsWith('http') ? mediaItem.url : `http://localhost:8080${mediaItem.url}`}
                                alt={mediaItem.alt_text || ''}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  console.error('Image load error:', mediaItem.url);
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23181B22" width="400" height="300"/%3E%3Ctext fill="%236D6D6D" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : mediaItem.type === 'video' ? (
                              <VideoPlayer
                                src={mediaItem.url.startsWith('http') ? mediaItem.url : `http://localhost:8080${mediaItem.url}`}
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            ) : post.mediaUrl ? (
              /* Legacy single media URL */
              <div className="overflow-hidden rounded-2xl border border-[#181B22]">
                <img
                  src={post.mediaUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
          </section>
        )
      )}

      {/* Footer with engagement metrics */}
      <footer className="relative flex w-full items-center pt-1.5 sm:pt-2 md:pt-3">
        <div className="flex w-[2.75rem] sm:w-12" aria-hidden="true" />
        <div className="flex flex-1 items-center justify-between pr-2 sm:pr-3 md:pr-4 text-[11px] sm:text-xs md:text-sm font-normal text-[#6D6D6D]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePostClick();
            }}
            className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
          >
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M1.94043 9.84328C1.94043 5.61993 5.36497 2.19922 9.58927 2.19922H13.761C18.0512 2.19922 21.5283 5.67727 21.5283 9.96749C21.5283 12.7958 19.9928 15.3948 17.519 16.7612L9.82337 21.0227V17.4969H9.75935C5.46912 17.5924 1.94043 14.1431 1.94043 9.84328ZM9.58927 4.11023C6.41985 4.11023 3.85144 6.68055 3.85144 9.84328C3.85144 13.0633 6.4982 15.6528 9.71635 15.5859L10.0517 15.5763H11.7344V17.774L16.595 15.089C18.4592 14.0571 19.6173 12.0983 19.6173 9.96749C19.6173 6.72832 16.9954 4.11023 13.761 4.11023H9.58927Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(post.comments)}</span>
            <span className="md:hidden">{formatNumber(post.comments)}</span>
          </button>

          <button
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#00BA7C]"
          >
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.70502 3.99561L8.93983 7.95141L7.63652 9.34645L5.66053 7.50232V15.5764C5.66053 16.6274 6.51667 17.4874 7.57155 17.4874H12.8268V19.3984H7.57155C5.46083 19.3984 3.74952 17.688 3.74952 15.5764V7.50232L1.77353 9.34645L0.470215 7.95141L4.70502 3.99561ZM16.1711 6.02128H10.9158V4.11027H16.1711C18.2818 4.11027 19.9931 5.82062 19.9931 7.9323V16.0063L21.9691 14.1622L23.2724 15.5572L19.0376 19.513L14.8028 15.5572L16.1061 14.1622L18.0821 16.0063V7.9323C18.0821 6.88124 17.226 6.02128 16.1711 6.02128Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(post.reposts)}</span>
            <span className="md:hidden">{formatNumber(post.reposts)}</span>
          </button>

          <button
            onClick={handleLikeToggle}
            className={cn(
              "relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors",
              isLiked ? "text-[#F91880]" : "hover:text-[#F91880]"
            )}
          >
            <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"}>
              <path
                d="M16.498 5.54308C15.3303 5.48575 13.9382 6.03039 12.7811 7.60698L12.0119 8.64848L11.2417 7.60698C10.0837 6.03039 8.69053 5.48575 7.5229 5.54308C6.3352 5.60997 5.27841 6.28838 4.74237 7.3681C4.21493 8.43827 4.13753 10.0244 5.20006 11.9736C6.22627 13.856 8.31214 16.0537 12.0119 18.2895C15.7097 16.0537 17.7946 13.856 18.8208 11.9736C19.8824 10.0244 19.805 8.43827 19.2766 7.3681C18.7406 6.28838 17.6847 5.60997 16.498 5.54308ZM20.4987 12.8909C19.2078 15.2606 16.6757 17.7831 12.4925 20.2197L12.0119 20.5063L11.5303 20.2197C7.34613 17.7831 4.81403 15.2606 3.52123 12.8909C2.22174 10.5022 2.17397 8.24717 3.0301 6.5177C3.87764 4.80734 5.55933 3.73717 7.42639 3.64162C9.00393 3.55562 10.6445 4.1767 12.0109 5.56219C13.3763 4.1767 15.0169 3.55562 16.5935 3.64162C18.4606 3.73717 20.1423 4.80734 20.9898 6.5177C21.846 8.24717 21.7982 10.5022 20.4987 12.8909Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden md:inline">{formatNumber(likesCount)}</span>
            <span className="md:hidden">{formatNumber(likesCount)}</span>
          </button>

          {typeof post.views === "number" && (
            <button
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 flex items-center gap-1 sm:gap-1.5 md:gap-2 transition-colors hover:text-[#4D7CFF]"
            >
              <svg className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9.04257 20.3539V3.15479H10.9536V20.3539H9.04257ZM17.881 20.3539V8.41008H19.792V20.3539H17.881ZM4.50391 20.3539L4.50773 10.7988H6.41874L6.41492 20.3539H4.50391ZM13.3404 20.3539V13.6654H15.2515V20.3539H13.3404Z"
                  fill="currentColor"
                />
              </svg>
              <span className="hidden md:inline">{formatNumber(post.views)}</span>
              <span className="md:hidden">{formatNumber(post.views)}</span>
            </button>
          )}

          <button
            onClick={handleBookmarkToggle}
            className={cn(
              "relative z-10 flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-200 hover:bg-[#482090]/10",
              isBookmarked ? "text-[#A06AFF]" : "text-[#6D6D6D] hover:text-[#A06AFF]"
            )}
          >
            <svg
              className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px] md:w-[18px] md:h-[18px]"
              viewBox="0 0 20 20"
              fill={isBookmarked ? "currentColor" : "none"}
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

    {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        type={paymentType}
        amount={paymentType === "unlock" ? (localPost.postPrice || 9) : (localPost.author.subscriptionPrice || 29)}
        postId={paymentType === "unlock" ? localPost.id : undefined}
        authorId={paymentType === "subscribe" ? localPost.author.handle : undefined}
        authorName={localPost.author.name}
        plan="monthly"
        onSuccess={handlePaymentSuccess}
      />

      {/* Follow Modal */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        authorId={localPost.author.handle}
        authorName={localPost.author.name}
        authorHandle={localPost.author.handle?.replace('@', '')}
        authorAvatar={localPost.author.avatar}
        postId={localPost.id}
        onSuccess={handleFollowSuccess}
      />
    </>
  );
}
