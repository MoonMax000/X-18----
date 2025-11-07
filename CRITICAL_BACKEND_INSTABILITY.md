# 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА: Backend крайне нестабилен

**Дата:** 08.11.2025, 00:09  
**Статус:** API постоянно падает (503 Service Unavailable)

## 🔴 Критическая проблема

Backend **крайне нестабилен**:
- Периодически возвращает 200 OK
- Через несколько секунд падает в 503
- Tasks запущены (3 running), но контейнеры crash-ят
- Health check не проходит стабильно

## 📊 Что происходит

```
Попытка 1: ✅ 200 OK
Попытка 2: ✅ 200 OK  
Попытка 3: ✅ 200 OK
Попытка 4: ❌ 503 Service Unavailable
Попытка 5: ❌ 503 Service Unavailable
...цикл повторяется
```

## 🚨 Последствия

### Не работают:
- ❌ Login (503 на preflight)
- ❌ Password Reset (503 на preflight)
- ❌ Logout (503 на preflight)
- ❌ Register (периодически 503)
- ❌ WebSocket подключения (падают)
- ❌ Widgets (заработок, активность)
- ❌ Notifications
- ❌ Timeline/Feed

### Работает иногда:
- ⚠️ Регистрация (если успеть)
- ⚠️ Email верификация (если успеть)

## 🔍 СРОЧНО ТРЕБУЕТСЯ

### 1. Откройте CloudWatch логи (НЕМЕДЛЕННО!)

```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Ftyriantrade$252Fbackend
```

**Ищите ошибки:**
- `panic:` - критический crash
- `Failed to connect to database` - RDS недоступна
- `Failed to connect to Redis` - ElastiCache недоступен
- `dial tcp` - network errors
- `context deadline exceeded` - таймауты
- `exit code 1` - контейнер упал

### 2. Проверьте Target Group Health

```
https://console.aws.amazon.com/ec2/home?region=us-east-1#TargetGroups
```

- Сколько targets **unhealthy**?
- Какая причина (failure reason)?
- Health check configuration правильный?

### 3. Возможные причины

#### A. Контейнеры crash-ят после старта

**Симптомы:**
- Task запускается
- Через 10-30 секунд падает
- Load Balancer видит unhealthy target
- Цикл повторяется

**Причины:**
- Нет подключения к RDS
- Нет подключения к Redis
- Отсутствуют ENV переменные
- Panic в коде при старте

**Решение:**
Смотрите CloudWatch логи - там будет точная ошибка!

#### B. Health check settings неправильные

**Проверьте:**
- Path: должен быть `/health`
- Interval: 30 секунд
- Timeout: 5 секунд
- Healthy threshold: 2
- Unhealthy threshold: 2

#### C. Security Groups блокируют трафик

**Проверьте:**
- ECS tasks могут достучаться до RDS (5432)?
- ECS tasks могут достучаться до Redis (6379)?
- Load Balancer может достучаться до ECS tasks?

#### D. RDS или Redis недоступны

**Проверьте в AWS Console:**
- RDS status: должен быть **available**
- ElastiCache status: должен быть **available**
- Security groups правильные?

## 🔧 ДЕЙСТВИЯ ДЛЯ ИСПРАВЛЕНИЯ

### План А: Диагностика через CloudWatch

1. **Откройте логи** (ссылка выше)
2. **Найдите самый свежий лог-стрим**
3. **Ищите ERROR/PANIC**
4. **Исправьте проблему** (добавьте ENV, исправьте Security Groups)
5. **Force new deployment**

### План Б: Увеличить health check grace period

В Task Definition:
```
Health check grace period: 120 секунд (вместо 0)
```

Это даст контейнеру больше времени для инициализации.

### План В: Проверить переменные окружения

В Task Definition должны быть ВСЕ:
```
✓ DB_HOST
✓ DB_PORT
✓ DB_NAME
✓ DB_USER
✓ DB_PASSWORD
✓ REDIS_HOST
✓ REDIS_PORT  
✓ JWT_ACCESS_SECRET
✓ JWT_REFRESH_SECRET
✓ RESEND_API_KEY
✓ CORS_ORIGIN=https://social.tyriantrade.com
✓ SERVER_ENV=production
```

### План Г: Rollback к предыдущей версии

Если ничего не помогает:

1. Найдите предыдущую working version в ECR
2. Update Task Definition с старым image
3. Update service to use old task definition

## 🐛 Дополнительная проблема: Forgot Password Form

В `ForgotPasswordForm` **отсутствует логика показа поля для ввода кода**.

Текущий flow должен быть:
1. Пользователь вводит email
2. Отправляется запрос на `/api/auth/password/reset`
3. На email приходит 6-значный код
4. **Должно показаться поле для ввода кода + новый пароль**
5. Отправляется `/api/auth/password/reset/confirm` с кодом и новым паролем

Нужно добавить состояние `codeSent` и условный рендеринг полей.

## 📝 Логи ошибок

```
[Error] Preflight response is not successful. Status code: 503
[Error] Fetch API cannot load https://api.tyriantrade.com/api/auth/login
[Error] Failed to load resource: Preflight response is not successful. Status code: 503

[Error] Ошибка при загрузке заработка: TypeError: Load failed
[Error] Ошибка при загрузке активности: TypeError: Load failed  
[Error] Error fetching notifications: TypeError: Load failed

[Error] WebSocket connection failed: There was a bad response from the server
[Error] WebSocket: Max reconnection attempts reached
```

Все эти ошибки - из-за 503 от backend.

## ⚡ КРИТИЧЕСКИЙ ПРИОРИТЕТ

1. ✅ **СЕЙЧАС:** Откройте CloudWatch логи
2. ✅ **СЕЙЧАС:** Найдите причину crash-ов
3. ✅ **СЕЙЧАС:** Исправьте и force redeploy
4. ⏳ После стабилизации: Исправить ForgotPasswordForm
5. ⏳ После стабилизации: Добавить мониторинг

## 🔗 Быстрые ссылки

- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Ftyriantrade$252Fbackend
- **ECS Service:** https://console.aws.amazon.com/ecs/v2/clusters/tyriantrade-cluster/services/tyriantrade-backend-service
- **Target Groups:** https://console.aws.amazon.com/ec2/home?region=us-east-1#TargetGroups
- **RDS:** https://console.aws.amazon.com/rds/home?region=us-east-1
- **ElastiCache:** https://console.aws.amazon.com/elasticache/home?region=us-east-1

## 🎯 Следующие шаги

Без стабильного backend **ничего не будет работать**. Это блокирующая проблема.

Нужно:
1. Найти причину в CloudWatch
2. Исправить (ENV/Security Groups/Code)
3. Redeploy
4. Дождаться стабилизации
5. Только потом исправлять UI issues

**Система сейчас фактически неработоспособна.**
