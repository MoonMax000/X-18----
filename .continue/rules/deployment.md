# Правила деплоя для X-18

## 🚫 ЗАПРЕЩЕНО

### НЕ используйте устаревшие платформы:
- ❌ Railway (railway.app)
- ❌ Netlify (netlify.com)
- ❌ Любые команды `railway ...`
- ❌ Любые команды `netlify ...`

### НЕ используйте неправильные команды билда:
- ❌ `pnpm run build` - билдит И клиент И сервер
- ❌ `npm run build` - то же самое
- ❌ Любые упоминания `dist/` без `dist/spa/`

## ✅ РАЗРЕШЕНО

### Используйте только AWS:
- ✅ AWS S3 + CloudFront для frontend
- ✅ AWS ECS + ECR для backend
- ✅ GitHub Actions для CI/CD

### Используйте правильные команды:

**Для frontend билда:**
```bash
pnpm run build:client  # Только клиент → dist/spa/
```

**Для деплоя:**
```bash
# Frontend
aws s3 sync dist/spa/ s3://tyriantrade-frontend/ --delete
aws cloudfront create-invalidation --distribution-id E2V60CFOUD2P7L --paths "/*"

# Backend
aws ecs update-service --cluster tyriantrade-cluster --service tyriantrade-backend-service --force-new-deployment
```

## 📄 Документация

### Главный документ:
- `DEPLOYMENT.md` - полная инструкция по деплою

### При вопросах о деплое:
1. Сначала прочитать `DEPLOYMENT.md`
2. Проверить `.github/workflows/deploy.yml`
3. НЕ использовать устаревшие MD файлы с упоминанием Railway/Netlify

## 🎯 Production URLs

- Frontend: https://social.tyriantrade.com
- API: https://api.tyriantrade.com

## ⚠️ Важно

При любых изменениях в процессе деплоя:
1. Обновить `DEPLOYMENT.md`
2. Обновить `.github/workflows/deploy.yml`
3. НЕ создавать новые Railway/Netlify конфигурации
