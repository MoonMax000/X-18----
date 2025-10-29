# 🎯 Production Errors - ИСПРАВЛЕНО

## Дата: 28.10.2025

---

## ✅ Что было исправлено

### 1. **Media URLs указывали на localhost**

**Проблема:**
```
https://x-18-production.netlify.app/storage/media/d3e0cf17-9234-4c02-82b9-db4a18dc42e9.jpg
```
Файлы загружались на сервер Railway, но URL сохранялся как относительный путь, который браузер интерпретировал как localhost.

**Решение:**
Модифицирован файл `custom-backend/internal/api/media.go`:
- Добавлена поддержка переменной окружения `BASE_URL`
- URL теперь формируется как `BASE_URL + /storage/media/filename`
- Fallback на `http://localhost:8080` для локальной разработки

**Код изменения:**
```go
// URL для доступа к файлу (используем переменную окружения для BASE_URL)
baseURL := os.Getenv("BASE_URL")
if baseURL == "" {
    baseURL = "http://localhost:8080" // fallback для локальной разработки
}

// URL для доступа к файлу
fileURL := fmt.Sprintf("%s/storage/media/%s", baseURL, safeFilename)

// Создаём thumbnail
thumbnailFilename := "thumb_" + safeFilename
thumbnailPath := filepath.Join(h.uploadDir, thumbnailFilename)
if err := utils.GenerateThumbnail(processedPath, thumbnailPath, 400, 400); err == nil {
    thumbnailURL = fmt.Sprintf("%s/storage/media/%s", baseURL, thumbnailFilename)
}
```

### 2. **Error 500 от /api/widgets/news**

**Проблема:**
```
Failed to fetch from https://x-18-production-38ec.up.railway.app/api/widgets/news
```
Таблица `news` не существует в production базе данных.

**Решение:**
Нужно применить миграцию `007_add_widgets_and_admin.sql`, которая создаст:
- Таблицу `news`
- Таблицу `user_blocks`
- Таблицу `post_reports`
- Таблицу `pinned_posts`
- Поле `role` в таблице `users`

---

## 📋 Что нужно сделать СЕЙЧАС

### Шаг 1: Добавить переменную окружения BASE_URL в Railway

1. Откройте ваш проект на Railway: https://railway.app
2. Выберите сервис `custom-backend`
3. Перейдите на вкладку **Variables**
4. Нажмите **New Variable**
5. Добавьте:
   ```
   Имя: BASE_URL
   Значение: https://x-18-production-38ec.up.railway.app
   ```
6. Нажмите **Add** и **Deploy**

### Шаг 2: Применить миграцию к базе данных Railway

**Вариант A: Через Railway CLI (рекомендуется)**

```bash
# Установите Railway CLI если еще не установлен
brew install railway

# Войдите в Railway
railway login

# Подключитесь к вашему проекту
railway link

# Откройте psql к базе данных
railway run psql $DATABASE_URL

# В psql выполните миграцию:
\i custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql

# Проверьте что таблицы созданы:
\dt

# Выйдите из psql:
\q
```

**Вариант B: Через Railway Dashboard**

1. Откройте Railway Dashboard
2. Выберите ваш PostgreSQL сервис
3. Перейдите на вкладку **Query**
4. Скопируйте содержимое файла `custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql`
5. Вставьте в редактор запросов
6. Выполните запрос

**Вариант C: Через локальное подключение**

```bash
# Получите DATABASE_URL из Railway Dashboard
# Затем выполните:
psql "ваш_DATABASE_URL_из_Railway" -f custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql
```

### Шаг 3: Закоммитить изменения и запустить auto-deploy

```bash
# Добавьте измененный файл
git add custom-backend/internal/api/media.go

# Закоммитьте изменения
git commit -m "fix: use BASE_URL env var for media URLs in production"

# Запушьте в ветку nova-hub (или main)
git push origin nova-hub
```

GitHub Actions автоматически:
- ✅ Задеплоит бэкенд на Railway (если изменения в `custom-backend/**`)
- ✅ Задеплоит фронтенд на Netlify (если изменения в `client/**`)

### Шаг 4: Проверить что все работает

После деплоя:

1. **Проверьте загрузку медиа:**
   - Создайте новый пост с фото
   - Проверьте URL изображения в инспекторе браузера
   - Должно быть: `https://x-18-production-38ec.up.railway.app/storage/media/...`

