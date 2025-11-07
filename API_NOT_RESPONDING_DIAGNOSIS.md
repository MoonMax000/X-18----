# 🚨 Диагностика: API не отвечает на запросы

**Дата:** 07.11.2025, 22:56
**Проблема:** После успешной регистрации пользователя, при вводе кода верификации email возникает сетевая ошибка

## 📊 Симптомы

1. **Frontend ошибка:**
   ```
   [Error] Failed to load resource: Сетевое соединение потеряно. (email, line 0)
   [Error] ❌ Verification error: – TypeError: Load failed
   ```

2. **API endpoint:** `POST https://api.tyriantrade.com/api/auth/verify/email`
3. **Код верификации:** 453150
4. **Email:** devidanderson@gmail.com

## 🔍 Проведенная диагностика

### 1. ✅ Деплой статус (GitHub Actions)
- **Последний деплой:** Run #19169984279 (07.11.2025, 13:33)
- **Статус:** SUCCESS ✅
- **Кластер:** tyriantrade-cluster
- **Сервис:** tyriantrade-backend-service
- **Image:** 506675684508.dkr.ecr.us-east-1.amazonaws.com/tyriantrade/backend:9ba8353853f8dc04b5bd8f2d2ee4db5ad9111bad

### 2. ⚠️ SSL соединение
- **DNS:** Резолвится в 3 IP: 54.243.33.27, 52.86.35.221, 52.3.180.155
- **SSL handshake:** Успешен ✅
- **TLS:** v1.2 / ECDHE-RSA-AES128-GCM-SHA256 ✅
- **Certificate:** Valid для api.tyriantrade.com ✅
- **HTTP/2:** Подключен ✅

### 3. ❌ API Response
- **Curl тест:** `curl -v https://api.tyriantrade.com/health`
- **Результат:** TIMEOUT (30+ секунд)
- **Проблема:** Backend не отвечает на запросы после установки SSL соединения

### 4. ⏱️ AWS CLI Timeouts
Все AWS команды завершаются таймаутом:
- `aws ecs describe-services` - TIMEOUT
- `aws ecs list-tasks` - TIMEOUT

## 🤔 Возможные причины

### 1. Backend контейнер не запущен
- ECS task мог не запуститься из-за ошибки
- Health check может не проходить
- Container может crashить при старте

### 2. Проблема с переменными окружения
Возможно отсутствуют критические ENV переменные:
- `DATABASE_URL` или connection settings
- `REDIS_URL`
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `RESEND_API_KEY` или `SES` credentials
- `GOOGLE_OAUTH_*` / `APPLE_OAUTH_*`

### 3. Database connection issues
- RDS может быть недоступен из ECS subnet
- Security groups могут блокировать соединение
- IAM database authentication может быть не настроен

### 4. Redis connection issues
- ElastiCache может быть недоступен
- Security groups могут блокировать Redis порт

### 5. Health check failure
- ECS health check endpoint `/health` может не отвечать
- Load balancer не регистрирует healthy targets
- ALB перестал направлять трафик на targets

## 🔧 Необходимые действия

### Приоритет 1: Проверить логи CloudWatch
```bash
aws logs tail /ecs/tyriantrade-backend \
  --follow \
  --since 30m \
  --region us-east-1
```

### Приоритет 2: Проверить ECS task статус
```bash
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --region us-east-1
```

### Приоритет 3: Проверить running tasks
```bash
aws ecs list-tasks \
  --cluster tyriantrade-cluster \
  --service-name tyriantrade-backend-service \
  --region us-east-1
```

### Приоритет 4: Проверить ALB target health
```bash
aws elbv2 describe-target-health \
  --target-group-arn <ARN> \
  --region us-east-1
```

## 📝 Временное решение

Пока API не работает, пользователь не может:
1. Завершить регистрацию через email verification
2. Войти в систему
3. Использовать любые API endpoints

### Workaround для тестирования
Можно напрямую пометить пользователя как verified в БД:
```sql
UPDATE users 
SET is_email_verified = true 
WHERE email = 'devidanderson@gmail.com';

-- Удалить код верификации
DELETE FROM verification_codes 
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'devidanderson@gmail.com'
);
```

## 🎯 Следующие шаги

1. ✅ Создать этот диагностический отчет
2. ⏳ Попытаться получить логи CloudWatch с увеличенным timeout
3. ⏳ Если AWS CLI не работает - использовать AWS Console
4. ⏳ Проверить переменные окружения в task definition
5. ⏳ При необходимости - перезапустить ECS service
6. ⏳ Проверить ALB target groups
7. ⏳ Если проблема не решается - rollback к предыдущей версии

## ⚠️ Критическая информация

**Обнаружено несоответствие имен:**
- В коде репозитория используются: `x18-backend-cluster`, `x18-backend-service`
- В GitHub Actions используются: `tyriantrade-cluster`, `tyriantrade-backend-service`

Это может указывать на то, что деплой идет не в тот кластер, который ожидается!

## 🔗 Связанные файлы

- `.github/workflows/deploy.yml` - workflow configuration
- `custom-backend/internal/api/auth.go` - VerifyEmail handler
- `DEPLOYMENT.md` - deployment documentation
