# 📚 Команды PostgreSQL для управления пользователями

## Вы успешно подключились! Теперь выполняйте эти команды:

### 1. Показать всех пользователей с их ролями
```sql
SELECT id, username, email, role, created_at 
FROM users 
ORDER BY created_at DESC;
```

### 2. Показать только первые 10 пользователей
```sql
SELECT id, username, email, role 
FROM users 
LIMIT 10;
```

### 3. Найти конкретного пользователя по email
```sql
SELECT id, username, email, role 
FROM users 
WHERE email = 'test@test.com';
```

### 4. Найти пользователя по username
```sql
SELECT id, username, email, role 
FROM users 
WHERE username LIKE '%test%';
```

### 5. Назначить админа конкретному пользователю
```sql
-- Сначала найдите ID нужного пользователя
SELECT id, username, email FROM users WHERE email = 'нужный_email@example.com';

-- Затем обновите роль (замените ID на найденный)
UPDATE users SET role = 'admin' WHERE id = 'вставьте_id_здесь';

-- Проверьте результат
SELECT id, username, email, role FROM users WHERE id = 'вставьте_id_здесь';
```

### 6. Назначить админа для testuser
```sql
UPDATE users SET role = 'admin' WHERE email = 'test@test.com';
```

### 7. Посмотреть статистику ролей
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;
```

### 8. Показать всех админов
```sql
SELECT id, username, email, created_at 
FROM users 
WHERE role = 'admin';
```

### 9. Убрать админские права
```sql
UPDATE users SET role = 'user' WHERE email = 'email_пользователя';
```

### 10. Посмотреть структуру таблицы users
```sql
\d users
```

### 11. Показать все таблицы в базе
```sql
\dt
```

### 12. Выйти из PostgreSQL
```sql
\q
```

## 🎯 Быстрый старт

Выполните эти команды по порядку:

```sql
-- 1. Посмотрите всех пользователей
SELECT id, username, email, role FROM users;

-- 2. Назначьте админа для testuser
UPDATE users SET role = 'admin' WHERE email = 'test@test.com';

-- 3. Проверьте что роль обновилась
SELECT username, email, role FROM users WHERE email = 'test@test.com';

-- 4. Выйдите из psql
\q
```

## 📝 Роли в системе

- **user** - обычный пользователь (по умолчанию)
- **moderator** - модератор (может обрабатывать жалобы)
- **admin** - администратор (полный доступ к админ-панели)

## ⚠️ Важно

После изменения роли пользователь должен **перезайти** на сайте, чтобы получить новый токен с обновленной ролью!

---

**После выполнения команд:**
1. Выйдите из psql командой `\q`
2. Перезайдите на сайте https://social.tyriantrade.com
3. Откройте админ-панель https://social.tyriantrade.com/admin
