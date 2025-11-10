import { FC, useState, memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, BarChart3, Trash2, Eye, Heart, MessageCircle, Plus, LayoutList, LayoutGrid, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BUTTON_VARIANTS } from "@/features/feed/styles";
import { LAB_CATEGORY_CONFIG, type LabCategory, LAB_CATEGORY_MAP } from "@/components/testLab/categoryConfig";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPosts } from "@/hooks/useUserPosts";
import type { Post as ApiPost } from "@/services/api/custom-backend";
import { formatTimeAgo } from "@/lib/time-utils";

type PostStatus = "published" | "draft";
type PostType = "all" | "premium" | "free";
type DateSort = "newest" | "oldest";
type ViewMode = "list" | "cards";

interface Post {
  id: string;
  title: string;
  text: string;
  thumbnail?: string;
  date: string;
  status: PostStatus;
  category: LabCategory;
  isPremium: boolean;
  views: number;
  likes: number;
  comments: number;
  tags?: string[];
}

// Convert API post to UI post format
function convertApiPostToUiPost(apiPost: ApiPost): Post {
  // Extract category and ensure it's valid
  const metadataCategory = apiPost.metadata?.category as LabCategory | undefined;
  const category: LabCategory = metadataCategory && LAB_CATEGORY_MAP[metadataCategory] 
    ? metadataCategory 
    : "text";
  
  console.log('[MyPosts] Converting post:', {
    postId: apiPost.id,
    rawCategory: metadataCategory,
    finalCategory: category,
    categoryExists: !!LAB_CATEGORY_MAP[category],
    metadata: apiPost.metadata,
  });
  
  const isPremium = apiPost.metadata?.is_premium === true || apiPost.metadata?.is_premium === "true";
  
  // Extract first media as thumbnail
  const thumbnail = apiPost.media?.[0]?.url;
  
  // Extract title from content (first line or truncated content)
  const lines = apiPost.content.split('\n');
  const title = lines[0].length > 100 ? lines[0].substring(0, 100) + '...' : lines[0];
  const text = lines.length > 1 ? lines.slice(1).join('\n') : apiPost.content;
  
  return {
    id: apiPost.id,
    title: title || "Untitled Post",
    text: text || apiPost.content,
    thumbnail,
    date: formatTimeAgo(apiPost.created_at),
    status: "published" as PostStatus, // API only returns published posts
    category,
    isPremium,
    views: 0, // Not available from API yet
    likes: apiPost.likes_count || 0,
    comments: apiPost.replies_count || 0,
    tags: apiPost.metadata?.tags as string[] | undefined,
  };
}

