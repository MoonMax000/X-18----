# ⚠️ ВАЖНО: Вы добавляете домены не в те проекты!

## 🔴 Проблема:
Вы добавляете оба домена (social и admin) в проект **sunny-froyo-f47377**, но это неправильно!

## ✅ Как правильно:

### У вас ДВА разных проекта в Netlify:
1. **wonderful-einstein-123abc.netlify.app** - это ваша СОЦИАЛЬНАЯ СЕТЬ
2. **sunny-froyo-f47377.netlify.app** - это ваша АДМИН ПАНЕЛЬ

### Домены нужно добавлять так:
- **social.tyriantrade.com** → в проект wonderful-einstein-123abc
- **admin.tyriantrade.com** → в проект sunny-froyo-f47377

## 📝 Шаг 1: Добавьте TXT запись для подтверждения

Netlify требует подтвердить, что вы владеете доменом tyriantrade.com.

### В FirstVDS добавьте TXT запись:
| Имя | Тип | Значение |
|-----|-----|----------|
| subdomain-owner-verification | TXT | 9a9c8b1075e75c4c642c29ecb03b54f2 |

## 📝 Шаг 2: Откройте ПРАВИЛЬНЫЙ проект в Netlify

### Для social.tyriantrade.com:
1. Перейдите на главную страницу Netlify
2. Найдите проект **wonderful-einstein-123abc**
3. Откройте Site settings → Domain management
4. Добавьте social.tyriantrade.com

### Для admin.tyriantrade.com:
1. Оставайтесь в проекте **sunny-froyo-f47377** (где вы сейчас)
2. Site settings → Domain management  
3. Добавьте admin.tyriantrade.com

## 🎯 Правильные DNS записи для FirstVDS:

После того, как вы добавите домены в правильные проекты Netlify:

| Имя | Тип | Значение | Для чего |
|-----|-----|----------|----------|
| social | CNAME | **wonderful-einstein-123abc.netlify.app** | Соц. сеть |
| admin | CNAME | **sunny-froyo-f47377.netlify.app** | Админка |
| api | CNAME | **tjpcog02.up.railway.app** | Backend |
| subdomain-owner-verification | TXT | 9a9c8b1075e75c4c642c29ecb03b54f2 | Проверка |

## ❌ Что вы делаете сейчас (неправильно):
- Добавляете social.tyriantrade.com в проект sunny-froyo (админка)
- Netlify показывает CNAME на sunny-froyo для обоих доменов

## ✅ Что нужно сделать:
1. Нажмите "Close" в текущем окне
2. Вернитесь на главную Netlify
3. Выберите проект **wonderful-einstein-123abc**
4. Добавьте туда social.tyriantrade.com
5. В проекте **sunny-froyo-f47377** добавьте только admin.tyriantrade.com

## 🔍 Как найти нужный проект:

В Netlify на главной странице у вас должно быть два сайта:
```
Sites:
- wonderful-einstein-123abc  ← сюда social.tyriantrade.com
- sunny-froyo-f47377         ← сюда admin.tyriantrade.com
```

## 💡 Почему это важно:
- wonderful-einstein - это ваше основное приложение (социальная сеть)
- sunny-froyo - это отдельное приложение (админ панель)
- Они должны работать на разных доменах
