# Apple OAuth Callback Debug

## Проблема
Apple OAuth callback возвращает 500 ошибку при выборе "Hide My Email" или обычной авторизации.

## Возможные причины

1. **APPLE_REDIRECT_URL несоответствие**
   - Настроено в ECS: `https://api.tyriantrade.com/api/auth/apple/callback`
   - Apple ожидает точное совпадение URL

2. **ID Token отсутствует**
   - Apple может не отправлять id_token при повторных авторизациях
   - Нужно обрабатывать случай когда есть только код

3. **Form parsing проблемы**
   - Apple использует `application/x-www-form-urlencoded`
   - Fiber должен правильно парсить FormValue

## Временное решение

Можно добавить дополнительный endpoint для отладки:

```go
// Debug Apple callback
auth.All("/apple/callback/debug", func(c *fiber.Ctx) error {
    log.Printf("Apple Debug - Method: %s", c.Method())
    log.Printf("Apple Debug - Headers: %v", c.GetReqHeaders())
    log.Printf("Apple Debug - Body: %s", string(c.Body()))
    log.Printf("Apple Debug - Form Values: %v", c.Request().PostArgs())
    
    return c.JSON(fiber.Map{
        "method": c.Method(),
        "headers": c.GetReqHeaders(),
        "form_values": map[string]string{
            "code": c.FormValue("code"),
            "state": c.FormValue("state"),
            "id_token": c.FormValue("id_token"),
            "user": c.FormValue("user"),
            "error": c.FormValue("error"),
        },
    })
})
```

## Проверка на продакшене

1. Убедиться что в Apple Developer Console:
   - Services ID: `com.tyriantrade.web`
   - Return URL: `https://api.tyriantrade.com/api/auth/apple/callback`
   - Domain verified: `api.tyriantrade.com`

2. Проверить что переменные в ECS содержат production URLs:
   ```
   APPLE_REDIRECT_URL=https://api.tyriantrade.com/api/auth/apple/callback
   ```

3. Логи должны показывать точную ошибку в AppleCallback функции
