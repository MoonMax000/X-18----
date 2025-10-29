# Отчет о внедрении TOTP-защиты для критичных операций

## Дата: 29.10.2025
## Статус: ✅ Backend готов

---

## 🎯 Что сделано

### 1. ✅ Middleware для TOTP верификации

Создан файл `custom-backend/pkg/middleware/totp_required.go`:

- **TOTPRequired** - требует TOTP код для доступа к эндпоинту
  - Проверяет заголовок `X-TOTP-Code`
  - Валидирует 6-значный TOTP код
  - Возвращает `403` с флагом `requires_totp: true` если код отсутствует/неверен

- **TOTPOptional** - проверяет TOTP только если он включен у пользователя
  - Устанавливает `totp_enabled` и `totp_verified` в контексте
  - Позволяет пропустить если TOTP не активирован

### 2. ✅ SecurityService расширен

Добавлены методы в `custom-backend/internal/services/security.go`:

```go
// Проверяет, включен ли TOTP у пользователя
func (s *SecurityService) GetUserTOTPStatus(userID uint) (bool, error)

// Верифицирует TOTP код (6 цифр)
func (s *SecurityService) VerifyTOTPCode(userID uint, code string) (bool, error)
```

**Примечание:** Поддержка backup кодов будет добавлена в будущем обновлении.

### 3. ✅ Protected Operations Handler

Создан файл `custom-backend/internal/api/protected_operations.go` с тремя защищенными операциями:

#### a) Смена пароля
**POST** `/api/auth/password/change`
- Требует TOTP код если активирован
- Валидирует текущий пароль
- Проверяет силу нового пароля
- Отзывает все сессии кроме текущей

#### b) Смена email
**POST** `/api/users/email/change`
- Требует TOTP код если активирован
- Валидирует текущий пароль
- Проверяет формат email
- Генерирует код верификации для нового email
- Помечает email как неверифицированный

#### c) Смена телефона
**POST** `/api/users/phone/change`
- Требует TOTP код если активирован
- Валидирует текущий пароль
- Проверяет формат телефона (новая функция `ValidatePhone`)
- Генерирует код верификации для нового номера
- Помечает телефон как неверифицированный

### 4. ✅ Валидация телефона

Добавлена функция в `custom-backend/pkg/utils/validation.go`:

```go
func ValidatePhone(phone string) (bool, string)
```

Проверяет:
- Минимум 10 цифр
- Максимум 20 символов
- Поддерживает форматы: `+1234567890`, `(123) 456-7890`, `123-456-7890`

### 5. ✅ Маршруты зарегистрированы

В `custom-backend/cmd/server/main.go` добавлены защищенные маршруты:

```go
// Смена пароля
auth.Post("/password/change",
    middleware.JWTMiddleware(cfg),
    middleware.TOTPRequired(securityService),
    protectedOpsHandler.ChangePassword)

// Смена email
users.Post("/email/change",
    middleware.JWTMiddleware(cfg),
    middleware.TOTPRequired(securityService),
    protectedOpsHandler.ChangeEmail)

// Смена телефона
users.Post("/phone/change",
    middleware.JWTMiddleware(cfg),
    middleware.TOTPRequired(securityService),
    protectedOpsHandler.ChangePhone)
```

### 6. ✅ Компиляция успешна

Backend успешно компилируется без ошибок.

---

## 📋 Следующие шаги

### Backend (Production)

1. **Применить миграцию 009 на Railway**
   ```bash
   # Подключиться к базе данных Railway
   psql $DATABASE_URL
   
   # Применить миграцию
   \i custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql
   ```

2. **Добавить ENCRYPTION_KEY в Railway**
   ```bash
   railway variables --set ENCRYPTION_KEY="your-32-character-secret-key-here"
   ```
   
   Или сгенерировать ключ:
   ```bash
   openssl rand -base64 32
   ```

3. **Задеплоить backend на Railway**
   ```bash
   git add .
   git commit -m "Add TOTP-protected operations"
   git push origin main
   ```

### Frontend

#### 1. Модальное окно TOTP верификации

Создать компонент для ввода TOTP кода:

```typescript
// client/components/auth/TOTPVerificationModal.tsx

interface TOTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  operation: string; // "change password", "change email", etc.
}
```

**Функционал:**
- Инпут для 6-значного кода
- Автофокус при открытии
- Валидация (только цифры, 6 символов)
- Кнопка "Verify" с loading state
- Показ ошибок
- Ссылка на "Открыть authenticator app"

#### 2. Интеграция в ProfileSecuritySettings

Обновить `client/components/socialProfile/ProfileSecuritySettings.tsx`:

```typescript
// Перед сменой пароля/email/phone
if (user.totp_enabled) {
  // Показать TOTPVerificationModal
  const code = await showTOTPModal();
  
  // Отправить запрос с кодом в заголовке
  await fetch('/api/auth/password/change', {
    method: 'POST',
    headers: {
      'X-TOTP-Code': code,
      // ...
    },
    body: JSON.stringify({ /* ... */ })
  });
}
```

#### 3. Упрощение полей профиля

В настройках профиля оставить только:
- **Full Name** (объединить First Name + Last Name)
- **Username**

Убрать отдельные поля First Name и Last Name.

#### 4. Auto-save функционал

Добавить debounced auto-save при изменении полей:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // Показать "Saving..."
    setSavingStatus('saving');
    
    // Сохранить изменения
    await updateProfile(data);
    
    // Показать "Saved ✓"
    setSavingStatus('saved');
    
    // Скрыть через 2 секунды
    setTimeout(() => setSavingStatus(null), 2000);
  }, 1000); // debounce 1 секунда
  
  return () => clearTimeout(timer);
}, [fullName, username]);
```

---

## 🔒 Как работает защита

### 1. Пользователь без TOTP

```
POST /api/auth/password/change
Authorization: Bearer jwt_token
Body: { current_password, new_password }

