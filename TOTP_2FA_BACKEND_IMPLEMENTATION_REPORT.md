# TOTP 2FA и Деактивация Аккаунта - Backend Реализация

**Дата**: 29 октября 2025  
**Статус**: Backend Core Complete ✅  
**Версия**: 1.0.0

## 📋 Выполненные Задачи

### ✅ 1. Криптография и Утилиты

#### `pkg/utils/encryption.go`
- ✅ AES-256-GCM шифрование для TOTP секретов
- ✅ Функции: `EncryptString()`, `DecryptString()`, `GenerateEncryptionKey()`
- ✅ Автоматическая проверка целостности данных
- ✅ Использует переменную окружения `ENCRYPTION_KEY` (32 байта)

#### `pkg/utils/totp.go`
- ✅ Генерация TOTP ключей (RFC 6238)
- ✅ Создание QR кодов (256x256 PNG, base64 data URL)
- ✅ Валидация 6-значных кодов с временным окном ±30 сек
- ✅ Генерация backup кодов (8 штук, формат XXXX-XXXX-XX)
- ✅ Форматирование секретов для отображения
- ✅ Совместимость: Google Authenticator, Microsoft Authenticator, Authy

### ✅ 2. Сервисы

#### `internal/services/security.go` (Обновлен)
**TOTP Методы:**
- ✅ `GenerateTOTPSecret()` - генерация секрета и QR кода
- ✅ `VerifyTOTPCode()` - проверка кода с расшифровкой секрета
- ✅ `EnableTOTP()` - включение 2FA с шифрованием секрета
- ✅ `DisableTOTP()` - отключение 2FA

**Особенности:**
- Секреты хранятся в зашифрованном виде
- Проверка существования пользователя
- Защита от повторного включения

#### `internal/services/account.go` (Создан)
**Методы деактивации:**
- ✅ `DeactivateAccount()` - деактивация с 30-дневным периодом восстановления
- ✅ `RestoreAccount()` - восстановление в течение 30 дней
- ✅ `PermanentlyDeleteAccount()` - полное удаление (транзакционное)
- ✅ `GetDeactivatedAccounts()` - получение аккаунтов для удаления
- ✅ `IsAccountDeactivated()` - проверка статуса
- ✅ `GetAccountRecoveryInfo()` - информация о восстановлении

**Удаляемые данные:**
- Профиль пользователя
- Все посты и комментарии
- Подписки (follows, likes, retweets, bookmarks)
- Уведомления
- Медиа файлы
- Сессии
- Попытки входа и блокировки
- Коды верификации

#### `internal/services/cleanup.go` (Создан)
**Автоматическая очистка:**
- ✅ `StartScheduledCleanup()` - запуск фоновых задач
- ✅ `CleanupDeactivatedAccounts()` - удаление через 30 дней (каждые 6 часов)
- ✅ `CleanupExpiredSessions()` - очистка сессий (каждый час)
- ✅ `CleanupExpiredCache()` - очистка кэша (каждые 30 минут)
- ✅ `CleanupOldLoginAttempts()` - удаление старых попыток входа (90 дней)
- ✅ `CleanupOldNotifications()` - удаление прочитанных уведомлений (30 дней)
- ✅ `PerformFullCleanup()` - полная очистка (для администраторов)
- ✅ `GetCleanupStats()` - статистика очистки

**Расписание:**
- Деактивированные аккаунты: каждые 6 часов
- Сессии: каждый час  
- Кэш: каждые 30 минут

### ✅ 3. API Handlers

#### `internal/api/totp_handlers.go` (Создан)
**6 Endpoints:**

1. ✅ **POST** `/api/totp/generate`
   - Генерация TOTP секрета и QR кода
   - Возвращает: secret, formatted_secret, qr_code, backup_codes
   - Временное хранение в кэше (15 минут)

2. ✅ **POST** `/api/totp/enable`
   - Проверка кода и включение 2FA
   - Body: `{ "code": "123456" }`
   - Шифрует и сохраняет секрет в БД

