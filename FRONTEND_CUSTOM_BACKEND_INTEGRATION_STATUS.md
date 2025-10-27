# Статус интеграции фронтенда с Custom Backend

## ✅ Выполнено

### 1. Создана инфраструктура Custom Backend API
- **`client/services/api/custom-backend.ts`** - Полный адаптер API
  - Все эндпоинты custom backend реализованы
  - Users, Posts, Timeline, Notifications, Media, Search
  - Типы данных полностью определены
  
### 2. Создан Auth сервис
- **`client/services/auth/custom-backend-auth.ts`** - Аутентификация
  - Регистрация (username, email, password)
  - Логин (email, password)
  - Logout с вызовом backend
  - JWT token management (Access + Refresh)
  - Auto-refresh механизм готов к реализации

### 3. Создан Timeline хук
- **`client/hooks/useCustomTimeline.ts`** - Timeline управление
  - Поддержка home, explore, trending
  - Пагинация (before/after курсоры)
  - Auto-refresh с настраиваемым интервалом
  - Load more функциональность
  - Оптимистичные обновления

### 4. Обновлены модальные окна
- **`client/components/auth/LoginModal.tsx`** ✅
  - Использует customAuth.login()
  - Правильная работа с JWT токенами
  
- **`client/components/auth/SignUpModal.tsx`** ✅
  - Использует customAuth.register()
  - Автоматический логин после регистрации
  - Токены сохраняются автоматически

### 5. Создан план миграции
- **`CUSTOM_BACKEND_MIGRATION_PLAN.md`**
  - Полный список файлов для обновления
  - Приоритеты (1-4)
  - Различия в API структуре
  - План тестирования

## 🔄 Следующие шаги

### Приоритет 1: Компоненты Feed
1. **FeedTest.tsx** - Обновить useGTSTimeline → useCustomTimeline
2. **QuickComposer.tsx** - Обновить createStatus, uploadMedia

### Приоритет 2: Дополнительные хуки
3. **useCustomProfile.ts** - Создать (аналог useGTSProfile)
4. **useCustomStatus.ts** - Создать (аналог useGTSStatus)
5. **useCustomNotifications.ts** - Создать (аналог useGTSNotifications)

### Приоритет 3: Страницы профилей
6. **ProfilePage.tsx** - Обновить getCurrentAccount
7. **OtherProfilePage.tsx** - Обновить useGTSProfile
8. **ProfileConnections.tsx** - Обновить getCurrentAccount

### Приоритет 4: Остальные компоненты
9. **SocialPostDetail.tsx** - Обновить типы и API
10. **SocialNotifications.tsx** - Обновить типы и API
11. **ProfileContentClassic.tsx** - Обновить типы
12. **ProfilePageLayout.tsx** - Обновить типы

## 📊 Прогресс: 4/14 (29%)

## 🧪 Готово к тестированию

### Можно протестировать сейчас:
1. ✅ **Регистрация** - SignUpModal с custom backend
2. ✅ **Логин** - LoginModal с custom backend
3. ✅ **JWT токены** - Сохранение и использование

### Требуется custom backend:
```bash
cd custom-backend
go run cmd/server/main.go
```

### Проверка API:
```bash
# Health check
curl http://localhost:8080/health

# API info
curl http://localhost:8080/api/
```

## 🔧 Конфигурация

### .env.local (уже настроен)
```env
VITE_API_URL=http://localhost:8080/api
VITE_BACKEND_TYPE=custom
```

### Различия в эндпоинтах

| Действие | GoToSocial | Custom Backend |
|----------|------------|----------------|
| Регистрация | `/api/v1/accounts` (OAuth) | `/api/auth/register` (Direct) |
| Логин | OAuth flow | `/api/auth/login` (JWT) |
| Timeline home | `/api/v1/timelines/home` | `/api/timeline/home` |
| Create post | `/api/v1/statuses` | `/api/posts/` |
| Like post | `/api/v1/statuses/:id/favourite` | `/api/posts/:id/like` |
| User profile | `/api/v1/accounts/verify_credentials` | `/api/users/me` |

### Различия в типах

```typescript
// GoToSocial → Custom Backend

GTSStatus → Post {
  account → user
  favourites_count → likes_count
  reblogs_count → retweets_count
}

GTSAccount → User {
  // Структура похожа, но названия полей немного отличаются
}
```

## 📝 Важные замечания

1. **Токены**: Custom backend использует JWT (Access 15 мин, Refresh 30 дней)
2. **CORS**: Настроен для localhost:5173 и localhost:3000
3. **Middleware**: Все protected эндпоинты требуют `Authorization: Bearer <token>`
4. **Пагинация**: Использует курсоры (before/after) вместо max_id/min_id
5. **Metadata**: Custom backend поддерживает произвольные metadata для постов

## 🎯 Рекомендации по тестированию

### 1. Тест регистрации
```
1. Открыть фронтенд (localhost:5173)
2. Открыть Sign Up modal
3. Ввести email и пароль
4. Нажать Create account
5. Проверить в консоли браузера успешную регистрацию
6. Проверить что токены сохранены в localStorage
```

### 2. Тест логина
```
1. Открыть Login modal
2. Ввести зарегистрированный email и пароль
3. Нажать Sign In
4. Проверить успешный логин в консоли
5. Проверить токены в localStorage
```

### 3. Проверка токенов
```javascript
// В консоли браузера:
localStorage.getItem('custom_token')
localStorage.getItem('custom_refresh_token')
localStorage.getItem('custom_user')
```

## 🚀 Следующий релиз

После успешного тестирования auth:
1. Обновить FeedTest.tsx для работы с timeline
2. Создать недостающие хуки (Profile, Status, Notifications)
3. Обновить все страницы профилей
4. Полное интеграционное тестирование

## 📞 Поддержка

При возникновении проблем проверьте:
1. Custom backend запущен и доступен
2. .env.local правильно настроен
3. CORS настроен в backend
4. Токены корректно сохраняются
5. API эндпоинты доступны
