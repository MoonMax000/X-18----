# 🤖 Настройка GitHub Actions для автодеплоя

Я создал два workflow файла для **автоматического деплоя** при каждом пуше на GitHub:

- `.github/workflows/deploy-railway.yml` - деплой backend на Railway
- `.github/workflows/deploy-netlify.yml` - деплой frontend на Netlify

## 🔑 Что нужно настроить

### 1. GitHub Secrets

Перейдите в ваш репозиторий на GitHub:
```
https://github.com/MoonMax000/X-18----/settings/secrets/actions
```

### 2. Добавьте следующие секреты:

#### Для Railway:

**RAILWAY_TOKEN**
1. Откройте https://railway.app/account/tokens
2. Нажмите "Create Token"
3. Скопируйте токен
4. Добавьте как секрет в GitHub

**RAILWAY_PROJECT_ID**
1. Откройте ваш проект на Railway
2. URL будет вида: `https://railway.com/project/566cabff-e9df-4baf-b1c0-8a92f4a0625f`
3. Скопируйте ID проекта (566cabff-e9df-4baf-b1c0-8a92f4a0625f)
4. Добавьте как секрет в GitHub

#### Для Netlify:

**NETLIFY_AUTH_TOKEN**
1. Откройте https://app.netlify.com/user/applications#personal-access-tokens
2. Нажмите "New access token"
3. Введите имя: "GitHub Actions"
4. Скопируйте токен
5. Добавьте как секрет в GitHub

**NETLIFY_SITE_ID**
1. Откройте ваш сайт на Netlify
2. Перейдите в Site settings → General → Site information
3. Скопируйте "Site ID" (или "API ID")
4. Добавьте как секрет в GitHub

**VITE_CUSTOM_BACKEND_URL**
```
https://ваш-backend-url.up.railway.app
```
(URL вашего Railway backend)

**VITE_STRIPE_PUBLISHABLE_KEY**
```
pk_test_51SAAyA5L1ldpQtHXqPMjNzmJgC66HaczmaGiBFvvqMbdjeGyTsEJAo740wyBphurUdTn7nWJLoscP48ICxklGRLp00tOkeCiOE
```

---

## 🚀 Как это работает

### Автоматический деплой backend (Railway):
Триггер срабатывает при пуше в ветки `nova-hub` или `main`, если изменились файлы в папке `custom-backend/`

### Автоматический деплой frontend (Netlify):
Триггер срабатывает при пуше в ветки `nova-hub` или `main`, если изменились файлы в папках `client/`, `package.json` или `vite.config.ts`

---

## ✅ Проверка

После настройки секретов:

1. Сделайте любое изменение в коде
2. Закоммитьте и запушьте на GitHub:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin nova-hub
   ```

3. Откройте раздел Actions на GitHub:
   ```
   https://github.com/MoonMax000/X-18----/actions
   ```

4. Вы увидите запущенные workflows:
   - ✅ "Deploy to Railway"
   - ✅ "Deploy to Netlify"

---

## 🎉 Результат

Теперь при каждом `git push`:
- Backend автоматически деплоится на Railway
- Frontend автоматически деплоится на Netlify

**Не нужно** каждый раз вручную запускать команды!

---

## 📝 Примечания

- Деплой занимает 2-5 минут
- Вы можете отслеживать прогресс в разделе Actions на GitHub
- Если деплой упал - проверьте логи в Actions
- Secrets безопасно хранятся в GitHub и не отображаются в логах

---

## 🆘 Troubleshooting

### "Error: RAILWAY_TOKEN not found"
Убедитесь что вы добавили все секреты в настройках репозитория

### "Error: railway link failed"
Проверьте что RAILWAY_PROJECT_ID корректный

### "Error: NETLIFY_AUTH_TOKEN invalid"
Перегенерируйте токен на Netlify и обновите секрет

### Деплой не запускается
Проверьте что вы пушите в ветку `nova-hub` или `main`
