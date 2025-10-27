# Исправление синхронизации состояния подписки

## Проблема
После предыдущего исправления функционала подписки, кнопка Follow не синхронизировалась с реальным состоянием подписки на бэкенде:
- При загрузке страницы профиля кнопка всегда показывала "Follow"
- Если пользователь уже подписан, клик на "Follow" вызывал ошибку 409 "Already following this user"
- Ошибка повторялась многократно при повторных кликах

## Причина
`useFollow` хук инициализировался с пустым состоянием `{}`, не учитывая реальное состояние подписки:
```typescript
const { followUser, unfollowUser, isFollowing: isFollowingUser } = useFollow({});
```

При этом `useCustomUserProfile` хук мог определить, подписан ли текущий пользователь, проверяя список followers, но это значение не передавалось в `useFollow`.

## Решение

### 1. Исправлены TypeScript ошибки в useCustomUserProfile.ts
**Файл**: `client/hooks/useCustomUserProfile.ts`

Добавлен импорт `useMemo` и исправлена логика определения подписки:
```typescript
import { useState, useEffect, useCallback, useMemo } from 'react';

// Check if current user is following this profile
const isFollowing = useMemo(() => {
  if (!profile || !followers.length) return false;
  const currentUserId = localStorage.getItem('custom_user_id');
  if (!currentUserId) return false;
  return followers.some(f => f.id === currentUserId);
}, [profile, followers]);
```

**Изменения**:
- Добавлен импорт `useMemo`
- Исправлено `profileData` → `profile` (переменная не существовала)
- Хук теперь корректно возвращает `isFollowing: boolean`

### 2. Обновлен OtherProfilePage.tsx для запроса followers
**Файл**: `client/pages/OtherProfilePage.tsx`

Добавлен запрос списка подписчиков и передача состояния подписки:
```typescript
const { profile, posts, isFollowing, isLoading, error } = useCustomUserProfile({
  username,
  fetchPosts: true,
  fetchFollowers: true, // Needed to determine if current user is following this profile
});

return <ProfilePageLayout 
  isOwnProfile={isOwnProfile} 
  profile={gtsProfile} 
  posts={gtsPosts} 
  initialFollowingState={isFollowing} 
/>;
```

**Изменения**:
- Добавлен параметр `fetchFollowers: true` для загрузки списка подписчиков
- Извлечено значение `isFollowing` из хука
- Передано `initialFollowingState={isFollowing}` в ProfilePageLayout

### 3. Обновлен ProfilePageLayout.tsx для инициализации состояния
**Файл**: `client/components/socialProfile/ProfilePageLayout.tsx`

Добавлен параметр для начального состояния подписки:
```typescript
interface ProfilePageLayoutProps {
  isOwnProfile: boolean;
  profile?: GTSAccount | null;
  posts?: GTSStatus[];
  initialFollowingState?: boolean; // NEW
}

export default function ProfilePageLayout({ 
  isOwnProfile, 
  profile, 
  posts, 
  initialFollowingState = false 
}: ProfilePageLayoutProps) {
  // Initialize follow state with the actual following status from backend
  const initialState = profile?.id ? { [profile.id]: initialFollowingState } : {};
  const { followUser, unfollowUser, isFollowing: isFollowingUser } = useFollow(initialState);
```

**Изменения**:
- Добавлен опциональный параметр `initialFollowingState?: boolean`
- Создается `initialState` объект с ID профиля и реальным статусом подписки
- `useFollow` инициализируется с правильным состоянием вместо `{}`

## Как это работает

1. **Загрузка страницы профиля**:
   - `OtherProfilePage` вызывает `useCustomUserProfile` с `fetchFollowers: true`
   - Бэкенд возвращает список подписчиков профиля
   
2. **Определение состояния подписки**:
   - `useCustomUserProfile` проверяет, есть ли ID текущего пользователя в списке followers
   - Возвращает `isFollowing: true/false`
   
3. **Инициализация UI**:
   - `OtherProfilePage` передает `isFollowing` в `ProfilePageLayout`
   - `ProfilePageLayout` создает `initialState = { [profileId]: isFollowing }`
   - `useFollow` инициализируется с правильным состоянием
   
4. **Отображение кнопки**:
   - Если `isFollowing === true`, кнопка показывает "Following"
   - Если `isFollowing === false`, кнопка показывает "Follow"
   - Повторный клик не вызывает ошибку 409

## Результат

✅ Кнопка Follow/Following корректно отображает текущее состояние подписки  
✅ Нет ошибки 409 при клике на уже подписанного пользователя  
✅ Состояние синхронизируется между UI и бэкендом  
✅ Обновление состояния работает через API (followUser/unfollowUser)

## Тестирование

Для проверки исправления:

1. Авторизуйтесь под пользователем A
2. Откройте профиль пользователя B
3. Нажмите "Follow" - кнопка должна измениться на "Following"
4. Обновите страницу (F5)
5. Кнопка должна остаться "Following" (не сбрасываться на "Follow")
6. При клике на "Following" должна произойти отписка без ошибок
7. Проверьте в уведомлениях пользователя B - должно прийти уведомление о подписке

## Связанные файлы

- `client/hooks/useCustomUserProfile.ts` - хук для загрузки профилей с расчетом isFollowing
- `client/hooks/useFollow.ts` - хук для управления подписками
- `client/pages/OtherProfilePage.tsx` - страница профиля другого пользователя
- `client/components/socialProfile/ProfilePageLayout.tsx` - layout компонент профиля
- `client/components/socialProfile/ProfileContentClassic.tsx` - контент профиля
- `client/components/socialProfile/ProfileHero.tsx` - хедер профиля с кнопкой Follow
- `custom-backend/internal/api/users.go` - бэкенд API для подписок и уведомлений
