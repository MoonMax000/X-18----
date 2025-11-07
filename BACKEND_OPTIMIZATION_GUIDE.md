# 🚀 Оптимизация Backend: Ускорение сборки и деплоя

**Дата:** 08.11.2025  
**Цель:** Ускорить сборку Docker image и деплой в ECS

## 📊 Текущая ситуация

**Сейчас деплой занимает:**
- Docker build: ~3-5 минут
- Push to ECR: ~1-2 минуты
- ECS deployment: ~5-10 минут
- **Итого: 9-17 минут**

## 🚀 Способы ускорения

### 1. Увеличить CPU/Memory для ECS Tasks

#### Текущие настройки (предположительно):
```
CPU: 256 (0.25 vCPU)
Memory: 512 MB
```

#### Рекомендуемые настройки:
```
CPU: 512 (0.5 vCPU)  → в 2 раза быстрее
Memory: 1024 MB      → стабильнее работа
```

**Стоимость:**
- 256/512: ~$5-7/месяц за task
- 512/1024: ~$10-14/месяц за task
- **Разница: +$5-7/месяц за улучшенную производительность**

**Как изменить:**
1. ECS Console → Task Definitions → tyriantrade-backend
2. Create new revision
3. Task size → CPU: 512, Memory: 1024
4. Update service to use new revision

#### Еще лучше (для production):
```
CPU: 1024 (1 vCPU)
Memory: 2048 MB
```
**Стоимость:** ~$20-28/месяц, но значительно быстрее и стабильнее.

---

### 2. Docker Build Cache в GitHub Actions

Сейчас каждый build начинается с нуля. Можно добавить кеширование!

#### Обновить `.github/workflows/deploy.yml`:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Cache Docker layers
  uses: actions/cache@v3
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: ./custom-backend
    push: true
    tags: ${{ steps.login-ecr.outputs.registry }}/tyriantrade/backend:${{ github.sha }}
    cache-from: type=local,src=/tmp/.buildx-cache
    cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

- name: Move cache
  run: |
    rm -rf /tmp/.buildx-cache
    mv /tmp/.buildx-cache-new /tmp/.buildx-cache
```

**Эффект:** Сократит build время на 50-70% при повторных деплоях!

---

### 3. Оптимизировать Dockerfile

#### Текущий Dockerfile (предположительно):
```dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o main cmd/server/main.go
CMD ["./main"]
```

#### Оптимизированный Dockerfile:

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Copy only go.mod and go.sum first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -o main cmd/server/main.go

# Runtime stage (smaller image)
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

# Copy only binary from builder
COPY --from=builder /app/main .
COPY --from=builder /app/AuthKey_*.p8 .

# Non-root user for security
RUN adduser -D -u 1000 appuser
USER appuser

EXPOSE 8080
CMD ["./main"]
```

**Преимущества:**
- ✅ Multi-stage build → финальный image в 10x меньше
- ✅ Лучшее кеширование слоев
- ✅ Оптимизированный бинарник (-ldflags="-s -w")
- ✅ Безопасность (non-root user)

**Эффект:**
- Build: на 30-40% быстрее
- Image size: с ~800MB до ~50MB
- Push to ECR: в 10x быстрее
- Pull by ECS: в 10x быстрее

---

### 4. Параллельная сборка в GitHub Actions

```yaml
jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      # ... build backend ...
  
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      # ... build frontend ...
  
  deploy:
    needs: [build-backend, build-frontend]
    runs-on: ubuntu-latest
    steps:
      # ... deploy both ...
```

**Эффект:** Frontend и Backend собираются одновременно!

---

### 5. Blue-Green Deployment для Zero-Downtime

Сейчас при деплое:
```
Old tasks → stopping → 503 errors → new tasks → starting → ok
```

С Blue-Green:
```
Old tasks (green) → running
New tasks (blue) → starting
Switch traffic → instant
Old tasks → stopping
```

**Настройка в ECS:**
1. Deployment type: Blue/Green
2. Traffic shifting: All at once или Linear
3. Rollback on alarm: Enabled

**Эффект:** Нет 503 ошибок во время деплоя!

---

### 6. Health Check Grace Period

Увеличьте grace period, чтобы дать контейнеру время запуститься:

```
Health check grace period: 120 секунд (вместо 0)
```

**Эффект:** ALB не будет помечать контейнер как unhealthy сразу.

---

### 7. Использовать GitHub Actions Self-Hosted Runner

