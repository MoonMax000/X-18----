# GoToSocial Authentication API Integration Guide

## Текущая проблема

Модальные окна LoginModal.tsx и SignUpModal.tsx используют Node.js backend API (`VITE_BACKEND_URL`), который не интегрирован с GoToSocial. Нужно переключить их на использование GoToSocial API.

## GoToSocial API Endpoints

GoToSocial использует Mastodon-совместимый API:

### 1. Регистрация нового пользователя
```
POST http://localhost:8080/api/v1/accounts
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "agreement": true,
  "locale": "en"
}

Response:
{
  "access_token": "...",
  "token_type": "Bearer",
  "scope": "read write follow",
  "created_at": 1234567890
}
```

### 2. OAuth 2.0 Authentication Flow

GoToSocial поддерживает полный OAuth 2.0 flow:

#### Шаг 1: Создание OAuth приложения
```
POST http://localhost:8080/api/v1/apps
Content-Type: application/json

{
  "client_name": "Tyrian Trading Platform",
  "redirect_uris": "http://localhost:8081/oauth/callback",
  "scopes": "read write follow",
  "website": "http://localhost:8081"
}

Response:
{
  "id": "...",
  "name": "Tyrian Trading Platform",
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "http://localhost:8081/oauth/callback"
}
```

#### Шаг 2: Получение токена (Password Grant)
```
POST http://localhost:8080/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id={client_id}
&client_secret={client_secret}
&username={username or email}
&password={password}
&scope=read write follow

Response:
{
  "access_token": "...",
  "token_type": "Bearer",
  "scope": "read write follow",
  "created_at": 1234567890
}
```

### 3. Проверка учетных данных
```
GET http://localhost:8080/api/v1/accounts/verify_credentials
Authorization: Bearer {access_token}

Response:
{
  "id": "...",
  "username": "testuser",
  "acct": "testuser",
  "display_name": "",
  "locked": false,
  "bot": false,
  "created_at": "...",
  "note": "",
  "url": "http://localhost:8080/@testuser",
  "avatar": "...",
  "header": "...",
  "followers_count": 0,
  "following_count": 0,
  "statuses_count": 0
}
```

## План интеграции

### 1. Создать GoToSocial Auth Service

Создать файл `client/services/auth/gotosocial-auth.ts`:

```typescript
interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

class GoToSocialAuthService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  private clientId: string | null = null;
  private clientSecret: string | null = null;

  async initializeApp() {
    // Создать OAuth приложение если еще не создано
    const stored = localStorage.getItem('gts_oauth_client');
    if (stored) {
      const { client_id, client_secret } = JSON.parse(stored);
      this.clientId = client_id;
      this.clientSecret = client_secret;
      return;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Tyrian Trading Platform',
        redirect_uris: 'urn:ietf:wg:oauth:2.0:oob',
        scopes: 'read write follow',
        website: window.location.origin,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create OAuth app');
    }

    const data = await response.json();
    this.clientId = data.client_id;
    this.clientSecret = data.client_secret;
    
    localStorage.setItem('gts_oauth_client', JSON.stringify({
      client_id: data.client_id,
      client_secret: data.client_secret,
    }));
  }

  async register({ username, email, password }: RegisterParams): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        email,
        password,
        agreement: true,
        locale: 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login({ email, password }: LoginParams): Promise<AuthResponse> {
    await this.initializeApp();

    if (!this.clientId || !this.clientSecret) {
      throw new Error('OAuth app not initialized');
    }

    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      username: email,
      password: password,
      scope: 'read write follow',
    });

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  async verifyCredentials(token: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to verify credentials');
    }

    return response.json();
  }
}

export const gtsAuth = new GoToSocialAuthService();
```

### 2. Обновить LoginModal.tsx

Изменить функцию `handleLogin`:

```typescript
const handleLogin = async () => {
  setIsLoading(true);
  setAuthError('');

  try {
    // Используем GoToSocial API
    const authData = await gtsAuth.login({
      email: authMethod === 'email' ? email : `${phoneNumber}@phone.temp`,
      password,
    });

    // Сохраняем токен
    localStorage.setItem('gts_token', authData.access_token);

    // Получаем данные пользователя
    const user = await gtsAuth.verifyCredentials(authData.access_token);
    localStorage.setItem('gts_user', JSON.stringify(user));

    // Закрываем модальное окно и обновляем страницу
    onClose();
    window.location.reload();
  } catch (error) {
    console.error('Login error:', error);
    setAuthError(error instanceof Error ? error.message : 'Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Обновить SignUpModal.tsx

Изменить функцию `handleSignUp`:

```typescript
const handleSignUp = async () => {
  setIsLoading(true);

  try {
    // Генерируем username из email
    const username = authMethod === 'email' 
      ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
      : `user_${phone.replace(/\D/g, '').slice(-8)}`;

    // Регистрация через GoToSocial API
    const authData = await gtsAuth.register({
      username,
      email: authMethod === 'email' ? email : `${phone}@phone.temp`,
      password,
    });

    // Если регистрация успешна и вернулся токен - сохраняем
    if (authData.access_token) {
      localStorage.setItem('gts_token', authData.access_token);
      
      const user = await gtsAuth.verifyCredentials(authData.access_token);
      localStorage.setItem('gts_user', JSON.stringify(user));

      // Показываем модальное окно верификации email
      setShowVerification(true);
    }
  } catch (error) {
    console.error('Registration error:', error);
    setEmailError(error instanceof Error ? error.message : 'Registration failed');
  } finally {
    setIsLoading(false);
  }
};
```

## Email Verification Flow

GoToSocial может требовать подтверждения email в зависимости от настроек. Текущие настройки в config.yaml:

```yaml
accounts-registration-open: true
accounts-approval-required: false  # Не требуется одобрение администратора
accounts-reason-required: false    # Не требуется указывать причину регистрации
```

Если `accounts-approval-required: true`, то после регистрации пользователь получит email с инструкциями.

## SMTP Настройки

Для отправки email необходимо настроить SMTP в config.yaml:

```yaml
smtp-host: "smtp.gmail.com"
smtp-port: 587
smtp-username: "your-email@gmail.com"
smtp-password: "your-app-password"  # Используйте App Password для Gmail
smtp-from: "noreply@yourdomain.com"
```

**Важно**: Для Gmail нужно создать App Password в настройках безопасности аккаунта.

## Следующие шаги

1. ✅ Добавлены SMTP настройки в config.yaml
2. ⏳ Создать файл `client/services/auth/gotosocial-auth.ts`
3. ⏳ Обновить LoginModal.tsx для использования GoToSocial API
4. ⏳ Обновить SignUpModal.tsx для использования GoToSocial API
5. ⏳ Настроить реальные SMTP credentials для отправки email
6. ⏳ Протестировать регистрацию и вход

## Тестирование

После интеграции протестировать:

1. Регистрация нового пользователя через модальное окно
2. Получение email с подтверждением (если настроен SMTP)
3. Вход существующего пользователя
4. Сохранение токена и данных пользователя
5. Проверка авторизации после перезагрузки страницы
