# Production Deployment Guide (Option 3)

## 🎯 Цель

Применение production-оптимизаций для бэкенда TyrianTrade:
- 1024 CPU / 2048 MB памяти
- Docker build cache для ускорения сборки
- CloudWatch мониторинг
- Blue-Green deployment для zero-downtime

**Стоимость:** ~$40-50/месяц  
**Улучшения:** Быстрые деплои, стабильность, мониторинг, zero-downtime

---

## 📋 Что было сделано

### ✅ 1. Оптимизированный Dockerfile
**Файл:** `custom-backend/Dockerfile`

**Что изменилось:**
- Multi-stage build (builder + runtime)
- Статический бинарник с оптимизацией размера
- Non-root пользователь для безопасности
- Health check встроен в контейнер

**Преимущества:**
- Меньший размер образа (~20-30 MB runtime)
- Более быстрая сборка
- Повышенная безопасность

### ✅ 2. GitHub Actions с Docker Cache
**Файл:** `.github/workflows/deploy.yml`

**Что изменилось:**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build with cache
  docker buildx build \
    --cache-from=$ECR_REGISTRY/$ECR_REPOSITORY:latest \
    --build-arg BUILDKIT_INLINE_CACHE=1 \
    --push
```

**Преимущества:**
- Использует кэш предыдущих сборок
- Сборка ускоряется с 5-8 минут до 2-3 минут
- Меньше расход GitHub Actions minutes

---

## 🚀 Шаги для применения

### Шаг 1: Обновление GitHub Actions (АВТОМАТИЧЕСКИ)

✅ **Уже применено** - изменения в `.github/workflows/deploy.yml`

При следующем коммите в `main` branch:
- Сборка будет использовать Docker cache
- Деплой будет быстрее

### Шаг 2: Увеличение ресурсов ECS

Запустите скрипт для обновления Task Definition:

```bash
chmod +x update-ecs-resources.sh
./update-ecs-resources.sh
```

**Что произойдет:**
1. Скрипт скачает текущую Task Definition
2. Покажет изменения (256→1024 CPU, 512→2048 Memory)
3. Рассчитает стоимость (~$40-50/месяц)
4. Попросит подтверждение
5. Применит изменения и дождется стабилизации (5-10 минут)

**Альтернативный способ (через AWS Console):**
1. Откройте [ECS Console](https://console.aws.amazon.com/ecs/)
2. Cluster: `tyriantrade-cluster`
3. Service: `tyriantrade-backend-service`
4. Update Service → Create new revision
5. Task Size:
   - CPU: `1024` (1 vCPU)
   - Memory: `2048` (2 GB)
6. Save → Update

### Шаг 3: Настройка CloudWatch Алармов

Отредактируйте скрипт с вашими данными:

```bash
nano setup-cloudwatch-alarms.sh
```

Измените:
```bash
EMAIL_ADDRESS="your-email@example.com"  # Ваш email для уведомлений
```

Опционально (для ALB алармов):
```bash
ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:..."
TARGET_GROUP_ARN="arn:aws:elasticloadbalancing:us-east-1:..."
```

Запустите:
```bash
chmod +x setup-cloudwatch-alarms.sh
./setup-cloudwatch-alarms.sh
```

**Созданные алармы:**
1. `high-cpu` - CPU > 80% (5 минут)
2. `high-memory` - Memory > 80% (5 минут)
3. `task-count-low` - Tasks < 1 (2 минуты)
4. `unhealthy-targets` - Unhealthy targets ≥ 1
5. `high-5xx-errors` - 5XX errors > 10 (5 минут)
6. `slow-response-time` - Response time > 2s

**После создания:**
- Проверьте email для подтверждения SNS подписки
- Откройте [CloudWatch Alarms](https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:)

---

## 🔵🟢 Blue-Green Deployment

### Что такое Blue-Green?

**Blue (Старая версия)** ← Пользователи  
↓ Деплой новой версии  
**Green (Новая версия)** ← Тестируем  
↓ Переключение трафика  
**Green (Новая версия)** ← Пользователи ✅

**Преимущества:**
- Zero downtime
- Мгновенный откат при проблемах
- Тестирование в production среде

### Настройка Blue-Green в ECS

#### Способ 1: Через AWS CodeDeploy (Рекомендуется)

1. **Создайте CodeDeploy Application:**
```bash
aws deploy create-application \
  --application-name tyriantrade-backend \
  --compute-platform ECS \
  --region us-east-1
