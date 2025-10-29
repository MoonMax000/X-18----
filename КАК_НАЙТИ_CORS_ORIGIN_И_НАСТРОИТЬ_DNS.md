# 🎯 Где найти CORS_ORIGIN и как исправить DNS

## 1️⃣ CORS_ORIGIN находится в Variables!

По вашему скриншоту вижу, что вы в Settings. Вот где добавить CORS_ORIGIN:

### Шаги:
1. Вы сейчас в **Settings** вашего сервиса X-18----
2. Прямо над Settings есть вкладка **Variables** - нажмите на неё!
3. В Variables добавьте новую переменную:
   - Имя: `CORS_ORIGIN`
   - Значение: `https://social.tyriantrade.com,https://admin.tyriantrade.com`
4. Нажмите Add/Save

## 2️⃣ Исправьте DNS в FirstVDS

Railway показывает, что у вас неправильно настроен DNS. Нужно изменить CNAME:

### Что сейчас (неправильно):
```
api CNAME x-18-production-38ec.up.railway.app.tyriantrade.com
```

### Что должно быть (правильно):
```
api CNAME tjpcog02.up.railway.app
```

## 📝 Итоговые DNS записи для FirstVDS:

| Имя | Тип | Значение |
|-----|-----|----------|
| api | CNAME | **tjpcog02.up.railway.app** |
| social | CNAME | wonderful-einstein-123abc.netlify.app |
| admin | CNAME | sunny-froyo-f47377.netlify.app |

## ⚠️ Важно:
- Railway дал вам новый CNAME: **tjpcog02.up.railway.app**
- Используйте именно его, а не старый x-18-production-38ec
- В FirstVDS нужно исправить запись для api

## 🔧 Навигация в Railway:

```
X-18---- (ваш сервис)
├── Deployments - история деплоев
├── Variables - ТУТ ДОБАВЬТЕ CORS_ORIGIN! ⬅️
├── Metrics - метрики
└── Settings - вы сейчас здесь
```

## ✅ Что делать:
1. Нажмите на вкладку **Variables** (она рядом с Settings)
2. Добавьте `CORS_ORIGIN`
3. Идите в FirstVDS и измените CNAME для api на **tjpcog02.up.railway.app**
