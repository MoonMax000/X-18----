# 🎯 Финальная настройка Admin Panel и TOTP

## ✅ Что уже сделано

1. ✅ Миграция 009 применена к Railway (все TOTP колонки существуют)
2. ✅ Ключ шифрования сгенерирован: `MMaiIy3dKPYpFZ9eSKVOD03AEsffPn80E/ik2sIRSO0=`
3. ✅ Ключ сохранен в файл `.railway-encryption-key.txt`
4. ✅ Admin Panel полностью готов (код, роуты, компоненты)
5. ✅ TOTP система полностью реализована (бэкенд, фронтенд, UI)

## 🔧 Что нужно сделать сейчас

### Шаг 1: Установить ENCRYPTION_KEY в Railway

**Вариант A - Через Railway Dashboard (РЕКОМЕНДУЕТСЯ):**

1. Откройте: https://railway.app
2. Войдите в свой проект
3. Выберите сервис `custom-backend`
4. Перейдите на вкладку **Variables**
5. Нажмите **New Variable**
6. Добавьте:
   ```
   Variable Name: ENCRYPTION_KEY
   Value: MMaiIy3dKPYpFZ9eSKVOD03AEsffPn80E/ik2sIRSO0=
   ```
7. Нажмите **Add**
8. Railway автоматически перезапустит сервис

**Вариант B - Через Railway CLI (если хотите):**

```bash
# Попробуйте один из этих вариантов:
railway variables --set ENCRYPTION_KEY="MMaiIy3dKPYpFZ9eSKVOD03AEsffPn80E/ik2sIRSO0="

# или
railway variables -s ENCRYPTION_KEY="MMaiIy3dKPYpFZ9eSKVOD03AEsffPn80E/ik2sIRSO0="
```

### Шаг 2: Назначить себе роль Admin

**Локальная база данных:**

```bash
cd custom-backend
psql "postgresql://postgres:postgres@localhost:5432/social_network" -c \
  "UPDATE users SET role = 'admin' WHERE username = 'ВАШ_USERNAME';"
```

**Railway база данных:**

```bash
# Подключитесь к Railway DB
railway connect postgres

# Выполните SQL
UPDATE users SET role = 'admin' WHERE username = 'ВАШ_USERNAME';

# Проверьте
SELECT id, username, email, role FROM users WHERE role = 'admin';

# Выход
\q
```

---

## 🧪 Тестирование

### Тест 1: Admin Panel

1. **Локально:**
   ```bash
   # Запустите бэкенд
   cd custom-backend && go run cmd/server/main.go
   
   # В другом терминале - фронтенд
   npm run dev
   ```

2. **Откройте:**
   - http://localhost:5173/admin
   - http://localhost:5173/admin/dashboard
   - http://localhost:5173/admin/users
   - http://localhost:5173/admin/news
   - http://localhost:5173/admin/reports

3. **Проверьте:**
   - ✅ Вас пустило на страницу (не редирект на главную)
   - ✅ Видны статистики на дашборде
   - ✅ Можно просматривать пользователей
   - ✅ Можно менять роли пользователей
   - ✅ Можно управлять новостями

4. **Production:**
   - Откройте: https://social.tyriantrade.com/admin
   - Проверьте те же функции

### Тест 2: TOTP (2FA)

1. **Перейдите в профиль безопасности:**
   - Локально: http://localhost:5173/profile/security
   - Production: https://social.tyriantrade.com/profile?tab=profile&profileTab=security

2. **Включите TOTP:**
   - Нажмите кнопку "Enable 2FA" / "Включить 2FA"
   - Должен появиться QR код
   - Отсканируйте в Google Authenticator / Authy
   - Введите 6-значный код из приложения
   - Должны появиться backup коды

3. **Проверьте защищенные операции:**
   - Попробуйте изменить пароль
   - Попробуйте изменить email
   - Попробуйте изменить номер телефона
   - Должно запрашиваться подтверждение TOTP кода

4. **Проверьте на Production:**
   - Повторите те же действия на https://social.tyriantrade.com

---

## 📝 Возможные проблемы

### Проблема 1: "Invalid TOTP code"

**Причина:** ENCRYPTION_KEY не установлен в Railway

**Решение:**
1. Проверьте переменные в Railway Dashboard
2. Убедитесь что ENCRYPTION_KEY установлен
3. Перезапустите сервис

### Проблема 2: "Access denied" в Admin Panel

**Причина:** Роль admin не назначена

**Решение:**
```sql
-- Проверьте текущую роль
SELECT username, email, role FROM users WHERE username = 'ВАШ_USERNAME';

-- Если NULL или 'user', назначьте admin
UPDATE users SET role = 'admin' WHERE username = 'ВАШ_USERNAME';
```

### Проблема 3: QR код не появляется

**Причина:** Ошибка на бэкенде при генерации секрета

**Решение:**
1. Откройте DevTools → Network
2. Найдите запрос к `/api/totp/enable`
3. Посмотрите ошибку в ответе
4. Проверьте логи бэкенда

---

## 🎉 Критерии успешности

### Admin Panel готов, если:
- ✅ Вы можете открыть /admin
- ✅ Видны все разделы (Dashboard, Users, News, Reports)
- ✅ Можно менять роли пользователей
- ✅ Можно управлять новостями
- ✅ Работает как локально, так и на production

### TOTP готов, если:
- ✅ Можно включить 2FA и получить QR код
- ✅ Код из Google Authenticator работает
- ✅ Сохраняются backup коды
- ✅ TOTP требуется при изменении пароля/email/телефона
- ✅ Работает как локально, так и на production

---

## 📞 После завершения настройки

**Сообщите мне:**
1. Установлен ли ENCRYPTION_KEY в Railway? (да/нет)
2. Назначена ли вам роль admin? (да/нет)
3. Работает ли Admin Panel локально? (да/нет/ошибка)
4. Работает ли Admin Panel на production? (да/нет/ошибка)
5. Работает ли TOTP локально? (да/нет/ошибка)
6. Работает ли TOTP на production? (да/нет/ошибка)

И я создам финальный отчет о выполнении обеих задач!
