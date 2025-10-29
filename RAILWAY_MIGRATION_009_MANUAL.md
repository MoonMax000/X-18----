# 📝 Ручное применение миграции 009 к Railway PostgreSQL

## Проблема
Railway CLI имеет проблемы с выполнением SQL через командную строку. Применим миграцию вручную через Railway Dashboard.

---

## ✅ Решение: Применить миграцию через Railway Dashboard

### Шаг 1: Открыть Railway Dashboard
1. Перейти на https://railway.app
2. Войти в аккаунт
3. Выбрать проект **TT PROD1**
4. Выбрать **PostgreSQL** сервис

### Шаг 2: Открыть Query интерфейс
1. В PostgreSQL сервисе нажать на вкладку **Query**
2. Откроется SQL редактор

### Шаг 3: Скопировать и выполнить SQL

Скопируйте следующий SQL код и вставьте в Query редактор:

```sql
-- Migration 009: Add TOTP 2FA and Account Deactivation Fields
-- Description: Adds fields for TOTP authentication and 30-day account deactivation system

-- Add TOTP fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;

-- Add deactivation fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled);
CREATE INDEX IF NOT EXISTS idx_users_deactivated_at ON users(deactivated_at);
CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON users(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;

-- Add comments explaining fields
COMMENT ON COLUMN users.deactivated_at IS 'Timestamp when user requested account deactivation';
COMMENT ON COLUMN users.deletion_scheduled_at IS 'Timestamp when account will be permanently deleted (30 days after deactivation)';
COMMENT ON COLUMN users.totp_secret IS 'Encrypted TOTP secret for authenticator app';
COMMENT ON COLUMN users.totp_enabled IS 'Whether TOTP 2FA is enabled for this user';
```

### Шаг 4: Выполнить запрос
1. Нажать кнопку **Execute** или **Run**
2. Дождаться завершения выполнения
3. Проверить, что нет ошибок

### Шаг 5: Проверить результат

Выполните этот SQL для проверки:

```sql
-- Проверить что поля добавлены
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('totp_secret', 'totp_enabled', 'deactivated_at', 'deletion_scheduled_at');
```

**Ожидаемый результат:**
```
column_name              | data_type           | is_nullable
-------------------------|---------------------|------------
totp_secret              | character varying   | YES
totp_enabled             | boolean             | YES
deactivated_at           | timestamp           | YES
deletion_scheduled_at    | timestamp           | YES
```

### Шаг 6: Проверить индексы

```sql
-- Проверить индексы
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'users' 
AND indexname LIKE 'idx_users_%totp%' OR indexname LIKE 'idx_users_%deactivat%';
```

**Ожидаемый результат:**
```
indexname
------------------------------
idx_users_totp_enabled
idx_users_deactivated_at
idx_users_deletion_scheduled
```

---

## 📋 Что делает эта миграция

### Новые поля

1. **totp_secret** (VARCHAR 255)
   - Хранит зашифрованный TOTP секрет
   - Используется для генерации 6-значных кодов
   - Будет зашифрован с помощью AES-256-GCM

2. **totp_enabled** (BOOLEAN)
   - Флаг включения TOTP 2FA
   - По умолчанию FALSE
   - Пользователь должен настроить TOTP перед включением

3. **deactivated_at** (TIMESTAMP)
   - Время когда пользователь деактивировал аккаунт
   - NULL если аккаунт активен
   - Используется для 30-дневного периода восстановления

4. **deletion_scheduled_at** (TIMESTAMP)  
   - Запланированное время удаления (deactivated_at + 30 дней)
   - Cron job будет проверять это поле ежедневно
   - После этой даты аккаунт удаляется безвозвратно

### Индексы для производительности

- `idx_users_totp_enabled` - быстрая фильтрация пользователей с TOTP
- `idx_users_deactivated_at` - поиск деактивированных аккаунтов  
- `idx_users_deletion_scheduled` - partial index для cron job

---

## 🔒 Безопасность

### TOTP Secret Encryption
- Секреты будут шифроваться перед сохранением в БД
- Используется AES-256-GCM
- Ключ шифрования хранится в переменных окружения

### Account Deactivation
- Soft delete - данные не удаляются сразу
- 30 дней на восстановление
- Автоматическое удаление через cron job

---

## ✅ После выполнения миграции

Миграция успешно применена! Теперь можно:

1. ✅ Продолжить разработку TOTP функционала
2. ✅ Реализовать endpoint'ы для TOTP
3. ✅ Создать UI для настройки 2FA
4. ✅ Реализовать деактивацию аккаунтов

---

## 🎯 Следующие шаги

1. Реализовать TOTP generation и verification
2. Создать encryption utilities
3. Добавить API endpoints
4. Создать Frontend UI
5. Тестирование

---

**Дата:** 29.10.2025  
**Статус:** Готово к ручному применению  
**Приоритет:** Высокий
