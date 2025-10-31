import { useState } from 'react';
import { customBackendAPI } from '@/services/api/custom-backend';

// Статистика
export function useAdminStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить статистику');
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, error, fetchStats };
}

// Новости
export function useAdminNews() {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getAdminNews(params);
      // Backend возвращает объект {news: [...], total, limit, offset}
      // Нам нужен только массив новостей
      const newsArray = Array.isArray(data) ? data : (data as any)?.news || [];
      setNews(newsArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить новости');
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNews = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await customBackendAPI.createNews(data);
      await fetchNews();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать новость');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const updateNews = async (id: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await customBackendAPI.updateNews(id, data);
      await fetchNews();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить новость');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await customBackendAPI.deleteNews(id);
      await fetchNews();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить новость');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { news, isLoading, error, fetchNews, createNews, updateNews, deleteNews };
}

// Пользователи
export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getAdminUsers(params);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить пользователей');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await customBackendAPI.updateUserRole(userId, role);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось изменить роль пользователя');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { users, isLoading, error, fetchUsers, updateUserRole };
}

// Жалобы
export function useAdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customBackendAPI.getAdminReports(params);
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить жалобы');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const reviewReport = async (reportId: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await customBackendAPI.reviewReport(reportId, data);
      await fetchReports();
      return { success: true };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обработать жалобу');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { reports, isLoading, error, fetchReports, reviewReport };
}
