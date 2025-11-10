import { FC, useState, useEffect, useRef } from 'react';
import { useSearch, SearchFilters } from '@/hooks/useSearch';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SearchMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const SearchMegaMenu: FC<SearchMegaMenuProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { filters, results, isLoading, error, updateFilters, clearFilters } = useSearch({
    query: initialQuery,
  });

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div
        ref={menuRef}
        className="bg-[#1A1D24]/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col transition-transform duration-300"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Поиск постов</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            placeholder="Поиск по содержанию постов..."
            className="w-full px-4 py-3 bg-[#0F1117] text-white rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="px-6 py-4 border-b border-gray-700 bg-[#0F1117]">
            <div className="grid grid-cols-2 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Сортировка</label>
                <select
                  value={filters.sortBy || 'date'}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="date">По дате</option>
                  <option value="relevance">По релевантности</option>
                  <option value="likes">По лайкам</option>
                  <option value="views">По просмотрам</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Порядок</label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="desc">По убыванию</option>
                  <option value="asc">По возрастанию</option>
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Автор</label>
                <input
                  type="text"
                  value={filters.author || ''}
                  onChange={(e) => updateFilters({ author: e.target.value })}
                  placeholder="Имя пользователя"
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Категория</label>
                <input
                  type="text"
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value })}
                  placeholder="Категория"
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Media Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Тип медиа</label>
                <select
                  value={filters.mediaType || 'any'}
                  onChange={(e) => updateFilters({ mediaType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="any">Любой</option>
                  <option value="image">Только изображения</option>
                  <option value="video">Только видео</option>
                  <option value="document">Только документы</option>
                </select>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Доступ</label>
                <select
                  value={filters.accessLevel || ''}
                  onChange={(e) => updateFilters({ accessLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Все</option>
                  <option value="free">Бесплатные</option>
                  <option value="premium">Премиум</option>
                  <option value="subscribers-only">Только подписчики</option>
                </select>
              </div>

              {/* Has Media */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Наличие медиа</label>
                <select
                  value={filters.hasMedia || 'any'}
                  onChange={(e) => updateFilters({ hasMedia: e.target.value as 'true' | 'false' | 'any' })}
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="any">Любое</option>
                  <option value="true">Только с медиа</option>
                  <option value="false">Только без медиа</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Теги</label>
                <input
                  type="text"
                  value={filters.tags || ''}
                  onChange={(e) => updateFilters({ tags: e.target.value })}
                  placeholder="tag1, tag2, ..."
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Date Range */}
              <div className="col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Диапазон дат</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                      placeholder="От"
                      className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => updateFilters({ dateTo: e.target.value })}
                      placeholder="До"
                      className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Min Likes */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Мин. лайков</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minLikes ?? ''}
                  onChange={(e) => updateFilters({ minLikes: e.target.valueAsNumber || undefined })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Min Views */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Мин. просмотров</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minViews ?? ''}
                  onChange={(e) => updateFilters({ minViews: e.target.valueAsNumber || undefined })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#1A1D24] text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Очистить фильтры
            </button>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-400">{error}</div>
          )}

          {!isLoading && !error && filters.query && !results && (
            <div className="text-center py-8 text-gray-400">
              Введите запрос для поиска
            </div>
          )}

          {!isLoading && !error && results && results.posts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Ничего не найдено
            </div>
          )}

          {!isLoading && !error && results && results.posts.length > 0 && (
            <div className="space-y-4">
              {results.posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  onClick={onClose}
                  className="block bg-[#0F1117] hover:bg-[#1A1D24] rounded-xl p-4 transition-colors"
                >
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={post.user?.avatar_url || '/placeholder.svg'}
                      alt={post.user?.display_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-white font-semibold">{post.user?.display_name}</p>
                      <p className="text-gray-400 text-sm">@{post.user?.username}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-white mb-3 line-clamp-3">{post.content}</p>

                  {/* Media Preview */}
                  {post.media && post.media.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {post.media.slice(0, 3).map((media: any) => (
                        <img
                          key={media.id}
                          src={media.url}
                          alt=""
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {post.replies_count}
                    </span>
                    <span className="text-gray-500">
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Info */}
          {results && results.total > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-700 text-center text-gray-400 text-sm">
              Показано {results.posts.length} из {results.total} постов
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
