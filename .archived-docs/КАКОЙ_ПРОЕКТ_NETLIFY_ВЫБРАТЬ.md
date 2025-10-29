# 🎯 Какой проект Netlify для какого домена

## 📋 Ваши проекты в Netlify:

По скриншоту вижу у вас 2 проекта:
1. **tyrian-trade-frontend** 
2. **social.tyriantrade.com**

## ❓ Как определить что где:

### Вариант 1: Откройте каждый проект и посмотрите URL

Кликните на **tyrian-trade-frontend**:
- Посмотрите URL в браузере (что-то вроде xxx.netlify.app)
- Если это **wonderful-einstein-123abc.netlify.app** → это ваша СОЦИАЛЬНАЯ СЕТЬ
- Если это **sunny-froyo-f47377.netlify.app** → это ваша АДМИН ПАНЕЛЬ

Потом кликните на **social.tyriantrade.com**:
- Посмотрите URL в браузере
- Определите что это за проект

## 🎯 Скорее всего правильное распределение:

### Если tyrian-trade-frontend = wonderful-einstein-123abc:
- **tyrian-trade-frontend** → добавьте домен **social.tyriantrade.com**
- **social.tyriantrade.com** (второй проект) → добавьте домен **admin.tyriantrade.com**

### Если наоборот:
- **social.tyriantrade.com** (проект) → добавьте домен **social.tyriantrade.com**
- **tyrian-trade-frontend** → добавьте домен **admin.tyriantrade.com**

## 🔍 Как проверить какой проект что содержит:

1. Откройте проект **tyrian-trade-frontend**
2. В адресной строке браузера посмотрите netlify URL
3. Или откройте сайт и посмотрите что там - социальная сеть или админка

## 📝 Быстрая проверка:

### Откройте в браузере:
- https://wonderful-einstein-123abc.netlify.app - если откроется соц. сеть, это ваш основной проект
- https://sunny-froyo-f47377.netlify.app - если откроется админка, это админ панель

## ✅ После определения:

### Для основного проекта (социальная сеть):
1. Откройте нужный проект
2. Site settings → Domain management
3. Add custom domain → **social.tyriantrade.com**

### Для админки:
1. Откройте другой проект
2. Site settings → Domain management
3. Add custom domain → **admin.tyriantrade.com**

## 💡 Подсказка:
Проект с названием **tyrian-trade-frontend** скорее всего является основным фронтендом (социальная сеть), поэтому туда нужно добавить **social.tyriantrade.com**
