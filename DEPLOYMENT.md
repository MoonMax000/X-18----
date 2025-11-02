# 🚀 Деплой X-18 на AWS

> **ВАЖНО:** Проект использует ТОЛЬКО AWS для production деплоя. Railway и Netlify больше не используются.

## 📋 Оглавление

- [Архитектура](#архитектура)
- [Предварительные требования](#предварительные-требования)
- [Деплой Frontend](#деплой-frontend)
- [Деплой Backend](#деплой-backend)
- [Проверка работоспособности](#проверка-работоспособности)
- [Troubleshooting](#troubleshooting)

---

## 🏗 Архитектура

### Production URLs:
- **Frontend**: https://social.tyriantrade.com (CloudFront + S3)
- **API**: https://api.tyriantrade.com (ECS + ALB)

### Компоненты AWS:
- **S3**: Хранение статических файлов frontend
- **CloudFront**: CDN для frontend
- **ECR**: Docker registry для backend образов
- **ECS (Fargate)**: Запуск backend контейнеров
- **RDS PostgreSQL**: База данных
- **SES**: Отправка email

---

## ✅ Предварительные требования

1. **AWS CLI** установлен и настроен
2. **GitHub** репозиторий настроен с secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
3. **Переменные окружения** в AWS настроены

---

## 🎨 Деплой Frontend

### Автоматический деплой (GitHub Actions)

При push в `main` или `production` ветку автоматически запускается workflow `.github/workflows/deploy.yml`.

**Важно:** Frontend билдится командой `pnpm run build:client`, которая создает статические файлы в `dist/spa/`.

### Шаги деплоя:

1. **Build**: `pnpm run build:client`
   - Создает оптимизированные файлы в `dist/spa/`
   - Использует переменные из `.env.production`

2. **Upload to S3**: `aws s3 sync dist/spa/ s3://tyriantrade-frontend/ --delete`
   - Загружает файлы в S3 bucket
   - Удаляет устаревшие файлы

3. **Invalidate CloudFront**: `aws cloudfront create-invalidation --distribution-id E2V60CFOUD2P7L --paths "/*"`
   - Очищает CDN кеш
   - Пользователи получают новую версию

### Переменные окружения:

```env
VITE_API_URL=https://api.tyriantrade.com
VITE_APP_URL=https://social.tyriantrade.com
VITE_APP_ENV=production
```

### Ручной деплой:

```bash
# 1. Собрать frontend
pnpm run build:client

# 2. Загрузить в S3
aws s3 sync dist/spa/ s3://tyriantrade-frontend/ --delete

# 3. Очистить CloudFront кеш
aws cloudfront create-invalidation \
  --distribution-id E2V60CFOUD2P7L \
  --paths "/*"
```

---

## 🔧 Деплой Backend

### Автоматический деплой (GitHub Actions)

Backend деплоится параллельно с frontend через тот же workflow.

### Шаги деплоя:

1. **Build Docker image**:
   ```bash
   cd custom-backend
   docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
   ```

2. **Push to ECR**:
   ```bash
   docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
   docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
   docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
   ```

3. **Update ECS Task Definition** и **Deploy to ECS**:
   - Создается новая версия task definition
   - ECS запускает новые контейнеры
   - Ждет стабильности сервиса (health checks)
   - Останавливает старые контейнеры

### Переменные окружения в ECS:

Настроены через AWS Console → ECS → Task Definition:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
CORS_ORIGIN=https://social.tyriantrade.com
APP_ENV=production
AWS_REGION=us-east-1
AWS_SES_FROM_EMAIL=noreply@tyriantrade.com
```

### Ручной деплой:

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  506675684508.dkr.ecr.us-east-1.amazonaws.com

# 2. Build and push
cd custom-backend
docker build -t 506675684508.dkr.ecr.us-east-1.amazonaws.com/tyriantrade/backend:latest .
docker push 506675684508.dkr.ecr.us-east-1.amazonaws.com/tyriantrade/backend:latest

# 3. Update ECS service
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment
```

---

## ✓ Проверка работоспособности

### Frontend:

```bash
# Проверить что сайт доступен
curl -I https://social.tyriantrade.com

# Должен вернуть 200 OK
```

### Backend:

```bash
# Health check
curl https://api.tyriantrade.com/health

# Должен вернуть:
# {"status":"ok","env":"production"}
```

### CloudFront:

```bash
# Проверить что CDN работает
curl -I https://social.tyriantrade.com

# В заголовках должно быть:
# x-cache: Hit from cloudfront
```

---

## 🔍 Troubleshooting

### Frontend не обновляется

**Проблема:** Изменения не видны на сайте

**Решение:**
```bash
# Очистить CloudFront кеш
aws cloudfront create-invalidation \
  --distribution-id E2V60CFOUD2P7L \
  --paths "/*"

# Подождать 1-2 минуты
```

### Backend не запускается

**Проблема:** ECS не может запустить контейнеры

**Решение:**
```bash
# 1. Проверить логи в CloudWatch
aws logs tail /ecs/tyriantrade-backend --follow

# 2. Проверить task definition
aws ecs describe-task-definition --task-definition tyriantrade-backend

# 3. Проверить health checks
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service
```

### CORS ошибки

**Проблема:** `Access-Control-Allow-Origin` ошибки

**Решение:**
1. Проверить что `CORS_ORIGIN` в ECS = `https://social.tyriantrade.com`
2. Убедиться что frontend делает запросы на `https://api.tyriantrade.com`

### Деплой занимает слишком долго

**Нормально:**
- Frontend: 30-60 секунд
- Backend: 5-10 минут (включая health checks)

**Если дольше:**
1. Проверить GitHub Actions logs
2. Проверить AWS Service Health Dashboard
3. Проверить лимиты AWS аккаунта

### Mixed content warnings

**Проблема:** `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource`

**Решение:**
1. Проверить что все URL используют `https://`
2. Проверить `client/.env.production`:
   ```env
   VITE_API_URL=https://api.tyriantrade.com  # https, НЕ http
   ```

---

## 📚 Дополнительные ресурсы

- **AWS Console**: https://console.aws.amazon.com
- **GitHub Actions**: https://github.com/MoonMax000/X-18----/actions
- **CloudFront Distribution**: https://console.aws.amazon.com/cloudfront/v3/home#/distributions/E2V60CFOUD2P7L

---

## ⚠️ Важные правила

### ✅ DO:
- Используйте `pnpm run build:client` для билда frontend
- Деплойте через GitHub Actions (push в main/production)
- Проверяйте health checks после деплоя
- Очищайте CloudFront кеш после frontend деплоя

### ❌ DON'T:
- НЕ используйте `pnpm run build` (билдит сервер тоже)
- НЕ используйте Railway или Netlify команды
- НЕ забывайте про CloudFront invalidation
- НЕ деплойте без проверки в локальном окружении

---

## 🆘 Получить помощь

Если возникли проблемы:

1. Проверьте [Troubleshooting](#troubleshooting)
2. Проверьте логи GitHub Actions
3. Проверьте логи CloudWatch для backend
4. Проверьте AWS Service Health Dashboard

---

**Последнее обновление:** 02.11.2025
