import React, { useEffect, useState } from 'react';
import { useAdminReports } from '@/hooks/useAdmin';
import { AlertCircle, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import type { PostReport } from '@/services/api/custom-backend';

export function AdminReports() {
  const { reports, isLoading, error, fetchReports, reviewReport } = useAdminReports();
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [deletePost, setDeletePost] = useState(false);

  useEffect(() => {
    if (filter === 'all') {
      fetchReports();
    } else {
      fetchReports({ status: filter });
    }
  }, [filter]);

  const filteredReports = reports;

  const handleReview = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    await reviewReport(reportId, {
      status,
      review_note: reviewNote || undefined,
      action: deletePost ? 'delete_post' : 'none',
    });
    setSelectedReport(null);
    setReviewNote('');
    setDeletePost(false);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'На рассмотрении', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: AlertCircle },
      reviewed: { label: 'Рассмотрена', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Eye },
      resolved: { label: 'Решена', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
      dismissed: { label: 'Отклонена', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: XCircle },
    };

    const statusConfig = config[status as keyof typeof config] || config.pending;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${statusConfig.color}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  if (isLoading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка жалоб...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Модерация жалоб
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Обработка жалоб пользователей на посты
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Ошибка: {error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { value: 'all', label: 'Все' },
          { value: 'pending', label: 'На рассмотрении' },
          { value: 'reviewed', label: 'Рассмотренные' },
          { value: 'resolved', label: 'Решенные' },
          { value: 'dismissed', label: 'Отклоненные' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === item.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(report.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(report.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Причина: {report.reason}
                  </h3>
                  {report.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.details}
                    </p>
                  )}
                </div>

                {report.reporter && (
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={report.reporter.avatar_url || '/default-avatar.png'}
                      alt={report.reporter.display_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Жалоба от <span className="font-medium">@{report.reporter.username}</span>
                    </span>
                  </div>
                )}

                {report.post && (
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Пост от @{report.post.user?.username}:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {report.post.content}
                    </p>
                  </div>
                )}

                {report.review_note && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Заметка модератора:
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      {report.review_note}
                    </p>
                  </div>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Рассмотреть
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Жалоб пока нет
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Рассмотрение жалобы
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Причина жалобы:
                </p>
                <p className="text-gray-900 dark:text-white">{selectedReport.reason}</p>
                {selectedReport.details && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedReport.details}
                  </p>
                )}
              </div>

              {selectedReport.post && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Содержимое поста:
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">
                      {selectedReport.post.content}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Заметка (опционально)
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Добавьте комментарий к вашему решению..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="delete_post"
                  checked={deletePost}
                  onChange={(e) => setDeletePost(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded"
                />
                <label htmlFor="delete_post" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Удалить пост
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleReview(selectedReport.id, 'resolved')}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Решить
                </button>
                <button
                  onClick={() => handleReview(selectedReport.id, 'dismissed')}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Отклонить
                </button>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setReviewNote('');
                    setDeletePost(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
