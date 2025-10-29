# 🗄️ Подключение к базе данных Railway PostgreSQL

## Полное руководство по управлению пользователями и администраторами

---

## 📋 Содержание

1. [Установка Railway CLI](#1-установка-railway-cli)
2. [Подключение к проекту](#2-подключение-к-проекту)
3. [Подключение к базе данных](#3-подключение-к-базе-данных)
4. [Полезные SQL-запросы](#4-полезные-sql-запросы)
5. [Управление администраторами](#5-управление-администраторами)
6. [Просмотр данных](#6-просмотр-данных)
7. [Выход из psql](#7-выход-из-psql)

---

## 1. Установка Railway CLI

### macOS / Linux:
```bash
brew install railway
```

### Альтернативный способ (npm):
```bash
npm install -g @railway/cli
```

### Проверка установки:
```bash
railway --version
```

---

## 2. Подключение к проекту

### Шаг 1: Вход в Railway
```bash
railway login
```
Это откроет браузер для авторизации.

### Шаг 2: Перейти в директорию проекта
```bash
cd /Users/devidanderson/Projects/X-18----/custom-backend
```

### Шаг 3: Привязать проект (если еще не привязан)
```bash
railway link
```
Выберите ваш проект из списка.

---

## 3. Подключение к базе данных

### Простой способ (автоматическое подключение):
```bash
railway run psql
```

### Или с явным указанием переменной:
```bash
railway run psql $DATABASE_URL
```

После выполнения команды вы окажетесь в интерактивной оболочке PostgreSQL:
```
psql (15.x)
Type "help" for help.

database_name=>
```

---

## 4. Полезные SQL-запросы

### 📊 Просмотр всех пользователей
```sql
SELECT id, username, email, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

### 👑 Показать только администраторов
```sql
SELECT id, username, email, role, created_at 
FROM users 
WHERE role = 'admin';
```

### 🔍 Найти пользователя по email
```sql
SELECT * FROM users WHERE email = 'user@example.com';
```

### 🔍 Найти пользователя по username
```sql
SELECT * FROM users WHERE username = 'username';
```

### 📈 Подсчет пользователей по ролям
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### 📋 Детальная информация о пользователе
```sql
SELECT 
    id,
    username,
    email,
    display_name,
    role,
    email_verified,
    phone_verified,
    created_at,
    updated_at
FROM users 
WHERE email = 'user@example.com';
```

---

## 5. Управление администраторами

### ⭐ Назначить пользователя администратором
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'user@example.com';
```

### 📧 Альтернатива: по username
```sql
UPDATE users 
SET role = 'admin' 
WHERE username = 'username';
```

### 🔑 Альтернатива: по ID
```sql
UPDATE users 
SET role = 'admin' 
WHERE id = 1;
```

### ❌ Удалить права администратора
```sql
UPDATE users 
SET role = 'user' 
WHERE email = 'user@example.com';
```

### ✅ Проверить результат изменения
```sql
SELECT id, username, email, role 
FROM users 
WHERE email = 'user@example.com';
```

---

## 6. Просмотр данных

### 📑 Список всех таблиц в базе данных
```sql
\dt
```

### 📐 Структура таблицы users
```sql
\d users
```

### 📊 Количество записей в таблице
```sql
SELECT COUNT(*) FROM users;
```

### 🔄 Последние 10 зарегистрированных пользователей
```sql
SELECT id, username, email, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### 📝 Посты определенного пользователя
```sql
SELECT p.id, p.content, p.created_at 
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'user@example.com'
ORDER BY p.created_at DESC;
```

### 📈 Статистика активности пользователя
```sql
SELECT 
    u.username,
    u.email,
    COUNT(DISTINCT p.id) as post_count,
    COUNT(DISTINCT c.id) as comment_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
WHERE u.email = 'user@example.com'
GROUP BY u.id, u.username, u.email;
```

---

## 7. Выход из psql

### Команды выхода:
```sql
\q
```

Или просто нажмите `Ctrl + D`

---

## 🎯 Быстрый пример: Назначить администратора

### Полный процесс:

```bash
# 1. Подключиться к базе данных
railway run psql

# 2. Найти пользователя
SELECT id, username, email, role FROM users WHERE email = 'your@email.com';

# 3. Назначить администратором
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';

# 4. Проверить изменения
SELECT id, username, email, role FROM users WHERE email = 'your@email.com';

# 5. Выйти
\q
```

---

## 🔐 Важные замечания

### ⚠️ Безопасность:
- Назначайте права администратора только проверенным пользователям
- Регулярно проверяйте список администраторов
- Не делитесь учетными данными базы данных

### 📝 Резервное копирование:
Перед массовыми изменениями создавайте резервную копию:
```bash
railway run pg_dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 🔄 Восстановление из резервной копии:
```bash
railway run psql < backup_20241029_120000.sql
```

---

## 💡 Полезные команды psql

| Команда | Описание |
|---------|----------|
| `\dt` | Список всех таблиц |
| `\d table_name` | Структура конкретной таблицы |
| `\l` | Список всех баз данных |
| `\du` | Список пользователей PostgreSQL |
| `\q` | Выход из psql |
| `\?` | Справка по командам psql |
| `\h SQL_COMMAND` | Справка по SQL-команде |

---

## 📞 Поддержка

Если возникли проблемы:

1. **Railway не подключается:**
   ```bash
   railway logout
   railway login
   railway link
   ```

2. **Ошибка "command not found: psql":**
   - Railway CLI использует собственный psql
   - Убедитесь, что используете `railway run psql`, а не просто `psql`

3. **База данных недоступна:**
   ```bash
   railway status
   ```
   Проверьте, что сервис PostgreSQL запущен

---

## 🎓 Дополнительные ресурсы

- [Railway CLI Documentation](https://docs.railway.app/develop/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)

---

**Дата создания:** 29 октября 2025  
**Версия:** 1.0  
**Статус:** ✅ Готово к использованию
