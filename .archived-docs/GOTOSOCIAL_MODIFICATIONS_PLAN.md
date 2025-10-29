# GoToSocial Modifications Plan

## 🎯 Цель
Модифицировать GoToSocial для поддержки:
1. ✅ Публичной регистрации без токена
2. ✅ OAuth Password Grant для входа

## 📋 Найденные файлы

### 1. Регистрация аккаунта
**Файл:** `gotosocial/internal/api/client/accounts/accountcreate.go`
**Проблема:** Строки 68-71 требуют OAuth токен
```go
authed, errWithCode := apiutil.TokenAuth(c,
    true, true, true, false,
    apiutil.ScopeWriteAccounts,
)
```

### 2. OAuth Server
**Файл:** `gotosocial/internal/oauth/server.go`
**Проблема:** Строки 125-130 - поддерживает только 2 grant types
```go
AllowedGrantTypes: []oauth2.GrantType{
    oauth2.AuthorizationCode,
    oauth2.ClientCredentials,
},
```

## 🔧 ПЛАН МОДИФИКАЦИИ

### Шаг 1: Разрешить публичную регистрацию

#### Файл: `gotosocial/internal/api/client/accounts/accountcreate.go`

**Изменить строки 68-71:**

```go
// СТАРЫЙ КОД:
authed, errWithCode := apiutil.TokenAuth(c,
    true, true, true, false,
    apiutil.ScopeWriteAccounts,
)
if errWithCode != nil {
    apiutil.ErrorHandler(c, errWithCode, m.processor.InstanceGetV1)
    return
}

// НОВЫЙ КОД:
// Попытка авторизации через токен (опционально)
authed, _ := apiutil.TokenAuth(c,
    false, false, false, false,  // все флаги false = опционально
    apiutil.ScopeWriteAccounts,
)

// Если нет токена, создаем временный объект auth для публичной регистрации
if authed == nil || authed.Application == nil {
    // Получаем или создаем дефолтное приложение для публичной регистрации
    defaultApp, err := m.processor.GetOrCreateDefaultApplication(c.Request.Context())
    if err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorInternalError(err), m.processor.InstanceGetV1)
        return
    }
    
    authed = &apiutil.Authed{
        Application: defaultApp,
    }
}
```

### Шаг 2: Добавить Password Grant в OAuth

#### Файл: `gotosocial/internal/oauth/server.go`

**Изменить строки 125-130:**

```go
// СТАРЫЙ КОД:
AllowedGrantTypes: []oauth2.GrantType{
    oauth2.AuthorizationCode,
    oauth2.ClientCredentials,
},

// НОВЫЙ КОД:
AllowedGrantTypes: []oauth2.GrantType{
    oauth2.AuthorizationCode,
    oauth2.ClientCredentials,
    oauth2.PasswordCredentials,  // <-- ДОБАВИТЬ ЭТУ СТРОКУ
},
```

### Шаг 3: Создать функцию GetOrCreateDefaultApplication

#### Новый файл: `gotosocial/internal/processing/user/default_app.go`

```go
package user

import (
    "context"
    "code.superseriousbusiness.org/gotosocial/internal/gtsmodel"
    "code.superseriousbusiness.org/gotosocial/internal/id"
)

const (
    DefaultAppName = "Public Registration App"
    DefaultAppClientID = "PUBLIC_REGISTRATION_CLIENT"
)

// GetOrCreateDefaultApplication получает или создает дефолтное приложение
// для публичной регистрации без токена
func (p *Processor) GetOrCreateDefaultApplication(ctx context.Context) (*gtsmodel.Application, error) {
    // Попытка найти существующее приложение
    app, err := p.state.DB.GetApplicationByClientID(ctx, DefaultAppClientID)
    if err == nil && app != nil {
        return app, nil
    }
    
    // Создать новое приложение
    appID, err := id.NewRandomULID()
    if err != nil {
        return nil, err
    }
    
    app = &gtsmodel.Application{
        ID:           appID,
        Name:         DefaultAppName,
        Website:      "",
        RedirectURIs: []string{"urn:ietf:wg:oauth:2.0:oob"},
        ClientID:     DefaultAppClientID,
        ClientSecret: id.NewULID(),
        Scopes:       "read write follow",
    }
    
    if err := p.state.DB.PutApplication(ctx, app); err != nil {
        return nil, err
    }
    
    return app, nil
}
```

### Шаг 4: Добавить обработчик Password Grant

#### Файл: `gotosocial/internal/oauth/handlers/handlers.go`

Добавить новую функцию:

