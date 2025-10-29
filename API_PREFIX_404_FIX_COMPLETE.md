# Исправление 404 Ошибок - Решение Проблемы с Префиксом API

## 🎯 Проблема

После деплоя на Railway, все API запросы возвращали **404 ошибки**, хотя backend успешно развернулся.

### Логи Railway показали:
```
2025/10/29 03:51:58 🚀 Starting X-18 Backend Server...
2025/10/29 03:51:59 ✅ CORS configured for: https://social.tyriantrade.com,https://admin.tyriantrade.com
2025/10/29 03:51:59 🚀 Server running on http://0.0.0.0:8080
[03:52:07] 404 - GET /timeline/explore
[03:52:09] 404 - GET /notifications
```

## 🔍 Анализ Причины

**Backend (custom-backend/cmd/server/main.go):**
```go
apiGroup := app.Group("/api")
```
- Все маршруты регистрируются с префиксом `/api`
- Backend ожидает: `https://api.tyriantrade.com/api/timeline/explore`

**Frontend (client/services/api/custom-backend.ts):**
```typescript
private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```
- Запросы отправлялись БЕЗ префикса `/api`
- Frontend отправлял: `https://api.tyriantrade.com/timeline/explore` ❌

### client/.env.production:
```env
VITE_API_URL=https://api.tyriantrade.com
```

## ✅ Решение

Добавил `/api` к `baseUrl` в `custom-backend.ts`:

```typescript
class CustomBackendAPI {
  private baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
  // ...
}
```

Теперь:
- Frontend: `https://api.tyriantrade.com` + `/api` + `/timeline/explore`
- Итоговый запрос: `https://api.tyriantrade.com/api/timeline/explore` ✅
- Backend маршрут: `/api` + `/timeline/explore` = `/api/timeline/explore` ✅

## 📦 Измененные Файлы

1. **client/services/api/custom-backend.ts**
   - Добавлен `/api` к baseUrl
   - Обновлен комментарий для refresh endpoint

## 🚀 Следующие Шаги

### 1. Commit и Push изменений:
```bash
git add client/services/api/custom-backend.ts
git commit -m "fix: добавлен /api префикс к baseUrl для правильной маршрутизации"
git push origin main
```

### 2. Netlify автоматически задеплоит изменения

### 3. Проверить работу:
```bash
# Открыть сайт
open https://social.tyriantrade.com

# Проверить, что API запросы работают:
# - Timeline/Explore должен загружать посты
# - Notifications должны работать
# - Все виджеты должны загружаться
```

## ✅ Результат

После деплоя:
- ✅ Все API запросы будут использовать правильный путь `/api`
- ✅ 404 ошибки исчезнут
- ✅ Сайт будет полностью функционален

## 🎉 Статус

**ПРОБЛЕМА РЕШЕНА** - Изменения готовы к деплою на Netlify.

---

**Дата:** 29.10.2025
**Время исправления:** ~5 минут
**Тип проблемы:** Конфигурация API маршрутов
