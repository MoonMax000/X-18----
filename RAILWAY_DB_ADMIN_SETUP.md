# 🔧 Настройка админа через Railway CLI

## При выполнении `railway link`:

**Выберите `Postgres`** - это база данных, где хранятся пользователи.

```
? Select a service <esc to skip>  
  X-18----
> Postgres    ← ВЫБЕРИТЕ ЭТО
  Redis
```

## После выбора Postgres:

### Вариант 1: Быстрая команда
```bash
railway run psql -c "UPDATE users SET role = 'admin' WHERE email = 'test@test.com';"
```

### Вариант 2: Интерактивная консоль
```bash
railway run psql
```

Затем в консоли psql выполните:
```sql
-- Обновить роль для testuser
UPDATE users SET role = 'admin' WHERE id = 'b969c422-85c3-4e7e-a9f6-bf9c24984fe7';

-- Проверить результат
SELECT id, username, email, role FROM users WHERE email = 'test@test.com';

-- Выйти из psql
\q
```

## После обновления роли:

1. **Перезайдите** на сайте https://social.tyriantrade.com
2. Используйте учетные данные:
   - Email: `test@test.com`
   - Пароль: `TestPassword123!`
3. После входа откройте https://social.tyriantrade.com/admin

## Что делать если команда не работает:

Если railway psql не работает, используйте веб-интерфейс:

1. Откройте https://railway.app/dashboard
2. Выберите проект **TT PROD1**
3. Кликните на **Postgres**
4. Перейдите во вкладку **Data** → **Query**
5. Выполните SQL запрос там

---

**Готово!** После этих шагов у вас будет доступ к админ-панели.