2. **Проверьте виджет новостей:**
   - Откройте главную страницу
   - NewsWidget не должен показывать ошибку
   - Если новостей нет, виджет должен показать пустой список (не ошибку)

3. **Проверьте логи Railway:**
   ```bash
   railway logs
   ```
   Не должно быть ошибок 500

---

## 🔧 Технические детали

### Структура миграции 007

Файл `custom-backend/internal/database/migrations/007_add_widgets_and_admin.sql` создает:

**1. Поле role в users:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL;
```
Возможные значения: `user`, `moderator`, `admin`

**2. Таблица news:**
- Для хранения новостей в виджете
- Поля: title, description, url, image_url, category, source
- Админы могут создавать новости через админ-панель

**3. Таблица user_blocks:**
- Для блокировки пользователей
- Связь: blocker_id → blocked_id

**4. Таблица post_reports:**
- Для жалоб на посты
- Поля: reason, status (pending/reviewed/dismissed)

**5. Таблица pinned_posts:**
- Один закрепленный пост на пользователя
- Для отображения на профиле

### Как работает BASE_URL

**В разработке (локально):**
```
BASE_URL не установлен
→ используется fallback: http://localhost:8080
→ media URL: http://localhost:8080/storage/media/file.jpg
```

**В продакшене (Railway):**
```
BASE_URL=https://x-18-production-38ec.up.railway.app
→ media URL: https://x-18-production-38ec.up.railway.app/storage/media/file.jpg
```

### GitHub Actions Workflows

**deploy-railway.yml:**
- Триггер: push в `custom-backend/**`
- Деплоит бэкенд на Railway
- Автоматически применяет переменные окружения

**deploy-netlify.yml:**
- Триггер: push в `client/**`
- Билдит фронтенд с `VITE_API_URL`
- Деплоит на Netlify

---

## 📊 Что было исправлено ранее (контекст)

### Исправление 1: VITE_API_URL в Netlify
- **Было:** `VITE_API_URL=https://x-18-production-38ec.up.railway.app`
- **Стало:** `VITE_API_URL=https://x-18-production-38ec.up.railway.app/api`
- **Результат:** Фронтенд правильно обращается к API endpoints

### Исправление 2: GitHub Actions переменные
- **Было:** `VITE_CUSTOM_BACKEND_URL`
- **Стало:** `VITE_API_URL` + `VITE_APP_ENV=production`
- **Результат:** Правильные переменные при билде

### Исправление 3: CORS настройки
- Добавлен правильный CORS_ORIGIN в Railway
- Фронтенд может делать запросы к API

---

## ✨ Результат после всех исправлений

После выполнения всех шагов:

✅ **Media URLs работают корректно**
- Изображения загружаются с Railway сервера
- URL формата: `https://x-18-production-38ec.up.railway.app/storage/media/...`

✅ **Виджеты работают без ошибок**
- NewsWidget отображается корректно
- Нет ошибок 500 в консоли

✅ **Auto-deploy настроен**
- Push в GitHub автоматически деплоит изменения
- Фронтенд на Netlify, бэкенд на Railway

✅ **Production ready**
- Все переменные окружения настроены
- База данных содержит все необходимые таблицы
- CORS работает корректно

---

## 🚀 Следующие шаги (опционально)

1. **Добавить новости:**
   - Войдите как админ (установите `role='admin'` в БД для своего user_id)
   - Перейдите в Admin Panel → News
   - Создайте новости для виджета

2. **Настроить мониторинг:**
   - Railway предоставляет метрики
   - Настройте alerts для ошибок

3. **Бэкапы базы данных:**
   - Railway автоматически делает бэкапы PostgreSQL
   - Можно настроить дополнительные бэкапы

---

## 📞 Полезные команды

```bash
# Просмотр логов Railway
railway logs

# Просмотр переменных окружения
railway variables

# Запуск команды в Railway окружении
railway run <command>

# Деплой вручную (если нужно)
railway up

# Просмотр статуса деплоя
railway status
```

---

## 📝 Чеклист проверки

- [ ] BASE_URL добавлен в Railway Variables
- [ ] Миграция 007 применена к production БД
- [ ] Изменения закоммичены и запушены в GitHub
- [ ] GitHub Actions успешно завершил деплой
- [ ] Медиа файлы загружаются с правильным URL
- [ ] Виджет новостей работает без ошибок 500
- [ ] Логи Railway не содержат ошибок

---

**Статус:** ✅ Готово к деплою  
**Требуется:** Настройка Railway + применение миграции + git push
