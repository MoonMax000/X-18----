# План миграции фронтенда на Custom Backend

## Статус миграции

### ✅ Завершено
1. **Создан адаптер Custom Backend API** (`client/services/api/custom-backend.ts`)
   - Все эндпоинты custom backend реализованы
   - Типы данных определены
   
2. **Создан auth сервис** (`client/services/auth/custom-backend-auth.ts`)
   - Регистрация, логин, logout
   - Работа с JWT токенами
   - Refresh token механизм
   
3. **Создан хук для timeline** (`client/hooks/useCustomTimeline.ts`)
   - Поддержка home, explore, trending
   - Пагинация и auto-refresh

4. **Обновлены модальные окна**
   - ✅ LoginModal.tsx - использует customAuth

### 🔄 Требует обновления

#### Приоритет 1 (Критические компоненты)
1. **SignUpModal.tsx** - использует gtsAuth вместо customAuth
2. **FeedTest.tsx** - использует useGTSTimeline
3. **QuickComposer.tsx** - использует createStatus, uploadMedia из gotosocial

#### Приоритет 2 (Страницы)
4. **ProfileConnections.tsx** - использует getCurrentAccount
5. **ProfilePage.tsx** - использует getCurrentAccount, GTSAccount
6. **OtherProfilePage.tsx** - использует getCurrentAccount, useGTSProfile
7. **SocialPostDetail.tsx** - использует getCurrentAccount, GTSStatus
8. **SocialNotifications.tsx** - использует useGTSStatus, GTSNotification

#### Приоритет 3 (Хуки)
9. **useGTSProfile.ts** - создать useCustomProfile
10. **useGTSStatus.ts** - создать useCustomStatus
11. **useGTSNotifications.ts** - создать useCustomNotifications

#### Приоритет 4 (Компоненты)
12. **ProfileContentClassic.tsx** - типы GTSAccount, GTSStatus
13. **ProfilePageLayout.tsx** - типы GTSAccount, GTSStatus

## Различия в API структуре

### GoToSocial → Custom Backend

| Функция | GoToSocial | Custom Backend |
|---------|------------|----------------|
| Базовый URL | `/api/v1/` | `/api/` |
| Регистрация | OAuth flow | `/auth/register` |
| Timeline | `/timelines/home` | `/timeline/home` |
| Создание поста | `/statuses` | `/posts/` |
| Лайк | `/statuses/:id/favourite` | `/posts/:id/like` |
| Ретвит | `/statuses/:id/reblog` | `/posts/:id/retweet` |
| Профиль | `/accounts/verify_credentials` | `/users/me` |

### Различия в типах данных

```typescript
// GoToSocial
GTSStatus {
  id, content, account, favourites_count, reblogs_count
}

GTSAccount {
  id, username, display_name, followers_count
}

// Custom Backend
Post {
  id, content, user, likes_count, retweets_count
}

User {
  id, username, display_name, followers_count
}
```

## План действий

### Шаг 1: Обновить критические компоненты ✅
- [x] LoginModal.tsx
- [ ] SignUpModal.tsx
- [ ] FeedTest.tsx
- [ ] QuickComposer.tsx

### Шаг 2: Создать недостающие хуки
- [ ] useCustomProfile.ts
- [ ] useCustomStatus.ts
- [ ] useCustomNotifications.ts

### Шаг 3: Обновить страницы профиля
- [ ] ProfilePage.tsx
- [ ] OtherProfilePage.tsx
- [ ] ProfileConnections.tsx

### Шаг 4: Обновить остальные компоненты
- [ ] SocialPostDetail.tsx
- [ ] SocialNotifications.tsx
- [ ] ProfileContentClassic.tsx
- [ ] ProfilePageLayout.tsx

### Шаг 5: Тестирование
- [ ] Регистрация и логин
- [ ] Загрузка timeline
- [ ] Создание постов
- [ ] Лайки и ретвиты
- [ ] Профили пользователей
- [ ] Уведомления

## Заметки

- Custom backend использует JWT токены (15 мин access, 30 дней refresh)
- Все эндпоинты защищены JWT middleware (кроме auth и public endpoints)
- CORS настроен для localhost:5173 и localhost:3000
- Базовый URL настраивается через VITE_API_URL в .env.local
