# 📦 Настройка Railway Volume - Пошаговая Инструкция

## 🎯 Цель
Настроить постоянное хранилище для медиа-файлов (фото, видео) на Railway.

---

## 📋 Шаг 1: Открыть Railway Dashboard

1. Перейти на https://railway.app
2. Войти в аккаунт
3. Открыть проект **X-18----**

---

## 📦 Шаг 2: Создать Volume

### Вариант A: Через интерфейс (Рекомендуется)

1. В проекте **X-18----** найти сервис с вашим backend
2. Нажать на карточку сервиса
3. Перейти на вкладку **"Settings"**
4. Прокрутить вниз до секции **"Volumes"**
5. Нажать кнопку **"+ New Volume"**

### Настройки Volume:
```
Mount Path: /app/storage
Size: 10 GB
```

6. Нажать **"Add"** или **"Create"**

### Вариант B: Через CLI (Для продвинутых)
```bash
# Установить Railway CLI (если не установлен)
npm install -g @railway/cli

# Войти
railway login

# Создать volume
railway volume create \
  --mount-path /app/storage \
  --size 10
```

---

## ⚙️ Шаг 3: Настроить Переменные Окружения

### 3.1 Добавить BASE_URL

1. В сервисе backend перейти на вкладку **"Variables"**
2. Нажать **"+ New Variable"**
3. Добавить:
   ```
   Name:  BASE_URL
   Value: https://api.tyriantrade.com
   ```
4. Нажать **"Add"**

### 3.2 Проверить существующие переменные

Убедитесь что есть:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
CORS_ORIGIN=https://social.tyriantrade.com,https://admin.tyriantrade.com
```

---

## 🔄 Шаг 4: Редеплой Сервиса

### Автоматически:
После добавления Volume Railway автоматически пересоберет сервис.

### Вручную (если нужно):
1. Перейти на вкладку **"Deployments"**
2. Нажать **"Deploy"** на последнем деплое
3. Или нажать **"Redeploy"**

**⏱️ Ожидание:** 2-5 минут

---

## ✅ Шаг 5: Проверка

### 5.1 Проверить логи
1. Перейти на вкладку **"Deployments"**
2. Кликнуть на последний деплой
3. Проверить логи на наличие:
   ```
   ✓ Server started on port 8080
   ✓ Connected to database
   ✓ Connected to Redis
   ```

### 5.2 Проверить Volume смонтирован
В логах должна быть строка про создание директории:
```
Created upload directory: /app/storage/media
```

### 5.3 Тестовый запрос
```bash
# Проверить что API работает
curl https://api.tyriantrade.com/health
```

Ответ должен быть:
```json
{
  "status": "ok",
  "timestamp": "2024-10-29T..."
}
```

---

## 🧪 Шаг 6: Тест Загрузки Файла

### Запустить тестовый скрипт
```bash
chmod +x test-upload.sh
./test-upload.sh
```

### Ожидаемый результат:
```
🧪 Тестирование загрузки медиа на Railway

1. Регистрация тестового пользователя...
✓ Пользователь создан

2. Создание тестового изображения...
✓ Изображение создано: test_image.jpg

3. Загрузка файла на Railway...
✓ Файл загружен!
URL: https://api.tyriantrade.com/storage/media/abc-123.jpg

4. Проверка доступности файла...
✓ Файл доступен! (HTTP 200)

5. Скачивание файла для проверки...
✓ Файл скачан: downloaded_image.jpg (150K)

✅ Тест завершен успешно!
Railway Volume работает корректно
```

---

## 📊 Мониторинг Volume

### Проверить использование места

1. В Railway → Проект → Backend сервис
2. Вкладка **"Metrics"**
3. Смотреть график **"Volume Usage"**

### Увеличить размер (если нужно)

1. Вкладка **"Settings"**
2. Секция **"Volumes"**
3. Нажать на volume
4. Изменить **"Size"**
5. Сохранить

---

## 🔧 Troubleshooting

### Проблема 1: Volume не создается

**Симптомы:**
- Кнопка "+ New Volume" не активна
- Ошибка при создании

**Решение:**
1. Проверить баланс Railway (нужна подписка Pro)
2. Убедиться что у проекта есть Volume quota
3. Попробовать меньший размер (5GB вместо 10GB)
4. Перезагрузить страницу и попробовать снова

### Проблема 2: Файлы не загружаются (400/500 ошибка)

**Проверить:**
```bash
# 1. Проверить что переменная BASE_URL установлена
curl https://api.tyriantrade.com/health

