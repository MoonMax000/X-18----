# OAuth Deployment Guide - Production

## Текущий статус

### ✅ Локальная разработка
- Backend: запущен с новым OAuth кодом
- БД: миграция применена (avatar_url = 2000)
- Работает: Google OIDC, Apple SIWA with go-signin-with-apple

### ⚠️ Production (AWS)
- БД: требуется миграция avatar_url
- Код: требуется deployment

## Проблема в production

```
ERROR: value too long for type character varying(500)
```

**Причина:** Google возвращает очень длинные avatar URLs (>500 символов)

## Решение: 2 шага

### Шаг 1: Применить миграцию к AWS RDS

#### Вариант A: Через AWS Console (RDS Query Editor)

1. Откройте AWS Console → RDS → Query Editor
2. Подключитесь к `tyriantrade-db`
3. Выполните:

```sql
ALTER TABLE users ALTER COLUMN avatar_url TYPE VARCHAR(2000);
ALTER TABLE users ALTER COLUMN header_url TYPE VARCHAR(2000);
COMMENT ON COLUMN users.avatar_url IS 'User avatar URL (supports long Google profile URLs up to 2000 chars)';
```

#### Вариант B: Через psql (если есть доступ)

```bash
chmod +x apply-avatar-migration-aws.sh
./apply-avatar-migration-aws.sh
```

#### Вариант C: Через AWS Systems Manager Session Manager

```bash
# Подключитесь к bastion host или ECS task
# Затем выполните миграцию
```

#### Вариант D: Автоматически при deployment

Миграция будет применена автоматически при деплое через GORM AutoMigrate (код уже обновлен в models/user.go).

### Шаг 2: Задеплоить обновленный код

```bash
./deploy.sh backend
```

Это:
1. Соберет новый Docker image с обновленным OAuth
2. Push в ECR
3. Обновит ECS service (force new deployment)
4. GORM автоматически применит изменения схемы при старте

## Что изменилось в коде

### Backend (Go)
1. `internal/oauth/apple.go` - СОЗДАН новый AppleService
2. `internal/api/oauth_handlers.go` - использует AppleService
3. `internal/models/user.go` - avatar_url: 500 → 2000
4. `go.mod` - добавлена зависимость `go-signin-with-apple`

### OAuth улучшения
- ✅ Google: OIDC scopes (`openid`, `email`, `profile`)
- ✅ Apple: `go-signin-with-apple` библиотека
- ✅ Apple: response_mode=form_post
- ✅ Avatar URLs: поддержка до 2000 символов

## Проверка после deployment

### 1. Проверьте логи ECS
```bash
aws logs tail /ecs/tyriantrade-backend --follow
```

Должны увидеть:
```
✅ Google OAuth configured (OIDC): ClientID=659860...
✅ Apple client_secret generated (valid for 6 months)
✅ Apple OAuth configured: ClientID=com.tyriantrade.web
```

### 2. Проверьте OAuth endpoints
```bash
curl https://api.tyriantrade.com/api/auth/google
# Должен вернуть URL с scope=openid+email+profile

curl https://api.tyriantrade.com/api/auth/apple  
# Должен вернуть URL с response_mode=form_post
```

### 3. Тест авторизации
- Попробуйте войти через Google на https://d3d3yzz21b5b34.cloudfront.net
- Ошибка "value too long" должна исчезнуть

## Rollback (если что-то пойдет не так)

```bash
# Откатить ECS к предыдущей версии
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --task-definition <previous-task-def> \
  --region us-east-1
```

## Timeline

1. **Применить миграцию** - 1-2 минуты
2. **Deploy backend** - 5-10 минут (build + push + ECS rollout)
3. **Тестирование** - 2-3 минуты

**Итого:** ~15 минут до полного production deployment

## Важно

- Миграция БЕЗ downtime (ALTER COLUMN быстрая операция)
- ECS делает rolling deployment (zero-downtime)
- Логи детальные - легко debug если что-то не так
