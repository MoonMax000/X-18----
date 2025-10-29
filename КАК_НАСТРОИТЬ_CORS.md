# 🔧 Как настроить CORS на Railway

## Проблема
Фронтенд на Netlify не может подключиться к бэкенду на Railway из-за CORS ошибки:
```
Origin https://sunny-froyo-f47377.netlify.app is not allowed by Access-Control-Allow-Origin
```

## Решение (2 минуты)

### Способ 1: Через веб-интерфейс Railway (РЕКОМЕНДУЕТСЯ)

1. **Откройте Railway проект**
   - Перейдите на https://railway.app
   - Войдите в свой аккаунт
   - Откройте проект `X-18`

2. **Выберите сервис**
   - Нажмите на сервис `custom-backend` (тот, где работает Go бэкенд)

3. **Добавьте переменную окружения**
   - Перейдите на вкладку **Variables**
   - Нажмите **New Variable**
   - Введите:
     ```
     Name: CORS_ORIGIN
     Value: https://sunny-froyo-f47377.netlify.app
     ```
   - Нажмите **Add**

4. **Подождите перезапуска**
   - Railway автоматически перезапустит сервис (1-2 минуты)
   - Дождитесь, пока статус станет "Active"

5. **Проверьте работу**
   - Откройте https://sunny-froyo-f47377.netlify.app
   - Обновите страницу (Ctrl+R или Cmd+R)
   - Попробуйте зарегистрироваться/войти

### Способ 2: Через Railway CLI

Если у вас установлен Railway CLI:

```bash
# Привяжите проект (если еще не сделано)
railway link

# Добавьте переменную
railway variables --set CORS_ORIGIN="https://sunny-froyo-f47377.netlify.app"

# Подождите 1-2 минуты для перезапуска
```

## Что делает эта переменная?

Переменная `CORS_ORIGIN` указывает бэкенду, какому фронтенду разрешено делать запросы.

В коде бэкенда (`custom-backend/cmd/server/main.go`):
```go
corsOrigin := os.Getenv("CORS_ORIGIN")
if corsOrigin == "" {
    corsOrigin = "http://localhost:5173" // локальная разработка
}

r.Use(cors.New(cors.Config{
    AllowOrigins: []string{corsOrigin},
    // ...
}))
```

## Проверка

После настройки CORS, в консоли браузера вы больше НЕ должны видеть:
```
❌ Origin https://sunny-froyo-f47377.netlify.app is not allowed by Access-Control-Allow-Origin
```

Вместо этого API запросы должны работать нормально:
```
✅ 200 OK - POST /auth/register
✅ 200 OK - GET /timeline/explore
✅ 200 OK - GET /notifications
```

## Если не работает

1. **Проверьте, что переменная добавлена**
   - Railway → custom-backend → Variables
   - Должна быть: `CORS_ORIGIN = https://sunny-froyo-f47377.netlify.app`

2. **Проверьте, что сервис перезапустился**
   - Посмотрите на Deploy logs
   - Должно быть последнее развертывание после добавления переменной

3. **Очистите кэш браузера**
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

4. **Проверьте бэкенд напрямую**
   ```bash
   curl -I https://x-18-production-38ec.up.railway.app/health
   ```
   Должен вернуть 200 OK

## Дополнительная отладка

Если проблема сохраняется, проверьте логи бэкенда в Railway:
- Railway → custom-backend → Logs
- Ищите строки с "CORS" или "Origin"

---

**После настройки CORS, приложение должно работать полностью!**

- ✅ Регистрация пользователей
- ✅ Авторизация  
- ✅ Загрузка ленты
- ✅ Создание постов
- ✅ Уведомления
