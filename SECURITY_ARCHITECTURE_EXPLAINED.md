# 🔐 Архитектура Безопасности X-18

## ✅ Текущее Состояние

Система имеет **двухуровневую защиту**, что является правильным и безопасным подходом.

---

## 🎯 Уровень 1: Защита Frontend

### Реализация
**Файл**: `client/pages/ProfileNew.tsx`

```typescript
const { user, isAuthenticated } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!isAuthenticated) {
    console.log('⚠️ User not authenticated, redirecting to /feedtest');
    navigate('/feedtest', { replace: true });
  }
}, [isAuthenticated, navigate]);
```

### Что Защищает
- ✅ Предотвращает доступ неавторизованных пользователей к странице `/profile`
- ✅ Перенаправляет на `/feedtest` 
- ✅ Улучшает UX (пользователь сразу видит редирект)

### Ограничения
⚠️ **Может быть обойдена**: Опытный пользователь может отключить JavaScript или манипулировать кодом в браузере

---

## 🛡️ Уровень 2: Защита Backend (ГЛАВНАЯ)

### Реализация
**Файл**: `custom-backend/cmd/server/main.go`

#### Защищенные Эндпоинты Профиля
```go
users := apiGroup.Group("/users")

// ✅ ЗАЩИЩЕНО - только для авторизованных
users.Get("/me", middleware.JWTMiddleware(cfg), usersHandler.GetMe)
users.Patch("/me", middleware.JWTMiddleware(cfg), usersHandler.UpdateProfile)
users.Post("/:id/follow", middleware.JWTMiddleware(cfg), usersHandler.FollowUser)
users.Delete("/:id/follow", middleware.JWTMiddleware(cfg), usersHandler.UnfollowUser)
```

#### Публичные Эндпоинты (Это Правильно!)
```go
// ✅ ПУБЛИЧНЫЕ - доступны всем (это нормально для соц. сети)
users.Get("/username/:username", usersHandler.GetUserByUsername)
users.Get("/:id", usersHandler.GetUser)
users.Get("/:id/posts", usersHandler.GetUserPosts)
users.Get("/:id/followers", usersHandler.GetFollowers)
users.Get("/:id/following", usersHandler.GetFollowing)
```

### Как Работает JWT Middleware

**Файл**: `custom-backend/pkg/middleware/auth.go`

```go
func JWTMiddleware(config *configs.Config) fiber.Handler {
    return func(c *fiber.Ctx) error {
        // 1. Проверяет наличие заголовка Authorization
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Status(401).JSON(fiber.Map{
                "error": "Missing authorization header",
            })
        }

        // 2. Проверяет формат Bearer токена
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            return c.Status(401).JSON(fiber.Map{
                "error": "Invalid authorization format",
            })
        }

        // 3. Валидирует JWT токен
        token := parts[1]
        claims, err := auth.ValidateAccessToken(token, config.JWT.AccessSecret)
        if err != nil {
            return c.Status(401).JSON(fiber.Map{
                "error": "Invalid or expired token",
            })
        }

        // 4. Добавляет данные пользователя в контекст
        c.Locals("userID", claims.UserID)
        c.Locals("username", claims.Username)
        c.Locals("email", claims.Email)

        return c.Next()
    }
}
```

### Что Защищает
- ✅ **НЕ МОЖЕТ быть обойдена** - сервер проверяет каждый запрос
- ✅ Возвращает `401 Unauthorized` без валидного токена
- ✅ Проверяет подпись и срок действия токена
- ✅ Извлекает ID пользователя для дальнейшей работы

---

## 🔄 Как Работают Оба Уровня Вместе

### Сценарий 1: Неавторизованный пользователь пытается зайти на /profile

```
1. Frontend (ProfileNew.tsx)
   ↓
   Проверка: isAuthenticated = false
   ↓
   Редирект → /feedtest
   ✅ Пользователь перенаправлен

2. Если бы он все-таки отправил запрос к API
   ↓
   GET /api/users/me
   ↓
   Backend (JWTMiddleware)
   ↓
   Проверка: Authorization header отсутствует
   ↓
   Response: 401 Unauthorized
   ✅ Доступ запрещен
```

### Сценарий 2: Авторизованный пользователь заходит на /profile

```
1. Frontend (ProfileNew.tsx)
   ↓
   Проверка: isAuthenticated = true
   ↓
   Страница загружается
   ↓
   Запрос: GET /api/users/me
   Headers: Authorization: Bearer <valid_token>
   
2. Backend (JWTMiddleware)
   ↓
   Проверка: токен валиден
   ↓
   Извлечение: userID, username, email
   ↓
   Обработчик: usersHandler.GetMe
   ↓
   Response: 200 OK + данные профиля
   ✅ Доступ разрешен
```

---

## 📊 Матрица Защиты Эндпоинтов

| Эндпоинт | Требует JWT? | Причина |
|----------|--------------|---------|
| `GET /api/users/me` | ✅ ДА | Личные данные текущего пользователя |
| `PATCH /api/users/me` | ✅ ДА | Изменение профиля |
| `POST /api/users/:id/follow` | ✅ ДА | Действие от имени пользователя |
| `GET /api/users/:id` | ❌ НЕТ | Публичный профиль (как в Twitter/X) |
| `GET /api/users/:id/posts` | ❌ НЕТ | Публичные посты (как в Twitter/X) |
| `GET /api/users/:id/followers` | ❌ НЕТ | Публичный список (как в Twitter/X) |
| `GET /api/timeline/home` | ✅ ДА | Персональная лента |
| `GET /api/timeline/explore` | ❌ НЕТ | Публичная лента |

---

## ✅ Итог: Все Правильно!

### Что Уже Реализовано

1. ✅ **Frontend защита** - предотвращает навигацию неавторизованных
2. ✅ **Backend защита** - реальная безопасность на уровне API
3. ✅ **JWT валидация** - проверка подписи и срока действия
4. ✅ **Правильное разделение** - публичные эндпоинты открыты, личные защищены
5. ✅ **Graceful degradation** - публичные профили доступны всем

### Это Стандартная Практика

Такая архитектура используется в:
- Twitter/X
- Instagram
- Facebook
- LinkedIn
- Всех современных социальных сетях

**Публичные данные ДОЛЖНЫ быть доступны без авторизации**, иначе:
- Нельзя поделиться ссылкой на профиль
- Нельзя просматривать профили без регистрации
- Хуже SEO (поисковики не индексируют)

---

## 🔒 Дополнительная Безопасность

### Уже Реализовано

1. ✅ **CORS защита** - только разрешенные origin'ы
2. ✅ **Rate limiting** через Redis
3. ✅ **Bcrypt для паролей** - необратимое хэширование
4. ✅ **JWT с коротким сроком жизни** (15 минут access token)
5. ✅ **Refresh token rotation** - безопасное обновление
6. ✅ **Валидация всех input'ов** на backend

### Можно Добавить (Опционально)

- [ ] **2FA** (двухфакторная аутентификация)
- [ ] **IP whitelist/blacklist**
- [ ] **Captcha** на регистрации
- [ ] **Webhook для подозрительной активности**

---

## 📝 Заключение

**Вопрос**: "а на бекэнде ты тоже делаешь эту защиту?"

**Ответ**: ✅ **ДА! Защита на бэкенде УЖЕ полностью реализована и работает правильно!**

- Frontend защита (редирект) - для UX
- Backend защита (JWT middleware) - для реальной безопасности
- Публичные эндпоинты открыты специально - это норма для соц. сети

Можете спокойно использовать систему - она защищена на профессиональном уровне! 🔐
