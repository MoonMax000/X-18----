# ✅ Применение миграции 009 через TablePlus

## Вы уже подключились к Railway базе! 🎉

Теперь просто выполните SQL запрос:

### Шаг 1: Открыть SQL редактор в TablePlus

1. В TablePlus нажмите **Cmd+T** (или кнопку "SQL" в верхней панели)
2. Откроется окно для выполнения SQL запросов

### Шаг 2: Скопировать и вставить SQL

Скопируйте весь этот SQL код:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_deletion_scheduled ON users(deletion_scheduled_at) WHERE deletion_scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_totp_enabled ON users(totp_enabled) WHERE totp_enabled = TRUE;
```

### Шаг 3: Выполнить запрос

1. Вставьте SQL в окно редактора
2. Нажмите **Cmd+R** (или кнопку "Run" / "Execute")
3. Дождитесь завершения (должно занять 1-2 секунды)

### Шаг 4: Проверить результат

**Способ 1: Через Structure (Структура таблицы)**

В TablePlus:
1. Нажмите на таблицу `users` в списке таблиц слева
2. Перейдите на вкладку **"Structure"** (вверху окна)
3. Прокрутите список колонок вниз
4. ✅ Вы должны увидеть **6 новых колонок** в конце списка:
   - `totp_secret` (тип: TEXT)
   - `totp_enabled` (тип: BOOLEAN, default: FALSE)
   - `is_deactivated` (тип: BOOLEAN, default: FALSE)
   - `deactivation_reason` (тип: TEXT)
   - `deactivated_at` (тип: TIMESTAMP)
   - `deletion_scheduled_at` (тип: TIMESTAMP)

**Способ 2: Через SQL запрос (самый точный)**

В TablePlus:
1. Откройте SQL редактор (Cmd+T)
2. Выполните этот запрос:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('totp_secret', 'totp_enabled', 'is_deactivated', 'deactivation_reason', 'deactivated_at', 'deletion_scheduled_at')
ORDER BY ordinal_position;
```
3. ✅ Вы должны увидеть результат с **6 строками** - по одной для каждой новой колонки

**Если видите все 6 колонок - миграция успешна! 🎉**

## ✅ Готово!

После выполнения SQL:
- Backend уже работает с новым кодом ✅
- Frontend уже работает с новыми компонентами ✅
- TOTP 2FA полностью функционален! 🎉

Функция будет работать сразу же!
