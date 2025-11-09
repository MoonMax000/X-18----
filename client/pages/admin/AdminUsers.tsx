import React, { useEffect, useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdmin';
import { Search, Shield, User, Crown, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminUsers() {
  const { users, isLoading, error, fetchUsers, updateUserRole, deleteAllExceptAdmin } = useAdminUsers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            user.display_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`Изменить роль пользователя на "${newRole}"?`)) {
      await updateUserRole(userId, newRole);
    }
  };

  const handleDeleteAllExceptAdmin = async () => {
    const nonAdminCount = users.filter(u => u.role !== 'admin').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    
    if (nonAdminCount === 0) {
      toast({
        title: 'Нет пользователей для удаления',
        description: 'Все пользователи являются администраторами',
      });
      return;
    }

    const confirmed = confirm(
      `⚠️ ВНИМАНИЕ! Вы собираетесь удалить ${nonAdminCount} пользователей!\n\n` +
      `Будут сохранены только ${adminCount} администратор(ов).\n\n` +
      `Это действие НЕОБРАТИМО!\n\n` +
      `Вы уверены?`
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      `Последнее подтверждение!\n\n` +
      `Удалить ${nonAdminCount} пользователей?`
    );

    if (!doubleConfirm) return;

    const result = await deleteAllExceptAdmin();
    
    if (result.success && result.data) {
      toast({
        title: 'Пользователи удалены',
        description: `Удалено: ${result.data.deleted_count} пользователей. Сохранено: ${result.data.admins_kept} админов.`,
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователей',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role?: string) => {
    const roleConfig = {
      admin: { label: 'Админ', icon: Shield, color: 'bg-red/20 text-red' },
      moderator: { label: 'Модератор', icon: Crown, color: 'bg-tyrian/20 text-tyrian' },
      user: { label: 'Пользователь', icon: User, color: 'bg-gray-700 text-gray-300' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tyrian mx-auto"></div>
          <p className="mt-4 text-gray-400">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Управление пользователями
        </h1>
        <p className="mt-2 text-gray-400">
          Просмотр и изменение ролей пользователей
        </p>
      </div>

      {error && (
        <div className="bg-red/20 border border-red rounded-lg p-4">
          <p className="text-red">Ошибка: {error}</p>
        </div>
      )}

      {/* Danger Zone - Delete All Users */}
      {users.length > 0 && (
        <div className="bg-red/10 border border-red/30 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red" />
                Опасная зона
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Удаление всех пользователей кроме администраторов. Это действие необратимо!
              </p>
              <div className="text-sm text-gray-400 mb-4">
                <div>Будет удалено: <span className="text-white font-bold">{users.filter(u => u.role !== 'admin').length}</span> пользователей</div>
                <div>Будет сохранено: <span className="text-white font-bold">{users.filter(u => u.role === 'admin').length}</span> администраторов</div>
              </div>
            </div>
            <button
              onClick={handleDeleteAllExceptAdmin}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red hover:bg-red/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Удалить всех кроме админов
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по имени, username или email..."
          className="w-full pl-10 pr-4 py-2 border border-widget-border rounded-lg bg-onyxGrey text-white placeholder-gray-400 focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
        />
      </div>

      {/* Users Table */}
      <div className="bg-moonlessNight rounded-lg border border-widget-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-onyxGrey">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Статистика
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-widget-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-onyxGrey/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar_url || '/default-avatar.png'}
                        alt={user.display_name}
                        className="w-10 h-10 rounded-full ring-2 ring-widget-border"
                      />
                      <div>
                        <p className="font-medium text-white">
                          {user.display_name}
                        </p>
                        <p className="text-sm text-gray-400">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Посты: <span className="text-white font-medium">{user.posts_count}</span></div>
                      <div>Подписчики: <span className="text-white font-medium">{user.followers_count}</span></div>
                      <div>Подписки: <span className="text-white font-medium">{user.following_count}</span></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1 text-sm border border-widget-border rounded-lg bg-onyxGrey text-white focus:border-tyrian focus:ring-1 focus:ring-tyrian transition-colors"
                    >
                      <option value="user">Пользователь</option>
                      <option value="moderator">Модератор</option>
                      <option value="admin">Админ</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {searchQuery ? 'Пользователи не найдены' : 'Пользователей пока нет'}
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-blue transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Всего пользователей
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {users.length}
              </p>
            </div>
            <div className="p-3 bg-blue/20 rounded-lg">
              <User className="w-8 h-8 text-blue" />
            </div>
          </div>
        </div>

        <div className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-tyrian transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Модераторов
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {users.filter((u) => u.role === 'moderator').length}
              </p>
            </div>
            <div className="p-3 bg-tyrian/20 rounded-lg">
              <Crown className="w-8 h-8 text-tyrian" />
            </div>
          </div>
        </div>

        <div className="bg-moonlessNight rounded-lg border border-widget-border p-6 hover:border-red transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Администраторов
              </p>
              <p className="mt-2 text-3xl font-bold text-white">
                {users.filter((u) => u.role === 'admin').length}
              </p>
            </div>
            <div className="p-3 bg-red/20 rounded-lg">
              <Shield className="w-8 h-8 text-red" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
