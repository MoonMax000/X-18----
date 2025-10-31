# 🎯 Последний шаг: Назначить роль Admin

## ✅ Что уже сделано:

1. ✅ Миграция 009 применена к Railway
2. ✅ ENCRYPTION_KEY установлен в Railway: `MMaiIy3dKPYpFZ9eSKVOD03AEsffPn80E/ik2sIRSO0=`
3. ✅ Railway сервис перезапущен с новой переменной

## 🔧 Остался 1 шаг: Назначить роль Admin

### Вариант 1 - Через Railway CLI (быстро):

```bash
# Подключитесь к Railway PostgreSQL
railway connect postgres

# Замените 'ваш_username' на ваш реальный username
UPDATE users SET role = 'admin' WHERE username = 'ваш_username';

# Проверьте, что роль назначена
SELECT id, username, email, role FROM users WHERE role = 'admin';

# Выход
\q
```

### Вариант 2 - Через TablePlus / pgAdmin:

1. Откройте Railway Dashboard → PostgreSQL → Connect
2. Скопируйте connection string
3. Подключитесь через TablePlus
4. Выполните SQL:
```sql
UPDATE users SET role = 'admin' WHERE username = 'ваш_username';
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

### Вариант 3 - Для локальной БД:

```bash
cd custom-backend
psql "postgresql://postgres:postgres@localhost:5432/social_network" -c "UPDATE users SET role = 'admin' WHERE username = 'ваш_username';"
```

---

## 🧪 Тестирование

### После назначения роли admin:

1. **Проверьте Admin Panel (Production):**
   - Откройте: https://social.tyriantrade.com/admin
   - Должны видеть Dashboard со статистикой
   - Перейдите в разделы:
     * `/admin/users` - управление пользователями
     * `/admin/news` - управление новостями
     * `/admin/reports` - модерация отчетов

2. **Проверьте TOTP (Production):**
   - Откройте: https://social.tyriantrade.com/profile?tab=profile&profileTab=security
   - Нажмите "Enable 2FA" / "Включить 2FA"
   - Должен появиться QR код
   - Отсканируйте в Google Authenticator
   - Введите 6-значный код
   - Должны получить backup коды

3. **Проверьте защищенные операции:**
   - Попробуйте изменить пароль → должен запросить TOTP код
   - Попробуйте изменить email → должен запросить TOTP код
   - Попробуйте изменить телефон → должен запросить TOTP код

---

## 🎉 Критерии успеха

### Admin Panel работает, если:
- ✅ Можете открыть `/admin` без редиректа
- ✅ Видите статистику на Dashboard
- ✅ Можете просматривать и редактировать пользователей
- ✅ Можете управлять новостями

### TOTP работает, если:
- ✅ Появляется QR код при включении 2FA
- ✅ Код из Google Authenticator принимается
- ✅ Получены backup коды
- ✅ TOTP запрашивается при изменении пароля/email/телефона

---

## 📝 Как узнать свой username

Если не помните username, выполните:

```bash
railway connect postgres

-- Посмотрите всех пользователей
SELECT id, username, email FROM users ORDER BY created_at DESC LIMIT 10;

-- Найдите своего пользователя и запомните username
\q
```

Затем назначьте себе роль admin командой выше.

---

## 🚀 После завершения

Сообщите результаты:
1. Роль admin назначена? (да/нет)
2. Admin Panel работает на production? (да/нет/ошибка)
3. TOTP работает на production? (да/нет/ошибка)
4. Если есть ошибки - скриншот или текст ошибки

И я создам финальный отчет о полном завершении обеих задач!
