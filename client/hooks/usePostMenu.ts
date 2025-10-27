import { useState } from 'react';
import { customBackendAPI } from '../services/api/custom-backend';

interface UsePostMenuOptions {
  postId: string;
  authorId: string;
  onSuccess?: (action: 'delete' | 'pin' | 'report' | 'block') => void;
  onError?: (error: string) => void;
}

export function usePostMenu({ postId, authorId, onSuccess, onError }: UsePostMenuOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await customBackendAPI.deletePost(postId);
      onSuccess?.('delete');
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
      onError?.(error instanceof Error ? error.message : 'Не удалось удалить пост');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePin = async () => {
    try {
      setIsLoading(true);
      if (isPinned) {
        await customBackendAPI.unpinPost(postId);
        setIsPinned(false);
      } else {
        await customBackendAPI.pinPost(postId);
        setIsPinned(true);
      }
      onSuccess?.('pin');
    } catch (error) {
      console.error('Ошибка при закреплении поста:', error);
      onError?.(error instanceof Error ? error.message : 'Не удалось закрепить пост');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = async (reason: string) => {
    try {
      setIsLoading(true);
      await customBackendAPI.reportPost(postId, reason);
      onSuccess?.('report');
    } catch (error) {
      console.error('Ошибка при отправке жалобы:', error);
      onError?.(error instanceof Error ? error.message : 'Не удалось отправить жалобу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockAuthor = async () => {
    try {
      setIsLoading(true);
      await customBackendAPI.blockUser(authorId);
      onSuccess?.('block');
    } catch (error) {
      console.error('Ошибка при блокировке пользователя:', error);
      onError?.(error instanceof Error ? error.message : 'Не удалось заблокировать пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPinned,
    handleDelete,
    handlePin,
    handleReport,
    handleBlockAuthor,
  };
}
