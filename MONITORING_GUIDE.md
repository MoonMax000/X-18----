# 📊 Руководство по мониторингу деплоя

## Текущий статус (08.11.2025, 12:10)

✅ **API работает** - https://api.tyriantrade.com/health (HTTP 200)  
✅ **Frontend работает** - https://social.tyriantrade.com (HTTP 200)  
🔄 **Деплой в процессе** - GitHub Actions выполняется (4м 16с)  
🔄 **Rolling Update** - ECS запускает новый контейнер

### Что происходит сейчас?

ECS выполняет **rolling update**:
- **Running: 2** контейнера (старый + новый)
- **Desired: 1** контейнер (целевое состояние)
- **Новый контейнер** запущен в 12:09:14
- **Статус:** RUNNING, Health: UNKNOWN (еще проверяется)

Это нормально! ECS сначала запускает новый контейнер, ждет прохождения health check, затем останавливает старый.

---

## 🚀 Быстрая проверка

### Одной командой:

```bash
./check-deployment.sh
```

Эта команда проверит:
- ✅ Статус GitHub Actions
- ✅ Состояние ECS сервиса
- ✅ Статус задач ECS
- ✅ Работоспособность API
- ✅ Работоспособность Frontend
- ✅ Последние логи

---

## 📦 Мониторинг GitHub Actions

### Список последних деплоев:

```bash
gh run list --limit 5
```

### Следить за текущим деплоем в реальном времени:

```bash
gh run watch
```

### Посмотреть логи деплоя:

```bash
gh run view --log
```

### Посмотреть логи конкретного деплоя:

```bash
gh run view 19188370459 --log
```

---

## ☁️ Мониторинг AWS ECS

### Статус сервиса:

```bash
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}' \
  --output table
```

### Статус задач:

```bash
aws ecs list-tasks \
  --cluster tyriantrade-cluster \
  --service-name tyriantrade-backend-service
```

### События деплоя:

```bash
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --query 'services[0].events[:5]' \
  --output table
```

---

## 📝 Просмотр логов

### Логи в реальном времени:

```bash
aws logs tail /ecs/tyriantrade-backend --follow
```

### Логи за последние 5 минут:

```bash
aws logs tail /ecs/tyriantrade-backend --since 5m
```

### Логи за последний час:

```bash
aws logs tail /ecs/tyriantrade-backend --since 1h
```

### Фильтр логов по паттерну:

```bash
aws logs tail /ecs/tyriantrade-backend --since 5m --filter-pattern "ERROR"
```

---

## 🌐 Проверка здоровья приложения

### API Health Check:

```bash
curl https://api.tyriantrade.com/health | jq '.'
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "env": "production"
}
```

### Frontend:

```bash
curl -I https://social.tyriantrade.com
```

Ожидаемый ответ: `HTTP/2 200`

### Проверка email сервиса:

```bash
# Зарегистрируйте тестового пользователя и проверьте получение email
```

---

## 🔔 Настройка уведомлений

### AWS SNS (для критических событий):

У вас уже настроены CloudWatch Alarms, которые отправляют уведомления на email при:
- Высоком CPU (>80%)
- Высокой памяти (>80%)
- Ошибках приложения
- Падении задач ECS

### GitHub Notifications:

1. Откройте: https://github.com/MoonMax000/X-18----/actions
2. Нажмите на "Watch" workflow
3. Получайте уведомления о статусе деплоев

### Telegram бот (опционально):

Можно настроить бота для уведомлений:

```bash
# Создайте бота через @BotFather
# Получите token и chat_id
# Добавьте в GitHub Secrets:
# TELEGRAM_BOT_TOKEN
# TELEGRAM_CHAT_ID
```

Затем в `.github/workflows/deploy.yml` добавьте:

```yaml
- name: Send Telegram notification
  if: always()
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    message: |
      🚀 Deploy Status: ${{ job.status }}
      Repository: ${{ github.repository }}
      Commit: ${{ github.sha }}
```

---

## 📊 CloudWatch Dashboard

### Открыть CloudWatch:

1. Откройте AWS Console
2. Перейдите в CloudWatch
3. Выберите "Dashboards"
4. Создайте dashboard "Tyrian Trade Production"

### Полезные метрики:

- **ECS Service**: CPUUtilization, MemoryUtilization
- **ALB**: TargetResponseTime, HTTPCode_Target_5XX_Count
- **RDS**: DatabaseConnections, CPUUtilization