```

2. **Создайте Deployment Group:**
```bash
aws deploy create-deployment-group \
  --application-name tyriantrade-backend \
  --deployment-group-name tyriantrade-bg-deployment \
  --service-role-arn arn:aws:iam::YOUR_ACCOUNT:role/CodeDeployServiceRole \
  --deployment-config-name CodeDeployDefault.ECSAllAtOnce \
  --ecs-services clusterName=tyriantrade-cluster,serviceName=tyriantrade-backend-service \
  --load-balancer-info targetGroupPairInfoList='[{
    "targetGroups":[
      {"name":"tyriantrade-backend-blue"},
      {"name":"tyriantrade-backend-green"}
    ],
    "prodTrafficRoute":{"listenerArns":["arn:aws:elasticloadbalancing:..."]},
    "testTrafficRoute":{"listenerArns":["arn:aws:elasticloadbalancing:..."]}
  }]' \
  --blue-green-deployment-configuration '{
    "terminateBlueInstancesOnDeploymentSuccess":{
      "action":"TERMINATE",
      "terminationWaitTimeInMinutes":5
    },
    "deploymentReadyOption":{
      "actionOnTimeout":"CONTINUE_DEPLOYMENT"
    }
  }'
```

3. **Обновите GitHub Actions workflow:**

Добавьте в `.github/workflows/deploy.yml` (после build):

```yaml
- name: Deploy with CodeDeploy
  run: |
    aws deploy create-deployment \
      --application-name tyriantrade-backend \
      --deployment-group-name tyriantrade-bg-deployment \
      --revision '{
        "revisionType": "AppSpecContent",
        "appSpecContent": {
          "content": "{\"version\":1,\"Resources\":[{\"TargetService\":{\"Type\":\"AWS::ECS::Service\",\"Properties\":{\"TaskDefinition\":\"${{ steps.task-def.outputs.task-definition }}\",\"LoadBalancerInfo\":{\"ContainerName\":\"backend\",\"ContainerPort\":8080}}}}]}"
        }
      }'
```

#### Способ 2: Ручная Blue-Green с двумя Target Groups

1. **Создайте второй Target Group (Green):**
```bash
aws elbv2 create-target-group \
  --name tyriantrade-backend-green \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxx \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3
```

2. **Создайте Test Listener (порт 8081):**
```bash
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 8081 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:.../tyriantrade-backend-green
```

3. **При деплое:**
   - Новая версия → Green target group
   - Тестируйте через порт 8081
   - Меняйте правила listener для переключения трафика

#### Способ 3: Простой Rolling Update (Текущий)

**Уже настроено в ECS:**
```bash
# В конфигурации сервиса:
Deployment Configuration:
  - Minimum healthy percent: 100%
  - Maximum percent: 200%
```

**Как работает:**
1. Запускается новая задача (Green)
2. Health check проходит
3. Старая задача (Blue) останавливается
4. ~1-2 минуты простоя при перезагрузке

**Для улучшения:**
```bash
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --deployment-configuration '{
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    },
    "maximumPercent": 200,
    "minimumHealthyPercent": 100
  }'
```

Это добавит:
- Автоматический откат при сбоях
- Health check перед переключением

---

## 📊 Мониторинг и Логи

### CloudWatch Logs

**Просмотр логов:**
```bash
# Production логи
./monitor-logs-production.sh

# Или напрямую
aws logs tail /ecs/tyriantrade-backend \
  --follow \
  --region us-east-1
```

### CloudWatch Metrics

**ECS Metrics Dashboard:**
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:

**Ключевые метрики:**
- CPU Utilization (должен быть < 80%)
- Memory Utilization (должен быть < 80%)
- Running Task Count (должен быть = 1)
- Response Time (должен быть < 1s)

### Алармы

**Проверка статуса:**
```bash
aws cloudwatch describe-alarms \
  --alarm-names \
    tyriantrade-backend-service-high-cpu \
    tyriantrade-backend-service-high-memory \
    tyriantrade-backend-service-task-count-low \
  --region us-east-1
