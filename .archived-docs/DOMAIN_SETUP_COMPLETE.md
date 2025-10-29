# 🌐 ПОШАГОВАЯ НАСТРОЙКА ДОМЕНОВ
## tyriantrade.com → Railway + Netlify

*Последнее обновление: 29 октября 2025*

---

## 📋 ВЫБРАННАЯ СТРУКТУРА ДОМЕНОВ

- **app.tyriantrade.com** → Frontend (Netlify)
- **api.tyriantrade.com** → Backend API (Railway)
- **admin.tyriantrade.com** → Админ панель (CNAME на app.tyriantrade.com)
- **tyriantrade.com** → Главная/лендинг (позже)

---

## 🔧 ШАГ 1: НАСТРОЙКА DNS В FIRSTVDS

### Добавьте следующие записи в панели FirstVDS:

```dns
# Frontend (Netlify)
Тип: CNAME
Имя: app
Значение: affectionate-murdock-b5e89f.netlify.app
TTL: 3600

# Backend (Railway)  
Тип: CNAME
Имя: api
Значение: [получите из Railway на шаге 3]
TTL: 3600

# Админ панель
Тип: CNAME
Имя: admin
Значение: app.tyriantrade.com
TTL: 3600
```

### Как добавить в FirstVDS:
1. Зайдите в **my.firstvds.ru**
2. Откройте **Управление доменами**
3. Выберите **tyriantrade.com**
4. Нажмите **Добавить запись**
5. Введите данные выше
6. Сохраните

---

## 🚀 ШАГ 2: НАСТРОЙКА NETLIFY

### 2.1 Добавление домена:
1. Откройте **[netlify.com](https://app.netlify.com)**
2. Выберите ваш проект
3. Перейдите в **Site configuration** → **Domain management**
4. Нажмите **Add a custom domain**
5. Введите: `app.tyriantrade.com`
6. Подтвердите, что вы владелец домена

### 2.2 Проверка DNS:
Netlify покажет статус проверки. Подождите 5-10 минут пока DNS обновится.

### 2.3 Включение HTTPS:
1. После проверки DNS
2. В разделе **Domain management** → **HTTPS**
3. Нажмите **Provision certificate**
4. Подождите 5 минут

---

## 🚂 ШАГ 3: НАСТРОЙКА RAILWAY

### 3.1 Получение CNAME для Railway:
1. Откройте **[railway.app](https://railway.app)**
2. Выберите ваш проект
3. Откройте сервис **custom-backend**
4. Перейдите в **Settings** → **Domains**
5. Нажмите **+ Custom Domain**
6. Введите: `api.tyriantrade.com`
7. Railway покажет CNAME вида: `[project-name].up.railway.app`

### 3.2 Добавление CNAME в FirstVDS:
Вернитесь в FirstVDS и обновите запись для api:
```dns
Тип: CNAME
Имя: api
Значение: [полученный CNAME из Railway]
TTL: 3600
```

### 3.3 Подтверждение в Railway:
1. Вернитесь в Railway
2. Нажмите **Check status**
3. Дождитесь зеленой галочки

---

## 📝 ШАГ 4: ОБНОВЛЕНИЕ КОНФИГУРАЦИИ

### 4.1 Frontend переменные:
Обновите `client/.env.production`:
```env
VITE_API_URL=https://api.tyriantrade.com
VITE_APP_URL=https://app.tyriantrade.com
VITE_ADMIN_URL=https://admin.tyriantrade.com
```

### 4.2 Backend переменные в Railway:
Добавьте в Railway Dashboard → Variables:
```env
FRONTEND_URL=https://app.tyriantrade.com
ADMIN_URL=https://admin.tyriantrade.com
ALLOWED_ORIGINS=https://app.tyriantrade.com,https://admin.tyriantrade.com,https://tyriantrade.com
```

### 4.3 CORS обновление:
Backend автоматически подхватит ALLOWED_ORIGINS из переменных.

---

## ✅ ШАГ 5: ПРОВЕРКА

### Проверьте каждый домен:

1. **Frontend**: https://app.tyriantrade.com
   - Должна открыться ваша соцсеть
   - Проверьте HTTPS (замочек в браузере)

2. **API**: https://api.tyriantrade.com/health
   - Должен вернуть `{"status":"ok"}`

3. **Admin**: https://admin.tyriantrade.com/admin
   - Должна открыться админ панель

---

## 🛠 АВТОМАТИЗАЦИЯ

Я создал скрипт для упрощения процесса:

### Запустите:
```bash
./setup-domains.sh
```

Скрипт:
- Обновит все конфигурационные файлы
- Сделает git commit и push
- Покажет статус доменов

---

## ⏱ ВРЕМЯ НАСТРОЙКИ

- **DNS пропагация**: 5-30 минут
- **SSL сертификаты**: 5-10 минут
- **Полная настройка**: 30-60 минут

---

## 🆘 ЧАСТЫЕ ПРОБЛЕМЫ

### "DNS_PROBE_FINISHED_NXDOMAIN"
- Подождите 30 минут для обновления DNS
- Проверьте правильность CNAME записей

### "SSL certificate error"
- Подождите пока Netlify/Railway выпустят сертификат
- Обычно занимает 5-10 минут

### API не отвечает
- Проверьте переменные ALLOWED_ORIGINS в Railway
- Убедитесь что backend деплой прошел успешно

---

## 📞 ПОДДЕРЖКА

### FirstVDS:
- Email: support@firstvds.ru
- Телефон: +7 (812) 336-44-86

### Netlify:
- Документация: https://docs.netlify.com
- Форум: https://answers.netlify.com

### Railway:
- Discord: https://discord.gg/railway
- Документация: https://docs.railway.app

---

## ✨ ГОТОВО!

После выполнения всех шагов ваш проект будет доступен по адресам:
- 🌐 **Приложение**: https://app.tyriantrade.com
- 🔌 **API**: https://api.tyriantrade.com
- 👨‍💼 **Админка**: https://admin.tyriantrade.com