### Прямая ссылка на метрики ECS:

```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#metricsV2:graph=~();namespace=AWS/ECS
```

---

## 🛠️ Полезные скрипты

### 1. Автоматическая проверка каждые 30 секунд:

```bash
watch -n 30 ./check-deployment.sh
```

### 2. Проверка после пуша:

```bash
git push origin main && sleep 10 && gh run watch
```

### 3. Быстрый ре-деплой при ошибке:

```bash
git commit --amend --no-edit && git push -f origin main
```

---

## ⚠️ Понимание статусов

### GitHub Actions:

- ⏳ **In Progress** - деплой выполняется
- ✅ **Success** - деплой успешен
- ❌ **Failure** - деплой провалился
- 🟡 **Cancelled** - деплой отменен

### ECS Deployment:

- **PRIMARY** - основной деплой (актуальная версия)
- **ACTIVE** - деплой активен и обслуживает трафик
- **DRAINING** - старый деплой отключается

### ECS Task Health:

- **UNKNOWN** - health check еще не прошел
- **HEALTHY** - задача здорова
- **UNHEALTHY** - задача нездорова (будет перезапущена)

### Running Count vs Desired Count:

- **Running > Desired**: Rolling update в процессе
- **Running = Desired**: Стабильное состояние
- **Running < Desired**: ECS запускает новые задачи

---

## 🚨 Что делать при проблемах

### Деплой завис:

```bash
# 1. Проверьте логи GitHub Actions
gh run view --log

# 2. Проверьте события ECS
aws ecs describe-services \
  --cluster tyriantrade-cluster \
  --services tyriantrade-backend-service \
  --query 'services[0].events[:10]'
```

### API не отвечает:

```bash
# 1. Проверьте здоровье задач
./check-deployment.sh

# 2. Посмотрите логи
aws logs tail /ecs/tyriantrade-backend --since 10m --filter-pattern "ERROR"

# 3. Перезапустите задачу
aws ecs update-service \
  --cluster tyriantrade-cluster \
  --service tyriantrade-backend-service \
  --force-new-deployment
```

### Откат на предыдущую версию:

```bash
# 1. Найдите последний рабочий коммит
git log --oneline -10

# 2. Откатитесь
git revert HEAD
git push origin main

# 3. Или force push предыдущего коммита
git reset --hard <commit-hash>
git push -f origin main
```

---

## 📱 Мобильный мониторинг

### AWS Console App:

- Установите "AWS Console" из App Store/Google Play
- Войдите в аккаунт
- Добавьте CloudWatch виджет на главный экран

### GitHub Mobile:

- Установите "GitHub" app
- Включите push-уведомления для Actions

---

## ✅ Чеклист успешного деплоя

После деплоя проверьте:

- [ ] GitHub Actions статус: ✅ Success
- [ ] ECS Running Count = Desired Count
- [ ] API Health Check: HTTP 200
- [ ] Frontend доступен: HTTP 200
- [ ] Новые email шаблоны работают (зарегистрируйте тестового пользователя)
- [ ] База данных чистая (только admin)
- [ ] Логи без критических ошибок

---

## 🎯 Быстрые ссылки

- **GitHub Actions**: https://github.com/MoonMax000/X-18----/actions
- **AWS ECS Console**: https://console.aws.amazon.com/ecs/v2/clusters/tyriantrade-cluster/services
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Ftyriantrade-backend
- **Production API**: https://api.tyriantrade.com
- **Production Frontend**: https://social.tyriantrade.com

---

## 💡 Советы

1. **Всегда проверяйте деплой** после пуша:
   ```bash
   git push && gh run watch
   ```

2. **Мониторьте логи** во время деплоя:
   ```bash
   aws logs tail /ecs/tyriantrade-backend --follow
   ```

3. **Используйте staging** для тестирования (если есть):
   ```bash
   git push origin staging
   ```

4. **Делайте бэкапы БД** перед большими изменениями:
   ```bash
   aws rds create-db-snapshot \
     --db-instance-identifier tyriantrade-db \
     --db-snapshot-identifier manual-backup-$(date +%Y%m%d-%H%M%S)
   ```

5. **Проверяйте health check** после деплоя:
   ```bash
   for i in {1..10}; do curl https://api.tyriantrade.com/health && sleep 2; done
