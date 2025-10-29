# 🔧 Исправление Проблемы со Старым URL

## 🔴 Проблема

Frontend обращается к старому Railway URL:
```
https://x-18-production.up.railway.app
```

Вместо нового домена:
```
https://api.tyriantrade.com
```

## 🎯 Причина

При сборке frontend на Netlify использовался старый URL. Переменные окружения в `.env.production` правильные, но нужно:
1. Добавить их в Netlify
2. Пересобрать проект

---

## ✅ РЕШЕНИЕ (5 минут)

### Шаг 1: Добавить Environment Variables в Netlify

1. Открыть https://app.netlify.com
2. Выбрать проект **tyrian-trade-frontend**
3. **Site configuration** → **Environment variables**
4. Нажать **Add a variable**

Добавить эти переменные:

```
VITE_API_URL=https://api.tyriantrade.com
VITE_APP_URL=https://social.tyriantrade.com
VITE_ADMIN_URL=https://admin.tyriantrade.com
VITE_APP_ENV=production
```

**Важно:** Каждую переменную добавлять отдельно!

### Шаг 2: Очистить кэш и Пересобрать

1. В Netlify проекте перейти в **Deploys**
2. Нажать **Trigger deploy** → **Clear cache and deploy site**
3. Подождать 2-3 минуты

---

## 🚀 Альтернатива: Через Git (Рекомендуется)

Если у вас настроен Git:

```bash
# Закоммитить изменения
git add client/.env.production
git commit -m "Update production API URL"
git push origin main

# Netlify автоматически пересоберет
```

---

## ✅ Проверка После Исправления

```bash
# 1. Открыть сайт
open https://social.tyriantrade.com

# 2. Открыть DevTools (F12)
# 3. Смотреть Network tab
# 4. Должны видеть запросы к api.tyriantrade.com
```

**Правильные запросы:**
```
https://api.tyriantrade.com/api/notifications
https://api.tyriantrade.com/api/timeline/explore
```

**НЕ должно быть:**
```
https://x-18-production.up.railway.app  ❌
```

---

## 🔍 Диагностика

### Проверить что переменные установлены:

1. В Netlify → Site configuration → Environment variables
2. Должны видеть:
   - VITE_API_URL = https://api.tyriantrade.com
   - VITE_APP_URL = https://social.tyriantrade.com
   - VITE_ADMIN_URL = https://admin.tyriantrade.com
   - VITE_APP_ENV = production

### Проверить логи сборки:

1. Netlify → Deploys → последний Deploy
2. Смотреть в логах строки:
   ```
   VITE_API_URL=https://api.tyriantrade.com
   ```

---

## 💡 Почему Это Произошло?

Vite (сборщик) "зашивает" environment variables в bundle во время сборки.

**Старая сборка:**
```javascript
// Код был скомпилирован с:
const API_URL = "https://x-18-production.up.railway.app"
```

**Новая сборка (после исправления):**
```javascript
// Код будет скомпилирован с:
const API_URL = "https://api.tyriantrade.com"
```

Вот почему просто изменить `.env.production` недостаточно - нужна пересборка!

---

## ⚠️ Важно

После добавления переменных в Netlify и пересборки:
- ✅ Все запросы пойдут на `api.tyriantrade.com`
- ✅ CORS будет работать (мы его уже настроили)
- ✅ Домены будут правильно общаться

---

## 📞 Что Делать Прямо Сейчас

1. Открыть https://app.netlify.com
2. Найти **tyrian-trade-frontend**
3. Site configuration → Environment variables → Add variables
4. Deploys → Trigger deploy → Clear cache and deploy site
5. Подождать 2-3 минуты
6. Обновить страницу https://social.tyriantrade.com

**Готово! 🎉**