# 2. Проверить логи Railway
# В Railway → Deployments → View Logs

# 3. Проверить что директория существует
# В логах должно быть: "Created upload directory"
```

**Возможные причины:**
- Не установлена переменная `BASE_URL`
- Volume не смонтирован (проверить в Settings → Volumes)
- Проблемы с правами доступа

**Решение:**
```bash
# Добавить переменную в Railway
BASE_URL=https://api.tyriantrade.com

# Редеплоить сервис
```

### Проблема 3: Файлы исчезают после рестарта

**Симптомы:**
- Загруженные файлы доступны сразу после загрузки
- После рестарта сервиса файлы пропадают (404)

**Причина:** Volume не настроен правильно

**Решение:**
1. Проверить что Mount Path = `/app/storage` (не `/storage`)
2. Убедиться что в коде используется `./storage/media`
3. Удалить старый Volume и создать новый с правильным путем
4. Редеплоить

### Проблема 4: Файлы не отдаются (404)

**Проверить:**
```bash
# Проверить что роут настроен
curl https://api.tyriantrade.com/storage/media/test.jpg
```

**Причина:** Не настроен static middleware в Go

**Решение - проверить в custom-backend/cmd/server/main.go:**
```go
// Должна быть строка:
app.Static("/storage/media", "./storage/media")
```

### Проблема 5: Медленная загрузка файлов

**Симптомы:**
- Загрузка занимает >30 секунд
- Timeout ошибки

**Причина:** Большие файлы или медленная сеть

**Решение:**
1. Увеличить timeout в frontend:
```typescript
const response = await fetch(url, {
  method: 'POST',
  body: formData,
  signal: AbortSignal.timeout(60000) // 60 секунд
});
```

2. Оптимизировать изображения перед загрузкой
3. Добавить прогресс-бар для UX

### Проблема 6: Volume заполнен

**Симптомы:**
- Ошибка "No space left on device"
- Не удается загрузить новые файлы

**Решение:**
1. Проверить использование в Metrics
2. Увеличить размер Volume в Settings
3. Или очистить старые файлы:
```bash
# В Railway Shell
cd /app/storage/media
du -sh .
# Удалить старые файлы если нужно
```

### Проблема 7: CORS ошибки при загрузке

**Симптомы:**
```
Access to fetch at 'https://api.tyriantrade.com/api/media/upload' 
from origin 'https://social.tyriantrade.com' has been blocked by CORS
```

**Решение:**
Проверить CORS_ORIGIN в Railway:
```
CORS_ORIGIN=https://social.tyriantrade.com,https://admin.tyriantrade.com
```

---

## 💡 Советы по Оптимизации

### 1. Сжатие изображений
```go
// В media.go уже реализовано
// Изображения автоматически сжимаются до 4096x4096
```

### 2. Создание thumbnails
```go
// Thumbnails создаются автоматически
// Размер: 400x400
```

### 3. Мониторинг размера
```bash
# Регулярно проверяйте использование
# Railway → Metrics → Volume Usage
```

### 4. Бэкап важных файлов
```bash
# Настроить автоматический бэкап в S3
# (опционально, для critical данных)
```

---

## 🎓 Дополнительная Информация

### Структура хранилища
```
/app/storage/
├── media/
│   ├── abc-123.jpg          # Оригинал
│   ├── thumb_abc-123.jpg    # Thumbnail
│   ├── def-456.mp4          # Видео
│   └── ...
```

### Размеры файлов
- Максимальный размер: 10MB (настраивается)
- Рекомендуемый для фото: 2-5MB
- Рекомендуемый для видео: 5-10MB

### Форматы
**Разрешенные:**
- Изображения: JPG, PNG, GIF, WebP
- Видео: MP4, WebM

**Запрещенные:**
- Исполняемые файлы
- Документы (PDF, DOC)
- Архивы (ZIP, RAR)

---

## 📞 Следующие Шаги

После успешной настройки Volume:

1. ✅ Протестировать загрузку в UI
2. ✅ Настроить автоматический мониторинг
3. ✅ Документировать процесс для команды
4. 🔄 Планировать миграцию на S3/R2 при масштабировании

---

## 📚 Полезные Ссылки

- [Railway Volumes Documentation](https://docs.railway.app/reference/volumes)
- [Cloudflare R2 Pricing](https://www.cloudflare.com/products/r2/)
- [AWS S3 Pricing](https://aws.amazon.com/s3/pricing/)

---

**✅ Railway Volume настроен и готов к использованию!**
