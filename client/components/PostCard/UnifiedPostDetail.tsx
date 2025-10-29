import { type FC, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Heart, Repeat2, TrendingUp, TrendingDown, DollarSign, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import VerifiedBadge from "./VerifiedBadge";
import CommentCard from "./CommentCard";
import AvatarWithHoverCard from "@/components/common/AvatarWithHoverCard";
import { getCommentsByPostId, type SocialComment } from "@/data/socialComments";
import type { SocialPost } from "@/data/socialPosts";
import type { Post } from "@/features/feed/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { customBackendAPI, type ReplyPost } from "@/services/api/custom-backend";
import { getAvatarUrl } from "@/lib/avatar-utils";
import { formatTimeAgo } from "@/lib/time-utils";
import PostMenu from "@/features/feed/components/posts/PostMenu";
import { usePostMenu } from "@/hooks/usePostMenu";
import LoginModal from "@/components/auth/LoginModal";

interface UnifiedPostDetailProps {
  post: SocialPost | Post;
}

interface ExtendedComment {
  id: string;
  postId: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified: boolean;
  };
  timestamp: string;
  text: string;
  content: string;
  likes: number;
  replyCount: number;
  replies: ExtendedComment[];
}

const UnifiedPostDetail: FC<UnifiedPostDetailProps> = ({ post }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const comments = useMemo(() => getCommentsByPostId(post.id), [post.id]);
  const hashtags = 'hashtags' in post ? (post.hashtags ?? []) : ('tags' in post ? (post.tags ?? []) : []);
  const postBody = 'body' in post ? post.body : ('text' in post ? post.text : '');
  const postTitle = 'title' in post ? post.title : ('text' in post ? post.text.split('\n')[0] : '');

  // Check if this is the current user's post
  const currentUserHandle = user ? `@${user.username}` : null;
  const isOwnPost = currentUserHandle && post.author.handle 
    ? post.author.handle.toLowerCase() === currentUserHandle.toLowerCase()
    : false;

  // PostMenu integration
  const { handleDelete, handlePin, handleReport, handleBlockAuthor } = usePostMenu({
    postId: post.id,
    authorId: post.author.handle || post.author.name,
    onSuccess: (action) => {
      console.log(`PostMenu action ${action} completed successfully`);
      // TODO: Add toast notification
      if (action === 'delete') {
        // Navigate back after delete
        navigate(-1);
      }
    },
    onError: (error) => {
      console.error('PostMenu action failed:', error);
      // TODO: Add error toast
    },
  });

  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<ExtendedComment[]>(
    comments.map(c => ({ 
      ...c, 
      text: c.content, 
      replyCount: c.replies || 0, 
      replies: [],
      author: {
        name: c.author.name,
        handle: c.author.handle || `@${c.author.name.toLowerCase()}`,
        avatar: c.author.avatar,
        verified: c.author.verified ?? false,
      }
    }))
  );
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX_COMMENT_LENGTH = 500;
  const [isLiked, setIsLiked] = useState('isLiked' in post ? post.isLiked : false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<'comment' | 'like' | 'bookmark'>('comment');

  // Build comment hierarchy from flat list
  const buildCommentHierarchy = (flatComments: ExtendedComment[], postId: string): ExtendedComment[] => {
    const commentMap = new Map<string, ExtendedComment>();
    const rootComments: ExtendedComment[] = [];

    // Create map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build hierarchy
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      // Find what this comment is replying to
      const replyToPost = flatComments.find(c => c.id === comment.id);
      const parentId = replyToPost?.postId;

      if (parentId && parentId !== postId) {
        // This is a reply to another comment
        const parent = commentMap.get(parentId);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        } else {
          // Parent not found, treat as root
          rootComments.push(commentWithReplies);
        }
      } else {
        // This is a direct reply to the post
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  // Load real comments from API on mount
  useEffect(() => {
    const loadComments = async () => {
      try {
        setIsLoadingComments(true);
        const replies = await customBackendAPI.getPostReplies(post.id);
        const flatComments: ExtendedComment[] = replies.map(reply => ({
          id: reply.id,
          postId: reply.reply_to_id || post.id,
          author: {
            name: reply.user?.display_name || reply.user?.username || 'Unknown',
            handle: `@${reply.user?.username || 'unknown'}`,
            avatar: getAvatarUrl(reply.user),
            verified: reply.user?.verified || false,
          },
          timestamp: reply.created_at,
          text: reply.content,
          content: reply.content,
          likes: reply.likes_count || 0,
          replyCount: reply.replies_count || 0,
          replies: [],
        }));
        
        // Build hierarchy: comments that reply directly to post are roots,
        // comments that reply to other comments are nested
        const rootComments = flatComments.filter(c => c.postId === post.id);
        const nestedComments = flatComments.filter(c => c.postId !== post.id);
        
        // Build tree
        const buildTree = (comments: ExtendedComment[]): ExtendedComment[] => {
          return comments.map(comment => {
            const children = nestedComments.filter(c => c.postId === comment.id);
            return {
              ...comment,
              replies: children.length > 0 ? buildTree(children) : []
            };
          });
        };
        
        setLocalComments(buildTree(rootComments));
      } catch (error) {
        console.error('Failed to load comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [post.id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      // Create comment via API
      await customBackendAPI.createPost({
        content: commentText.trim(),
        reply_to_id: post.id,
      });

      // Reload comments from server and rebuild hierarchy
      const replies = await customBackendAPI.getPostReplies(post.id);
      const flatComments: ExtendedComment[] = replies.map(reply => ({
        id: reply.id,
        postId: reply.reply_to_id || post.id,
        author: {
          name: reply.user?.display_name || reply.user?.username || 'Unknown',
          handle: `@${reply.user?.username || 'unknown'}`,
          avatar: getAvatarUrl(reply.user),
          verified: reply.user?.verified || false,
        },
        timestamp: reply.created_at,
        text: reply.content,
        content: reply.content,
        likes: reply.likes_count || 0,
        replyCount: reply.replies_count || 0,
        replies: [],
      }));
      
      // Build hierarchy
      const rootComments = flatComments.filter(c => c.postId === post.id);
      const nestedComments = flatComments.filter(c => c.postId !== post.id);
      
      const buildTree = (comments: ExtendedComment[]): ExtendedComment[] => {
        return comments.map(comment => {
          const children = nestedComments.filter(c => c.postId === comment.id);
          return {
            ...comment,
            replies: children.length > 0 ? buildTree(children) : []
          };
        });
      };
      
      setLocalComments(buildTree(rootComments));
      
      setCommentText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      setLoginAction('like');
      setShowLoginModal(true);
      return;
    }

    const previousState = isLiked;
    const previousCount = likes;
    
    // Optimistic update
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    
    try {
      if (isLiked) {
        await customBackendAPI.unlikePost(post.id);
      } else {
        await customBackendAPI.likePost(post.id);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousState);
      setLikes(previousCount);
      console.error('Failed to toggle like:', error);
    }
  };

  const handleBookmark = () => {
    if (!user) {
      setLoginAction('bookmark');
      setShowLoginModal(true);
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentFocus = () => {
    if (!user) {
      setLoginAction('comment');
      setShowLoginModal(true);
    }
  };

  const handleProfileClick = () => {
    const username = post.author.handle?.replace('@', '') || post.author.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/profile/${username}`);
  };

  return (
    <article className="mx-auto flex w-full sm:max-w-[680px] flex-col gap-4 sm:gap-6 bg-black p-4 sm:p-6 text-white">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AvatarWithHoverCard
            author={{
              ...post.author,
              handle: post.author.handle || `@${post.author.name.toLowerCase()}`,
              followers: post.author.followers ?? 0,
              following: post.author.following ?? 0,
            }}
            isFollowing={'isFollowing' in post ? post.isFollowing : false}
          >
            <div className="cursor-pointer" onClick={handleProfileClick}>
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={getAvatarUrl(post.author)} alt={post.author.name} />
                <AvatarFallback className="text-sm font-semibold text-white">
                  {post.author.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </AvatarWithHoverCard>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span 
                className="hover:underline hover:underline-offset-2 cursor-pointer"
                onClick={handleProfileClick}
              >
                {post.author.name}
              </span>
              {post.author.verified && <VerifiedBadge size={18} />}
            </div>
            {post.author.handle ? (
              <div className="text-sm text-[#8B98A5]">{post.author.handle}</div>
            ) : null}

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {/* Sentiment Badge */}
              {'sentiment' in post && post.sentiment && (
                <span
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: post.sentiment === "bullish" ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)" }}
                >
                  {post.sentiment === "bullish" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {post.sentiment === "bullish" ? "Bullish" : "Bearish"}
                </span>
              )}

              {/* Market Badge */}
              {'market' in post && post.market && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(59, 130, 246)" }}
                >
                  {post.market}
                </span>
              )}

              {/* Category Badge */}
              {'category' in post && post.category && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(168, 85, 247)" }}
                >
                  {post.category}
                </span>
              )}

              {/* Timeframe Badge */}
              {'timeframe' in post && post.timeframe && (
                <span 
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs"
                  style={{ backgroundColor: "rgb(6, 182, 212)" }}
                >
                  {post.timeframe}
                </span>
              )}

              {/* Risk Badge */}
              {'risk' in post && post.risk && (
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

              {/* Access Level Badges */}
              {'accessLevel' in post && post.accessLevel && post.accessLevel !== "public" ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#1F1630] text-[#CDBAFF] border border-[#6F4BD3]/40">
                  <DollarSign className="h-3 w-3" />
                  Premium
                </span>
              ) : (!('accessLevel' in post) || !post.accessLevel || post.accessLevel === "public") ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.12em] bg-[#14243A] text-[#6CA8FF] border border-[#3B82F6]/40">
                  <Sparkles className="h-3 w-3" />
                  FREE
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <PostMenu
          isOwnPost={isOwnPost}
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

      <div className="space-y-4">
        {'title' in post && <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>}
        {postBody ? (
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#E7E9EA]">
            {postBody}
          </p>
        ) : null}
        {hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {hashtags.map((tag) => (
              <span key={tag} className="text-[#4D7CFF] hover:underline cursor-pointer">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        ) : null}
        {/* Code Blocks */}
        {'codeBlocks' in post && post.codeBlocks && post.codeBlocks.length > 0 && (
          <div className="flex flex-col gap-3">
            {post.codeBlocks.map((cb: any, idx: number) => (
              <div key={idx} className="rounded-2xl bg-gradient-to-br from-[#0A0D12] to-[#1B1A2E] border border-[#6B46C1]/20 overflow-hidden shadow-lg hover:border-[#6B46C1]/40 transition-all w-full max-w-full">
                <div className="flex items-center justify-between border-b border-[#6B46C1]/20 bg-gradient-to-r from-[#1B1A2E] to-[#0A0D12] px-4 py-2">
                  <span className="text-xs font-bold text-[#B299CC] uppercase tracking-wider">{cb.language}</span>
                </div>
                <pre className="p-4 text-sm leading-relaxed font-mono bg-[#05030A] w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] overflow-x-hidden" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>
                  <code className="block text-[#D4B5FD] whitespace-pre-wrap break-words" style={{ overflowWrap: 'anywhere', wordBreak: 'break-all' }}>{cb.code}</code>
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media from array (new format) */}
      {'media' in post && post.media && post.media.length > 0 ? (
        <div className="grid gap-2 grid-cols-1">
          {post.media.slice(0, 4).map((mediaItem: any, index: number) => (
            <div key={mediaItem.id || index} className="overflow-hidden rounded-2xl border border-[#181B22]">
              {mediaItem.type === 'image' || mediaItem.type === 'gif' ? (
                <img
                  src={mediaItem.url.startsWith('http') ? mediaItem.url : `http://localhost:8080${mediaItem.url}`}
                  alt={mediaItem.alt_text || ''}
                  className="w-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', mediaItem.url);
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23181B22" width="400" height="300"/%3E%3Ctext fill="%236D6D6D" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : mediaItem.type === 'video' ? (
                <video
                  src={mediaItem.url.startsWith('http') ? mediaItem.url : `http://localhost:8080${mediaItem.url}`}
                  controls
                  className="w-full"
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : post.mediaUrl ? (
        /* Legacy single media URL */
        <div className="overflow-hidden rounded-2xl border border-widget-border">
          <img
            src={post.mediaUrl}
            alt={'title' in post ? post.title : 'Post image'}
            className="w-full object-cover"
          />
        </div>
      ) : null}

      {'videoUrl' in post && post.videoUrl ? (
        <div className="overflow-hidden rounded-2xl border border-widget-border">
          <video
            src={post.videoUrl}
            controls
            className="w-full"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 text-sm text-[#8B98A5] border-b border-widget-border pb-4">
        <div>{formatTimeAgo(post.timestamp)}</div>
      </div>

      <div className="flex items-center justify-around border-b border-widget-border pb-4">
        <button
          type="button"
          className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#4D7CFF]"
          aria-label="Comment"
        >
          <MessageCircle className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" />
          <span className="text-sm">{localComments.length || post.comments || 0}</span>
        </button>
        
        <button
          type="button"
          className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#00BA7C]"
          aria-label="Repost"
        >
          <Repeat2 className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5" />
          <span className="text-sm">0</span>
        </button>
        
        <button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? "text-[#F91880]" : "text-[#8B98A5] hover:text-[#F91880]"
          }`}
          aria-label="Like"
        >
          <Heart className={`w-[15px] h-[15px] sm:w-[17px] sm:h-[17px] md:w-5 md:h-5 ${isLiked ? "fill-current" : ""}`} />
          <span className="text-sm">{likes >= 1000 ? `${(likes / 1000).toFixed(1)}K` : likes}</span>
        </button>

        <div className="flex items-center gap-2 text-[#8B98A5] transition-colors hover:text-[#4D7CFF]" aria-label="Views">
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
          {typeof post.views === "number" ? (
            <span className="text-sm">{post.views >= 1000 ? `${(post.views / 1000).toFixed(1)}K` : post.views}</span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleBookmark}
          className={`flex items-center gap-2 transition-colors ${
            isBookmarked ? "text-[#A06AFF]" : "text-[#8B98A5] hover:text-[#A06AFF]"
          }`}
          aria-label="Bookmark"
        >
          <svg
            className="h-[18px] w-[18px]"
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

      {user ? (
        <div className="rounded-2xl border border-widget-border bg-[#0A0A0A] p-3 transition-all duration-300 hover:border-[#B87AFF] hover:shadow-[0_0_20px_rgba(184,122,255,0.25)]">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={getAvatarUrl(user)} 
                alt={user?.display_name || user?.username || "You"} 
              />
              <AvatarFallback className="text-sm font-semibold text-white">
                {user?.display_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'Y'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= MAX_COMMENT_LENGTH) {
                    setCommentText(newValue);
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                  }
                }}
                placeholder="Post your reply..."
                className="w-full resize-none bg-transparent text-sm text-white placeholder:text-[#8B98A5] focus:outline-none min-h-[32px] max-h-[200px] overflow-y-auto"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs transition-colors ${
                  commentText.length > MAX_COMMENT_LENGTH * 0.9
                    ? 'text-[#F91880]'
                    : 'text-[#6C7080]'
                }`}>
                  {commentText.length}/{MAX_COMMENT_LENGTH}
                </span>
                <button
                  type="button"
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="rounded-2xl border border-widget-border bg-[#0A0A0A] p-3 transition-all duration-300 hover:border-[#B87AFF] hover:shadow-[0_0_20px_rgba(184,122,255,0.25)] cursor-pointer"
          onClick={handleCommentFocus}
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] animate-pulse" />
            <div className="flex-1">
              <div className="w-full resize-none bg-transparent text-sm text-[#8B98A5] placeholder:text-[#8B98A5] focus:outline-none min-h-[32px] flex items-center">
                Sign in to post your reply...
              </div>
            </div>
          </div>
        </div>
      )}

      {localComments.length > 0 ? (
        <section className="flex flex-col border-t border-widget-border pt-4">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Comments ({localComments.length})
          </h3>
          <div className="flex flex-col">
            {localComments.map((comment, index) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                depth={0}
                isFirst={index === 0}
                onReply={async (commentId, text) => {
                  if (!text.trim()) return;

                  try {
                    // Создаем reply на комментарий (вложенный ответ)
                    await customBackendAPI.createPost({
                      content: text.trim(),
                      reply_to_id: commentId, // Отвечаем на комментарий, а не на пост
                    });

                    // Перезагружаем все комментарии с бэкенда и перестраиваем иерархию
                    const replies = await customBackendAPI.getPostReplies(post.id);
                    const reloadedComments: ExtendedComment[] = replies.map(reply => ({
                      id: reply.id,
                      postId: reply.reply_to_id || post.id,
                      author: {
                        name: reply.user?.display_name || reply.user?.username || 'Unknown',
                        handle: `@${reply.user?.username || 'unknown'}`,
                        avatar: getAvatarUrl(reply.user),
                        verified: reply.user?.verified || false,
                      },
                      timestamp: reply.created_at,
                      text: reply.content,
                      content: reply.content,
                      likes: reply.likes_count || 0,
                      replyCount: reply.replies_count || 0,
                      replies: [],
                    }));
                    
                    // Build hierarchy
                    const rootComments = reloadedComments.filter(c => c.postId === post.id);
                    const nestedComments = reloadedComments.filter(c => c.postId !== post.id);
                    
                    const buildTree = (comments: ExtendedComment[]): ExtendedComment[] => {
                      return comments.map(comment => {
                        const children = nestedComments.filter(c => c.postId === comment.id);
                        return {
                          ...comment,
                          replies: children.length > 0 ? buildTree(children) : []
                        };
                      });
                    };
                    
                    setLocalComments(buildTree(rootComments));
                  } catch (error) {
                    console.error('Failed to post reply:', error);
                  }
                }}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center border-t border-widget-border py-12 text-center text-[#8B98A5]">
          <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No comments yet</p>
          <p className="mt-2 text-xs">Be the first to comment on this post</p>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        initialScreen="login"
      />
    </article>
  );
};

export default UnifiedPostDetail;
