import { useState, useEffect } from 'react';
import { useNews } from '@/hooks/useWidgets';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Filter, Search, ExternalLink, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

const NewsPage: FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { news, isLoading, error, refetch } = useNews({ limit: 50 });

  const categories = [
    { value: '', label: 'Все категории' },
    { value: 'general', label: 'Общие' },
    { value: 'technology', label: 'Технологии' },
    { value: 'business', label: 'Бизнес' },
    { value: 'finance', label: 'Финансы' },
    { value: 'crypto', label: 'Крипто' },
    { value: 'sports', label: 'Спорт' },
  ];

  const filteredNews = news.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-richBlack py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Новости
          </h1>
          <p className="text-gray-400">
            Последние обновления и важные события
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск новостей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-moonlessNight border border-widget-border rounded-lg text-white placeholder-gray-500 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-moonlessNight border border-widget-border rounded-lg text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red/20 border border-red rounded-lg p-4 mb-6">
            <p className="text-red">Ошибка загрузки новостей: {error}</p>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && !error && (
          <>
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">
                  {searchQuery || selectedCategory
                    ? 'Новости не найдены'
                    : 'Новостей пока нет'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((item) => {
                  const publishedAgo = formatDistanceToNow(new Date(item.published_at), {
                    addSuffix: true,
                    locale: ru,
                  });

                  return (
                    <article
                      key={item.id}
                      onClick={() => navigate(`/news/${item.id}`)}
                      className="group bg-moonlessNight border border-widget-border rounded-lg overflow-hidden hover:border-tyrian/50 transition-all duration-200 hover:shadow-lg hover:shadow-tyrian/10 cursor-pointer"
                    >
                      {/* Image */}
                      {item.image_url && (
                        <div className="relative h-48 overflow-hidden bg-onyxGrey">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Category Badge */}
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 text-xs font-medium bg-tyrian/90 text-white rounded-full backdrop-blur-sm">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-5">
                        {/* Title */}
                        <h2 className="text-lg font-bold text-white mb-2 group-hover:text-tyrian transition-colors line-clamp-2">
                          {item.title}
                        </h2>

                        {/* Description */}
                        {item.description && (
                          <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                            {item.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <span>{publishedAgo}</span>
                            {item.source && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-600" />
                                <span>{item.source}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Read More Button */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-tyrian/10 text-tyrian rounded-lg group-hover:bg-tyrian group-hover:text-white transition-all duration-200 text-sm font-medium">
                          Читать полностью
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Results Count */}
        {!isLoading && !error && filteredNews.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-400">
            Показано {filteredNews.length} {filteredNews.length === 1 ? 'новость' : filteredNews.length < 5 ? 'новости' : 'новостей'}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
