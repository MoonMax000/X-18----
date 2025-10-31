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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red/20 border border-red rounded-lg p-4">
        <p className="text-red">Ошибка: {error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Всего пользователей',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'tyrian',
      bgColor: 'bg-tyrian/20',
      iconBg: 'bg-tyrian',
      change: `+${stats?.users_today || 0} сегодня`
    },
    {
      title: 'Всего постов',
      value: stats?.total_posts || 0,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green/20',
      iconBg: 'bg-green',
      change: `+${stats?.posts_today || 0} сегодня`
    },
    {
      title: 'Жалобы',
      value: stats?.total_reports || 0,
      icon: Flag,
      color: 'red',
      bgColor: 'bg-red/20',
      iconBg: 'bg-red',
      change: `${stats?.pending_reports || 0} на рассмотрении`
    },
    {
      title: 'Активные новости',
      value: stats?.active_news || 0,
      icon: Newspaper,
      color: 'blue',
      bgColor: 'bg-blue/20',
      iconBg: 'bg-blue',
      change: 'В виджете новостей'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Панель управления
        </h1>
        <p className="mt-2 text-gray-400">
          Общая статистика платформы
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`${card.bgColor} rounded-lg border border-widget-border p-6 hover:border-${card.color} transition-all duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-400">
                    {card.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {card.change}
                  </p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Chart Placeholder */}
      <div className="bg-moonlessNight rounded-lg border border-widget-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            Активность
          </h2>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-widget-border rounded-lg bg-richBlack/50">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-tyrian/50 mx-auto mb-2" />
            <p className="text-gray-400">
              График активности будет добавлен позже
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/news"
          className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-blue hover:bg-blue/10 transition-all duration-200 group"
        >
          <div className="p-2 bg-blue/20 rounded-lg w-fit mb-3 group-hover:bg-blue/30 transition-colors">
            <Newspaper className="w-8 h-8 text-blue" />
          </div>
          <h3 className="font-semibold text-white mb-2">
            Управление новостями
          </h3>
          <p className="text-sm text-gray-400">
            Добавить, редактировать или удалить новости
          </p>
        </a>

        <a
          href="/admin/users"
          className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-tyrian hover:bg-tyrian/10 transition-all duration-200 group"
        >
          <div className="p-2 bg-tyrian/20 rounded-lg w-fit mb-3 group-hover:bg-tyrian/30 transition-colors">
            <Users className="w-8 h-8 text-tyrian" />
          </div>
          <h3 className="font-semibold text-white mb-2">
            Управление пользователями
          </h3>
          <p className="text-sm text-gray-400">
            Просмотр и изменение ролей пользователей
          </p>
        </a>

        <a
          href="/admin/reports"
          className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-red hover:bg-red/10 transition-all duration-200 group"
        >
          <div className="p-2 bg-red/20 rounded-lg w-fit mb-3 group-hover:bg-red/30 transition-colors">
            <Flag className="w-8 h-8 text-red" />
          </div>
          <h3 className="font-semibold text-white mb-2">
            Модерация жалоб
          </h3>
          <p className="text-sm text-gray-400">
            Обработка жалоб на посты
          </p>
        </a>
      </div>
    </div>
  );
}
