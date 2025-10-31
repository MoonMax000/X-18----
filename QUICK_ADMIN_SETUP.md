# 🚀 Быстрая настройка администратора

## ⏱️ Время: 5 минут

---

## 📋 ДЛЯ ВАС (Назначение Admin роли)

### Локальная БД

```bash
# 1. Подключиться к локальной БД
psql -U postgres -d x18_db

# 2. Посмотреть всех пользователей
SELECT id, username, email, role FROM users ORDER BY created_at;

# 3. Назначить себя админом (замените YOUR_USERNAME на свой username!)
UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME';

# 4. Проверить что роль назначена
SELECT username, email, role FROM users WHERE role = 'admin';

# Должны увидеть свой username с role = 'admin'

# 5. Выйти
\q
```

### Railway Production БД

```bash
# 1. Подключиться к Railway
railway connect postgres

# 2. Посмотреть пользователей
SELECT id, username, email, role FROM users ORDER BY created_at;

# 3. Назначить себя админом (замените YOUR_USERNAME!)
UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME';

# 4. Проверить
SELECT username, email, role FROM users WHERE role = 'admin';

# 5. Выйти
\q
```

---

## ✅ Проверка что админка работает

### Локально:

1. **Перезапустить backend** (если запущен):
   ```bash
   # Остановить (Ctrl+C если запущен)
   # Запустить снова
   ./START_CUSTOM_BACKEND_STACK.sh
   ```

2. **Запустить frontend**:
   ```bash
   npm run dev
   ```

3. **В браузере** (http://localhost:5173):
   - Выйти из аккаунта (если залогинены)
   - Войти снова
   - Открыть **http://localhost:5173/admin**
   - ✅ **Должна открыться админ-панель!**

4. **Проверить разделы**:
   - Dashboard - показывает статистику
   - News - можно создать новость
   - Users - список пользователей виден
   - Reports - список жалоб виден

### Production:

1. **На сайте** (https://ваш-сайт.netlify.app):
   - Выйти из аккаунта
   - Войти снова
   - Открыть **/admin**
   - ✅ **Админка должна работать!**

---

## 🐛 Если админка не открывается

### Проблема: Редирект на главную

**Причина:** Role не загрузилась в AuthContext

**Решение:**

```bash
# 1. Проверить что role действительно в БД
psql -U postgres -d x18_db -c "SELECT username, role FROM users WHERE username = 'YOUR_USERNAME';"

# Должны увидеть:
#  username  |  role
# -----------+-------
#  your_name | admin

# 2. Очистить localStorage в браузере:
# DevTools (F12) → Application → Local Storage → Clear All

# 3. Hard refresh браузера:
# Mac: Cmd + Shift + R
# Windows: Ctrl + Shift + R

# 4. Войти снова
```

### Проблема: Backend не возвращает role

**Проверка:**

```bash
# В браузере DevTools → Network
# Найти запрос: GET /api/users/me
# Смотреть Response

# Должно быть:
{
  "id": "...",
  "username": "...",
  "role": "admin",  // <-- Это поле должно быть!
  ...
}
```

**Если role нет:**

```bash
# Проверить что backend видит role в БД
# Перезапустить backend
./START_CUSTOM_BACKEND_STACK.sh
```

---

## 🎯 Чеклист

Локально:
- [ ] Подключился к БД
- [ ] Назначил себе role='admin'
- [ ] Проверил что role сохранилась
- [ ] Перезапустил backend
- [ ] Вышел и вошёл на сайте
- [ ] Открыл /admin
- [ ] ✅ Админка работает!
- [ ] Проверил Dashboard
- [ ] Проверил News
- [ ] Проверил Users
- [ ] Проверил Reports

Production:
- [ ] Подключился к Railway DB
- [ ] Назначил role='admin'
- [ ] Проверил что role сохранилась
- [ ] Вышел и вошёл на сайте
- [ ] Открыл /admin
- [ ] ✅ Админка работает!

---

## 📞 Готово?

После выполнения этих шагов:

1. ✅ Админка должна работать
2. Сообщите мне: **"Админка работает!"**
3. Я создам финальный отчет с результатами обеих задач

---

**Удачи! 🚀**
