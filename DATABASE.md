# 🗄 База данных - X-18

**Последнее обновление:** 06.11.2025  
**База данных:** AWS Lightsail PostgreSQL 15.14

---

## 📊 Информация о базе данных

### Production параметры

```
Host:     ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com
Port:     5432
Database: tyriantrade
Username: dbadmin
Password: TyrianTrade2024SecurePass
Engine:   PostgreSQL 15.14
Region:   us-east-1
Plan:     Micro (1GB RAM, 40GB Storage)
```

### Connection String

```bash
postgresql://dbadmin:TyrianTrade2024SecurePass@ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com:5432/tyriantrade?sslmode=prefer
```

---

## 🔌 Подключение через TablePlus

### Шаг 1: Создайте новое подключение

1. Откройте TablePlus
2. Нажмите `⌘ N` (или "Create a new connection")
3. Выберите **PostgreSQL**

### Шаг 2: Введите параметры

```
Name:     TyrianTrade Lightsail
Host:     ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com
Port:     5432
User:     dbadmin
Password: TyrianTrade2024SecurePass
Database: tyriantrade
SSL Mode: Prefer
```

### Шаг 3: Подключитесь

1. Нажмите **Test** для проверки
2. Нажмите **Connect**

---

## 🚀 Настройка для проекта

### Backend (.env)

```bash
# Database Configuration
DB_HOST=ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_USER=dbadmin
DB_PASSWORD=TyrianTrade2024SecurePass
DB_NAME=tyriantrade
DB_SSLMODE=prefer
```

### Инициализация таблиц

Проект использует **GORM AutoMigrate**. Таблицы создаются автоматически при первом запуске:

```bash
cd custom-backend
go run cmd/server/main.go
```

GORM автоматически:
- ✅ Создаст все таблицы
- ✅ Применит индексы
- ✅ Настроит связи
- ✅ Создаст начального админа

---

## 📋 Схема базы данных

### Основные таблицы

```sql
-- Пользователи
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(500),
  cover_url VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  role VARCHAR(20) DEFAULT 'user',
  subscription_price_cents INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Посты (включая комментарии)
posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  content_html TEXT,
  reply_to_id UUID REFERENCES posts(id),
  root_post_id UUID REFERENCES posts(id),
  metadata JSONB,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  retweets_count INTEGER DEFAULT 0,
  visibility VARCHAR(20) DEFAULT 'public',
  is_premium BOOLEAN DEFAULT false,
  price_cents INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Подписки
follows (
  id UUID PRIMARY KEY,
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP,
  UNIQUE(follower_id, following_id)
)

-- Лайки
likes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  created_at TIMESTAMP,
  UNIQUE(user_id, post_id)
)

-- Уведомления
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  from_user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  post_id UUID REFERENCES posts(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)

-- Медиа файлы
media (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  url VARCHAR(500) NOT NULL,
  width INTEGER,
  height INTEGER,
  size INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP
)

-- Премиум подписки
subscriptions (
  id UUID PRIMARY KEY,
  subscriber_id UUID REFERENCES users(id),
  creator_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL,
  price_cents INTEGER NOT NULL,
  stripe_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(subscriber_id, creator_id)
)

-- Сессии (Redis backup)
sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)

-- OAuth идентификаторы
user_oauth_identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  UNIQUE(provider, provider_user_id)
)

-- Реферальные коды
referral_codes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  code VARCHAR(50) UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

### Индексы

```sql
-- Performance indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_reply_to_id ON posts(reply_to_id);
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_following_id ON follows(following_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
```

---

## 🔧 Управление базой данных

### Подключение через psql

```bash
PGPASSWORD=TyrianTrade2024SecurePass psql \
  -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com \
  -p 5432 \
  -U dbadmin \
  -d tyriantrade
```

### Полезные команды

```sql
-- Список таблиц
\dt

-- Описание таблицы
\d users

-- Количество пользователей
SELECT COUNT(*) FROM users;

-- Последние посты
SELECT id, content, created_at FROM posts 
ORDER BY created_at DESC LIMIT 10;

-- Статистика
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM posts) as total_posts,
  (SELECT COUNT(*) FROM follows) as total_follows;
```

### Резервное копирование

```bash
# Создать бэкап
pg_dump -h ls-69057322a60e97e4e1cdaef477c7935317dd7dbe.c6ryeissg3eu.us-east-1.rds.amazonaws.com \
  -U dbadmin \
  -d tyriantrade \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Восстановить из бэкапа
pg_restore -h HOST -U dbadmin -d tyriantrade backup_20251106.dump
```

---

## 📊 Мониторинг

### CloudWatch

AWS Lightsail автоматически отправляет метрики в CloudWatch:
- CPU Usage
- Database Connections
- Free Storage Space
- Network Throughput

### Проверка статуса

```bash
# Через AWS CLI
aws lightsail get-relational-database \
  --relational-database-name tyriantrade-lightsail-db \
  --region us-east-1
```

---

## 🔐 Безопасность

### Рекомендации

1. **Смените пароль после первого подключения**
   ```sql
   ALTER USER dbadmin WITH PASSWORD 'NewSecurePassword123!';
   ```

2. **Ограничьте доступ по IP** (в AWS Console)
   - Lightsail → Databases → Networking
   - Добавьте разрешенные IP адреса

3. **Используйте SSL подключения**
   - Всегда используйте `sslmode=prefer` или `require`

4. **Регулярные бэкапы**
   - AWS Lightsail автоматически создает ежедневные бэкапы
   - Хранятся 7 дней

---

## 🐛 Troubleshooting

### Не могу подключиться

1. Проверьте публичный доступ:
   ```bash
   aws lightsail get-relational-database --relational-database-name tyriantrade-lightsail-db
   ```

2. Проверьте firewall правила в AWS Console

3. Проверьте что используете правильный хост и порт

### Too many connections

```sql
-- Проверить активные соединения
SELECT count(*) FROM pg_stat_activity;

-- Закрыть idle соединения
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND query_start < now() - interval '10 minutes';
```

### Медленные запросы

```sql
-- Включить логирование медленных запросов
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 секунда

-- Посмотреть медленные запросы
SELECT * FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 📚 Дополнительные ресурсы

- [AWS Lightsail Database Documentation](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-databases)
- [PostgreSQL 15 Documentation](https://www.postgresql.org/docs/15/)
- [GORM Documentation](https://gorm.io/docs/)
- [TablePlus](https://tableplus.com/)

---

**Последнее обновление:** 06.11.2025  
**Database Version:** PostgreSQL 15.14  
**Стоимость:** $15/месяц
