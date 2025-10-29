# 🚀 Инструкция по деплою TOTP-защиты

## 📋 Краткое резюме

Реализована полная система TOTP 2FA с защитой критичных операций:
- ✅ Backend готов (100%)
- ✅ Frontend готов (100%)
- ⏳ Требуется деплой на Railway + Netlify

---

## 🔧 Что нужно сделать

### Шаг 1: Применить миграцию на Railway

```bash
# Запустить скрипт
./apply-migration-009-railway.sh

# Внутри psql выполнить:
\i custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql

# Проверить что поля добавлены:
\d users

# Выйти:
\q
```

**Что добавляет миграция:**
- `totp_secret` - зашифрованный TOTP секрет
- `totp_enabled` - флаг включения TOTP
- `is_deactivated` - флаг деактивации аккаунта
- `deactivation_reason` - причина деактивации
- `deactivated_at` - время деактивации
- `deletion_scheduled_at` - запланированная дата удаления

---

### Шаг 2: Добавить ENCRYPTION_KEY в Railway

```bash
# Сгенерировать ключ (32 байта)
openssl rand -base64 32

# Скопировать вывод и добавить в Railway:
railway variables set ENCRYPTION_KEY="<сгенерированный_ключ>"

# Пример:
# railway variables set ENCRYPTION_KEY="xK8vF2nR5mP9jL3qW7hT4bN6sC1dE0aY2uI8oV5gZ3w="
```

**Важно:** Этот ключ используется для шифрования TOTP секретов в базе данных. Без него TOTP не будет работать!

---

### Шаг 3: Задеплоить Backend на Railway

```bash
# Коммит изменений
git add .
git commit -m "feat: Add TOTP protected operations"

# Push в Railway
git push railway main

# Проверить логи
railway logs -f
```

**Ожидаемый вывод:**
```
✓ Build successful
✓ Deployment successful
✓ Server started on :8080
✓ Connected to PostgreSQL
✓ Connected to Redis
```

---

### Шаг 4: Задеплоить Frontend на Netlify

```bash
# Push в GitHub (Netlify автоматически задеплоит)
git push origin main

# Или через CLI:
netlify deploy --prod
```

**Проверка:**
1. Открыть https://your-app.netlify.app
2. Войти в аккаунт
3. Перейти в Profile → Security Settings

---

## ✅ Проверка работоспособности

### Тест 1: Включение TOTP

1. Откройте Security Settings
2. Нажмите "Enable 2FA"
3. Отсканируйте QR код в Google Authenticator
4. Введите 6-значный код
5. Сохраните backup codes

**Ожидание:** 
- ✅ QR код отображается
- ✅ Код принимается
- ✅ Backup codes показываются
- ✅ TOTP enabled = true

### Тест 2: Смена пароля с TOTP

1. Откройте "Change Password"
2. Введите текущий и новый пароль
3. Нажмите "Изменить пароль"

**Ожидание:**
- ✅ Показывается предупреждение "Потребуется TOTP"
- ✅ Открывается TOTP modal
- ✅ После ввода кода пароль меняется
- ✅ Показывается "Пароль успешно изменён!"

### Тест 3: Auto-save резервных контактов

1. Откройте "Backup Contacts"
2. Начните вводить email
3. Подождите 1 секунду

**Ожидание:**
- ✅ Показывается "Сохранение..."
- ✅ Через ~2 сек показывается "Сохранено ✓"
- ✅ Индикатор исчезает через 2 секунды

---

## 🐛 Troubleshooting

### Проблема 1: "TOTP generation failed"

**Причина:** Отсутствует ENCRYPTION_KEY

**Решение:**
```bash
# Проверить переменные
railway variables

# Если ENCRYPTION_KEY нет - добавить:
openssl rand -base64 32
railway variables set ENCRYPTION_KEY="<ключ>"

# Перезапустить сервис
railway up
```

### Проблема 2: "Database migration failed"

**Причина:** Миграция 009 не применена

**Решение:**
```bash
# Применить миграцию вручную
railway connect postgres
\i custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql
\q
```

### Проблема 3: TOTP modal не открывается

**Причина:** Frontend не задеплоен

**Решение:**
```bash
# Проверить что изменения в git
git status

# Коммит и push
git add .
git commit -m "feat: Add TOTP frontend"
git push origin main

# Проверить Netlify деплой
netlify open
```

### Проблема 4: "Invalid TOTP code"

**Возможные причины:**
1. Время на сервере не синхронизировано
2. Неправильный ключ в authenticator
3. TOTP secret не был сохранён

**Решение:**
```bash
# Проверить время на Railway
railway run date

# Если время неправильное - синхронизировать
# (Railway обычно использует UTC)

# Проверить что TOTP setup прошёл успешно
railway logs | grep "TOTP"
```

---

