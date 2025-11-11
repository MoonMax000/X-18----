# 📐 Архитектура Ленты Постов - Руководство

## 🎯 Текущая Проблема

**Симптом**: Посты отображаются по-разному в разных местах
- ✅ Лента (FeedTest.tsx) - работает правильно с preview
- ❌ Профиль (@kyvaldov) - использует старые моковые данные

**Причина**: Фрагментированная архитектура с несколькими источниками данных

---

## ✅ Правильная Архитектура

### 1. **Единый Компонент Posts**
```
FeedPost (features/feed/components/posts/FeedPost.tsx)
├── Поддерживает ALL функции
├── Preview text для платных постов
├── Toggle для автора
├── LockedPostPlaceholder
└── Используется ВЕЗДЕ
```

###  2. **Единый Источник Данных**
```typescript
// ❌ НЕ ИСПОЛЬЗОВАТЬ
- SocialPost[] из data/socialPosts.ts (моки)
- Трансформации в разных местах

// ✅ ИСПОЛЬЗОВАТЬ
import { customBackendAPI } from '@/services/api/custom-backend';

// Для ленты
const posts = await customBackendAPI.getExploreTimeline();

// Для профиля
const posts = await customBackendAPI.getUserPosts(userId);
```

### 3. **Тип Post из API**
```typescript
import type { Post } from '@/services/api/custom-backend';

// Уже содержит ВСЕ поля:
interface Post {
  id: string;
  content: string;        // Платный контент (может быть пустым)
  previewText?: string;   // Бесплатный preview
  accessLevel: string;
  priceCents: number;
  isPurchased: boolean;
  isSubscriber: boolean;
  // ... все остальные поля
}
```

---

## 🔧 Как Исправить Profile Page

### Вариант 1: Обновить ProfileTweetsClassic (РЕКОМЕНДУЕТСЯ)

```typescript
// client/components/socialProfile/ProfileTweetsClassic.tsx

import FeedPost from "@/features/feed/components/posts/FeedPost";
import type { Post } from "@/services/api/custom-backend"; // ✅ Использовать API тип
import { customBackendAPI } from "@/services/api/custom-backend";
import { useEffect, useState } from "react";

interface ProfileTweetsClassicProps {
  userId: string; // ✅ Принимать userId вместо массива постов
}

export default function ProfileTweetsClassic({ userId }: ProfileTweetsClassicProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const userPosts = await customBackendAPI.getUserPosts(userId);
        setPosts(userPosts);
      } catch (error) {
        console.error('Failed to load user posts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, [userId]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex w-full flex-col items-center pt-3 sm:pt-4 md:pt-6">
      {posts.map((post, index) => (
        <FeedPost
          key={post.id}
          post={post} // ✅ Передаем напрямую из API без трансформации
          isFollowing={false}
          onFollowToggle={() => {}}
          showTopBorder={index === 0}
        />
      ))}
    </div>
  );
}
```

### Вариант 2: Использовать useUserPosts Hook

```typescript
import { useUserPosts } from "@/hooks/useUserPosts";

export default function ProfileTweetsClassic({ userId }: { userId: string }) {
  const { posts, isLoading } = useUserPosts(userId);
  
  // Остальное так же...
}
```

---

## 📋 План Миграции

### Шаг 1: Обновить компоненты профиля
- [ ] ProfileTweetsClassic - использовать API вместо моков
- [ ] ProfilePageLayout - передавать userId вместо mock posts
- [ ] UnifiedProfilePage - убрать загрузку моковых данных

### Шаг 2: Удалить старый код
- [ ] Удалить `data/socialPosts.ts` (моковые данные)
- [ ] Удалить функцию `transformToPost` из ProfileTweetsClassic
- [ ] Удалить VideoPost.tsx (старый компонент)

### Шаг 3: Универсализировать FeedPost
- [x] Поддержка previewText ✅
- [x] Toggle для автора ✅
- [x] Backend защита контента ✅
- [ ] Использование во ВСЕХ местах приложения

---

## 🔒 Безопасность (УЖЕ РЕАЛИЗОВАНО)

### Backend Filtering (post_dto.go)
```go
// ✅ Контент фильтруется на сервере
if !hasAccess && post.PreviewText != "" {
    content = ""        // Скрываем платный контент
    contentHTML = ""
}
```

### Frontend Display (FeedPost.tsx)
```typescript
// ✅ Правильная логика отображения
const isPurchasedWithPreview = (!isLocked || (isOwnPost && !isAuthorPreviewMode)) 
  && post.previewText && post.text;

const textToShow = isPurchasedWithPreview 
  ? `${post.previewText}\n\n${post.text}` // Оба текста
  : (isLocked && post.previewText ? post.previewText : post.text); // Только preview
```

---

## 📊 Текущий Статус

### ✅ Работает Правильно:
- FeedTest.tsx (основная лента)
- Backend API защита контента
- QuickComposer с previewText
- FeedPost с toggle preview

### ⚠️ Требует Обновления:
- ProfileTweetsClassic - использует моковые данные
- ProfilePageLayout - передает моковые данные
- SocialOverview - возможно тоже использует моки

---

## 💡 Рекомендация

**ЕДИНАЯ ТОЧКА ВХОДА** для всех компонентов отображения постов:

```typescript
// features/feed/components/UniversalFeed.tsx
export function UniversalFeed({ 
  source: 'timeline' | 'user-posts' | 'following',
  userId?: string 
}) {
  // Загружаем данные из API
  // Отображаем через FeedPost
  // Все в одном месте!
}
```

Это обеспечит консистентность отображения везде.
