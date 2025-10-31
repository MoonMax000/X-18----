import React, { useEffect, useState } from 'react';
import { useAdminNews } from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Eye, EyeOff, X, ExternalLink, Upload, Loader2 } from 'lucide-react';
import type { NewsItem, CreateNewsData } from '@/services/api/custom-backend';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { customBackendAPI } from '@/services/api/custom-backend';

export function AdminNews() {
  const { news, isLoading, error, fetchNews, createNews, updateNews, deleteNews } = useAdminNews();
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateNewsData>({
    title: '',
    description: '',
    content: '',
    url: '',
    image_url: '',
    category: 'general',
    source: '',
    status: 'draft',
    is_active: true,
  });

  // Популярные источники новостей
  const popularSources = [
    'RBC',
    'Ведомости',
    'Коммерсантъ',
    'Reuters',
    'Bloomberg',
    'TechCrunch',
    'CoinDesk',
    'Forbes',
    'The Guardian',
    'Другой источник',
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNews) {
      await updateNews(editingNews.id, formData);
    } else {
      await createNews(formData);
    }
    
    handleCloseModal();
  };

  const handleEdit = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      description: newsItem.description,
      content: newsItem.content || '',
      url: newsItem.url || '',
      image_url: newsItem.image_url || '',
      category: newsItem.category,
      source: newsItem.source,
      status: newsItem.status || 'draft',
      is_active: true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту новость?')) {
      await deleteNews(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNews(null);
    setUploadError(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      url: '',
      image_url: '',
      category: 'general',
      source: '',
      status: 'draft',
      is_active: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Размер изображения не должен превышать 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadError(null);
      
      const media = await customBackendAPI.uploadMedia(file);
      setFormData({ ...formData, image_url: media.url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки изображения');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading && news.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка новостей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Управление новостями
          </h1>
          <p className="mt-2 text-gray-400">
            Создание и редактирование новостей для виджета
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-tyrian text-white rounded-lg hover:bg-tyrian-dark transition-colors shadow-lg shadow-tyrian/20"
        >
          <Plus className="w-5 h-5" />
          Добавить новость
        </button>
      </div>

      {error && (
        <div className="bg-red/20 border border-red rounded-lg p-4">
          <p className="text-red">Ошибка: {error}</p>
        </div>
      )}

      {/* News Table */}
      <div className="bg-moonlessNight rounded-lg border border-widget-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-onyxGrey">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Новость
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-widget-border">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-onyxGrey/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 ring-1 ring-widget-border"
                        />
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 text-xs font-medium bg-blue/20 text-blue rounded w-fit">
                        {item.category}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded w-fit ${
                        item.status === 'published' 
                          ? 'bg-green/20 text-green' 
                          : 'bg-yellow/20 text-yellow'
                      }`}>
                        {item.status === 'published' ? 'Опубликована' : 'Черновик'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(item.published_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/news/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                        title="Просмотр"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-tyrian hover:bg-tyrian/10 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red hover:bg-red/10 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {news.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              Новостей пока нет. Добавьте первую новость.
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-moonlessNight rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-widget-border shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-widget-border">
              <h2 className="text-xl font-bold text-white">
                {editingNews ? 'Редактировать новость' : 'Добавить новость'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white hover:bg-onyxGrey rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Заголовок новости *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Запуск новой функции в платформе"
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-500 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Краткое описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Краткое описание для карточки новости (2-3 предложения)"
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-500 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Полный текст новости *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="Напишите полный текст новости, который будет виден при открытии..."
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-500 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors resize-none"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Этот текст будет виден на странице новости /news/:id
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ссылка на источник (опционально)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com/original-article"
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-500 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Если хотите добавить ссылку "Читать оригинал" на внешний источник
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Обложка новости
                </label>
                
                {formData.image_url ? (
                  <div className="space-y-3">
                    <div className="relative h-40 rounded-lg overflow-hidden bg-onyxGrey border border-widget-border">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-1.5 bg-red/80 hover:bg-red text-white rounded-lg transition-colors"
                        title="Удалить изображение"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-gray-300 hover:text-white hover:border-tyrian transition-colors text-sm"
                    >
                      Изменить изображение
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-widget-border rounded-lg cursor-pointer bg-onyxGrey hover:bg-onyxGrey/50 hover:border-tyrian transition-all"
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 text-tyrian animate-spin mb-2" />
                          <span className="text-sm text-gray-400">Загрузка...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-400 mb-1">
                            Нажмите для загрузки изображения
                          </span>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, GIF до 5MB
                          </span>
                        </div>
                      )}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </div>
                )}
                
                {uploadError && (
                  <p className="mt-2 text-xs text-red">{uploadError}</p>
                )}
                
                <p className="mt-1 text-xs text-gray-500">
                  Рекомендуется изображение 16:9 (например, 1200x675px)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Категория *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                    required
                  >
                    <option value="general">Общие</option>
                    <option value="technology">Технологии</option>
                    <option value="business">Бизнес</option>
                    <option value="finance">Финансы</option>
                    <option value="crypto">Крипто</option>
                    <option value="sports">Спорт</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Источник новости *
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                    required
                  >
                    <option value="">Выберите источник</option>
                    {popularSources.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Название издания или источника
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Статус публикации *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: 'draft' })}
                      className="w-4 h-4 text-tyrian border-widget-border focus:ring-tyrian bg-onyxGrey"
                    />
                    <span className="text-sm text-gray-300">Черновик</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: 'published' })}
                      className="w-4 h-4 text-tyrian border-widget-border focus:ring-tyrian bg-onyxGrey"
                    />
                    <span className="text-sm text-gray-300">Опубликована</span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Только опубликованные новости видны пользователям
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-widget-border">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 px-4 py-2 text-tyrian hover:bg-tyrian/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Предпросмотр
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-300 hover:bg-onyxGrey rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-tyrian text-white rounded-lg hover:bg-tyrian-dark transition-colors disabled:opacity-50 shadow-lg shadow-tyrian/20"
                  >
                    {editingNews ? 'Сохранить' : 'Создать'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-moonlessNight rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-widget-border shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-widget-border">
              <h2 className="text-xl font-bold text-white">
                Предпросмотр новости
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-onyxGrey rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Preview как в виджете */}
              <div className="bg-richBlack border border-widget-border rounded-lg overflow-hidden">
                {formData.image_url && (
                  <div className="relative h-64 overflow-hidden bg-onyxGrey">
                    <img
                      src={formData.image_url}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 text-xs font-medium bg-tyrian/90 text-white rounded-full backdrop-blur-sm">
                        {formData.category}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3">
                    {formData.title || 'Заголовок новости'}
                  </h3>

                  {/* Description */}
                  {formData.description && (
                    <p className="text-sm text-gray-400 mb-4">
                      {formData.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <span>только что</span>
                    {formData.source && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-gray-600" />
                        <span>{formData.source}</span>
                      </>
                    )}
                  </div>

                  {/* Read More Button */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-tyrian/10 text-tyrian rounded-lg text-sm font-medium">
                    Читать полностью
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="mt-4 p-4 bg-blue/10 border border-blue/30 rounded-lg">
                <p className="text-sm text-blue">
                  💡 Так новость будет выглядеть в виджете и на странице новостей
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-widget-border">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-tyrian text-white rounded-lg hover:bg-tyrian-dark transition-colors shadow-lg shadow-tyrian/20"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
