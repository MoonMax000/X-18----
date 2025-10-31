import React, { useEffect, useState } from 'react';
import { useAdminNews } from '@/hooks/useAdmin';
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import type { NewsItem, CreateNewsData } from '@/services/api/custom-backend';

export function AdminNews() {
  const { news, isLoading, error, fetchNews, createNews, updateNews, deleteNews } = useAdminNews();
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<CreateNewsData>({
    title: '',
    description: '',
    url: '',
    image_url: '',
    category: 'general',
    source: '',
    is_active: true,
  });

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
      url: newsItem.url,
      image_url: newsItem.image_url || '',
      category: newsItem.category,
      source: newsItem.source,
      is_active: true, // Backend не возвращает is_active, но можно добавить
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
    setFormData({
      title: '',
      description: '',
      url: '',
      image_url: '',
      category: 'general',
      source: '',
      is_active: true,
    });
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
                    <span className="px-2 py-1 text-xs font-medium bg-blue/20 text-blue rounded">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {item.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(item.published_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
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
                  Заголовок *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL новости *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL изображения
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                />
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
                    Источник *
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-tyrian border-widget-border rounded focus:ring-tyrian bg-onyxGrey"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                  Активна (отображается в виджете)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-widget-border">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