```

---

## 🧪 Тестирование после деплоя

### 1. Health Check
```bash
curl https://api.tyriantrade.com/health
# Ожидается: {"status":"healthy"}
```

### 2. Проверка логов
```bash
./monitor-logs-production.sh
# Убедитесь что нет ошибок
```

### 3. Метрики
- Откройте CloudWatch
- Проверьте CPU/Memory < 80%
- Response time < 2s

### 4. Функциональное тестирование
- Регистрация нового пользователя
- Вход в систему
- OAuth (Google, Apple)
- Создание поста
- Загрузка медиа

---

## 🔙 Откат (Rollback)

### Способ 1: Через AWS Console

1. [ECS Console](https://console.aws.amazon.com/ecs/) → tyriantrade-cluster
2. Service → tyriantrade-backend-service
3. Deployments tab → найдите предыдущую успешную ревизию
4. Create new deployment → Force new deployment

### Способ 2: Через CLI

```bash
# Получить предыдущую Task Definition
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Откатиться
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --task-definition $PREVIOUS_TASK_DEF \
  --force-new-deployment
```

### Способ 3: Через GitHub

Revert коммит и push в main:
```bash
git revert HEAD
git push origin main
```

---

## 💰 Стоимость и оптимизация

### Текущие расходы (Option 3)

**ECS Fargate (1024 CPU / 2048 MB):**
- CPU: 1 vCPU × $0.04048/час × 730 ч = $29.55/месяц
- Memory: 2 GB × $0.004445/GB-час × 730 ч = $6.49/месяц
- **Итого:** ~$36/месяц

**Другие сервисы:**
- RDS PostgreSQL (db.t3.micro): ~$13/месяц
- ElastiCache Redis (cache.t3.micro): ~$12/месяц
- S3 + CloudFront: ~$5-10/месяц
- ALB: ~$18/месяц

**Общая стоимость:** ~$84-94/месяц

### Оптимизация расходов

**Если нужно сэкономить:**

1. **Используйте Savings Plans** (экономия до 30%)
2. **Spot Instances для dev окружения**
3. **Reserved Instances для RDS** (экономия до 40%)
4. **S3 Intelligent Tiering** для старых файлов

---

## 📚 Дополнительные ресурсы

### Документация AWS
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [ECS Blue/Green Deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-bluegreen.html)
- [CloudWatch Container Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/ContainerInsights.html)

### Инструменты мониторинга
- CloudWatch Dashboards
- AWS X-Ray для трейсинга
- CloudWatch Logs Insights для анализа

---

## ✅ Чеклист применения

- [x] Dockerfile оптимизирован (multi-stage build)
- [x] GitHub Actions обновлен (Docker cache)
- [ ] ECS ресурсы увеличены (1024/2048)
- [ ] CloudWatch алармы настроены
- [ ] Email для алармов подтвержден
- [ ] Blue-Green deployment настроен (опционально)
- [ ] Проведено тестирование после деплоя
- [ ] Документация обновлена

---

## 🆘 Поддержка

**При проблемах:**

1. **Проверьте логи:**
   ```bash
   ./monitor-logs-production.sh
   ```

2. **Проверьте health check:**
   ```bash
   curl https://api.tyriantrade.com/health
   ```

3. **Проверьте CloudWatch алармы:**
   https://console.aws.amazon.com/cloudwatch/

4. **Откатитесь на предыдущую версию** (см. раздел Откат)

**Контакты:**
- GitHub Issues: https://github.com/MoonMax000/X-18----/issues
- AWS Support: https://console.aws.amazon.com/support/

---

## 📝 История изменений

- **2025-11-08:** Создан Production Deployment Guide
  - Dockerfile оптимизирован
  - GitHub Actions с Docker cache
  - Скрипты для ECS и CloudWatch
  - Инструкции по Blue-Green deployment
