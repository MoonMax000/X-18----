import React, { useEffect } from 'react';
import { useAdminStats } from '@/hooks/useAdmin';
import { 
  Users, 
  FileText, 
  Flag, 
  Newspaper,
  TrendingUp,
  Activity
} from 'lucide-react';

export function AdminDashboard() {
  const { stats, isLoading, error, fetchStats } = useAdminStats();

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">Ошибка: {error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'blue',
      change: `+${stats?.users_today || 0} сегодня`
    },
    {
      title: 'Всего постов',
      value: stats?.total_posts || 0,
      icon: FileText,
      color: 'green',
      change: `+${stats?.posts_today || 0} сегодня`
    },
    {
      title: 'Жалобы',
      value: stats?.total_reports || 0,
      icon: Flag,
      color: 'red',
      change: `${stats?.pending_reports || 0} на рассмотрении`
    },
    {
      title: 'Активные новости',
      value: stats?.active_news || 0,
      icon: Newspaper,
      color: 'purple',
      change: 'В виджете новостей'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Панель управления
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Общая статистика платформы
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500',
          }[card.color];

          return (
            <div
              key={card.title}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {card.change}
                  </p>
                </div>
                <div className={`${colorClasses} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Активность
          </h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              График активности будет добавлен позже
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/news"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Newspaper className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Управление новостями
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Добавить, редактировать или удалить новости
          </p>
        </a>

        <a
          href="/admin/users"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Users className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Управление пользователями
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Просмотр и изменение ролей пользователей
          </p>
        </a>

        <a
          href="/admin/reports"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
        >
          <Flag className="w-8 h-8 text-red-600 mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Модерация жалоб
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Обработка жалоб на посты
          </p>
        </a>
      </div>
    </div>
  );
}