const MyPosts: FC = () => {
  const { user } = useAuth();
  const { posts: apiPosts, isLoading, error } = useUserPosts(user?.id);
  
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [typeFilter, setTypeFilter] = useState<PostType>("all");
  const [dateSort, setDateSort] = useState<DateSort>("newest");
  const [categoryFilter, setCategoryFilter] = useState<"all" | LabCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatNumber = (num: number) => (num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num);

  // Handle delete post
  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    try {
      const { customBackendAPI } = await import('@/services/api/custom-backend');
      await customBackendAPI.deletePost(postToDelete.id);
      
      // Refresh posts after deletion
      window.location.reload(); // Simple solution, можно улучшить через refetch
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Не удалось удалить пост. Попробуйте еще раз.');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setPostToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  // Convert API posts to UI format
  const allPosts = useMemo(() => {
    console.log('[MyPosts] Converting API posts:', {
      count: apiPosts.length,
      userId: user?.id,
      username: user?.username,
    });
    return apiPosts.map(convertApiPostToUiPost);
  }, [apiPosts, user?.id, user?.username]);

  // Apply filters
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.text.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    // Type filter
    if (typeFilter === "premium") {
      filtered = filtered.filter((post) => post.isPremium);
    } else if (typeFilter === "free") {
      filtered = filtered.filter((post) => !post.isPremium);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((post) => post.category === categoryFilter);
    }

    // Date sort
    // Note: Since we already get posts sorted by date from API, we just reverse if needed
    if (dateSort === "oldest") {
      filtered = filtered.reverse();
    }

    return filtered;
  }, [allPosts, searchQuery, statusFilter, typeFilter, categoryFilter, dateSort]);

  const statusOptions = [
    { value: "all" as const, label: "All" },
    { value: "published" as const, label: "Published" },
    { value: "draft" as const, label: "Draft" },
  ];

  const typeOptions = [
    { value: "all" as const, label: "Все" },
    { value: "premium" as const, label: "Премиум" },
    { value: "free" as const, label: "Бесплатные" },
  ];

  const dateOptions = [
    { value: "newest" as const, label: "Сначала новые" },
    { value: "oldest" as const, label: "Сначала старые" },
  ];

  const categoryOptions = [
    { value: "all" as const, label: "Все" },
    ...LAB_CATEGORY_CONFIG.map((cat) => ({
      value: cat.value,
      label: cat.label,
    })),
  ];

  // Loading state
  if (isLoading && allPosts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1059px] flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-[#6C7280]">Загрузка постов...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-[1059px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#181B22] bg-black p-12 backdrop-blur-[50px]">
        <div className="rounded-full bg-red-500/10 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white">Ошибка загрузки постов</h3>
        <p className="text-center text-sm text-[#6C7280]">{error}</p>
      </div>
    );
  }

  // Empty state
  if (allPosts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[1059px] flex-col items-center justify-center gap-4 rounded-3xl border border-[#181B22] bg-black p-12 backdrop-blur-[50px]">
        <div className="rounded-full bg-primary/10 p-4">
          <MessageCircle className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-white">У вас пока нет постов</h3>
        <p className="text-center text-sm text-[#6C7280]">
          Создайте свой первый пост на странице ленты, и он появится здесь
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1059px] flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#181B22] bg-black p-6 backdrop-blur-[50px]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-white">My Posts</h2>
            <p className="text-sm text-[#6C7280]">Manage your content</p>
          </div>
          <button className={cn(BUTTON_VARIANTS.primary, "flex items-center gap-2 px-4 py-2.5 text-sm")}>
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex flex-1 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 py-2.5 transition-colors focus-within:border-[#A06AFF]/50">
              <Search className="h-4 w-4 text-[#6C7280]" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-[#6C7280] focus:outline-none"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Status:</span>
                  {statusOptions.find((o) => o.value === statusFilter)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[180px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        statusFilter === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {statusFilter === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Тип:</span>
                  {typeOptions.find((o) => o.value === typeFilter)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[180px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTypeFilter(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        typeFilter === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {typeFilter === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Дата:</span>
                  {dateOptions.find((o) => o.value === dateSort)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[200px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {dateOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDateSort(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        dateSort === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {dateSort === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#181B22] bg-black px-4 text-sm font-semibold text-white transition-colors hover:border-[#A06AFF]/50">
                  <span className="text-[#6C7280]">Category:</span>
                  {categoryOptions.find((o) => o.value === categoryFilter)?.label}
                  <ChevronDown className="h-4 w-4 text-[#6C7280]" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[180px] rounded-2xl border border-[#181B22] bg-[#0F131A]/95 p-2 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-col gap-1">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCategoryFilter(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        categoryFilter === option.value ? "bg-[#A06AFF]/20 text-white" : "text-[#B0B0B0] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {option.label}
                      {categoryFilter === option.value && <div className="h-1.5 w-1.5 rounded-full bg-[#A06AFF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1 rounded-full border border-[#181B22] bg-black p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "list" ? "bg-[#A06AFF] text-white" : "text-[#6C7280] hover:text-white"
                )}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={cn(
                  "rounded-full p-2 transition-colors",
                  viewMode === "cards" ? "bg-[#A06AFF] text-white" : "text-[#6C7280] hover:text-white"
                )}
                title="Cards view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#181B22] bg-black p-12 backdrop-blur-[50px]">
          <Search className="h-8 w-8 text-[#6C7280]" />
          <p className="text-sm text-[#6C7280]">Посты не найдены с выбранными фильтрами</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="flex flex-col divide-y divide-[#181B22]">
          {filteredPosts.map((post) => {
            const categoryConfig = LAB_CATEGORY_MAP[post.category];
            if (!categoryConfig) {
              console.error('[MyPosts] Invalid category for post:', {
                postId: post.id,
                category: post.category,
                availableCategories: Object.keys(LAB_CATEGORY_MAP),
              });
              return null;
            }
            const CategoryIcon = categoryConfig.icon;
            return (
              <article
                key={post.id}
                className="group flex items-center gap-4 bg-black px-6 py-4 transition-colors hover:bg-white/[0.02]"
              >
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="h-14 w-20 flex-shrink-0 rounded-xl border border-[#181B22] object-cover" />
                )}
                {!post.thumbnail && <div className="h-14 w-20 flex-shrink-0 rounded-xl border border-[#181B22] bg-[#0A0D12]" />}

                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-bold text-white">{post.title}</h3>
                      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold", categoryConfig.badgeClassName)}>
                        <CategoryIcon className="h-3 w-3" />
                        {categoryConfig.label}
                      </span>
                      {post.isPremium && (
                        <span className="rounded bg-[#A06AFF]/20 px-1.5 py-0.5 text-xs font-bold text-[#A06AFF]">
                          Premium
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-bold",
                          post.status === "published" ? "bg-[#1C3430] text-[#2EBD85]" : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                        )}
                      >
                        {post.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6C7280]">
                      <span>{post.date}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.views) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.likes) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.comments) : "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="rounded-lg p-2 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white" title="Analytics">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(post)}
                      className="rounded-lg p-2 text-[#6C7280] transition-colors hover:bg-red-500/10 hover:text-red-400" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => {
            const categoryConfig = LAB_CATEGORY_MAP[post.category];
            if (!categoryConfig) {
              console.error('[MyPosts] Invalid category for post:', {
                postId: post.id,
                category: post.category,
                availableCategories: Object.keys(LAB_CATEGORY_MAP),
              });
              return null;
            }
            const CategoryIcon = categoryConfig.icon;
            return (
              <article
                key={post.id}
                className="group flex flex-col gap-3 rounded-2xl border border-[#181B22] bg-black p-4 transition-colors hover:border-[#A06AFF]/30 hover:bg-white/[0.02]"
              >
                {post.thumbnail && (
                  <img src={post.thumbnail} alt="" className="h-32 w-full rounded-2xl border border-[#181B22] object-cover" />
                )}
                {!post.thumbnail && <div className="h-32 w-full rounded-2xl border border-[#181B22] bg-[#0A0D12]" />}

                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 flex-1 text-sm font-bold text-white">{post.title}</h3>
                    <div className="flex items-center gap-1">
                      <button className="rounded-lg p-1.5 text-[#6C7280] transition-colors hover:bg-white/5 hover:text-white" title="Analytics">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(post)}
                        className="rounded-lg p-1.5 text-[#6C7280] transition-colors hover:bg-red-500/10 hover:text-red-400" 
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-bold", categoryConfig.badgeClassName)}>
                      <CategoryIcon className="h-3 w-3" />
                      {categoryConfig.label}
                    </span>
                    {post.isPremium && (
                      <span className="rounded bg-[#A06AFF]/20 px-1.5 py-0.5 text-xs font-bold text-[#A06AFF]">
                        Premium
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-bold",
                        post.status === "published" ? "bg-[#1C3430] text-[#2EBD85]" : "bg-[rgba(255,168,0,0.16)] text-[#FFA800]"
                      )}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs text-[#6C7280]">{post.text}</p>

                  <div className="flex items-center justify-between border-t border-[#181B22] pt-3 text-xs text-[#6C7280]">
                    <span>{post.date}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.views) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.likes) : "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.status === "published" ? formatNumber(post.comments) : "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#181B22] bg-black p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Удалить пост?</h3>
            </div>
            
            <p className="text-sm text-[#6C7280] mb-6">
              Вы уверены, что хотите удалить пост "{postToDelete.title}"? Это действие нельзя отменить.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 rounded-full border border-[#181B22] bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Удаление...
                  </>
                ) : (
                  'Удалить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MyPosts);