3. ✅ **POST** `/api/totp/disable`
   - Отключение 2FA с проверкой кода
   - Body: `{ "code": "123456" }`
   - Удаляет секрет из БД

4. ✅ **POST** `/api/totp/verify`
   - Проверка TOTP кода для sensitive операций
   - Body: `{ "code": "123456" }`
   - Возвращает: `{ "valid": true/false }`

5. ✅ **GET** `/api/totp/status`
   - Получение статуса 2FA
   - Возвращает: `{ "enabled": true, "has_backup_codes": false }`

6. ✅ **POST** `/api/totp/backup-codes/regenerate`
   - Генерация новых backup кодов
   - Body: `{ "code": "123456" }`
   - Возвращает: новые коды

**Особенности:**
- Все endpoints требуют аутентификации
- JSON сериализация для сложных объектов в кэше
- Детальные сообщения об ошибках

### ✅ 4. База Данных

#### Migration 009 (Применена локально)
**Добавленные поля в таблицу users:**
```sql
-- TOTP 2FA
totp_secret VARCHAR(255)           -- Зашифрованный секрет
totp_enabled BOOLEAN DEFAULT FALSE -- Статус 2FA

-- Деактивация аккаунта (30 дней)
deactivated_at TIMESTAMP           -- Дата деактивации
deletion_scheduled_at TIMESTAMP    -- Запланированное удаление
```

**Индексы:**
```sql
CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX idx_users_deactivated ON users(deactivated_at);
CREATE INDEX idx_users_deletion_scheduled ON users(deletion_scheduled_at);
```

**Статус:**
- ✅ Локальная БД (x18_backend): Применена
- ❌ Railway Production: Не применена (ручная инструкция готова)

### ✅ 5. Обновленные Модели

#### `internal/models/user.go`
```go
// TOTP 2FA fields
TOTPSecret  string `gorm:"size:255" json:"-"` // Скрыто из JSON
TOTPEnabled bool   `gorm:"default:false" json:"totp_enabled"`

// Account deactivation fields
DeactivatedAt       *time.Time `json:"deactivated_at,omitempty"`
DeletionScheduledAt *time.Time `json:"deletion_scheduled_at,omitempty"`
```

### ✅ 6. Зависимости

#### `go.mod`
```go
github.com/pquerna/otp v1.5.0                    // TOTP generation
github.com/boombuler/barcode v1.0.1-0....        // QR codes
```

## 📊 Прогресс Выполнения

### Backend Core (100%)
- [x] Создать pkg/utils/encryption.go
- [x] Создать pkg/utils/totp.go
- [x] Завершить internal/services/security.go
- [x] Создать internal/services/account.go
- [x] Создать internal/services/cleanup.go
- [x] Создать internal/api/totp_handlers.go
- [x] Migration 009 (применена локально)
- [x] Обновить internal/models/user.go
- [x] Все файлы компилируются успешно

### Осталось Сделать
- [ ] Создать internal/api/account_handlers.go (3 endpoint)
- [ ] Обновить cmd/server/main.go (регистрация роутов + cleanup)
- [ ] Применить migration 009 к Railway production
- [ ] Frontend: TOTP UI компоненты
- [ ] Frontend: Auto-save implementation
- [ ] Frontend: Profile fields simplification
- [ ] End-to-end тестирование

## 🔐 Требуемые Environment Variables

### Development
```bash
# custom-backend/.env
ENCRYPTION_KEY=<32-byte-base64-key>  # Для шифрования TOTP секретов
```

### Production (Railway)
```bash
# Добавить через Railway Dashboard
ENCRYPTION_KEY=<32-byte-base64-key>
```

**Генерация ключа:**
```bash
openssl rand -base64 32
```

## 🏗️ Архитектура

