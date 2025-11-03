# OAuth Configuration Check - Данные для точечной проверки

## Google OAuth

### Redirect URIs

**Из .env конфигурации:**
```
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
```

**Реально уходит в OAuth URL:**
```
http://localhost:8080/api/auth/google/callback
```

✅ **Redirect URI совпадают**

### Google Client Details
```
Client ID: 659860871739-9dh0mon5vggkf3iotffpg09a71o61p90.apps.googleusercontent.com
Client Secret: GOCSPX-*** (скрыто)
Redirect URI: http://localhost:8080/api/auth/google/callback
```

### Network Request (Google):
```
GET http://localhost:8080/api/auth/google/callback?
  state=KJ0lCkWQp80ZEH1MlC-_8-Li56Z5NXfef95Zt_B3M-8%3D
  &code=4%2F0Ab32j90QbgEdMUVC9xt9rKPsBaM2aTmqjc113T6CP9f2O-OBWwpHSw5XdvK9_fuKR1tY_g
  &scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+openid
  &authuser=0
  &hd=tyriantrade.com
  &prompt=none

Status: 500 Internal Server Error
Duration: ~290-600ms
```

### Backend Logs (Google):
```
2025/11/03 22:27:51 === Google OAuth Callback Started ===
2025/11/03 22:27:51 Code present: true, State present: true
2025/11/03 22:27:51 State verification - found: true, provider: google
2025/11/03 22:27:51 Exchanging code for token...
2025/11/03 22:27:51 Token exchange successful
[22:27:51] 500 - GET /api/auth/google/callback (292ms)
```

⚠️ **Проблема:** После "Token exchange successful" логи обрываются

---

## Apple OAuth

### Redirect URIs

**Из .env конфигурации:**
```
APPLE_REDIRECT_URL=http://localhost:8080/api/auth/apple/callback
```

### Apple Client Details
```
Client ID: com.tyriantrade.web (Service ID)
Team ID: CYAMCL7B32
Key ID: 4QUQ4U396S
Redirect URI: http://localhost:8080/api/auth/apple/callback
```

### Apple Client Secret (JWT без signature):
```
Header: {"alg":"ES256","kid":"4QUQ4U396S"}
Claims: {
  "iss": "CYAMCL7B32",
  "iat": <timestamp>,
  "exp": <timestamp + 15778476>,
  "aud": "https://appleid.apple.com",
  "sub": "com.tyriantrade.web"
}
```

### Network Request (Apple):
```
GET https://appleid.apple.com/auth/authorize?
  client_id=com.tyriantrade.web
  &redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fauth%2Fapple%2Fcallback
  &response_mode=form_post
  &response_type=code+id_token
  &scope=name+email
  &state=7j3oKZqQMYAnh7sK9531y699m836DaXMM3E9jiRmKOw%3D

Status: 500 Internal Server Error
```

### Backend Error (Apple):
```
2025/11/03 21:46:54 Warning: Failed to generate Apple Client Secret: failed to parse PEM block containing the key
```

❌ **Критическая проблема:** Private key не парсится, `appleOAuth = nil`

---

## Ключевые находки

### Google OAuth:
1. ✅ Redirect URI совпадают (`http://localhost:8080/api/auth/google/callback`)
2. ✅ Client ID/Secret корректные (OAuth URL генерируется)
3. ✅ State validation работает
4. ✅ Code exchange с Google успешен
5. ❌ **500 Error сразу после token exchange** - код обрывается без логов

### Apple OAuth:
1. ❌ Private Key не парсится в PEM формате
2. ❌ `appleOAuth` остаётся `nil`
3. ❌ Запрос к `/api/auth/apple` возвращает 500 т.к. OAuth не инициализирован

---

## Для AI проверки

**Google OAuth:**
- Client ID: `659860871739-9dh0mon5vggkf3iotffpg09a71o61p90.apps.googleusercontent.com`
- Redirect URI (config): `http://localhost:8080/api/auth/google/callback`
- Redirect URI (actual): `http://localhost:8080/api/auth/google/callback`
- Error: 500 после успешного token exchange
- Missing logs после: "Token exchange successful"

**Apple OAuth:**
- Client ID: `com.tyriantrade.web`
- Team ID: `CYAMCL7B32`
- Key ID: `4QUQ4U396S`
- Redirect URI (config): `http://localhost:8080/api/auth/apple/callback`
- Error: "failed to parse PEM block containing the key"
- Result: `appleOAuth` is `nil`, все запросы возвращают 500

**Код где происходит обрыв (Google):**
`custom-backend/internal/api/oauth_handlers.go:186-213`
После строки `log.Printf("Token exchange successful")` должны быть логи "Creating OAuth client...", но их нет.
