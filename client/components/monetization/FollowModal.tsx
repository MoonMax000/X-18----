import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { customBackendAPI } from '../../services/api/custom-backend';

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  postId: string;
  onSuccess?: () => void;
}

export const FollowModal: React.FC<FollowModalProps> = ({
  isOpen,
  onClose,
  authorId,
  authorName,
  authorHandle,
  authorAvatar,
  onSuccess
}) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFollow = async () => {
    if (!user) {
      setError('Пожалуйста, войдите в систему');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Используем API метод с cookie-based authentication
      await customBackendAPI.followUser(authorId);

      setIsFollowing(true);
      setSuccess(true);
      
      // Успешная подписка - вызываем колбэк и закрываем через 2 секунды
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Заголовок */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Контент только для подписчиков
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Подпишитесь на автора, чтобы увидеть этот пост
          </p>
        </div>

        {/* Информация об авторе */}
        <div className="flex items-center justify-center mb-6">
          <div className="text-center">
            {authorAvatar && (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-purple-100 dark:border-purple-900"
              />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {authorName}
            </h3>
            {authorHandle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{authorHandle}
              </p>
            )}
          </div>
        </div>

        {/* Преимущества подписки */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            Что вы получите:
          </h4>
          <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-400">
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Доступ к эксклюзивному контенту</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Обновления и новые посты первыми</span>
            </li>
            <li className="flex items-start">
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>Прямое взаимодействие с автором</span>
            </li>
          </ul>
        </div>

        {/* Сообщения об ошибках и успехе */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 text-sm">
            Вы успешно подписались! Перенаправление...
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading || success}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          <button
            onClick={handleFollow}
            disabled={isLoading || isFollowing || success}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Подписка...</span>
              </>
            ) : success ? (
              <>
                <Check className="h-5 w-5" />
                <span>Подписаны</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Подписаться</span>
              </>
            )}
          </button>
        </div>

        {/* Дополнительная информация */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          Подписка бесплатна. Вы можете отписаться в любое время.
        </p>
      </div>
    </div>
  );
};