### TOTP Flow
```
1. User → POST /api/totp/generate
   ↓
2. Backend генерирует secret + QR code
   ↓
3. Сохраняет в Redis кэш (15 мин) + возвращает пользователю
   ↓
4. User сканирует QR в Authenticator App
   ↓
5. User → POST /api/totp/enable { "code": "123456" }
   ↓
6. Backend проверяет код → шифрует secret → сохраняет в PostgreSQL
   ↓
7. TOTP enabled ✅
```

### Account Deactivation Flow
```
1. User → POST /api/account/deactivate
   ↓
2. Backend: deactivated_at = NOW(), deletion_scheduled_at = NOW() + 30 days
   ↓
3. User может войти и восстановить аккаунт (POST /api/account/restore)
   ↓
4. Через 30 дней: CleanupService автоматически удаляет аккаунт
```

### Cleanup Service
```
Main Server Startup
   ↓
StartScheduledCleanup()
   ↓
   ├─→ Every 6 hours: CleanupDeactivatedAccounts()
   ├─→ Every 1 hour:  CleanupExpiredSessions()
   └─→ Every 30 min:  CleanupExpiredCache()
```

## 📝 API Endpoints Summary

### TOTP 2FA (6 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/totp/generate | ✅ | Generate TOTP secret + QR |
| POST | /api/totp/enable | ✅ | Enable 2FA |
| POST | /api/totp/disable | ✅ | Disable 2FA |
| POST | /api/totp/verify | ✅ | Verify TOTP code |
| GET | /api/totp/status | ✅ | Get 2FA status |
| POST | /api/totp/backup-codes/regenerate | ✅ | Regenerate backup codes |

### Account Management (3 endpoints - TODO)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/account/deactivate | ✅ | Deactivate account (30 days) |
| POST | /api/account/restore | ✅ | Restore deactivated account |
| GET | /api/account/recovery-info | ✅ | Get recovery info |

## 🔍 Следующие Шаги

### 1. Завершить Backend (осталось 2 файла)
```bash
# Создать account handlers
custom-backend/internal/api/account_handlers.go

# Обновить main.go
custom-backend/cmd/server/main.go
```

### 2. Применить Migration к Production
```bash
# Вручную через Railway Dashboard → PostgreSQL → Query
# Используя файл: RAILWAY_MIGRATION_009_MANUAL.md
```

### 3. Frontend Implementation
```typescript
// Компоненты для TOTP
client/components/security/TOTPSetup.tsx
client/components/security/TOTPVerify.tsx
client/hooks/useTOTP.ts

// Обновить ProfileSecuritySettings
client/components/socialProfile/ProfileSecuritySettings.tsx
```

### 4. Testing
- Unit тесты для TOTP utils
- Integration тесты для API
- E2E тесты для полного flow
- Load тесты для cleanup service

## 🎯 Ключевые Достижения

✅ **Безопасность**: AES-256-GCM шифрование TOTP секретов  
✅ **Стандарты**: RFC 6238 совместимость с популярными authenticator apps  
✅ **Надежность**: Транзакционное удаление данных, откат при ошибках  
✅ **Автоматизация**: Background cron jobs для cleanup  
✅ **Масштабируемость**: Redis кэширование, эффективные индексы  
✅ **Восстановление**: 30-дневный grace period для деактивированных аккаунтов  

## 📚 Документация

Созданные документы:
- ✅ `RAILWAY_MIGRATION_009_MANUAL.md` - Инструкция по применению миграции
- ✅ `PROFILE_SECURITY_ENHANCEMENTS_PROGRESS.md` - Детальный прогресс
- ✅ `TOTP_2FA_BACKEND_IMPLEMENTATION_REPORT.md` - Этот файл

## 🚀 Ready for Next Phase

Backend Core полностью готов к:
1. Регистрации роутов в main.go
2. Deployment на Railway
3. Frontend интеграции
4. Production тестирования

**Статус**: ✅ Backend Implementation Complete  
**Next**: Account Handlers + Route Registration + Frontend