**Проблема:** GitHub hosted runners имеют ограниченные ресурсы.

**Решение:** Запустить свой runner на AWS EC2:
```
Instance type: t3.medium (2 vCPU, 4GB RAM)
Cost: ~$30/месяц
```

**Эффект:** Build в 2-3x быстрее!

---

## 💰 Сравнение стоимости и скорости

### Вариант 1: Минимальный (текущий)
```
ECS: 256 CPU / 512 MB
Cost: ~$5-7/месяц
Build: ~5 минут
Deploy: ~15 минут
Stability: ⚠️ Нестабильно
```

### Вариант 2: Оптимальный (рекомендую)
```
ECS: 512 CPU / 1024 MB
Docker cache: Enabled
Optimized Dockerfile: ✅
Cost: ~$10-14/месяц
Build: ~2 минуты
Deploy: ~8 минут
Stability: ✅ Стабильно
```

### Вариант 3: Production (для высокой нагрузки)
```
ECS: 1024 CPU / 2048 MB
Docker cache: Enabled
Optimized Dockerfile: ✅
Blue-Green deployment: ✅
Self-hosted runner: ✅
Cost: ~$50-70/месяц
Build: ~1 минута
Deploy: ~5 минут (zero-downtime)
Stability: ✅✅ Очень стабильно
Auto-scaling: ✅
```

---

## 🎯 Рекомендуемый план действий

### Этап 1: Быстрые победы (бесплатно, 1 час)

1. ✅ Оптимизировать Dockerfile (multi-stage build)
2. ✅ Добавить Docker build cache в GitHub Actions
3. ✅ Увеличить health check grace period до 120s

**Эффект:** 
- Build: 5 мин → 2 мин
- Deploy: 15 мин → 10 мин
- **Экономия: 8 минут на каждый деплой**

### Этап 2: Увеличить ресурсы (+$5/мес, 30 минут)

4. ✅ ECS Task: 256/512 → 512/1024
5. ✅ Добавить Auto Scaling (1-3 tasks)

**Эффект:**
- Стабильность: значительно лучше
- Response time: в 2x быстрее
- 503 errors: почти исчезнут

### Этап 3: Production-ready (+$40/мес, 3 часа)

6. ✅ Blue-Green deployment
7. ✅ ECS Task: 512/1024 → 1024/2048
8. ✅ Self-hosted GitHub runner
9. ✅ CloudWatch alarms + SNS notifications

**Эффект:**
- Zero-downtime deployments
- Build: 1 минута
- Deploy: 5 минут
- Production-ready!

---

## 📝 Пример оптимизированного Dockerfile

Сохраните как `custom-backend/Dockerfile`:

```dockerfile
# syntax=docker/dockerfile:1

# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build optimized binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -X main.Version=${VERSION:-dev}" \
    -trimpath \
    -o /app/main \
    ./cmd/server

# Runtime stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata curl

# Create non-root user
RUN adduser -D -u 1000 appuser

WORKDIR /app

# Copy binary and assets
COPY --from=builder /app/main .
COPY --from=builder /app/AuthKey_*.p8 ./

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run
CMD ["./main"]
```

---

## 🔍 Monitoring & Alerting

Добавьте CloudWatch alarms:

```yaml
# ECS CPU High
Threshold: > 80% for 5 minutes
Action: SNS notification + Auto Scale Up

# ECS Memory High  
Threshold: > 80% for 5 minutes
Action: SNS notification + Auto Scale Up

# Target Unhealthy
Threshold: < 1 healthy target for 2 minutes
Action: SNS notification + Auto restart

# 5xx Errors
Threshold: > 10 errors in 5 minutes
Action: SNS notification + Rollback deployment
```

---

## ✅ Итого

**Минимальная оптимизация (бесплатно):**
- Optimized Dockerfile
- Docker build cache
- Health check grace period
→ **Деплой: 15 мин → 10 мин**

**Рекомендуемая оптимизация (+$5-10/мес):**
- + ECS resources: 512/1024
- + Auto Scaling
→ **Деплой: 10 мин → 8 мин, стабильно работает**

**Production оптимизация (+$40-50/мес):**
- + ECS resources: 1024/2048
- + Blue-Green deployment
- + Self-hosted runner
- + Monitoring & Alerts
→ **Деплой: 8 мин → 5 мин, zero-downtime, production-ready**

Хотите, чтобы я внес эти изменения?