```go
// PasswordGrantHandler обрабатывает OAuth password grant
func (h *Handlers) PasswordGrantHandler(
    ctx context.Context,
    clientID string,
    username string,
    password string,
) (userID string, err error) {
    // 1. Найти пользователя по username или email
    user, err := h.state.DB.GetUserByUsernameOrEmail(ctx, username, username)
    if err != nil {
        return "", fmt.Errorf("user not found")
    }
    
    // 2. Проверить пароль
    if err := bcrypt.CompareHashAndPassword(
        []byte(user.EncryptedPassword),
        []byte(password),
    ); err != nil {
        return "", fmt.Errorf("invalid password")
    }
    
    // 3. Проверить что аккаунт подтвержден
    if user.ConfirmedAt.IsZero() {
        return "", fmt.Errorf("account not confirmed")
    }
    
    // 4. Проверить что аккаунт не заблокирован
    if user.Disabled {
        return "", fmt.Errorf("account disabled")
    }
    
    return user.ID, nil
}
```

## 🏗️ СБОРКА И УСТАНОВКА

### 1. Применить изменения

```bash
cd gotosocial

# Редактировать файлы согласно плану выше
```

### 2. Пересобрать GoToSocial

```bash
# Установить зависимости Go (если нужно)
go mod download

# Собрать
go build -o gotosocial ./cmd/gotosocial

# Проверить что собралось
./gotosocial --version
```

### 3. Перезапустить сервер

```bash
# Остановить старый процесс
pkill -f "gotosocial.*server start"

# Запустить новый
nohup ./gotosocial --config-path ./config.yaml server start > ../gotosocial.log 2>&1 &
```

## ✅ ТЕСТИРОВАНИЕ

### Тест 1: Публичная регистрация

```bash
curl -X POST http://localhost:8080/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "TestPass123!",
    "agreement": true,
    "locale": "en"
  }'
```

**Ожидаемый результат:** Получен токен доступа

### Тест 2: OAuth Password Grant

```bash
# 1. Создать OAuth app (если еще нет)
CLIENT_ID="..."
CLIENT_SECRET="..."

# 2. Получить токен через password grant
curl -X POST http://localhost:8080/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&username=test@example.com&password=TestPass123&scope=read+write+follow"
```

**Ожидаемый результат:** Получен access_token

## 📝 АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ

### Вариант A: Минимальные изменения
Только добавить Password Grant, но оставить регистрацию через CLI.

**Плюсы:** Меньше изменений, меньше риска  
**Минусы:** Нужен отдельный процесс для регистрации

### Вариант B: Полная модификация (РЕКОМЕНДУЮ)
Оба изменения: публичная регистрация + password grant.

**Плюсы:** Все работает из коробки, чистое решение  
**Минусы:** Больше кода для изменения

### Вариант C: Добавить настройку в config.yaml
Сделать опцию `allow-public-registration: true/false`

**Плюсы:** Гибкость, можно включить/выключить  
**Минусы:** Еще больше кода

## 🎯 РЕКОМЕНДАЦИЯ

Начать с **Варианта B** - полной модификации:

1. ✅ Публичная регистрация (20 строк кода)
2. ✅ Password grant (1 строка + обработчик)
3. ✅ Пересобрать (5 минут)
4. ✅ Протестировать

**Время:** 1-2 часа работы  
**Результат:** Полностью рабочая регистрация и вход

## 📚 ФАЙЛЫ ДЛЯ МОДИФИКАЦИИ

```
gotosocial/
├── internal/
│   ├── api/
│   │   └── client/
│   │       └── accounts/
│   │           └── accountcreate.go          <- ИЗМЕНИТЬ
│   ├── oauth/
│   │   ├── server.go                         <- ИЗМЕНИТЬ
│   │   └── handlers/
│   │       └── handlers.go                   <- ДОБАВИТЬ функцию
│   └── processing/
│       └── user/
│           └── default_app.go                <- СОЗДАТЬ
└── cmd/
    └── gotosocial/
        └── main.go                           <- БЕЗ ИЗМЕНЕНИЙ
```

## 🚀 БЫСТРЫЙ СТАРТ

```bash
# 1. Открыть файлы в редакторе
code gotosocial/internal/api/client/accounts/accountcreate.go
code gotosocial/internal/oauth/server.go

# 2. Применить изменения из этого документа

# 3. Пересобрать
cd gotosocial && go build -o gotosocial ./cmd/gotosocial

# 4. Перезапустить
pkill -f gotosocial && nohup ./gotosocial --config-path ./config.yaml server start > ../gotosocial.log 2>&1 &

# 5. Протестировать
curl -X POST http://localhost:8080/api/v1/accounts ...
```

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Backup:** Сделайте backup базы данных перед изменениями
2. **Testing:** Тестируйте на dev окружении сначала
3. **Security:** Password grant менее безопасен чем authorization code
4. **Email:** Настройте SMTP для верификации email

## 💡 ПОСЛЕ МОДИФИКАЦИИ

Фронтенд код (`gotosocial-auth.ts`) будет работать БЕЗ изменений:

```typescript
// Регистрация - теперь работает!
await gtsAuth.register({
  username: "user",
  email: "user@example.com",
  password: "pass123"
});

// Вход - теперь работает!
await gtsAuth.login({
  email: "user@example.com",
  password: "pass123"
});
```

## 🎉 ГОТОВО!

После этих изменений у вас будет полностью рабочая система регистрации и входа без костылей!
