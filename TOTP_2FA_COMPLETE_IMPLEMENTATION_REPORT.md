# TOTP 2FA и Account Management - Полная Реализация

## 📋 Обзор

Реализована полная система двухфакторной аутентификации (TOTP 2FA) и управления аккаунтами с 30-дневным периодом восстановления.

---

## ✅ Реализованные Компоненты

### Backend (Go)

#### 1. **Encryption Utils** (`custom-backend/pkg/utils/encryption.go`)
- AES-256-GCM шифрование для TOTP секретов
- Функции: `EncryptString()`, `DecryptString()`, `GenerateEncryptionKey()`
- Использует environment variable `ENCRYPTION_KEY` (32 bytes hex)

#### 2. **TOTP Utils** (`custom-backend/pkg/utils/totp.go`)
- Генерация TOTP ключей по стандарту RFC 6238
- QR код генерация (256x256 PNG, base64)
- Валидация кодов с time skew ±30 секунд
- Генерация backup кодов (8 кодов формата XXXX-XXXX-XX)
- Использует библиотеку `github.com/pquerna/otp`

#### 3. **Security Service** (`custom-backend/internal/services/security.go`)
- `GenerateTOTPSecret()` - генерация нового секрета
- `VerifyTOTPCode()` - проверка кода с учетом backup кодов
- `EnableTOTP()` - активация 2FA
- `DisableTOTP()` - деактивация 2FA

#### 4. **Account Service** (`custom-backend/internal/services/account.go`)
- `DeactivateAccount()` - деактивация с 30-дневным периодом
- `RestoreAccount()` - восстановление аккаунта
- `PermanentlyDeleteAccount()` - окончательное удаление
- `GetDeactivatedAccounts()` - получение списка деактивированных
- `IsAccountDeactivated()` - проверка статуса
- `GetAccountRecoveryInfo()` - информация о восстановлении

#### 5. **Cleanup Service** (`custom-backend/internal/services/cleanup.go`)
- Автоматическая очистка по расписанию:
  - Деактивированные аккаунты (каждые 6 часов)
  - Expired sessions (каждый час)
  - Expired cache (каждые 30 минут)
- Запускается в горутине при старте сервера

#### 6. **TOTP Handlers** (`custom-backend/internal/api/totp_handlers.go`)
- `POST /api/totp/generate` - генерация TOTP секрета и QR кода
- `POST /api/totp/enable` - включение 2FA с верификацией кода
- `POST /api/totp/disable` - отключение 2FA
- `POST /api/totp/verify` - проверка TOTP кода
- `GET /api/totp/status` - получение статуса 2FA
- `POST /api/totp/backup-codes/regenerate` - регенерация backup кодов

#### 7. **Account Handlers** (`custom-backend/internal/api/account_handlers.go`)
- `POST /api/account/deactivate` - деактивация аккаунта
- `POST /api/account/restore` - восстановление аккаунта
- `GET /api/account/recovery-info` - информация о восстановлении

#### 8. **Database Migration** (`009_add_totp_and_deactivation_fields.sql`)
```sql
-- TOTP поля
totp_secret TEXT
totp_enabled BOOLEAN DEFAULT FALSE
totp_backup_codes TEXT[]

-- Account deactivation поля
is_deactivated BOOLEAN DEFAULT FALSE
deactivated_at TIMESTAMP
deletion_scheduled_at TIMESTAMP
deactivation_reason TEXT

-- Индексы для производительности
CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX idx_users_is_deactivated ON users(is_deactivated);
CREATE INDEX idx_users_deletion_scheduled ON users(deletion_scheduled_at);
```

### Frontend (React + TypeScript)

#### 1. **useTOTP Hook** (`client/hooks/useTOTP.ts`)
```typescript
interface Functions {
  getTOTPStatus(): Promise<TOTPStatus | null>
  generateTOTP(): Promise<TOTPSetupData | null>
  enableTOTP(code: string): Promise<boolean>
  disableTOTP(code: string): Promise<boolean>
  verifyTOTP(code: string): Promise<boolean>
  regenerateBackupCodes(code: string): Promise<string[] | null>
}
```

