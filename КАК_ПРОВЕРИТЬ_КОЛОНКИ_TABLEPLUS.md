# ❗ Как правильно проверить колонки в TablePlus

## Проблема
Вы показали данные из вкладки "Content" (содержимое строк), но там не видны все колонки - только те, что поместились в окно.

## ✅ Правильный способ проверки

### Вариант 1: Через Structure (РЕКОМЕНДУЕТСЯ)

1. В TablePlus нажмите на таблицу `users` слева
2. Перейдите на вкладку **"Structure"** вверху окна (не Content!)
3. Прокрутите список **колонок** вниз до конца
4. Вы должны увидеть эти 6 колонок:

```
totp_secret          | TEXT      | NULL
totp_enabled         | BOOLEAN   | false
is_deactivated       | BOOLEAN   | false
deactivation_reason  | TEXT      | NULL
deactivated_at       | TIMESTAMP | NULL
deletion_scheduled_at| TIMESTAMP | NULL
```

### Вариант 2: Через SQL запрос (ТОЧНЕЕ)

1. Откройте SQL редактор (Cmd+T)
2. Выполните:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN (
  'totp_secret', 
  'totp_enabled', 
  'is_deactivated', 
  'deactivation_reason', 
  'deactivated_at', 
  'deletion_scheduled_at'
)
ORDER BY ordinal_position;
```

3. **Результат должен показать ровно 6 строк:**

| column_name | data_type | column_default |
|-------------|-----------|----------------|
| totp_secret | text | NULL |
| totp_enabled | boolean | false |
| is_deactivated | boolean | false |
| deactivation_reason | text | NULL |
| deactivated_at | timestamp without time zone | NULL |
| deletion_scheduled_at | timestamp without time zone | NULL |

## ❓ Если не видите все 6 колонок

Значит миграция еще **НЕ применена**. 

Вернитесь к файлу `ПРИМЕНИТЬ_МИГРАЦИЮ_ЧЕРЕЗ_TABLEPLUS.md` и выполните SQL:

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

## ✅ Когда увидите все 6 колонок - миграция готова! 🎉
