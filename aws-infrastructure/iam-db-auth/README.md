# 🔐 IAM DB Authentication для RDS PostgreSQL

Полное руководство по настройке IAM аутентификации для доступа к RDS без паролей.

## 📋 Содержание

1. [Обзор](#обзор)
2. [Преимущества](#преимущества)
3. [Архитектура](#архитектура)
4. [Требования](#требования)
5. [Установка](#установка)
6. [Использование](#использование)
7. [Устранение неполадок](#устранение-неполадок)

---

## Обзор

IAM DB Authentication позволяет подключаться к RDS PostgreSQL используя временные IAM токены вместо паролей. Это обеспечивает:

- **Безопасность**: Нет хранимых паролей, токены действительны ~15 минут
- **Удобство**: Автоматическая аутентификация через AWS credentials
- **Администрирование**: Централизованное управление через IAM policies
- **Полный доступ**: Роль `rds_superuser` для административных операций

## Преимущества

✅ **Без паролей** - все токены генерируются автоматически  
✅ **TablePlus доступ** - удобный GUI для работы с БД  
✅ **SSM Bastion** - безопасное подключение без SSH ключей  
✅ **Полные права** - `rds_superuser` для всех операций  
✅ **Auto-rotation** - токены обновляются автоматически  

## Архитектура

```
┌─────────────────┐
│  Ваш компьютер  │
│   (TablePlus)   │
└────────┬────────┘
         │ IAM Token
         │ (15 min)
         ▼
┌─────────────────┐      ┌──────────────┐
│  SSM Bastion    │◄────►│  RDS Postgres│
│   (t3.micro)    │      │  (db_agent)  │
└─────────────────┘      └──────────────┘
         │
         │ Port Forward
         │ 5432 → 5433
         ▼
┌─────────────────┐
│   localhost:    │
│      5433       │
└─────────────────┘
```

## Требования

### AWS CLI
```bash
aws --version  # AWS CLI v2
```

### Terraform
```bash
terraform --version  # >= 1.0
```

### Session Manager Plugin
```bash
# macOS
brew install --cask session-manager-plugin

# Linux
# https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
```

### TablePlus (опционально)
- [Скачать TablePlus](https://tableplus.com/)

## Установка

### Шаг 1: Включить IAM Authentication на RDS

```bash
cd aws-infrastructure/iam-db-auth
chmod +x 01-enable-iam-auth.sh
./01-enable-iam-auth.sh
```

**Что происходит:**
- Модифицирует RDS instance `tyriantrade-db`
- Включает `IAMDatabaseAuthenticationEnabled`
- Может потребовать перезагрузку (~5 минут)

**Проверка:**
```bash
aws rds describe-db-instances \
  --db-instance-identifier tyriantrade-db \
  --region us-east-1 \
  --query 'DBInstances[0].IAMDatabaseAuthenticationEnabled'
```

### Шаг 2: Создать пользователя db_agent

```bash
chmod +x 02-apply-db-agent-user.sh
./02-apply-db-agent-user.sh
```

**Что происходит:**
- Выполняет SQL через ECS exec
- Создает пользователя `db_agent`
- Выдает роли `rds_iam` и `rds_superuser`
- Предоставляет полные права на базу данных

**SQL скрипт:** `02-create-db-agent-user.sql`

**Альтернатива (TablePlus/psql):**
```bash
psql -h tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d tyriantrade \
     -f 02-create-db-agent-user.sql
```

### Шаг 3: Создать IAM политику

```bash
chmod +x 03-create-iam-policy.sh
./03-create-iam-policy.sh
```

**Что происходит:**
- Создает IAM политику `RDSIAMAuthPolicy-db-agent`
- Разрешает действие `rds-db:connect` для пользователя `db_agent`
- Присоединяет политику к `tyriantrade-ecs-task-role`

**Политика:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "rds-db:connect",
      "Resource": "arn:aws:rds-db:us-east-1:506675684508:dbuser:db-4JXFCQG3SJ3ENB3M3S3BA2SLUA/db_agent"
    }
  ]
}
```

### Шаг 4: Развернуть SSM Bastion

```bash
cd aws-infrastructure/iam-db-auth
terraform init
terraform plan
terraform apply
```

**Что создается:**
- EC2 instance `tyriantrade-bastion` (t3.micro)
- IAM роль с SSM и RDS IAM правами
- Security Groups для доступа к RDS
- PostgreSQL 16 client + RDS CA bundle

**Outputs:**
```
bastion_instance_id = "i-xxxxxxxxxxxxx"
connect_command = "aws ssm start-session --target i-xxxxxxxxxxxxx --region us-east-1"
port_forward_command = "aws ssm start-session --target ... --parameters ..."
```

## Использование

### TablePlus подключение

```bash
cd aws-infrastructure/iam-db-auth
chmod +x 04-connect-tableplus.sh
./04-connect-tableplus.sh
```

**Скрипт:**
1. Находит bastion instance
2. Генерирует IAM токен (~15 минут)
3. Копирует токен в clipboard
4. Запускает SSM port forwarding
5. Выводит параметры для TablePlus

**Настройки TablePlus:**
```
Name:     TyrianTrade Production (IAM)
Host:     127.0.0.1
Port:     5433
User:     db_agent
Password: [IAM Token из скрипта]
Database: tyriantrade
SSL Mode: require
```

### Прямое подключение через bastion

```bash
# Подключиться к bastion через SSM
aws ssm start-session \
  --target i-xxxxxxxxxxxxx \
  --region us-east-1

# Внутри bastion выполнить
./connect-rds.sh
```

### Генерация IAM токена вручную

```bash
aws rds generate-db-auth-token \
  --hostname tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
  --port 5432 \
  --username db_agent \
  --region us-east-1
```

### Подключение через psql

```bash
# Скачать RDS CA bundle
wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Сгенерировать токен
TOKEN=$(aws rds generate-db-auth-token \
  --hostname tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
  --port 5432 \
  --username db_agent \
  --region us-east-1)

# Подключиться
PGPASSWORD="$TOKEN" psql \
  "host=tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com \
   port=5432 \
   dbname=tyriantrade \
   user=db_agent \
   sslmode=verify-full \
   sslrootcert=global-bundle.pem"
```

## Backend интеграция

### Добавить зависимости

```bash
cd custom-backend
go get github.com/aws/aws-sdk-go-v2/config
go get github.com/aws/aws-sdk-go-v2/feature/rds/auth
go get github.com/lib/pq
```

### Использование в коде

```go
package main

import (
    "context"
    "github.com/yourproject/custom-backend/pkg/database"
)

func main() {
    cfg := database.IAMAuthConfig{
        Hostname: "tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com",
        Port:     5432,
        Username: "db_agent",
        Database: "tyriantrade",
        Region:   "us-east-1",
    }

    // Вариант 1: Одноразовое подключение
    db, err := database.ConnectWithIAM(context.Background(), cfg)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Вариант 2: С автообновлением токена (рекомендуется)
    refresher := database.NewIAMTokenRefresher(cfg)
    err = refresher.Start(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    defer refresher.Stop()

    db = refresher.GetDB()
    // Используйте db для запросов
}
```

## Устранение неполадок

### Port forwarding не запускается

**Проблема:** `Session Manager plugin is not found`

**Решение:**
```bash
# macOS
brew install --cask session-manager-plugin

# Проверить
session-manager-plugin --version
```

### IAM токен истек

**Проблема:** `password authentication failed`

**Решение:**
- IAM токены действительны ~15 минут
- Перезапустите `04-connect-tableplus.sh`
- Скопируйте новый токен в TablePlus

### Не могу подключиться к bastion

**Проблема:** `Target is not connected`

**Решение:**
```bash
# Проверить статус instance
aws ec2 describe-instances \
  --instance-ids i-xxxxxxxxxxxxx \
  --region us-east-1 \
  --query 'Reservations[0].Instances[0].State.Name'

# Должно быть: "running"

# Проверить SSM агент
aws ssm describe-instance-information \
  --filters "Key=InstanceIds,Values=i-xxxxxxxxxxxxx" \
  --region us-east-1
```

### Security Group ошибки

**Проблема:** Connection timeout

**Решение:**
```bash
# Проверить Security Groups
aws ec2 describe-security-groups \
  --group-ids sg-0c2b94f40cedb4d61 \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions'

# Должно быть правило от bastion SG
```

### Пользователь db_agent не существует

**Проблема:** `role "db_agent" does not exist`

**Решение:**
```bash
# Повторить создание пользователя
./02-apply-db-agent-user.sh

# Или проверить вручную через ECS exec
aws ecs execute-command \
  --cluster tyriantrade-cluster \
  --task [TASK_ID] \
  --container custom-backend \
  --interactive \
  --command "psql \$DATABASE_URL -c 'SELECT usename FROM pg_user WHERE usename = \'db_agent\''"
```

## Полезные команды

### Проверить IAM Auth статус

```bash
aws rds describe-db-instances \
  --db-instance-identifier tyriantrade-db \
  --region us-east-1 \
  --query 'DBInstances[0].[DBInstanceStatus,IAMDatabaseAuthenticationEnabled]' \
  --output table
```

### Список IAM политик роли

```bash
aws iam list-attached-role-policies \
  --role-name tyriantrade-ecs-task-role \
  --output table
```

### Проверить пользователя db_agent

```sql
-- Подключиться как postgres и выполнить
SELECT 
    usename,
    usesuper,
    usecreatedb,
    usecreaterole
FROM pg_user 
WHERE usename = 'db_agent';

-- Проверить роли
SELECT r.rolname 
FROM pg_roles r
JOIN pg_auth_members m ON r.oid = m.roleid
JOIN pg_roles u ON u.oid = m.member
WHERE u.rolname = 'db_agent';
```

### Остановить bastion

```bash
cd aws-infrastructure/iam-db-auth
terraform destroy
```

## Безопасность

✅ **Временные токены** - действительны только 15 минут  
✅ **Без публичного IP** - bastion в private subnet  
✅ **SSM доступ** - без SSH ключей  
✅ **IAM контроль** - централизованное управление  
✅ **TLS шифрование** - все соединения зашифрованы  

## Стоимость

**SSM Bastion (t3.micro):**
- Инстанс: ~$0.0104/час × 730 часов = ~$7.59/месяц
- SSM Session Manager: бесплатно
- Port forwarding: бесплатно

**Итого:** ~$7.59/месяц

## Документация

- [AWS RDS IAM Authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html)
- [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [PostgreSQL Roles](https://www.postgresql.org/docs/current/user-manag.html)

---

**Создано:** 04.11.2025  
**Версия:** 1.0  
**Проект:** TyrianTrade