#### 2. **useAccountManagement Hook** (`client/hooks/useAccountManagement.ts`)
```typescript
interface Functions {
  getRecoveryInfo(): Promise<AccountRecoveryInfo | null>
  deactivateAccount(reason?: string): Promise<DeactivationResult | null>
  restoreAccount(): Promise<boolean>
}
```

#### 3. **ProfileSecuritySettings Component** (обновлен)
- Интегрированы TOTP и Account Management хуки
- **TOTP Setup Modal** с:
  - QR код дисплей
  - Manual entry код
  - 6-значный input для верификации
  - Отображение backup кодов после активации
  - Copy и Download функции для backup кодов
- **TOTP Disable Modal** с верификацией кода
- **Account Deactivation** интерфейс:
  - 30-дневное предупреждение
  - Поле для причины деактивации
  - Confirmation input (DELETE)
  - Отображение статуса деактивированного аккаунта
  - Кнопка восстановления

---

## 🔐 Безопасность

### Encryption
- TOTP секреты зашифрованы AES-256-GCM
- Ключ шифрования хранится в environment variable
- Генерация ключа: `openssl rand -hex 32`

### TOTP Стандарты
- RFC 6238 compliant
- 6-значные коды
- 30-секундный window
- SHA1 hash algorithm
- 8 backup кодов (XXXX-XXXX-XX format)

### Account Protection
- 30-дневный grace period перед удалением
- Автоматическая cleanup cron job
- Возможность восстановления в течение периода
- Логирование причины деактивации

---

## 🗄️ Database Schema

```sql
-- users table additions
ALTER TABLE users ADD COLUMN totp_secret TEXT;
ALTER TABLE users ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN totp_backup_codes TEXT[];
ALTER TABLE users ADD COLUMN is_deactivated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deletion_scheduled_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deactivation_reason TEXT;
```

---

## 📦 Dependencies

### Backend
```go
require (
    github.com/pquerna/otp v1.5.0
    github.com/boombuler/barcode v1.0.1
)
```

### Frontend
Использует существующие зависимости:
- React hooks
- lucide-react icons
- authFetch для API запросов

---

## 🚀 Deployment Checklist

### Local Development
- [x] Backend компилируется без ошибок
- [x] Миграция 009 создана
- [x] ENCRYPTION_KEY добавлен в `.env`
- [x] Cleanup service запущен

### Production (Railway)
- [ ] Применить миграцию 009 к базе данных
- [ ] Добавить ENCRYPTION_KEY в environment variables
- [ ] Перезапустить backend service
- [ ] Проверить работу cleanup service

---

## 📝 Testing Guide

### TOTP 2FA Testing

1. **Enable 2FA:**
   ```
   1. Перейти в Profile → Security Settings → Two-Factor Auth
   2. Нажать "Enable 2FA"
   3. Сканировать QR код в authenticator app
   4. Ввести 6-значный код
   5. Сохранить backup коды
   ```

2. **Verify 2FA:**
   ```
   1. Logout
   2. Login снова
   3. Ввести TOTP код при запросе
   ```

3. **Disable 2FA:**
   ```
   1. Перейти в Security Settings
   2. Нажать "Disable 2FA"
   3. Ввести текущий TOTP код для подтверждения
   ```

4. **Backup Codes:**
   ```
   1. Использовать backup код вместо TOTP при login
   2. Backup код можно использовать только один раз
   3. Regenerate backup codes при необходимости
   ```

### Account Deactivation Testing

1. **Deactivate Account:**
   ```
   1. Profile → Security Settings → Delete Account
   2. Ввести причину (опционально)
   3. Ввести "DELETE" для подтверждения
   4. Проверить отображение 30-day warning
   ```

