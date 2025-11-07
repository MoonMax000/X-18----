# 🚨 РЕШЕНИЕ: Backend не запущен (0/0 Tasks)

**Дата:** 07.11.2025, 23:07  
**Статус:** AWS CLI недоступен, требуется ручное вмешательство через AWS Console

## 🔴 Проблема

ECS Service показывает **0/0 Tasks running** - контейнеры вообще не запущены!

```
Service: tyriantrade-backend-service
Cluster: tyriantrade-cluster
Status: Active
Tasks: 0/0 Running ❌
```

## ⚡ НЕМЕДЛЕННОЕ РЕШЕНИЕ

### Вариант 1: Через AWS Console (РЕКОМЕНДУЕТСЯ)

1. **Откройте ECS Service:**
   ```
   https://console.aws.amazon.com/ecs/v2/clusters/tyriantrade-cluster/services/tyriantrade-backend-service
   ```

2. **Обновите service:**
   - Нажмите кнопку "Update service" (справа вверху)
   - В разделе "Deployment configuration":
     * Установите "Desired tasks" = 1
     * Включите "Force new deployment" ✓
   - Нажмите "Update"

3. **Дождитесь запуска:**
   - Service начнет deployment (2-5 минут)
   - Следите за вкладкой "Tasks" - должна появиться задача в статусе "RUNNING"
   - Проверьте вкладку "Events" на наличие ошибок

4. **Проверьте API:**
   ```bash
   curl https://api.tyriantrade.com/health
   ```
   Должен вернуть: `{"status":"ok","env":"production"}`

### Вариант 2: Если появилась задача, но она сразу останавливается

Проверьте логи в CloudWatch:

1. **Откройте CloudWatch Logs:**
   ```
   https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Ftyriantrade$252Fbackend
   ```

2. **Откройте последний лог-стрим** (самый свежий по времени)

3. **Ищите ошибки:**
   - `Failed to connect to database` - проблема с RDS
   - `Failed to connect to Redis` - проблема с ElastiCache
   - `RESEND_API_KEY not set` - отсутствует API key
   - Другие ошибки при старте

### Вариант 3: Проверка переменных окружения

1. **Откройте Task Definition:**
   ```
   https://console.aws.amazon.com/ecs/v2/task-definitions/tyriantrade-backend
   ```

2. **Проверьте Environment Variables:**
   Критически важные переменные:
   ```
   ✓ DATABASE_URL или (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
   ✓ REDIS_URL или (REDIS_HOST, REDIS_PORT)
   ✓ JWT_ACCESS_SECRET
   ✓ JWT_REFRESH_SECRET
   ✓ RESEND_API_KEY или EMAIL_PROVIDER=ses
   ✓ CORS_ORIGIN
   ```

3. **Если переменные отсутствуют:**
   - Создайте новую ревизию Task Definition с правильными ENV
   - Обновите service, чтобы использовать новую ревизию

## 🔍 Типичные причины 0/0 Tasks

### 1. Container crash при старте
**Симптомы:** Task запускается и сразу останавливается  
**Решение:** Проверьте CloudWatch логи на ошибки

### 2. Health check не проходит
**Симптомы:** Task в состоянии UNHEALTHY  
**Решение:** 
- Проверьте, отвечает ли `/health` endpoint
- Увеличьте grace period для health check

### 3. Отсутствуют переменные окружения
**Симптомы:** Backend не может подключиться к БД/Redis  
**Решение:** Добавьте ENV в Task Definition

### 4. Security Groups блокируют трафик
**Симптомы:** Backend не может подключиться к RDS/Redis  
**Решение:** 
- ECS Task security group должен иметь outbound доступ
- RDS/Redis security groups должны разрешать inbound из ECS SG

### 5. Недостаточно ресурсов
**Симптомы:** Task не может быть размещен  
**Решение:** Проверьте CPU/Memory limits в Task Definition

## 📋 Чеклист для диагностики

```
[ ] Service status = Active
[ ] Desired count = 1
[ ] Running count = 1
[ ] Task definition существует
[ ] Container image доступен в ECR
[ ] Environment variables настроены
[ ] Security groups правильные
[ ] Target Group показывает healthy targets
[ ] CloudWatch логи не содержат ошибок
[ ] API /health отвечает 200 OK
```

## 🆘 Если ничего не помогает

### Последний вариант: Пересоздать service

1. **Удалите текущий service:**
   ```bash
   aws ecs delete-service \
     --cluster tyriantrade-cluster \
     --service tyriantrade-backend-service \
     --force \
     --region us-east-1
   ```

2. **Создайте новый service через AWS Console:**
   - ECS → Clusters → tyriantrade-cluster → Create service
   - Launch type: Fargate
   - Task definition: tyriantrade-backend:latest
   - Desired tasks: 1
   - Load balancer: Application Load Balancer
   - Target group: tyriantrade-backend-tg

3. **Или используйте Terraform/CloudFormation** (если есть IaC)

## 💡 Временное решение для тестирования

Пока backend не работает, можно вручную верифицировать пользователя в БД:

```bash
export PGPASSWORD='TyrianTrade2024SecurePass'

psql -h 'ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com' \
  -p 5432 \
  -U dbadmin \
  -d tyriantrade \
  -c "UPDATE users SET is_email_verified = true WHERE email = 'devidanderson@gmail.com';"

psql -h 'ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com' \
  -p 5432 \
  -U dbadmin \
  -d tyriantrade \
  -c "DELETE FROM verification_codes WHERE user_id IN (SELECT id FROM users WHERE email = 'devidanderson@gmail.com');"

unset PGPASSWORD
```

Затем пользователь сможет войти через `/api/auth/login` (когда backend заработает).

## 📊 Мониторинг после исправления

После того, как service запустится:

1. **Проверьте Tasks:**
   ```bash
   watch -n 2 'curl -s https://api.tyriantrade.com/health'
   ```

2. **Следите за логами:**
   ```bash
   aws logs tail /ecs/tyriantrade/backend --follow --region us-east-1
   ```

3. **Проверьте метрики в CloudWatch:**
   - CPU Utilization
   - Memory Utilization
   - Request count
   - Error rate

## 🔗 Полезные ссылки

- **ECS Cluster:** https://console.aws.amazon.com/ecs/v2/clusters/tyriantrade-cluster
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Ftyriantrade$252Fbackend
- **Load Balancer:** https://console.aws.amazon.com/ec2/home?region=us-east-1#LoadBalancers
- **Target Groups:** https://console.aws.amazon.com/ec2/home?region=us-east-1#TargetGroups

## ⚠️ Важно

**AWS CLI недоступен** на вашей машине (все команды таймаутятся). Возможные причины:
- Проблемы с интернет-соединением
- AWS credentials устарели
- VPN/Firewall блокирует AWS endpoints

Используйте **AWS Console** для всех операций до решения проблемы с CLI.
