# 🌐 Полное руководство по настройке доменов

## Архитектура доменов

```
tyriantrade.com
├── app.tyriantrade.com     → Frontend (Netlify)
├── api.tyriantrade.com     → Backend API (Railway)
└── admin.tyriantrade.com   → Admin Panel (Netlify)
```

## 📝 Шаг 1: Настройка DNS в FirstVDS

### Войдите в панель FirstVDS
1. Перейдите на https://my.firstvds.ru
2. Авторизуйтесь в вашем аккаунте
3. Откройте раздел **Домены**
4. Найдите домен `tyriantrade.com`

### Добавьте DNS записи

#### Для Frontend (app.tyriantrade.com):
```
Тип: CNAME
Имя: app
Значение: [ваш-проект].netlify.app
TTL: 3600
```

#### Для Backend API (api.tyriantrade.com):
```
Тип: CNAME
Имя: api
Значение: x-18-production.up.railway.app
TTL: 3600
```

#### Для Admin Panel (admin.tyriantrade.com):
```
Тип: CNAME
Имя: admin
Значение: [ваш-проект].netlify.app
TTL: 3600
```

### ⚠️ Важно:
- Замените `[ваш-проект]` на реальное название вашего проекта в Netlify
- DNS изменения могут занять от 5 минут до 24 часов для полного распространения
- Обычно это происходит в течение 5-30 минут

## 🚂 Шаг 2: Настройка Railway

### Через веб-интерфейс:
1. Откройте https://railway.app/dashboard
2. Выберите проект **X-18**
3. Нажмите на сервис **custom-backend**

### Добавьте кастомный домен:
1. Перейдите в **Settings** → **Networking**
2. В разделе **Public Networking** нажмите **Add a Custom Domain**
3. Введите: `api.tyriantrade.com`
4. Railway покажет CNAME запись для проверки
5. Убедитесь, что она совпадает с той, что вы добавили в FirstVDS

### Обновите переменные окружения:
1. Перейдите в **Variables**
2. Найдите или создайте переменную `CORS_ORIGIN`
3. Установите значение:
```
https://app.tyriantrade.com,https://admin.tyriantrade.com,http://localhost:5173,http://localhost:5174
```

4. Добавьте другие необходимые переменные:
```
NODE_ENV=production
PORT=3000
```

### Перезапустите сервис:
1. В разделе **Deployments**
2. Нажмите **Redeploy** на последнем деплое
3. Дождитесь завершения деплоя

## 🚀 Шаг 3: Настройка Netlify

### Через веб-интерфейс:
1. Откройте https://app.netlify.com
2. Выберите ваш проект

### Добавьте основной домен (Frontend):
1. Перейдите в **Domain settings**
2. Нажмите **Add custom domain**
3. Введите: `app.tyriantrade.com`
4. Нажмите **Verify**
5. Если DNS настроен правильно, Netlify автоматически подтвердит домен

### Добавьте домен для админки:
1. В том же разделе нажмите **Add domain alias**
2. Введите: `admin.tyriantrade.com`
3. Netlify автоматически настроит редирект

### Настройте SSL сертификаты:
1. В разделе **Domain settings** → **HTTPS**
2. Netlify автоматически выпустит SSL сертификаты Let's Encrypt
3. Это может занять 5-15 минут после подтверждения доменов

### Обновите переменные окружения:
1. Перейдите в **Site settings** → **Environment variables**
2. Добавьте или обновите:
```
VITE_API_URL=https://api.tyriantrade.com
VITE_APP_URL=https://app.tyriantrade.com
VITE_ADMIN_URL=https://admin.tyriantrade.com
VITE_APP_ENV=production
```

### Пересоберите проект:
1. Перейдите в **Deploys**
2. Нажмите **Trigger deploy** → **Deploy site**

## 🔧 Шаг 4: Использование CLI инструментов

### Railway CLI:
```bash
# Установка
npm install -g @railway/cli

# Авторизация
railway login

# Привязка к проекту
railway link

# Установка переменных
railway variables set CORS_ORIGIN="https://app.tyriantrade.com,https://admin.tyriantrade.com"

# Деплой
railway up
```

### Netlify CLI:
```bash
# Установка
npm install -g netlify-cli

# Авторизация
netlify login

# Привязка к проекту
netlify link

# Добавление домена
netlify domains:add app.tyriantrade.com
netlify domains:add admin.tyriantrade.com

# Деплой
netlify deploy --prod
```

## ✅ Шаг 5: Проверка настройки

### Проверьте DNS записи:
```bash
# Проверка DNS для каждого домена
nslookup app.tyriantrade.com
nslookup api.tyriantrade.com
nslookup admin.tyriantrade.com

# Или используйте dig
dig app.tyriantrade.com
dig api.tyriantrade.com
dig admin.tyriantrade.com
```

### Проверьте доступность сервисов:
```bash
# Frontend
curl -I https://app.tyriantrade.com

# Backend API
curl https://api.tyriantrade.com/health

# Admin Panel
curl -I https://admin.tyriantrade.com
```

### Используйте скрипт автоматической проверки:
```bash
./setup-domains.sh
# Выберите опцию 6 - Проверить статус всех сервисов
```

## 🐛 Устранение проблем

### DNS не резолвится:
- Подождите 5-30 минут после добавления записей
- Проверьте правильность CNAME записей в FirstVDS
- Очистите кэш DNS: `sudo dscacheutil -flushcache` (macOS)

### Railway не принимает домен:
- Убедитесь, что CNAME указывает на `x-18-production.up.railway.app`
- Проверьте, что домен не используется в другом проекте
- Попробуйте удалить и заново добавить домен

### Netlify показывает ошибку:
- Проверьте, что DNS записи активны (используйте nslookup)
- Убедитесь, что домен не привязан к другому аккаунту Netlify
- Проверьте статус SSL сертификатов в настройках

### CORS ошибки:
- Проверьте переменную `CORS_ORIGIN` в Railway
- Убедитесь, что включены оба домена (app и admin)
- Перезапустите backend после изменения переменных

## 📊 Мониторинг

### Railway:
- Dashboard: https://railway.app/dashboard
- Логи: Settings → Observability → View Logs
- Метрики: Settings → Metrics

### Netlify:
- Dashboard: https://app.netlify.com
- Логи деплоя: Deploys → Click on deploy
- Аналитика: Analytics (если включено)

## 🔐 Безопасность

1. **SSL/TLS**: Все домены автоматически получают SSL сертификаты
2. **CORS**: Настроен для разрешения только ваших доменов
3. **Заголовки безопасности**: Netlify автоматически добавляет базовые заголовки
4. **Rate Limiting**: Railway предоставляет базовую защиту от DDoS

## 📝 Финальный чеклист

- [ ] DNS записи добавлены в FirstVDS
- [ ] Домены подтверждены в Railway
- [ ] Домены подтверждены в Netlify
- [ ] SSL сертификаты активны
- [ ] CORS настроен правильно
- [ ] Переменные окружения обновлены
- [ ] Frontend доступен по https://app.tyriantrade.com
- [ ] API доступен по https://api.tyriantrade.com/health
- [ ] Admin панель доступна по https://admin.tyriantrade.com
- [ ] Нет CORS ошибок при взаимодействии

## 🎉 Готово!

После выполнения всех шагов ваш проект будет доступен по адресам:
- **Приложение**: https://app.tyriantrade.com
- **API**: https://api.tyriantrade.com
- **Админ панель**: https://admin.tyriantrade.com

Для входа в админ панель используйте:
- Email: admin@tyriantrade.com (или ваш настроенный админ email)
- Пароль: (тот, который вы установили при создании админа)
