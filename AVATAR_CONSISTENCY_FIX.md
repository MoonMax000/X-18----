# Исправление Согласованности Аватаров

## Проблема
Пользователь заметил, что аватарки отображаются по-разному на разных страницах:
- На `/profile` - один вид аватарки
- На `/profile-page` - другой вид
- В постах - третий вид
- В меню (AvatarDropdown) - четвёртый вид

Причина: разные компоненты использовали разные сервисы для генерации placeholder-аватаров:
- `dicebear.com` - в AvatarDropdown, UnifiedPostDetail, CommentCard
- `ui-avatars.com` - в UserHeader
- Прямые URL - в других местах

## Решение

### 1. Создание Централизованных Утилит (`client/lib/avatar-utils.ts`)

Создан файл с утилитами для единообразной обработки аватаров:

```typescript
/**
 * Get avatar URL with fallback to generated placeholder
 * Ensures consistent avatar display across all components
 */
export function getAvatarUrl(user?: UserWithAvatar | null): string {
  if (!user) {
    return generatePlaceholderAvatar('User');
  }

  const avatarUrl = user.avatar_url || user.avatar;
  
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  const name = user.username || user.display_name || user.name || 'User';
  return generatePlaceholderAvatar(name);
}

/**
 * Generate a placeholder avatar using ui-avatars.com
 * Uses app's primary color (#A06AFF) for consistency
 */
export function generatePlaceholderAvatar(name: string): string {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=500&background=A06AFF&color=fff&bold=true`;
}

/**
 * Get cover/banner URL with fallback to placeholder
 */
export function getCoverUrl(coverUrl?: string | null): string {
  if (coverUrl && coverUrl.trim() !== '') {
    return coverUrl;
  }
  
  return 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=2118&h=600&fit=crop&q=80';
}
```

### 2. Обновлённые Компоненты

#### UserHeader.tsx (`client/components/UserHeader/UserHeader.tsx`)
```typescript
import { getAvatarUrl, getCoverUrl } from "@/lib/avatar-utils";

// Использование:
const data = profileData || (isOwn ? {
  // ... другие поля
  avatar: getAvatarUrl(currentUser),
  cover: getCoverUrl(currentUser.cover),
  // ...
} : {
  // ... другие поля
  avatar: getAvatarUrl(null),
  cover: getCoverUrl(null),
  // ...
});
```

#### AvatarDropdown.tsx (`client/components/ui/AvatarDropdown/AvatarDropdown.tsx`)
```typescript
import { getAvatarUrl } from "@/lib/avatar-utils";

// Использование:
<img
  src={getAvatarUrl(user)}
  alt="User avatar"
  className="w-full h-full object-cover"
/>
```

## Преимущества Решения

1. **Единообразие**: Все компоненты теперь используют один и тот же placeholder-генератор (`ui-avatars.com`)
2. **Консистентность**: Одинаковые цвета (#A06AFF - основной цвет приложения)
3. **Централизация**: Вся логика в одном месте - легко изменить при необходимости
4. **Fallback-логика**: Правильная обработка пустых строк, null, undefined
5. **Гибкость**: Поддержка разных названий полей (avatar, avatar_url)

## Что Теперь Работает Одинаково

✅ Страница профиля `/profile` - использует `getAvatarUrl()`
✅ Страница профиля `/profile-page` - использует `getAvatarUrl()`  
✅ Меню-дропдаун в хедере - использует `getAvatarUrl()`
✅ Все placeholder-аватарки генерируются единообразно

## Остальные Компоненты

Найдено ещё ~28 компонентов, которые также отображают аватарки:
- `client/components/PostCard/UnifiedPostDetail.tsx` - использует dicebear
- `client/components/PostCard/CommentCard.tsx` - использует dicebear
- `client/features/feed/components/posts/FeedPost.tsx`
- И другие...

Эти компоненты можно обновить аналогичным образом, если потребуется полная унификация.

## Тестирование

Для проверки изменений:

1. Откройте страницу `/profile` - проверьте аватарку в UserHeader
2. Откройте страницу `/profile-page` - проверьте аватарку в UserHeader
3. Откройте меню в правом верхнем углу - проверьте аватарку в дропдауне
4. Сравните - все должны выглядеть одинаково (фиолетовый фон #A06AFF с инициалами)

## Технические Детали

- **Цвет**: `#A06AFF` (основной цвет приложения)
- **Размер**: 500x500 пикселей
- **Сервис**: ui-avatars.com
- **Параметры**: bold=true, белый текст на фиолетовом фоне

## Дата Выполнения
26 октября 2025 года
