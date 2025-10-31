# 📘 Подробная инструкция: Применение миграции через TablePlus

## Что мы делаем
Добавляем поля в таблицу `sessions`, чтобы сохранять информацию об устройствах пользователей (браузер, ОС, IP адрес и т.д.)

---

## Шаг 1: Откройте TablePlus

1. Запустите приложение **TablePlus** на вашем компьютере
2. Если у вас еще нет подключения к Railway базе данных, создайте его:
   - Нажмите **Create a new connection**
   - Выберите **PostgreSQL**

---

## Шаг 2: Подключитесь к Railway PostgreSQL

### Получите данные подключения из Railway:

1. Откройте браузер и перейдите на [railway.app](https://railway.app)
2. Войдите в свой аккаунт
3. Выберите ваш проект (где находится custom-backend)
4. Найдите сервис **Postgres** (база данных)
5. Перейдите на вкладку **Connect**
6. Скопируйте **Database URL** (должен выглядеть примерно так):
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/railway
   ```

### Настройте подключение в TablePlus:

1. В TablePlus создайте новое подключение или откройте существующее
2. Заполните поля из вашего Database URL:
   - **Host:** (часть между `@` и `:` в URL)
   - **Port:** (число после Host, обычно 5432 или другой порт)
   - **User:** `postgres` (обычно)
   - **Password:** (ваш пароль из DATABASE_URL)
   - **Database:** `railway` (или как указано в конце URL)
3. Нажмите **Test** чтобы проверить подключение
4. Если тест прошел успешно, нажмите **Connect**

---

## Шаг 3: Откройте SQL редактор

1. После подключения к базе данных вы увидите список таблиц слева
2. Найдите в верхнем меню иконку **SQL** или нажмите **⌘T** (CMD+T на Mac) или **Ctrl+T** (на Windows)
3. Откроется новое окно с SQL редактором

---

## Шаг 4: Откройте файл миграции

### Вариант A: Через Finder/Проводник

1. Откройте Finder (Mac) или Проводник (Windows)
2. Перейдите в папку вашего проекта `X-18----`
3. Откройте папку `custom-backend`
4. Откройте папку `internal`
5. Откройте папку `database`
6. Откройте папку `migrations`
7. Найдите файл **`014_add_session_tracking_fields.sql`**
8. Откройте его в любом текстовом редакторе (VS Code, TextEdit, Notepad)
9. Скопируйте весь текст (**⌘A** затем **⌘C** или **Ctrl+A** затем **Ctrl+C**)

### Вариант B: Прямо из VS Code

1. В VS Code откройте файл `custom-backend/internal/database/migrations/014_add_session_tracking_fields.sql`
2. Выделите весь текст (**⌘A** или **Ctrl+A**)
3. Скопируйте (**⌘C** или **Ctrl+C**)

---

## Шаг 5: Вставьте SQL код в TablePlus

1. Вернитесь в окно TablePlus с открытым SQL редактором
2. Вставьте скопированный код в редактор (**⌘V** или **Ctrl+V**)
3. Вы должны увидеть примерно такой код:

```sql
-- Migration 014: Add session tracking fields
-- This migration adds device tracking fields to the sessions table

-- Add device tracking fields to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS device_type VARCHAR(20);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS browser VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS os VARCHAR(50);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN sessions.device_type IS 'Type of device: mobile, tablet, or desktop';
COMMENT ON COLUMN sessions.browser IS 'Browser name: Chrome, Firefox, Safari, Edge, etc.';
COMMENT ON COLUMN sessions.os IS 'Operating system: Windows, macOS, Linux, Android, iOS';
COMMENT ON COLUMN sessions.ip_address IS 'Client IP address (IPv4 or IPv6)';
COMMENT ON COLUMN sessions.user_agent IS 'Full user agent string from the request';
COMMENT ON COLUMN sessions.last_active_at IS 'Timestamp of last activity in this session';

-- Add index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON sessions(device_type);
```

---

## Шаг 6: Выполните SQL код

1. Убедитесь, что весь код вставлен правильно
2. Нажмите кнопку **Run** (иконка с треугольником ▶️) в правом верхнем углу
   - Или используйте горячую клавишу:
     - **⌘ + Enter** (на Mac)
     - **Ctrl + Enter** (на Windows)
3. Подождите несколько секунд

---

## Шаг 7: Проверьте результат

### Если выполнение прошло успешно:

Вы увидите сообщение внизу окна:
```
✓ Query executed successfully
```

### Проверьте структуру таблицы:

1. В левой панели найдите таблицу **`sessions`**
2. Кликните правой кнопкой мыши на ней
3. Выберите **Structure** или **Show Structure**
4. Вы должны увидеть новые колонки:
   - `device_type`
   - `browser`
   - `os`
   - `ip_address`
   - `user_agent`
   - `last_active_at`

### Если произошла ошибка:

- Прочитайте текст ошибки
- Убедитесь, что вы подключены к правильной базе данных (Railway production, а не локальная)
- Попробуйте выполнить снова

---

## Шаг 8: Закройте TablePlus

Миграция применена успешно! Можете закрыть TablePlus.

---

## Что дальше?

### 1. Задеплойте изменения кода

Откройте терминал в папке проекта и выполните:

```bash
# Добавьте все изменения
git add .

# Создайте коммит
git commit -m "Fix: Add session tracking fields for real device information"

# Отправьте на GitHub
git push origin main
```

Railway автоматически задеплоит обновленный backend в течение 2-5 минут.

### 2. Проверьте результат на сайте

1. Подождите пока Railway завершит деплой (следите за статусом на railway.app)
2. Откройте сайт https://social.tyriantrade.com
3. **Выйдите из аккаунта** (это важно!)
4. **Войдите заново** (это создаст новую сессию с device tracking)
5. Перейдите в **Profile → Security → User Sessions**
6. Теперь вы должны увидеть:
   - ✅ **Browser:** Chrome, Firefox, Safari и т.д.
   - ✅ **OS:** Windows, macOS, Linux, Android, iOS
   - ✅ **Device Type:** Desktop, Mobile или Tablet
   - ✅ **IP Address:** ваш IP адрес
   - ✅ **Last Active:** время последней активности

---

## Часто задаваемые вопросы

### Q: Я не вижу таблицу `sessions` в TablePlus
**A:** Убедитесь, что вы подключены к правильной базе данных Railway (production), а не к локальной базе.

### Q: Миграция выполнилась, но на сайте все еще мок-данные
**A:** 
1. Убедитесь, что Railway завершил деплой обновленного backend
2. Выйдите из аккаунта и войдите заново (старые сессии не будут иметь новые поля)
3. Очистите кэш браузера

### Q: Что если я случайно выполню миграцию дважды?
**A:** Не беспокойтесь! В SQL коде используется `IF NOT EXISTS`, поэтому повторное выполнение не создаст дубликаты и не вызовет ошибку.

### Q: Можно ли откатить эту миграцию?
**A:** Да, но не рекомендуется. Если очень нужно, выполните:
```sql
ALTER TABLE sessions DROP COLUMN IF EXISTS device_type;
ALTER TABLE sessions DROP COLUMN IF EXISTS browser;
ALTER TABLE sessions DROP COLUMN IF EXISTS os;
ALTER TABLE sessions DROP COLUMN IF EXISTS ip_address;
ALTER TABLE sessions DROP COLUMN IF EXISTS user_agent;
ALTER TABLE sessions DROP COLUMN IF EXISTS last_active_at;
DROP INDEX IF EXISTS idx_sessions_ip;
DROP INDEX IF EXISTS idx_sessions_device_type;
```

---

## Готово! 🎉

Теперь User Sessions будет показывать реальную информацию об устройствах вместо мок-данных.
