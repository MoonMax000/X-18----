/**
 * Создает обрезанное изображение из исходного изображения
 * используя координаты обрезки
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Устанавливаем размер canvas равным размеру обрезанной области
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Рисуем обрезанную часть изображения
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Конвертируем canvas в blob URL
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 'image/jpeg');
  });
}

/**
 * Создает HTMLImageElement из URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Освобождает blob URL из памяти
 */
export function revokeCroppedImg(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
