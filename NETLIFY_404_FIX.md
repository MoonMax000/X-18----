# 🔧 Исправление ошибки 404 на Netlify

## Проблема
Сайт https://sunny-froyo-f47377.netlify.app показывает "Page not found"

## Причина
Скорее всего неправильно указана директория для сборки в настройках Netlify

---

## ✅ Решение (2 минуты):

### Шаг 1: Проверьте настройки сборки на Netlify

1. Откройте https://app.netlify.com
2. Найдите ваш сайт **sunny-froyo-f47377**
3. Нажмите **"Site settings"**
4. Перейдите в **"Build & deploy"** → **"Continuous deployment"** → **"Build settings"**

### Шаг 2: Убедитесь в правильных настройках:

**ВАЖНО! Должно быть именно так:**

```
Base directory: (оставьте ПУСТЫМ или поставьте /)
Build command: npm run build
Publish directory: dist
```

**НЕ должно быть:**
- ❌ Base directory: client
- ❌ Publish directory: client/dist

### Шаг 3: Если настройки неправильные - измените их

Если вы видите что-то другое:
1. Нажмите **"Edit settings"**
2. Измените на правильные значения (см. выше)
3. Нажмите **"Save"**
4. Перейдите в **"Deploys"**
5. Нажмите **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Шаг 4: Проверьте переменные окружения

1. В настройках сайта перейдите в **"Environment variables"**
2. Убедитесь что там есть:

```
VITE_API_URL = https://x-18-production-38ec.up.railway.app
VITE_APP_ENV = production
```

Если их нет - добавьте!

---

## Шаг 5: Обновите CORS на Backend (Railway)

1. Откройте https://railway.app
2. Откройте ваш проект с backend
3. Перейдите в **"Variables"**
4. Найдите переменную `CORS_ORIGIN`
5. Измените значение на:
   ```
   https://sunny-froyo-f47377.netlify.app
   ```
6. Нажмите **"Deploy"** (или подождите автоматического редеплоя)

---

## Шаг 6: Проверьте результат

Подождите 2-3 минуты и откройте:
https://sunny-froyo-f47377.netlify.app

**Должна открыться главная страница вашего приложения!**

---

## 🔍 Если всё ещё не работает:

### Проверьте логи сборки:

1. На Netlify откройте **"Deploys"**
2. Нажмите на последний деплой
3. Посмотрите логи сборки

**Ищите:**
- ✅ "Build succeeded" - хорошо
- ❌ Ошибки сборки - нужно исправлять

### Типичные ошибки в логах:

**Ошибка 1:** "Module not found"
- **Решение:** Не хватает зависимостей, запустите локально `npm install`

**Ошибка 2:** "Build failed"
- **Решение:** Проверьте переменные окружения на Netlify

**Ошибка 3:** Успешная сборка, но 404
- **Решение:** Проверьте "Publish directory" - должно быть `dist`

---

## 📊 Проверка работы backend

Откройте в браузере:
```
https://x-18-production-38ec.up.railway.app/health
```

Должно вернуть:
```json
{
  "env": "production",
  "status": "ok"
}
```

Если нет - проблема с backend, не с frontend.

---

## 🎯 Чеклист финального деплоя:

- [ ] Base directory: пусто или `/`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Переменные окружения добавлены на Netlify
- [ ] CORS_ORIGIN обновлен на Railway на `https://sunny-froyo-f47377.netlify.app`
- [ ] Backend редеплоен после изменения CORS
- [ ] Сайт пересобран на Netlify (Clear cache and deploy)
- [ ] Открывается главная страница

---

## ✅ После исправления

Ваше приложение будет доступно по адресу:
**https://sunny-froyo-f47377.netlify.app**

И будет корректно общаться с backend на:
**https://x-18-production-38ec.up.railway.app**

**Готово!** 🎉
