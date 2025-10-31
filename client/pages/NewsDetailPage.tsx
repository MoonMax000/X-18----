import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customBackendAPI, NewsItem } from '@/services/api/custom-backend';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, Calendar, Tag, ExternalLink } from 'lucide-react';
import type { FC } from 'react';

const NewsDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);
        // Получаем новость напрямую по ID
        const newsItem = await customBackendAPI.getNewsById(id);
        setNews(newsItem);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки новости');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-richBlack flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian"></div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-richBlack py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Назад к новостям
          </button>
          <div className="bg-red/20 border border-red rounded-lg p-6 text-center">
            <p className="text-red text-lg">{error || 'Новость не найдена'}</p>
          </div>
        </div>
      </div>
    );
  }

  const publishedAgo = formatDistanceToNow(new Date(news.published_at), {
    addSuffix: true,
    locale: ru,
  });

  return (
    <div className="min-h-screen bg-richBlack py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/news')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Назад к новостям
        </button>

        {/* Article */}
        <article className="bg-moonlessNight border border-widget-border rounded-lg overflow-hidden">
          {/* Cover Image */}
          {news.image_url && (
            <div className="relative h-[400px] overflow-hidden bg-onyxGrey">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
              {/* Category Badge */}
              <div className="absolute top-6 right-6">
                <span className="px-4 py-2 text-sm font-medium bg-tyrian/90 text-white rounded-full backdrop-blur-sm">
                  {news.category}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={news.published_at}>
                  {new Date(news.published_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </time>
                <span className="text-gray-600">•</span>
                <span>{publishedAgo}</span>
              </div>
              
              {news.source && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>{news.source}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              {news.title}
            </h1>

            {/* Description */}
            {news.description && (
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {news.description}
              </p>
            )}

            {/* Full Content */}
            {news.content && (
              <div className="prose prose-invert prose-lg max-w-none">
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {news.content}
                </div>
              </div>
            )}

            {/* External Link if provided */}
            {news.url && (
              <div className="mt-8 pt-8 border-t border-widget-border">
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-tyrian/10 text-tyrian rounded-lg hover:bg-tyrian hover:text-white transition-all duration-200 font-medium"
                >
                  Читать оригинал на {news.source}
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}
          </div>
        </article>

        {/* Share Section */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/news')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Вернуться ко всем новостям
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