2. **Restore Account:**
   ```
   1. Login в течение 30 дней
   2. Нажать "Restore My Account"
   3. Подтвердить восстановление
   ```

3. **Auto Deletion:**
   ```
   1. Подождать 30+ дней
   2. Cleanup service автоматически удалит аккаунт
   3. Login должен показать "Account not found"
   ```

---

## 🔧 API Endpoints

### TOTP Endpoints
```
POST   /api/totp/generate            - Generate TOTP secret & QR code
POST   /api/totp/enable              - Enable 2FA with code verification
POST   /api/totp/disable             - Disable 2FA with code verification
POST   /api/totp/verify              - Verify TOTP code
GET    /api/totp/status              - Get 2FA status
POST   /api/totp/backup-codes/regenerate - Regenerate backup codes
```

### Account Management Endpoints
```
POST   /api/account/deactivate       - Deactivate account
POST   /api/account/restore          - Restore deactivated account
GET    /api/account/recovery-info    - Get recovery information
```

---

## 📊 Cron Jobs

### Cleanup Service Schedule
```go
- Deactivated Accounts: Every 6 hours
  → Deletes accounts where deletion_scheduled_at < NOW()
  
- Expired Sessions: Every 1 hour
  → Removes sessions where last_active > 30 days
  
- Expired Cache: Every 30 minutes
  → Clears Redis keys with expired TTL
```

---

## 🎨 UI Components

### TOTP Setup Flow
1. **Generation Modal**
   - QR код (256x256)
   - Formatted secret для manual entry
   - Copy button для секрета
   - 6-digit verification input

2. **Backup Codes Display**
   - Grid layout (2 columns)
   - Copy all button
   - Download as .txt button
   - Safety warning

3. **Disable Modal**
   - TOTP code verification
   - Confirmation buttons
   - Error display

### Account Deactivation Flow
1. **Warning Display**
   - 30-day recovery period
   - Consequences explanation
   - Reason input (optional)

2. **Confirmation**
   - "DELETE" typing confirmation
   - Red destructive button
   - Disable until confirmed

3. **Deactivated Status**
   - Deletion date display
   - Days remaining counter
   - Restore button

---

## 📈 Performance Considerations

### Database Indexing
```sql
CREATE INDEX idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX idx_users_is_deactivated ON users(is_deactivated);
CREATE INDEX idx_users_deletion_scheduled ON users(deletion_scheduled_at);
```

### Caching Strategy
- TOTP temp secrets кэшируются в Redis (5 минут TTL)
- Backup codes генерируются on-demand
- Account recovery info кэшируется (1 час TTL)

---

## 🐛 Known Limitations

1. **TOTP Time Sync**
   - Требует синхронизированное время на сервере
   - ±30 секунд tolerance window

2. **Backup Codes**
   - Используются только один раз
   - Нужно regenerate после использования нескольких кодов

3. **Account Deletion**
   - Необратимо после 30 дней
   - Все связанные данные удаляются (posts, follows, etc.)

---

## 📚 Resources

### Standards
- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [RFC 4226 - HOTP](https://tools.ietf.org/html/rfc4226)

### Libraries
- [pquerna/otp](https://github.com/pquerna/otp) - Go TOTP library
- [boombuler/barcode](https://github.com/boombuler/barcode) - QR code generation

### Authenticator Apps
- Google Authenticator (iOS, Android)
- Microsoft Authenticator (iOS, Android)
- Authy (iOS, Android, Desktop)

---

## ✅ Status: COMPLETE

Все компоненты реализованы и готовы к тестированию. Следующие шаги:

1. **Apply Migration 009** к production database
2. **Add ENCRYPTION_KEY** to Railway environment
3. **Test TOTP flow** end-to-end
4. **Test Account deactivation** и restore
5. **Verify Cleanup service** работает корректно

---

**Дата завершения:** 29.10.2025
**Автор:** Cline AI Assistant
