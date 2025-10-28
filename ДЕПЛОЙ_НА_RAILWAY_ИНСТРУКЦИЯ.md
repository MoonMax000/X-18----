# 🚂 Полная инструкция по деплою на Railway

## ✅ Изменения уже сохранены на GitHub!

Все необходимые изменения уже загружены в ваш репозиторий:
- Исправлена совместимость с Redis 7.2+
- Добавлена поддержка Username для Redis
- Обновлены конфигурационные файлы

**Коммит:** 3d208c5e - "docs: добавлены инструкции для ngrok и решение проблем Railway"

---

## 📋 Пошаговая инструкция для Railway

### Шаг 1: Подготовка проекта на Railway

1. Откройте Railway.app
2. Нажмите **"New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий: **MoonMax000/X-18----**
5. Выберите ветку: **nova-hub**

### Шаг 2: Создание сервисов

Railway создаст один сервис для вашего приложения. Теперь нужно добавить базы данных:

#### 2.1. Добавить PostgreSQL

1. В проекте нажмите **"+ New"**
2. Выберите **"Database"**
3. Выберите **"PostgreSQL"**
4. Дождитесь создания (займет 1-2 минуты)

#### 2.2. Добавить Redis

1. В проекте нажмите **"+ New"**
2. Выберите **"Database"**
3. Выберите **"Redis"**
4. Дождитесь создания (займет 1-2 минуты)

### Шаг 3: Настройка переменных окружения для Backend

Откройте сервис **custom-backend** (ваш Go backend) и перейдите в раздел **"Variables"**.

#### 3.1. Переменные базы данных PostgreSQL

Нажмите **"+ New Variable"** и добавьте (используйте значения из созданной PostgreSQL):

```
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USER=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
```

#### 3.2. Переменные Redis ⚠️ ВАЖНО!

```
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_USER=default
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_DB=0
```

**ВАЖНО:** `REDIS_USER=default` - это обязательное значение для Railway Redis 7.2+

#### 3.3. Остальные переменные

```
PORT=8080
JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
APP_ENV=production
CORS_ORIGIN=https://ваш-frontend-url.netlify.app
```

### Шаг 4: Деплой Backend на Railway

1. После добавления всех переменных нажмите **"Deploy"**
2. Дождитесь завершения деплоя (смотрите логи)
3. Скопируйте публичный URL вашего backend (например: `https://custom-backend-production.up.railway.app`)

### Шаг 5: Деплой Frontend на Netlify

#### 5.1. Подготовка

1. Откройте файл `client/.env.production` и создайте его если нет:

```bash
VITE_API_URL=https://ваш-backend.up.railway.app
VITE_APP_ENV=production
```

2. Зафиксируйте изменения:

```bash
git add client/.env.production
git commit -m "chore: добавлен production config для Netlify"
git push origin nova-hub
```

#### 5.2. Деплой на Netlify

1. Откройте [Netlify.com](https://www.netlify.com)
2. Нажмите **"Add new site"** → **"Import an existing project"**
3. Выберите **GitHub** и авторизуйтесь
4. Выберите ваш репозиторий **MoonMax000/X-18----**
5. Настройте деплой:
   - **Branch to deploy:** `nova-hub`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. В разделе **"Environment variables"** добавьте:
   ```
   VITE_API_URL=https://ваш-backend.up.railway.app
   VITE_APP_ENV=production
   ```
7. Нажмите **"Deploy site"**

### Шаг 6: Обновление CORS на Backend

После деплоя frontend:

1. Откройте Railway → ваш backend сервис
2. Перейдите в **"Variables"**
3. Обновите переменную:
   ```
   CORS_ORIGIN=https://ваш-сайт.netlify.app
   ```
4. Нажмите **"Redeploy"**

---

## 🔍 Проверка работы

После деплоя проверьте:

### 1. Backend работает

Откройте в браузере:
```
https://ваш-backend.up.railway.app/health
```

Должно вернуть:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### 2. Frontend загружается

Откройте ваш сайт на Netlify и проверьте:
- Страница загружается
- Можно зарегистрироваться
- Можно войти
- Посты отображаются

---

## ⚠️ Если Redis всё ещё не работает

### Проверка 1: Посмотрите логи Railway

1. Откройте ваш backend сервис на Railway
2. Перейдите в раздел **"Logs"**
3. Найдите ошибки связанные с Redis

### Проверка 2: Убедитесь что используется правильный код

Файл `custom-backend/internal/cache/redis.go` должен содержать:

```go
client := redis.NewClient(&redis.Options{
    Addr:     config.Addr(),
    Password: config.Password,
    Username: config.Username, // ← Это поле обязательно!
    DB:       config.DB,
})
```

Файл `custom-backend/configs/config.go` должен содержать:

```go
type RedisConfig struct {
    Host     string
    Port     string
    Username string  // ← Это поле обязательно!
    Password string
    DB       int
}
```

### Проверка 3: Переменные окружения

В Railway Variables для backend должны быть:

```
REDIS_USER=default
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
```

---

## 🎯 Альтернатива: Render.com

Если проблемы с Railway продолжаются, можно использовать Render.com:

### Преимущества Render:
- ✅ Более простая настройка Redis
- ✅ Автоматическое создание database URL
- ✅ Бесплатный tier для тестирования
- ✅ Автоматический SSL

### Быстрый старт на Render:

1. Откройте [Render.com](https://render.com)
2. Создайте **"New Web Service"**
3. Подключите GitHub репозиторий
4. Render автоматически определит Go приложение
5. Добавьте **Redis** через меню "New" → "Redis"
6. Render автоматически создаст переменную `REDIS_URL`
7. В настройках приложения добавьте переменные:
   ```
   DATABASE_URL=${{postgres.DATABASE_URL}}
   REDIS_URL=${{redis.REDIS_URL}}
   ```

---

## 📞 Нужна помощь?

Если что-то не работает:

1. **Проверьте логи** на Railway - там будет точная ошибка
2. **Убедитесь** что все переменные правильно прописаны
3. **Проверьте** что используется последняя версия кода с GitHub (коммит 3d208c5e)

---

## ✅ Чеклист финального деплоя

- [ ] PostgreSQL создан на Railway
- [ ] Redis создан на Railway
- [ ] Все переменные окружения добавлены для backend
- [ ] Backend задеплоен на Railway
- [ ] Frontend задеплоен на Netlify
- [ ] CORS_ORIGIN обновлен на backend
- [ ] Проверен endpoint /health
- [ ] Проверена регистрация на сайте
- [ ] Проверен вход на сайте
- [ ] Проверено отображение постов

**После выполнения всех шагов ваше приложение будет работать в production!** 🎉
