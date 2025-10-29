/**
 * Утилита для генерации аватарок с инициалами пользователя
 */

// Палитра цветов для фонов аватарок
const AVATAR_COLORS = [
  '#FF6B6B', // Красный
  '#4ECDC4', // Бирюзовый
  '#45B7D1', // Голубой
  '#96CEB4', // Зеленый
  '#FECA57', // Желтый
  '#48DBFB', // Светло-голубой
  '#FF9FF3', // Розовый
  '#54A0FF', // Синий
  '#A29BFE', // Фиолетовый
  '#FD79A8', // Светло-розовый
];

/**
 * Генерирует цвет фона на основе ID пользователя
 */
export function getAvatarColor(userId: string): string {
  // Используем hash от userId для стабильного выбора цвета
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Извлекает инициалы из имени пользователя
 */
export function getInitials(displayName: string | null, username: string): string {
  // Если есть display_name, используем его
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      // Берем первые буквы первых двух слов
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      // Берем первые две буквы одного слова
      return parts[0].slice(0, 2).toUpperCase();
    }
  }
  
  // Используем username как fallback
  return username.slice(0, 2).toUpperCase();
}

/**
 * Генерирует SVG data URL для аватарки с инициалами
 */
export function generateAvatarDataURL(
  userId: string,
  displayName: string | null,
  username: string,
  size: number = 100
): string {
  const initials = getInitials(displayName, username);
  const backgroundColor = getAvatarColor(userId);
  
  // Определяем контрастный цвет текста (белый или черный)
  const rgb = parseInt(backgroundColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF';
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size / 8}"/>
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="'Inter', system-ui, sans-serif" 
        font-size="${size * 0.4}" 
        font-weight="600" 
        fill="${textColor}"
      >${initials}</text>
    </svg>
  `.trim();
  
  // Конвертируем в data URL
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
}

/**
 * Компонент React для рендера аватарки
 */
export interface AvatarGeneratorProps {
  userId: string;
  displayName: string | null;
  username: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

/**
 * Получает URL аватарки или генерирует её с инициалами
 */
export function getAvatarUrl(props: Omit<AvatarGeneratorProps, 'className'>): string {
  const { avatarUrl, userId, displayName, username, size = 100 } = props;
  
  // Если есть загруженная аватарка, используем её
  if (avatarUrl && avatarUrl.trim()) {
    return avatarUrl;
  }
  
  // Генерируем аватарку с инициалами
  return generateAvatarDataURL(userId, displayName, username, size);
}

/**
 * Проверяет, является ли URL сгенерированной аватаркой
 */
export function isGeneratedAvatar(url: string): boolean {
  return url.startsWith('data:image/svg+xml');
}

/**
 * Хук для управления аватаркой
 */
export function useGeneratedAvatar(props: Omit<AvatarGeneratorProps, 'className'>) {
  const avatarUrl = getAvatarUrl(props);
  const isGenerated = isGeneratedAvatar(avatarUrl);
  
  return {
    avatarUrl,
    isGenerated,
    initials: getInitials(props.displayName, props.username),
    backgroundColor: getAvatarColor(props.userId),
  };
}
