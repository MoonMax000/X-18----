import { FC, useState, useEffect, useRef } from "react";
import { useSearch } from "@/hooks/useSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TrendingPost {
  id: string;
  content: string;
  user: {
    username: string;
    display_name?: string;
  };
  access_level?: string;
  likes_count: number;
  media?: Array<{ url: string; type: string }>;
  created_at: string;
}

export const SearchModal: FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "tags" | "articles">("all");
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, updateFilters } = useSearch({
    query: searchQuery,
  });

  // Load trending posts when modal opens
  useEffect(() => {
    const loadTrendingPosts = async () => {
      if (!isOpen) return;
      
      setIsTrendingLoading(true);
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
        const params = new URLSearchParams({
          sort_by: 'relevance',
          sort_order: 'desc',
          limit: '5',
        });
        
        const response = await fetch(`${baseUrl}/posts/search?${params.toString()}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setTrendingPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Failed to load trending posts:', error);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    loadTrendingPosts();
  }, [isOpen]);

  // Update filters when search query changes
  useEffect(() => {
    updateFilters({ query: searchQuery });
  }, [searchQuery, updateFilters]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const posts = results?.posts || [];
  const totalResults = results?.total || 0;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  // Get access level badge
  const getAccessBadge = (accessLevel?: string) => {
    if (!accessLevel || accessLevel === 'free') return null;

    const badges = {
      'pay-per-post': { text: 'Платный', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      'subscribers-only': { text: 'Подписка', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      'followers-only': { text: 'Подписчики', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      'premium': { text: 'Премиум', color: 'bg-[#A06AFF]/20 text-[#A06AFF] border-[#A06AFF]/30' },
    };

    const badge = badges[accessLevel as keyof typeof badges];
    if (!badge) return null;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[80] overflow-x-hidden overflow-y-auto"
      role="dialog"
      tabIndex={-1}
      aria-label="Search"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md pointer-events-auto" 
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-6">
        <div className="relative w-full max-w-2xl h-auto max-h-[calc(100vh-48px)] flex flex-col bg-black rounded-3xl pointer-events-auto shadow-[0_10px_40px_10px_rgba(0,0,0,0.8)] border border-[#2F2F31]/50">
          {/* Header */}
          <div className="p-4 border-b border-[#2F2F31]">
            {/* Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none z-20 pl-3.5">
                <svg
                  className="shrink-0 size-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="grow relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="py-2 sm:py-2.5 pl-10 pr-20 block w-full bg-[#101318] border border-[#2F2F31]/60 rounded-2xl text-sm text-gray-300 placeholder:text-gray-500 focus:border-[#A06AFF] focus:ring-0 focus:outline-none transition-all duration-200"
                    placeholder="Search posts or type a command"
                    autoFocus
                  />

                  <div className="absolute inset-y-0 right-0 flex items-center z-20 pr-2">
                    <div className="flex items-center gap-1">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="flex shrink-0 justify-center items-center size-6 rounded-full text-gray-400 hover:text-[#A06AFF] hover:bg-[#A06AFF]/10 focus:outline-none focus:text-[#A06AFF] transition-all duration-200"
                          aria-label="Clear"
                        >
                          <svg
                            className="shrink-0 size-4"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9-6 6" />
                            <path d="m9 9 6 6" />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        className="inline-flex shrink-0 justify-center items-center size-6 text-sm font-medium rounded-full text-white bg-[#A06AFF] hover:bg-[#B084FF] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-[#B084FF] shadow-sm hover:shadow-md hover:shadow-[#A06AFF]/30 transition-all duration-200"
                      >
                        <svg
                          className="shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* End Input */}

            {/* Filter Buttons */}
            <div className="mt-3 flex flex-wrap justify-between items-center gap-1 sm:gap-2">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-xs rounded-full focus:outline-none transition-all duration-200 ${
                    activeFilter === "all"
                      ? "bg-[#A06AFF] text-white shadow-sm"
                      : "text-gray-300 bg-[#272A32] hover:text-[#A06AFF] hover:bg-[#2F3340]"
                  }`}
                >
                  <svg
                    className="shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                    <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                    <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
                  </svg>
                  All {totalResults}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("tags")}
                  className={`py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-xs rounded-full focus:outline-none transition-all duration-200 ${
                    activeFilter === "tags"
                      ? "bg-[#A06AFF] text-white shadow-sm"
                      : "text-gray-300 bg-[#272A32] hover:text-[#A06AFF] hover:bg-[#2F3340]"
                  }`}
                >
                  <svg
                    className="shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                  </svg>
                  Tags
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("articles")}
                  className={`py-1.5 px-2.5 inline-flex items-center gap-x-1.5 text-xs rounded-full focus:outline-none transition-all duration-200 ${
                    activeFilter === "articles"
                      ? "bg-[#A06AFF] text-white shadow-sm"
                      : "text-gray-300 bg-[#272A32] hover:text-[#A06AFF] hover:bg-[#2F3340]"
                  }`}
                >
                  <svg
                    className="shrink-0 size-3.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="M15 18h-5" />
                    <path d="M10 6h8v4h-8V6Z" />
                  </svg>
                  Articles
                </button>
              </div>
            </div>
            {/* End Filter Buttons */}
          </div>
          {/* End Header */}

          {/* Body */}
          <div className="flex-1 py-1.5 px-4 overflow-y-auto overflow-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-[#272A32] [&::-webkit-scrollbar-thumb]:bg-[#3F4249]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A06AFF]"></div>
              </div>
            ) : searchQuery.length === 0 ? (
              <div className="space-y-4 py-2">
                {/* Demo Search Results */}
                <div>
                  <h4 className="mb-2 text-[11px] uppercase text-gray-500 font-semibold">
                    Recent Searches
                  </h4>

                  <ul className="-mx-2.5 space-y-0.5">
                    <li>
                      <a
                        className="py-2 px-3 flex items-center gap-x-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                        href="#"
                      >
                        <svg
                          className="shrink-0 size-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <div className="grow">
                          <span className="text-[13px] text-gray-200 group-hover:text-white line-clamp-1 transition-colors duration-150">
                            Cryptocurrency
                          </span>
                        </div>
                        <div className="ml-auto">
                          <svg
                            className="shrink-0 size-3.5 text-gray-500 group-hover:text-[#A06AFF] transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a
                        className="py-2 px-3 flex items-center gap-x-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                        href="#"
                      >
                        <svg
                          className="shrink-0 size-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <div className="grow">
                          <span className="text-[13px] text-gray-200 group-hover:text-white line-clamp-1 transition-colors duration-150">
                            Trading Strategies
                          </span>
                        </div>
                        <div className="ml-auto">
                          <svg
                            className="shrink-0 size-3.5 text-gray-500 group-hover:text-[#A06AFF] transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </a>
                    </li>
                    <li>
                      <a
                        className="py-2 px-3 flex items-center gap-x-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                        href="#"
                      >
                        <svg
                          className="shrink-0 size-4 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <div className="grow">
                          <span className="text-[13px] text-gray-200 group-hover:text-white line-clamp-1 transition-colors duration-150">
                            Market Analysis
                          </span>
                        </div>
                        <div className="ml-auto">
                          <svg
                            className="shrink-0 size-3.5 text-gray-500 group-hover:text-[#A06AFF] transition-colors duration-150"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </div>
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Demo Featured Posts */}
                {/* Trending Posts */}
                <div>
                  <h4 className="mb-2 text-[11px] uppercase text-gray-500 font-semibold">
                    Трендовые посты
                  </h4>

                  {isTrendingLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A06AFF]"></div>
                    </div>
                  ) : trendingPosts.length > 0 ? (
                    <>
                      <ul className="-mx-2.5 space-y-0.5">
                        {trendingPosts.map((post) => (
                          <li key={post.id}>
                            <a
                              className="block p-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                              href={`/posts/${post.id}`}
                            >
                              <div className="flex items-center gap-x-4">
                                <div className="grow truncate">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="truncate text-sm text-gray-200 group-hover:text-white font-medium transition-colors duration-150">
                                      {post.content.substring(0, 60)}{post.content.length > 60 ? '...' : ''}
                                    </h5>
                                    {getAccessBadge(post.access_level)}
                                  </div>

                                  <ol className="mt-1.5 flex flex-wrap items-center">
                                    <li className="relative pe-5 text-xs last:pe-0 last:after:hidden after:absolute after:top-1/2 after:end-2 after:inline-block after:size-[3px] after:bg-gray-400 after:rounded-full after:-translate-y-1/2">
                                      <span className="inline-flex items-center gap-x-1 text-xs text-gray-500">
                                        <svg
                                          className="shrink-0 size-3"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <rect width="7" height="7" x="14" y="3" rx="1" />
                                          <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                                        </svg>
                                        Пост
                                      </span>
                                    </li>
                                    {post.user?.username && (
                                      <li className="relative pe-5 text-xs last:pe-0 last:after:hidden after:absolute after:top-1/2 after:end-2 after:inline-block after:size-[3px] after:bg-gray-400 after:rounded-full after:-translate-y-1/2">
                                        <span className="inline-flex items-center gap-x-1 text-xs text-gray-500">
                                          @{post.user.username}
                                        </span>
                                      </li>
                                    )}
                                    {post.likes_count > 0 && (
                                      <li className="relative pe-5 text-xs last:pe-0 last:after:hidden after:absolute after:top-1/2 after:end-2 after:inline-block after:size-[3px] after:bg-gray-400 after:rounded-full after:-translate-y-1/2">
                                        <span className="inline-flex items-center gap-x-1 text-xs text-gray-500">
                                          <svg
                                            className="shrink-0 size-3"
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                          </svg>
                                          {post.likes_count}
                                        </span>
                                      </li>
                                    )}
                                  </ol>
                                </div>

                                {post.media && post.media.length > 0 && post.media[0].type === 'image' ? (
                                  <div className="shrink-0">
                                    <img
                                      className="w-20 h-14 object-cover bg-[#272A32] rounded-2xl group-hover:ring-2 group-hover:ring-[#A06AFF]/30 transition-all duration-150"
                                      src={post.media[0].url}
                                      alt="Post thumbnail"
                                    />
                                  </div>
                                ) : (
                                  <div className="shrink-0">
                                    <span className="flex justify-center items-center w-20 h-14 bg-[#272A32] text-gray-600 rounded-2xl">
                                      <svg
                                        className="shrink-0 size-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                        <path d="M10 9H8" />
                                        <path d="M16 13H8" />
                                        <path d="M16 17H8" />
                                      </svg>
                                    </span>
                                  </div>
                                )}
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>

                      <p className="mt-1 -ml-1.5">
                        <a
                          className="py-1 px-2 inline-flex items-center gap-x-1 text-xs text-[#A06AFF] hover:text-[#B084FF] decoration-2 hover:underline focus:outline-none focus:underline cursor-pointer transition-colors duration-150"
                          href="/explore"
                        >
                          Посмотреть все трендовые посты
                          <svg
                            className="shrink-0 size-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </a>
                      </p>
                    </>
                  ) : (
                    <p className="text-center py-4 text-sm text-gray-500">
                      Нет трендовых постов
                    </p>
                  )}
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M12 12h.01M12 12h.01"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-400">No results found</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Try adjusting your search query
                </p>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                {/* Search Results */}
                <div>
                  <h4 className="mb-2 text-[11px] uppercase text-gray-500 font-semibold">
                    Search Results
                  </h4>

                  <ul className="-mx-2.5 space-y-0.5">
                    {posts.slice(0, 3).map((post) => (
                      <li key={post.id}>
                        <a
                          className="py-2 px-3 flex items-center gap-x-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                          href={`/posts/${post.id}`}
                        >
                          <svg
                            className="shrink-0 size-4 text-gray-500"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                          <div className="grow">
                            <span className="text-[13px] text-gray-200 group-hover:text-white line-clamp-1 transition-colors duration-150">
                              {post.title || post.content?.substring(0, 60)}
                            </span>
                          </div>
                          <div className="ml-auto">
                            <svg
                              className="shrink-0 size-3.5 text-gray-500 group-hover:text-[#A06AFF] transition-colors duration-150"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>

                  {posts.length > 3 && (
                    <p className="mt-1 -ml-1.5">
                      <a
                        className="py-1 px-2 inline-flex items-center gap-x-1 text-xs text-[#A06AFF] hover:text-[#B084FF] decoration-2 hover:underline focus:outline-none focus:underline cursor-pointer transition-colors duration-150"
                        href="#"
                      >
                        {posts.length - 3} more results
                        <svg
                          className="shrink-0 size-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </a>
                    </p>
                  )}
                </div>

                {/* Posts with Details */}
                {posts.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-[11px] uppercase text-gray-500 font-semibold">
                      Posts
                    </h4>

                    <ul className="-mx-2.5 space-y-0.5">
                      {posts.slice(0, 3).map((post) => (
                        <li key={`featured-${post.id}`}>
                          <a
                            className="block p-3 hover:bg-[#1F2229] rounded-2xl focus:outline-none focus:bg-[#1F2229] transition-all duration-150 cursor-pointer group"
                            href={`/posts/${post.id}`}
                          >
                            <div className="flex items-center gap-x-4">
                              <div className="grow truncate">
                                <h5 className="truncate text-sm text-gray-200 group-hover:text-white font-medium transition-colors duration-150">
                                  {post.title || "Untitled Post"}
                                </h5>

                                <ol className="mt-1.5 flex flex-wrap items-center">
                                  <li className="relative pe-5 text-xs last:pe-0 last:after:hidden after:absolute after:top-1/2 after:end-2 after:inline-block after:size-[3px] after:bg-gray-400 after:rounded-full after:-translate-y-1/2">
                                    <span className="inline-flex items-center gap-x-1 text-xs text-gray-500">
                                      <svg
                                        className="shrink-0 size-3"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <rect width="7" height="7" x="14" y="3" rx="1" />
                                        <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                                      </svg>
                                      Post
                                    </span>
                                  </li>
                                  {post.author_username && (
                                    <li className="relative pe-5 text-xs last:pe-0 last:after:hidden after:absolute after:top-1/2 after:end-2 after:inline-block after:size-[3px] after:bg-gray-400 after:rounded-full after:-translate-y-1/2">
                                      <span className="inline-flex items-center gap-x-1 text-xs text-gray-500">
                                        <svg
                                          className="shrink-0 size-3"
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                                        </svg>
                                        @{post.author_username}
                                      </span>
                                    </li>
                                  )}
                                </ol>
                              </div>

                              {post.media_urls && post.media_urls.length > 0 ? (
                                <div className="shrink-0">
                                  <img
                                    className="w-20 h-14 object-cover bg-[#272A32] rounded-2xl group-hover:ring-2 group-hover:ring-[#A06AFF]/30 transition-all duration-150"
                                    src={post.media_urls[0]}
                                    alt="Post thumbnail"
                                  />
                                </div>
                              ) : (
                                <div className="shrink-0">
                                  <span className="flex justify-center items-center w-20 h-14 bg-[#272A32] text-gray-600 rounded-2xl">
                                    <svg
                                      className="shrink-0 size-5"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                      <path d="M10 9H8" />
                                      <path d="M16 13H8" />
                                      <path d="M16 17H8" />
                                    </svg>
                                  </span>
                                </div>
                              )}
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* End Body */}
        </div>
      </div>
    </div>
  );
};
