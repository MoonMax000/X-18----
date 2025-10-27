# Настройка Resend для отправки Email

## Обзор

Resend.com - современный сервис для отправки email через API и SMTP. Мы используем его для отправки кодов подтверждения и уведомлений пользователям.

## Текущая конфигурация

### API ключ
```
re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh
```

### SMTP настройки в gotosocial/config.yaml
```yaml
smtp-host: "smtp.resend.com"
smtp-port: 465
smtp-username: "resend"
smtp-password: "re_3Vuw1VvN_2crqhyc6fEtPHHU7rqnwjRGh"
smtp-from: "noreply@your-domain.com"
```

## Что нужно сделать

### 1. Верифицировать домен в Resend

⚠️ **ВАЖНО**: Resend требует верифицированный домен для отправки email.

1. Зайдите на https://resend.com/domains
2. Добавьте ваш домен
3. Добавьте DNS записи для верификации:
   - SPF запись
   - DKIM запись
   - DMARC запись (опционально)

### 2. Обновить smtp-from в config.yaml

После верификации домена, замените в `gotosocial/config.yaml`:
```yaml
smtp-from: "noreply@your-verified-domain.com"
```

### 3. Перезапустить GoToSocial

```bash
# Остановить текущий сервер
./stop-gotosocial.sh

# Запустить с новой конфигурацией
./start-gotosocial.sh
```

## Типы email, которые будут отправляться

1. **Email подтверждение при регистрации**
   - Код подтверждения для новых пользователей
   - Отправляется автоматически при регистрации через модальное окно

2. **Восстановление пароля** (если настроено)
   - Код для сброса пароля

3. **Уведомления** (опционально)
   - Можно настроить через GoToSocial

## Тестирование

### Проверка отправки email

1. Откройте фронтенд: http://localhost:5173
2. Откройте модальное окно регистрации
3. Зарегистрируйте нового пользователя с реальным email
4. Проверьте почтовый ящик на наличие письма с кодом подтверждения

### Проверка в Resend Dashboard

1. Зайдите на https://resend.com/emails
2. Посмотрите статус отправленных писем
3. Проверьте логи отправки

## Ограничения бесплатного плана Resend

- 100 email в день
- 3,000 email в месяц
- Требуется верифицированный домен

## Альтернатива для тестирования

Если у вас пока нет верифицированного домена, можно использовать:

### Resend в режиме разработки
```yaml
smtp-from: "onboarding@resend.dev"
```

⚠️ Письма будут доставляться только на email, зарегистрированные в вашем Resend аккаунте.

## Отладка проблем

### Email не приходят

1. Проверьте логи GoToSocial:
```bash
docker logs gotosocial 2>&1 | grep -i smtp
```

2. Проверьте статус в Resend Dashboard

3. Проверьте папку "Спам" в почтовом ящике

### Ошибка аутентификации SMTP

- Убедитесь, что API ключ правильный
- Username всегда должен быть `resend`
- Проверьте, не истек ли API ключ

## Преимущества Resend перед Gmail

✅ Проще настройка - не нужны App Passwords
✅ Лучшая доставляемость email
✅ Подробная аналитика отправок
✅ API для программной отправки
✅ Webhook'и для отслеживания событий
✅ Современный Dashboard

## Следующие шаги

1. Верифицировать домен в Resend
2. Обновить `smtp-from` в config.yaml
3. Перезапустить GoToSocial
4. Протестировать регистрацию пользователя
5. Проверить получение email с кодом подтверждения

## Полезные ссылки

- [Resend Dashboard](https://resend.com/overview)
- [Resend SMTP документация](https://resend.com/docs/send-with-smtp)
- [Resend API документация](https://resend.com/docs/api-reference/introduction)
- [Верификация домена](https://resend.com/docs/dashboard/domains/introduction)
