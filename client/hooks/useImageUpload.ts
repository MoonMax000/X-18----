import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { compressBlob } from '@/lib/image-compression';
import { customBackendAPI } from '@/services/api/custom-backend';
import { useAuth } from '@/contexts/AuthContext';

export interface UseImageUploadReturn {
  uploadAvatar: (blob: Blob) => Promise<string>;
  uploadCover: (blob: Blob) => Promise<string>;
  uploadProgress: number;
  isUploading: boolean;
  uploadType: 'avatar' | 'cover' | null;
}

/**
 * Centralized hook for image upload functionality
 * Handles compression, progress tracking, and API calls
 * Used across UserHeader, ProfileHero, and EditProfileModal
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const { refreshUser } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'avatar' | 'cover' | null>(null);

  /**
   * Upload file with XMLHttpRequest for progress tracking
   */
  const uploadWithProgress = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('custom_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch (err) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${baseUrl}/api/media/upload`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }, []);

  /**
   * Upload avatar with compression and profile update
   */
  const uploadAvatar = useCallback(async (blob: Blob): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadType('avatar');
      setUploadProgress(0);
      
      console.log('[useImageUpload] Starting avatar upload...');
      
      // Compress before upload
      console.log('[useImageUpload] Compressing avatar...');
      const file = await compressBlob(blob, 'avatar.jpg');
      
      // Upload to backend with progress
      const mediaUrl = await uploadWithProgress(file);
      console.log('[useImageUpload] Upload successful:', mediaUrl);
      
      // Update profile with new avatar URL
      console.log('[useImageUpload] Updating profile with new avatar...');
      await customBackendAPI.updateProfile({
        avatar_url: mediaUrl,
      });
      console.log('[useImageUpload] Profile updated');
      
      // Update global auth context
      console.log('[useImageUpload] Refreshing auth context...');
      await refreshUser();
      
      toast.success('Аватар успешно обновлен');
      return mediaUrl;
    } catch (error) {
      console.error('[useImageUpload] Failed to upload avatar:', error);
      toast.error('Ошибка при сохранении аватара');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadType(null);
      setUploadProgress(0);
    }
  }, [uploadWithProgress, refreshUser]);

  /**
   * Upload cover with compression and profile update
   */
  const uploadCover = useCallback(async (blob: Blob): Promise<string> => {
    try {
      setIsUploading(true);
      setUploadType('cover');
      setUploadProgress(0);
      
      console.log('[useImageUpload] Starting cover upload...');
      
      // Compress before upload
      console.log('[useImageUpload] Compressing cover...');
      const file = await compressBlob(blob, 'cover.jpg');
      
      // Upload to backend with progress
      const mediaUrl = await uploadWithProgress(file);
      console.log('[useImageUpload] Upload successful:', mediaUrl);
      
      // Update profile with new header URL
      console.log('[useImageUpload] Updating profile with new cover...');
      await customBackendAPI.updateProfile({
        header_url: mediaUrl,
      });
      console.log('[useImageUpload] Profile updated');
      
      // Update global auth context
      console.log('[useImageUpload] Refreshing auth context...');
      await refreshUser();
      
      toast.success('Обложка успешно обновлена');
      return mediaUrl;
    } catch (error) {
      console.error('[useImageUpload] Failed to upload cover:', error);
      toast.error('Ошибка при сохранении обложки');
      throw error;
    } finally {
      setIsUploading(false);
      setUploadType(null);
      setUploadProgress(0);
    }
  }, [uploadWithProgress, refreshUser]);

  return {
    uploadAvatar,
    uploadCover,
    uploadProgress,
    isUploading,
    uploadType,
  };
};
