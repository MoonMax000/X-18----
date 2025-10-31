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
      pending: { label: 'На рассмотрении', color: 'bg-orange/20 text-orange', icon: AlertCircle },
      reviewed: { label: 'Рассмотрена', color: 'bg-blue/20 text-blue', icon: Eye },
      resolved: { label: 'Решена', color: 'bg-green/20 text-green', icon: CheckCircle },
      dismissed: { label: 'Отклонена', color: 'bg-gray-700 text-gray-300', icon: XCircle },
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка жалоб...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Модерация жалоб
        </h1>
        <p className="mt-2 text-gray-400">
          Обработка жалоб пользователей на посты
        </p>
      </div>

      {error && (
        <div className="bg-red/20 border border-red rounded-lg p-4">
          <p className="text-red">Ошибка: {error}</p>
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
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
              filter === item.value
                ? 'bg-tyrian text-white shadow-lg shadow-tyrian/20'
                : 'bg-moonlessNight border border-widget-border text-gray-300 hover:bg-onyxGrey'
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
            className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-tyrian/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(report.status)}
                  <span className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleString('ru-RU')}
                  </span>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-white mb-1">
                    Причина: {report.reason}
                  </h3>
                  {report.details && (
                    <p className="text-sm text-gray-400">
                      {report.details}
                    </p>
                  )}
                </div>

                {report.reporter && (
                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={report.reporter.avatar_url || '/default-avatar.png'}
                      alt={report.reporter.display_name}
                      className="w-6 h-6 rounded-full ring-2 ring-widget-border"
                    />
                    <span className="text-sm text-gray-400">
                      Жалоба от <span className="font-medium text-white">@{report.reporter.username}</span>
                    </span>
                  </div>
                )}

                {report.post && (
                  <div className="bg-onyxGrey rounded-lg p-4 mb-4 border border-widget-border">
                    <p className="text-sm text-gray-300 mb-2">
                      Пост от <span className="text-white font-medium">@{report.post.user?.username}</span>:
                    </p>
                    <p className="text-sm text-gray-400 line-clamp-3">
                      {report.post.content}
                    </p>
                  </div>
                )}

                {report.review_note && (
                  <div className="bg-blue/20 rounded-lg p-3 border border-blue/30">
                    <p className="text-sm font-medium text-blue mb-1">
                      Заметка модератора:
                    </p>
                    <p className="text-sm text-blue-300">
                      {report.review_note}
                    </p>
                  </div>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-tyrian text-white rounded-lg hover:bg-tyrian-dark transition-colors shadow-lg shadow-tyrian/20"
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
          <p className="text-gray-400">
            Жалоб пока нет
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-moonlessNight rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-widget-border shadow-2xl">
            <div className="p-6 border-b border-widget-border">
              <h2 className="text-xl font-bold text-white">
                Рассмотрение жалобы
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Причина жалобы:
                </p>
                <p className="text-white">{selectedReport.reason}</p>
                {selectedReport.details && (
                  <p className="text-sm text-gray-400 mt-1">
                    {selectedReport.details}
                  </p>
                )}
              </div>

              {selectedReport.post && (
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    Содержимое поста:
                  </p>
                  <div className="bg-onyxGrey rounded-lg p-4 border border-widget-border">
                    <p className="text-white">
                      {selectedReport.post.content}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Заметка (опционально)
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-400 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors resize-none"
                  placeholder="Добавьте комментарий к вашему решению..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="delete_post"
                  checked={deletePost}
                  onChange={(e) => setDeletePost(e.target.checked)}
                  className="w-4 h-4 text-red border-widget-border rounded focus:ring-red bg-onyxGrey"
                />
                <label htmlFor="delete_post" className="text-sm font-medium text-gray-300">
                  Удалить пост
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-widget-border">
                <button
                  onClick={() => handleReview(selectedReport.id, 'resolved')}
                  className="flex-1 px-4 py-2 bg-green text-white rounded-lg hover:bg-green/80 transition-colors shadow-lg shadow-green/20"
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
                  className="px-4 py-2 text-gray-300 hover:bg-onyxGrey rounded-lg transition-colors"
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
