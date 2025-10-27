# Инструкция: Настройка Gmail SMTP для GoToSocial

## Что нужно для отправки email через Gmail

Gmail использует двухэтапную аутентификацию и требует создания специального пароля приложения (App Password) вместо обычного пароля от аккаунта.

## Пошаговая инструкция

### Шаг 1: Включить двухэтапную аутентификацию

1. Перейдите на https://myaccount.google.com/
2. В левом меню выберите **"Безопасность"** (Security)
3. Найдите раздел **"Вход в аккаунт Google"**
4. Нажмите на **"Двухэтапная аутентификация"** (2-Step Verification)
5. Следуйте инструкциям для включения (вам нужно будет подтвердить номер телефона)

### Шаг 2: Создать App Password (Пароль приложения)

1. После включения двухэтапной аутентификации, вернитесь на https://myaccount.google.com/
2. Перейдите в **"Безопасность"** → **"Двухэтапная аутентификация"**
3. Прокрутите вниз до раздела **"Пароли приложений"** (App passwords)
4. Нажмите на **"Пароли приложений"**
5. В поле "Выберите приложение" выберите **"Почта"** (Mail)
6. В поле "Выберите устройство" выберите **"Другое"** (Other)
7. Введите имя, например: "GoToSocial Server"
8. Нажмите **"Создать"** (Generate)
9. **ВАЖНО:** Скопируйте 16-значный пароль (он показывается только один раз!)
   - Пример: `abcd efgh ijkl mnop` (без пробелов при вводе)

### Шаг 3: Настроить GoToSocial config.yaml

Откройте файл `gotosocial/config.yaml` и добавьте SMTP настройки:

```yaml
# SMTP Settings (for email verification)
smtp-host: "smtp.gmail.com"
smtp-port: 587
smtp-username: "ваш-email@gmail.com"  # Ваш Gmail адрес
smtp-password: "abcdefghijklmnop"     # App Password БЕЗ пробелов!
smtp-from: "noreply@localhost"        # От кого будут письма
smtp-disclose-recipients: false
```

### Пример готовой конфигурации:

Если ваш email: `devidanderson@gmail.com`
И App Password: `abcd efgh ijkl mnop`

```yaml
smtp-host: "smtp.gmail.com"
smtp-port: 587
smtp-username: "devidanderson@gmail.com"
smtp-password: "abcdefghijklmnop"  # БЕЗ пробелов!
smtp-from: "noreply@localhost"
smtp-disclose-recipients: false
```

### Шаг 4: Перезапустить GoToSocial

```bash
# Остановите текущий процесс (Ctrl+C если запущен)
cd gotosocial
./gotosocial --config-path config.yaml server start
```

## Проверка работы

После настройки SMTP:

1. Зарегистрируйте нового пользователя через модальное окно
2. Проверьте почту - должно прийти письмо с кодом подтверждения
3. Введите код для активации аккаунта

## Альтернативные SMTP сервисы

Если не хотите использовать Gmail, можно использовать:

### Mailgun (бесплатно до 5000 писем/месяц)
```yaml
smtp-host: "smtp.mailgun.org"
smtp-port: 587
smtp-username: "postmaster@your-domain.mailgun.org"
smtp-password: "your-mailgun-password"
smtp-from: "noreply@your-domain.com"
```

### SendGrid (бесплатно до 100 писем/день)
```yaml
smtp-host: "smtp.sendgrid.net"
smtp-port: 587
smtp-username: "apikey"
smtp-password: "your-sendgrid-api-key"
smtp-from: "noreply@your-domain.com"
```

### Для локального тестирования (Mailtrap)
```yaml
smtp-host: "smtp.mailtrap.io"
smtp-port: 2525
smtp-username: "your-mailtrap-username"
smtp-password: "your-mailtrap-password"
smtp-from: "test@localhost"
```

## Частые проблемы

### Ошибка "Authentication failed"
- Проверьте, что App Password скопирован без пробелов
- Убедитесь, что двухэтапная аутентификация включена
- Попробуйте создать новый App Password

### Письма не приходят
- Проверьте папку "Спам"
- Проверьте логи GoToSocial на наличие ошибок
- Убедитесь, что smtp-from использует валидный email формат

### Gmail блокирует доступ
- Проверьте https://myaccount.google.com/notifications
- Убедитесь, что не используете обычный пароль вместо App Password
- Попробуйте зайти в Gmail и проверить уведомления безопасности
