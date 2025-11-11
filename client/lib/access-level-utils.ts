/**
 * Утилиты для работы с access level
 * Нормализация значений между фронтендом и бэкендом
 */

/**
 * Тип для клиентских значений access level
 */
export type AccessLevelClient = 
  | 'public' 
  | 'paid' 
  | 'subscribers' 
  | 'followers' 
  | 'premium';

/**
 * Тип для всех возможных значений от бэкенда (включая legacy)
 */
export type AccessLevelBackend = 
  | 'free'              // legacy
  | 'public'            // новое
  | 'pay-per-post'      // legacy  
  | 'paid'              // новое
  | 'subscribers-only'  // legacy
  | 'subscribers'       // упрощенное
  | 'followers-only'    // legacy
  | 'followers'         // упрощенное
  | 'premium';

/**
 * Нормализует значение accessLevel от бэкенда к единому формату
 * Обрабатывает как старые (free, pay-per-post, *-only), так и новые значения
 */
export function normalizeAccessLevel(level?: string | null): AccessLevelClient {
  if (!level) return 'public';
  
  const normalized = level.toLowerCase().trim();
  
  // Маппинг всех возможных значений
  const mapping: Record<string, AccessLevelClient> = {
    // Legacy values
    'free': 'public',
    'pay-per-post': 'paid',
    'subscribers-only': 'subscribers',
    'followers-only': 'followers',
    
    // Current values
    'public': 'public',
    'paid': 'paid',
    'subscribers': 'subscribers',
    'followers': 'followers',
    'premium': 'premium'
  };
  
  return mapping[normalized] || 'public';
}

/**
 * Проверяет, является ли пост заблокированным для текущего пользователя
 */
export function isPostLocked(params: {
  accessLevel?: string | null;
  isPurchased?: boolean;
  isSubscriber?: boolean;
  isFollower?: boolean;
  isOwnPost: boolean;
}): boolean {
  const { accessLevel, isPurchased, isSubscriber, isFollower, isOwnPost } = params;
  
  // Свои посты всегда открыты
  if (isOwnPost) return false;
  
  // Нормализуем access level
  const normalized = normalizeAccessLevel(accessLevel);
  
  // Публичные посты всегда открыты
  if (normalized === 'public') return false;
  
  // Проверяем доступ в зависимости от типа
  switch (normalized) {
    case 'paid':
      return !isPurchased;
    
    case 'subscribers':
      return !isSubscriber;
    
    case 'followers':
      return !isFollower;
    
    case 'premium':
      return !isSubscriber && !isPurchased;
    
    default:
      return false;
  }
}

/**
 * Получает человеко-читаемое название для access level
 */
export function getAccessLevelLabel(level?: string | null): string {
  const normalized = normalizeAccessLevel(level);
  
  const labels: Record<AccessLevelClient, string> = {
    'public': 'Public',
    'paid': 'Pay-per-post',
    'subscribers': 'Subscribers only',
    'followers': 'Followers only',
    'premium': 'Premium'
  };
  
  return labels[normalized];
}
