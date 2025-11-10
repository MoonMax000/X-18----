import React, { useState, useEffect } from 'react';
import { Mail, Download, Trash2, Calendar, CheckCircle, XCircle, Users, TrendingUp } from 'lucide-react';
import { customBackendAPI, NewsletterSubscription, NewsletterStats } from '../../services/api/custom-backend';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const AdminNewsletterSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<NewsletterSubscription | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, statsData] = await Promise.all([
        customBackendAPI.getNewsletterSubscriptions({
          page,
          limit: 20,
          is_active: filter === 'all' ? undefined : filter === 'active' ? 'true' : 'false'
        }),
        customBackendAPI.getNewsletterStats()
      ]);

      setSubscriptions(subscriptionsData.subscriptions);
      setTotalPages(subscriptionsData.total_pages);
      setStats(statsData);
    } catch (error: any) {
      alert(error.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;

    setIsDeleting(true);
    try {
      await customBackendAPI.deleteNewsletterSubscription(subscriptionToDelete.id);
      alert(`Подписка ${subscriptionToDelete.email} удалена`);
      setDeleteModalOpen(false);
      setSubscriptionToDelete(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Ошибка удаления');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const data = await customBackendAPI.exportNewsletterSubscriptions();
      const blob = new Blob([data.emails.join('\n')], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-emails-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert(`Экспортировано ${data.total} email адресов`);
    } catch (error: any) {
      alert(error.message || 'Ошибка экспорта');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Управление подписками</h1>
        <p className="text-zinc-400">Управление email подписками на новостную рассылку</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Всего подписок</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total_all}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Активные</p>
                <p className="text-2xl font-bold text-green-500 mt-1">{stats.total_active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Неактивные</p>
                <p className="text-2xl font-bold text-red-500 mt-1">{stats.total_inactive}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">За 30 дней</p>
                <p className="text-2xl font-bold text-blue-500 mt-1">{stats.recent_subscriptions}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Активные
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Неактивные
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 
                     hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg 
                     transition-all disabled:opacity-50"
          >
            {exportLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>Экспорт email</span>
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Дата подписки
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-400">
                    Нет подписок
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-500" />
                        <span className="text-white font-medium">{subscription.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {subscription.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-800">
                          <CheckCircle className="w-3 h-3" />
                          Активна
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-800">
                          <XCircle className="w-3 h-3" />
                          Неактивна
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(subscription.subscribed_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-400 text-sm">{subscription.source}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSubscriptionToDelete(subscription);
                          setDeleteModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 
                                 text-red-400 rounded-lg transition-colors border border-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Удалить</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Назад
            </button>
            <span className="text-zinc-400">
              Страница {page} из {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && subscriptionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Удалить подписку?</h3>
            <p className="text-zinc-400 mb-2">
              Вы действительно хотите удалить подписку:
            </p>
            <p className="text-white font-medium mb-6">{subscriptionToDelete.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSubscriptionToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 
                         transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 
                         hover:from-red-500 hover:to-red-400 text-white rounded-lg 
                         transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Удаление...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Удалить</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
