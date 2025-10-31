# Исправление Session Tracking - Простая Инструкция

## Проблема
User Sessions показывает мок-данные вместо реальной информации об устройствах.

## Решение
Добавлены поля для отслеживания устройств в таблицу `sessions`.

## Что было сделано

### 1. ✅ Обновлена модель Session
**Файл:** `custom-backend/internal/models/relations.go`
- Добавлены поля: `device_type`, `browser`, `os`, `ip_address`, `user_agent`, `last_active_at`

### 2. ✅ Обновлена функция CreateSession
**Файл:** `custom-backend/internal/services/security.go`
- Теперь сохраняет информацию об устройстве при создании сессии

### 3. ✅ Создана миграция
**Файл:** `custom-backend/internal/database/migrations/014_add_session_tracking_fields.sql`

## Как применить изменения

### Шаг 1: Применить миграцию к базе данных Railway

**Вариант A: Через TablePlus** (Рекомендуется)
1. Откройте TablePlus
2. Подключитесь к Railway PostgreSQL
3. Откройте файл `custom-backend/internal/database/migrations/014_add_session_tracking_fields.sql`
4. Выполните SQL-запросы из файла

**Вариант B: Через Railway CLI**
```bash
# Получите DATABASE_URL из Railway
railway variables

# Примените миграцию
psql "YOUR_DATABASE_URL_HERE" -f custom-backend/internal/database/migrations/014_add_session_tracking_fields.sql
```

### Шаг 2: Задеплоить обновленный backend

```bash
# Закоммитить изменения
git add .
git commit -m "Fix: Add session tracking fields to store real device information"
git push origin main
```

Railway автоматически задеплоит изменения.

### Шаг 3: Проверить результат

1. Выйдите из аккаунта на https://social.tyriantrade.com
2. Войдите заново (это создаст новую сессию с device tracking)
3. Перейдите в Profile → Security → User Sessions
4. Теперь вы должны увидеть:
   - Browser (Chrome, Firefox, Safari, etc.)
   - Operating System (Windows, macOS, Linux, etc.)
   - Device Type (Desktop, Mobile, Tablet)
   - IP Address
   - Last Active timestamp

## Содержимое миграции 014

```sql
-- Add device tracking fields to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS os VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON sessions(device_type);
```

## Важно

- **Старые сессии** (созданные до миграции) не будут иметь device info
- **Новые сессии** (после деплоя) будут автоматически сохранять всю информацию
- Рекомендуется переавторизоваться, чтобы создать новую сессию

## Что дальше?

После применения миграции и деплоя:
1. ✅ User Sessions будет показывать реальные данные
2. ✅ Можно будет видеть с каких устройств выполнен вход
3. ✅ Можно будет отслеживать IP адреса сессий
4. ✅ Видна последняя активность каждой сессии

## Проверка статуса

Чтобы убедиться, что миграция применена:

```sql
-- Проверьте структуру таблицы sessions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'sessions';
```

Вы должны увидеть новые колонки:
- `device_type`
- `browser`
- `os`
- `ip_address`
- `user_agent`
- `last_active_at`