## 📊 Мониторинг

### Railway Logs

```bash
# Следить за логами
railway logs -f

# Фильтровать TOTP события
railway logs | grep "TOTP"

# Ошибки
railway logs | grep "ERROR"
```

### Netlify Logs

```bash
# Открыть Netlify dashboard
netlify open

# Или через CLI
netlify functions:log
```

---

## 🔒 Безопасность в Production

### ✅ Что уже реализовано:

1. **TOTP секреты зашифрованы** (AES-256-GCM)
2. **TOTP коды передаются в headers** (не в body)
3. **JWT + HttpOnly Cookies** для аутентификации
4. **Rate limiting** на уровне middleware
5. **Валидация всех входных данных**

### 🎯 Рекомендации:

1. **ENCRYPTION_KEY:**
   - Держите в секрете
   - Не коммитьте в git
   - Храните в безопасном месте
   - Регулярно ротируйте (раз в год)

2. **Backup codes:**
   - Пользователи должны их сохранить
   - Показывайте предупреждения
   - Отправляйте на email (будущее улучшение)

3. **Monitoring:**
   - Следите за неудачными TOTP попытками
   - Логируйте все защищённые операции
   - Настройте alerts в Railway

4. **User Education:**
   - Добавьте FAQ по TOTP
   - Объясните backup codes
   - Предупреждайте о безопасности

---

## 📈 Метрики успеха

После деплоя отслеживать:

### Backend метрики:

```bash
# Логи Railway
railway logs | grep "TOTP" | wc -l  # Кол-во TOTP операций
railway logs | grep "ERROR" | wc -l  # Кол-во ошибок
```

### Frontend метрики:

1. **User adoption:**
   - Сколько пользователей включили TOTP
   - Время до первого включения
   - Процент активации

2. **UX метрики:**
   - Время открытия TOTP modal (< 100ms)
   - Время auto-save (< 1 сек)
   - Успешность первой попытки TOTP

3. **Безопасность:**
   - 0 случаев обхода TOTP
   - 0 утечек ENCRYPTION_KEY
   - 100% зашифрованных секретов

---

## 🎓 Архитектура

### Backend Flow:

```
User Request
    ↓
JWT Middleware (проверка токена)
    ↓
TOTPRequired Middleware (проверка TOTP если включён)
    ↓
Protected Operation Handler (выполнение операции)
    ↓
Response
```

### Frontend Flow:

```
User Input
    ↓
useProtectedOperations (вызов без TOTP)
    ↓
Backend Response (403 + requires_totp)
    ↓
TOTPVerificationModal (открывается)
    ↓
User enters TOTP code
    ↓
useProtectedOperations (повторный вызов с TOTP)
    ↓
Success!
```

---

## 🚀 Готово к запуску!

### Финальный чеклист:

- [ ] Миграция 009 применена на Railway
- [ ] ENCRYPTION_KEY добавлен в Railway variables
- [ ] Backend задеплоен на Railway (git push railway main)
- [ ] Frontend задеплоен на Netlify (git push origin main)
- [ ] Проверено включение TOTP
- [ ] Проверена смена пароля с TOTP
- [ ] Проверен auto-save
- [ ] Логи Railway чистые (нет критичных ошибок)
- [ ] Netlify деплой успешен

### Быстрые команды:

```bash
# 1. Применить миграцию
./apply-migration-009-railway.sh

# 2. Добавить ENCRYPTION_KEY
openssl rand -base64 32
railway variables set ENCRYPTION_KEY="<key>"

# 3. Деплой backend
git add . && git commit -m "feat: TOTP protection" && git push railway main

# 4. Деплой frontend
git push origin main

# 5. Проверить логи
railway logs -f

# 6. Открыть приложение
open https://your-app.netlify.app
```

---

## 📝 Следующие улучшения

После успешного деплоя можно добавить:

1. **Backup codes restore** - восстановление через backup код
2. **Remember device** - не требовать TOTP с доверенных устройств
3. **Email notifications** - уведомления о важных действиях
4. **Rate limiting для TOTP** - защита от brute force
5. **Audit log** - история всех защищённых операций
6. **SMS 2FA** - альтернатива TOTP (опционально)

---

## 🎉 Поздравляю!

Система TOTP-защиты полностью реализована и готова к production!

**Что получили:**
- 🔒 AES-256-GCM шифрование TOTP секретов
- 📱 QR коды для authenticator apps
- 🛡️ Защита критичных операций (пароль/email/телефон)
- 💾 Auto-save с debounce
- ✨ Отличный UX с loading states
- 🚀 Production-ready код

**Вопросы?** Проверьте:
1. TOTP_PROTECTED_OPERATIONS_COMPLETE.md - полная документация
2. Railway logs - текущее состояние backend
3. Netlify dashboard - статус frontend

**Готово к использованию!** 🚀