Response: 200 OK ✅
```

### 2. Пользователь с TOTP - без кода

```
POST /api/auth/password/change
Authorization: Bearer jwt_token
Body: { current_password, new_password }

Response: 403 Forbidden
{
  "error": "TOTP code required",
  "requires_totp": true,
  "totp_code_missing": true
}
```

### 3. Пользователь с TOTP - с кодом

```
POST /api/auth/password/change
Authorization: Bearer jwt_token
X-TOTP-Code: 123456
Body: { current_password, new_password }

Response: 200 OK ✅
```

---

## 🧪 Тестирование

### Локальное тестирование

1. Запустить backend:
   ```bash
   ./START_CUSTOM_BACKEND_STACK.sh
   ```

2. Включить TOTP для тестового пользователя:
   ```bash
   curl -X POST http://localhost:8080/api/totp/generate \
     -H "Authorization: Bearer $TOKEN"
   ```

3. Попробовать сменить пароль без кода:
   ```bash
   curl -X POST http://localhost:8080/api/auth/password/change \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"current_password":"old","new_password":"new123456"}'
   
   # Должен вернуть 403 с requires_totp: true
   ```

4. Попробовать с TOTP кодом:
   ```bash
   curl -X POST http://localhost:8080/api/auth/password/change \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -H "X-TOTP-Code: 123456" \
     -d '{"current_password":"old","new_password":"new123456"}'
   
   # Должен вернуть 200 OK
   ```

---

## 📊 Архитектура безопасности

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (React)                                       │
│  ┌────────────────────────────────────────────────┐   │
│  │  1. User initiates sensitive operation         │   │
│  │     (change password/email/phone)               │   │
│  └────────────────────────────────────────────────┘   │
│                       │                                 │
│                       ▼                                 │
│  ┌────────────────────────────────────────────────┐   │
│  │  2. Check if user has TOTP enabled             │   │
│  │     (from user profile state)                   │   │
│  └────────────────────────────────────────────────┘   │
│                       │                                 │
│          ┌────────────┴────────────┐                   │
│          ▼                          ▼                   │
│  ┌──────────────┐         ┌──────────────────┐        │
│  │  TOTP OFF    │         │  TOTP ON         │        │
│  │  Send direct │         │  Show TOTP modal │        │
│  └──────────────┘         └──────────────────┘        │
│          │                          │                   │
│          │                          ▼                   │
│          │                ┌──────────────────┐        │
│          │                │  Get 6-digit code│        │
│          │                │  from user       │        │
│          │                └──────────────────┘        │
│          │                          │                   │
│          └───────────┬──────────────┘                   │
│                      ▼                                   │
│          ┌─────────────────────────┐                   │
│          │  Send HTTP request with │                   │
│          │  X-TOTP-Code header     │                   │
│          └─────────────────────────┘                   │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (Go/Fiber)                                     │
│  ┌────────────────────────────────────────────────┐   │
│  │  JWT Middleware                                 │   │
│  │  • Validates JWT token                          │   │
│  │  • Sets user_id in context                      │   │
│  └────────────────────────────────────────────────┘   │
│                       │                                 │
│                       ▼                                 │
│  ┌────────────────────────────────────────────────┐   │
│  │  TOTP Required Middleware                       │   │
│  │  • Checks if user has TOTP enabled              │   │
│  │  • If enabled, validates X-TOTP-Code header     │   │
│  │  • Calls SecurityService.VerifyTOTPCode()       │   │
│  └────────────────────────────────────────────────┘   │
│                       │                                 │
│          ┌────────────┴────────────┐                   │
│          ▼                          ▼                   │
│  ┌──────────────┐         ┌──────────────────┐        │
│  │  Invalid code│         │  Valid code      │        │
│  │  Return 403  │         │  Continue to     │        │
│  │  requires_totp         │  handler         │        │
│  └──────────────┘         └──────────────────┘        │
│                                     │                   │
│                                     ▼                   │
│  ┌────────────────────────────────────────────────┐   │
│  │  Protected Operation Handler                    │   │
│  │  • Validates current password                   │   │
│  │  • Updates password/email/phone                 │   │
│  │  • Generates verification codes if needed       │   │
│  │  • Returns success response                     │   │
│  └────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist завершения

**Backend:**
- [x] Middleware TOTPRequired создан
- [x] SecurityService.VerifyTOTPCode добавлен
- [x] ProtectedOperationsHandler создан
- [x] Валидация телефона добавлена
- [x] Маршруты зарегистрированы
- [x] Компиляция успешна
- [ ] Миграция 009 применена на Railway
- [ ] ENCRYPTION_KEY добавлен в Railway
- [ ] Backend задеплоен на Railway

**Frontend:**
- [ ] TOTPVerificationModal создан
- [ ] Интегрирован в ProfileSecuritySettings
- [ ] Поля профиля упрощены (Full Name + Username)
- [ ] Auto-save реализован
- [ ] Тестирование пройдено

---

## 📝 Примечания

1. **Backup коды** - будут добавлены в следующем обновлении
2. **Rate limiting** - уже применяется через AuthRateLimiter
3. **Session revocation** - при смене пароля все сессии кроме текущей отзываются
4. **Email/Phone verification** - после смены генерируются новые коды верификации

---

## 🎯 Итог

Реализована полная backend-часть TOTP-защиты для критичных операций:
- ✅ Смена пароля требует TOTP
- ✅ Смена email требует TOTP
- ✅ Смена телефона требует TOTP

Остается только:
1. Применить миграцию на Production
2. Добавить ENCRYPTION_KEY
3. Реализовать frontend UI

**Система готова к деплою!** 🚀
