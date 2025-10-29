# 🔑 Как получить доступ к админ-панели

## 📍 Где находится админ-панель

**Production URL**: https://social.tyriantrade.com/admin

## 🎯 Простая инструкция для назначения администратора

### Шаг 1: Найдите ID пользователя

Мы только что создали пользователя `testuser`. Его ID: 
```
b969c422-85c3-4e7e-a9f6-bf9c24984fe7
```

### Шаг 2: Подключитесь к Railway БД через Dashboard

1. Откройте https://railway.app/dashboard
2. Выберите проект **TT PROD1**
3. Кликните на сервис **Postgres**
4. Перейдите во вкладку **Data**
5. Кликните на вкладку **Query**

### Шаг 3: Выполните SQL запрос для назначения админа

Вставьте и выполните этот запрос:

```sql
-- Назначить админа для testuser
UPDATE users 
SET role = 'admin' 
WHERE id = 'b969c422-85c3-4e7e-a9f6-bf9c24984fe7';

-- Проверить что роль обновилась
SELECT id, username, email, role 
FROM users 
WHERE id = 'b969c422-85c3-4e7e-a9f6-bf9c24984fe7';
```

Или если хотите назначить админа другому пользователю:

```sql
-- Сначала найдите пользователя по email
SELECT id, username, email, role 
FROM users 
WHERE email = 'ваш_email@example.com';

-- Затем обновите роль (замените ID на найденный)
UPDATE users 
SET role = 'admin' 
WHERE id = 'найденный_id_пользователя';
```

### Шаг 4: Войдите в систему

1. Откройте https://social.tyriantrade.com
2. Войдите с учетными данными пользователя, которому назначили админа
   - Для testuser: email `test@test.com`, пароль `TestPassword123!`
3. После входа перейдите на https://social.tyriantrade.com/admin

## 📊 Что есть в админ-панели

### Dashboard (`/admin`)
- Общая статистика
- Количество пользователей
- Количество постов
- Активные жалобы

### News Management (`/admin/news`)
- Создание новостей для виджета
- Редактирование новостей
- Удаление новостей

### Users Management (`/admin/users`)
- Просмотр всех пользователей
- Изменение ролей (user, moderator, admin)
- Просмотр статистики пользователей

### Reports Management (`/admin/reports`)
- Просмотр жалоб на посты
- Обработка жалоб
- Изменение статуса

## 🔐 Альтернативный способ через Railway CLI

Если удобнее через терминал:

```bash
# Установите Railway CLI
brew install railwayapp/tap/railway

# Войдите
railway login

# Подключитесь к проекту
railway link

# Подключитесь к БД и выполните SQL
railway run psql $DATABASE_URL -c "UPDATE users SET role = 'admin' WHERE email = 'test@test.com';"

# Проверьте
railway run psql $DATABASE_URL -c "SELECT id, username, email, role FROM users WHERE email = 'test@test.com';"
```

## 🚀 Быстрая проверка

1. После назначения админа войдите в систему
2. Откройте https://social.tyriantrade.com/admin
3. Если видите админ-панель - всё работает!

## ⚠️ Важно

- После изменения роли в БД нужно **перезайти** в систему
- JWT токен обновится и будет содержать новую роль
- Без роли `admin` доступа к панели не будет

---

**Готово!** Теперь у вас есть полный доступ к админ-панели 🎉
