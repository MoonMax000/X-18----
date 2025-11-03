import imageCompression from 'browser-image-compression';

/**
 * Сжимает изображение перед загрузкой на сервер
 * Оптимизация трафика и ускорение загрузки
 */
export async function compressImage(file: File): Promise<File> {
  // Опции сжатия
  const options = {
    maxSizeMB: 2, // Макс размер 2MB
    maxWidthOrHeight: 2048, // Макс разрешение 2048px
    useWebWorker: true, // Использовать Web Worker для лучшей производительности
    fileType: 'image/jpeg', // Конвертировать в JPEG для лучшего сжатия
    initialQuality: 0.85, // Качество 85% (баланс между качеством и размером)
  };

  try {
    console.log('[ImageCompression] Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Сжимаем изображение
    const compressedFile = await imageCompression(file, options);
    
    console.log('[ImageCompression] Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('[ImageCompression] Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('[ImageCompression] Compression failed:', error);
    // Если сжатие не удалось, возвращаем оригинал
    return file;
  }
}

/**
 * Сжимает Blob перед загрузкой
 * Используется после crop операции
 */
export async function compressBlob(blob: Blob, filename: string = 'image.jpg'): Promise<File> {
  // Конвертируем Blob в File
  const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
  
  // Сжимаем
  return compressImage(file);
}
