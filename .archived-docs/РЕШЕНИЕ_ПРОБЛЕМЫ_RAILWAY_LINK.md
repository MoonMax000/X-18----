# 🔧 Решение проблемы с подключением к Railway

## ❌ Проблема

Вы подключены к сервису **Postgres** вместо **custom-backend**, поэтому скрипт не может получить DATABASE_URL.

## ✅ Решение

### Способ 1: Быстрое переключение (рекомендуется)

```bash
# Из директории custom-backend выполните:
cd custom-backend
railway link

# Выберите из списка:
# > custom-backend  (НЕ Postgres!)

# Проверьте подключение:
railway status
# Должно показать: Service: custom-backend

# Вернитесь в корень проекта и запустите скрипт:
cd ..
./apply-migrations-production-fixed.sh
```

### Способ 2: Прямое подключение к базе данных

Если не удается переключиться на custom-backend, можно напрямую подключиться к БД:

```bash
# 1. Откройте Railway Dashboard
# 2. Перейдите в проект TT PROD1
# 3. Кликните на сервис Postgres
# 4. Перейдите во вкладку "Connect"
# 5. Скопируйте DATABASE_URL

# Используйте его напрямую:
cd custom-backend
export DATABASE_URL="postgresql://..."  # вставьте скопированный URL

# Примените миграции вручную:
psql "$DATABASE_URL" < internal/database/migrations/007_add_widgets_and_admin.sql
psql "$DATABASE_URL" < internal/database/migrations/008_add_extended_user_fields.sql
```

### Способ 3: Исправленный скрипт

Я уже обновил скрипт `apply-migrations-production-fixed.sh` - он теперь:
- ✅ Автоматически определяет текущий сервис
- ✅ Предлагает переключиться на custom-backend
- ✅ Пробует альтернативные способы получения DATABASE_URL

## 📝 Что делать дальше

1. **Переключитесь на правильный сервис:**
   ```bash
   cd custom-backend
   railway link
   # Выберите: custom-backend
   ```

2. **Запустите исправленный скрипт:**
   ```bash
   cd ..
   ./apply-migrations-production-fixed.sh
   ```

3. **Если все еще не работает, используйте прямое подключение** (Способ 2)

## 🎯 Проверка успеха

После успешного применения миграций вы увидите:
- ✅ Миграция 007 применена
- ✅ Миграция 008 применена
- 📊 Список всех таблиц в БД

## ⚠️ Важно

- Убедитесь что вы в директории `custom-backend` при выполнении `railway link`
- Выбирайте сервис **custom-backend**, а не **Postgres**
- DATABASE_URL находится в переменных окружения custom-backend сервиса

## 🆘 Если ничего не помогает

Откройте Railway Dashboard и вручную скопируйте DATABASE_URL из сервиса Postgres, затем используйте Способ 2.
