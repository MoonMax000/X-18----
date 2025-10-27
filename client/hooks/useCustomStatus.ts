// useCustomStatus - Hook for managing post/status data from Custom Backend
import { useState, useEffect, useCallback } from 'react';
import { customBackendAPI, type Post } from '@/services/api/custom-backend';

interface UseCustomStatusReturn {
  post: Post | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  likePost: () => Promise<void>;
  unlikePost: () => Promise<void>;
  retweetPost: () => Promise<void>;
  unretweetPost: () => Promise<void>;
  bookmarkPost: () => Promise<void>;
  unbookmarkPost: () => Promise<void>;
  deletePost: () => Promise<void>;
}

export function useCustomStatus(postId: string): UseCustomStatusReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = useCallback(async () => {
    if (!postId) {
      setIsLoading(false);
      return;
    }

    try {
      const postData = await customBackendAPI.getPost(postId);
      setPost(postData);
      setError(null);
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err instanceof Error ? err.message : 'Failed to load post');
      setPost(null);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadPost();
  }, [loadPost]);

  const likePost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.likePost(postId);
      await refresh();
    } catch (err) {
      console.error('Error liking post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const unlikePost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.unlikePost(postId);
      await refresh();
    } catch (err) {
      console.error('Error unliking post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const retweetPost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.retweetPost(postId);
      await refresh();
    } catch (err) {
      console.error('Error retweeting post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const unretweetPost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.unretweetPost(postId);
      await refresh();
    } catch (err) {
      console.error('Error unretweeting post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const bookmarkPost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.bookmarkPost(postId);
      await refresh();
    } catch (err) {
      console.error('Error bookmarking post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const unbookmarkPost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.unbookmarkPost(postId);
      await refresh();
    } catch (err) {
      console.error('Error unbookmarking post:', err);
      throw err;
    }
  }, [postId, refresh]);

  const deletePost = useCallback(async () => {
    if (!postId) return;
    try {
      await customBackendAPI.deletePost(postId);
      setPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return {
    post,
    isLoading,
    error,
    refresh,
    likePost,
    unlikePost,
    retweetPost,
    unretweetPost,
    bookmarkPost,
    unbookmarkPost,
    deletePost,
  };
}
