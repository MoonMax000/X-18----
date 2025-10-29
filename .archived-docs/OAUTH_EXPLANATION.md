# Что такое OAuth приложение?

## Простыми словами

**OAuth приложение** - это как "пропуск" или "удостоверение", которое позволяет вашему веб-сайту безопасно общаться с GoToSocial сервером.

## Аналогия из реальной жизни

Представьте:
- **GoToSocial** = Охраняемый офис
- **Ваш сайт** = Курьер, который хочет доставить посылку
- **OAuth приложение** = Пропуск курьера, который охранник проверяет перед входом
- **Access Token** = Временный бейдж, который курьер получает после проверки пропуска

## Как это работает в нашем случае

### 1. Регистрация OAuth приложения (автоматически)

Когда пользователь впервые открывает модальное окно входа, код автоматически создает OAuth приложение:

```typescript
// Из файла: client/services/auth/gotosocial-auth.ts
async initializeApp() {
  // Проверяем, есть ли уже OAuth приложение
  const stored = localStorage.getItem('gts_oauth_client');
  
  if (!stored) {
    // Создаем новое OAuth приложение
    const response = await fetch(`${baseUrl}/api/v1/apps`, {
      method: 'POST',
      body: JSON.stringify({
        client_name: 'Tyrian Trading Platform',  // Имя приложения
        redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
        scopes: 'read write follow',  // Права доступа
      }),
    });
    
    // Сохраняем client_id и client_secret
    localStorage.setItem('gts_oauth_client', JSON.stringify({
      client_id: data.client_id,      // Публичный ID
      client_secret: data.client_secret // Секретный ключ
    }));
  }
}
```

**Результат:** В localStorage сохраняется:
```json
{
  "client_id": "01HJXX...",
  "client_secret": "secret_key_here"
}
```

### 2. Вход пользователя (OAuth Password Grant)

Когда пользователь вводит email и пароль:

```typescript
async login({ email, password }) {
  // 1. Получаем client_id и client_secret из localStorage
  await this.initializeApp();
  
  // 2. Отправляем запрос на получение access token
  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,        // ID нашего приложения
      client_secret: this.clientSecret, // Секрет приложения
      username: email,                  // Email пользователя
      password: password,               // Пароль пользователя
      scope: 'read write follow',
    }),
  });
  
  // 3. Получаем access_token
  return response.json(); // { access_token: "...", ... }
}
```

### 3. Использование Access Token

После входа сохраняется access token:

```typescript
localStorage.setItem('gts_token', authData.access_token);
```

Этот токен используется для всех запросов к API:

```typescript
// Пример запроса с токеном
fetch('http://localhost:8080/api/v1/accounts/verify_credentials', {
  headers: {
    'Authorization': `Bearer ${access_token}`  // Используем токен
  }
});
```

## Зачем это нужно?

### Безопасность
- Пароль пользователя НЕ хранится на фронтенде
- Access token можно отозвать без смены пароля
- Токены имеют ограниченный срок действия

### Права доступа (Scopes)
OAuth позволяет запрашивать только нужные права:
- `read` - читать данные
- `write` - создавать/изменять данные  
- `follow` - подписываться на пользователей

### Независимость от пароля
Даже если пользователь меняет пароль, токен продолжает работать (до истечения срока)

## Визуализация процесса

```
Пользователь          Ваш Сайт              GoToSocial
    |                     |                      |
    |   Открывает сайт    |                      |
    |-------------------->|                      |
    |                     |  Создать OAuth App   |
    |                     |--------------------->|
    |                     |<---------------------|
    |                     |  client_id + secret  |
    |                     |                      |
    |   Вводит email/pwd  |                      |
    |-------------------->|                      |
    |                     |  Запрос токена       |
    |                     |  (с client_id/secret)|
    |                     |--------------------->|
    |                     |<---------------------|
    |                     |    access_token      |
    |                     |                      |
    |   Использует сайт   |                      |
    |-------------------->|  Запросы с токеном   |
    |                     |--------------------->|
    |<--------------------|<---------------------|
    |    Данные           |      Данные          |
```

## Где хранятся данные OAuth?

### В localStorage браузера:
```javascript
// OAuth приложение (создается один раз)
localStorage.getItem('gts_oauth_client')
// { "client_id": "...", "client_secret": "..." }

// Токен пользователя (обновляется при каждом входе)
localStorage.getItem('gts_token')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// Данные пользователя
localStorage.getItem('gts_user')
// { "id": "...", "username": "...", ... }
```

### На сервере GoToSocial:
- Информация об OAuth приложении
- Выданные access tokens
- Связь между токенами и пользователями

## FAQ

### Q: Что будет, если удалить OAuth приложение из localStorage?
A: Ничего страшного. При следующем входе автоматически создастся новое.

### Q: Можно ли использовать один OAuth приложение для всех пользователей?
A: Да! Одно OAuth приложение обслуживает всех пользователей вашего сайта.

### Q: Когда истекает access token?
A: Зависит от настроек GoToSocial. Обычно токены живут долго (недели/месяцы).

### Q: Что такое client_secret и почему он важен?
A: Это секретный ключ вашего приложения. Он подтверждает, что запросы идут именно от вашего сайта, а не от злоумышленника.

### Q: Безопасно ли хранить client_secret в localStorage?
A: Для локального development - да. Для production лучше использовать серверный OAuth flow или держать secret на сервере.

## Итог

OAuth приложение - это:
✅ Автоматически создается при первом использовании
✅ Позволяет безопасно аутентифицировать пользователей
✅ Выдает временные токены доступа
✅ Не требует ручной настройки со стороны пользователя
